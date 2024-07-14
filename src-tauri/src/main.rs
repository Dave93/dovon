use chrono::Local;
use serde::{Deserialize, Serialize};
use serialport::{self, SerialPort};
use std::collections::VecDeque;
use std::fs::{self, OpenOptions};
use std::io::{self, Read, Write};
use std::path::PathBuf;
use std::sync::Mutex;
use std::time::Duration;
use tauri::Manager;
use tauri::State;
#[derive(Serialize, Deserialize, Default)]
struct AppConfig {
    com_port: Option<String>,
}

impl AppConfig {
    fn load(config_path: &PathBuf) -> Self {
        if config_path.exists() {
            let config_data = fs::read_to_string(config_path).expect("Unable to read config file");
            serde_json::from_str(&config_data).expect("Unable to parse config file")
        } else {
            Self::default()
        }
    }

    fn save(&self, config_path: &PathBuf) {
        let config_data = serde_json::to_string_pretty(self).expect("Unable to serialize config");
        fs::write(config_path, config_data).expect("Unable to write config file");
    }
}

struct SharedState {
    config_path: PathBuf,
    config: Mutex<AppConfig>,
}

#[derive(Deserialize)]
struct SetComPortPayload {
    com_port: String,
}

#[tauri::command]
fn set_com_port(state: State<SharedState>, payload: SetComPortPayload) -> Result<(), String> {
    let mut config = state.config.lock().map_err(|_| "Failed to lock config")?;
    config.com_port = Some(payload.com_port);
    config.save(&state.config_path);
    Ok(())
}

struct WeightBuffer {
    buffer: VecDeque<f32>,
    capacity: usize,
}

impl WeightBuffer {
    fn new(capacity: usize) -> Self {
        WeightBuffer {
            buffer: VecDeque::with_capacity(capacity),
            capacity,
        }
    }

    fn add(&mut self, weight: f32) {
        if self.buffer.len() == self.capacity {
            self.buffer.pop_front();
        }
        self.buffer.push_back(weight);
    }

    fn average(&self) -> f32 {
        if self.buffer.is_empty() {
            0.0
        } else {
            self.buffer.iter().sum::<f32>() / self.buffer.len() as f32
        }
    }
}
fn parse_weight(data: &[u8]) -> Option<f32> {
    if data.len() < 4 {
        return None;
    }

    // Check for the header byte
    if data[0] != 0x38 {
        return None;
    }

    // Define the reference pattern for 2.72 kg
    let reference_pattern = [0x8B, 0x7D, 0x56];
    let reference_weight = 2.72;

    // Extract the next three bytes
    let weight_bytes = [data[1], data[2], data[3]];

    // Calculate the difference from the reference pattern
    let diff: i32 = weight_bytes
        .iter()
        .zip(reference_pattern.iter())
        .map(|(&a, &b)| (a as i32) - (b as i32))
        .sum();

    // Convert the difference to a weight adjustment
    let weight_adjustment = (diff as f32) * 0.001;

    Some(reference_weight + weight_adjustment)
}

fn listen_to_scale(com_port: &str, log_file_path: &PathBuf) -> io::Result<()> {
    let mut port = serialport::new(com_port, 9600)
        .timeout(Duration::from_millis(10))
        .open()?;

    println!(
        "Listening for weight changes on {} and logging to {:?}",
        com_port, log_file_path
    );

    let mut buffer = [0u8; 1024];
    let mut weight_buffer = WeightBuffer::new(10); // Use a buffer of the last 10 readings

    loop {
        match port.read(&mut buffer) {
            Ok(bytes_read) if bytes_read > 0 => {
                let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
                let hex_data = buffer[..bytes_read]
                    .iter()
                    .map(|b| format!("{:02X}", b))
                    .collect::<Vec<String>>()
                    .join(" ");

                let log_entry = format!("[{}] Raw data (hex): {}\n", timestamp, hex_data);

                let mut file = OpenOptions::new()
                    .create(true)
                    .append(true)
                    .open(log_file_path)?;

                file.write_all(log_entry.as_bytes())?;

                println!("{}", log_entry);

                if let Some(weight) = parse_weight(&buffer[..bytes_read]) {
                    weight_buffer.add(weight);
                    let averaged_weight = weight_buffer.average();
                    let weight_log = format!(
                        "[{}] Parsed weight: {:.2} kg, Averaged weight: {:.2} kg\n",
                        timestamp, weight, averaged_weight
                    );
                    file.write_all(weight_log.as_bytes())?;
                    println!("{}", weight_log);
                }
            }
            Ok(_) => {}
            Err(ref e) if e.kind() == io::ErrorKind::TimedOut => {}
            Err(e) => {
                let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
                let error_log = format!("[{}] Error: {}\n", timestamp, e);
                let mut file = OpenOptions::new()
                    .create(true)
                    .append(true)
                    .open(log_file_path)?;
                file.write_all(error_log.as_bytes())?;
                eprintln!("{}", error_log);
            }
        }
    }
}
fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Use the new API to get the app data directory
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data dir");
            let config_path = app_data_dir.join("config.json");
            let log_file_path = app_data_dir.join("weight_scale.log");

            // Ensure the app data directory exists
            fs::create_dir_all(&app_data_dir).expect("Failed to create app data directory");

            let config = AppConfig::load(&config_path);

            let state = SharedState {
                config_path: config_path.clone(),
                config: Mutex::new(config),
            };

            // Manage the state here, inside the setup closure
            app.manage(state);

            // Get a reference to the managed state
            let state = app.state::<SharedState>();

            // Start listening to the scale in a separate thread
            if let Some(com_port) = state.config.lock().unwrap().com_port.clone() {
                let log_file_path = log_file_path.clone();
                std::thread::spawn(move || {
                    if let Err(e) = listen_to_scale(&com_port, &log_file_path) {
                        eprintln!("Error listening to scale: {}", e);
                    }
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![set_com_port])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
