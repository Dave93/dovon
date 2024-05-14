// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_sql::{Migration, MigrationKind};
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    let migrations = vec![
        // Define your migrations here
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: "CREATE TABLE IF NOT EXISTS sizes (id INTEGER PRIMARY KEY, length INTEGER, thickness INTEGER, type TEXT)",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "drop_size_types",
            sql: "DROP TABLE IF EXISTS size_types",
            kind: MigrationKind::Down,
        },
        Migration {
            version: 3,
            description: "create_size_types",
            sql: "CREATE TABLE IF NOT EXISTS size_types (id INTEGER PRIMARY KEY, code TEXT, name TEXT)",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "add_size_types",
            sql: "INSERT INTO size_types (id, code, name) VALUES (1, 'L', 'Любой'), (2, 'S', 'Суммарный'), (3, 'M', 'Медленный'), (4, 'B', 'Большой')",
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:dovon.db", migrations)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
