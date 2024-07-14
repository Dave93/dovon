import Database from "@tauri-apps/plugin-sql";
export const database = async () => {
  return await Database.load("sqlite:dovon.db");
};
