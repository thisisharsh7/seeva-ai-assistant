mod models;
mod services;
mod managers;
mod commands;

use commands::settings::{AppSettings, SettingsState};
use managers::ThreadManager;
use services::{Database, ScreenshotService};
use std::sync::{Arc, Mutex};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize logging
    tracing_subscriber::fmt::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Get app data directory
            let app_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data directory");

            // Create directory if it doesn't exist
            std::fs::create_dir_all(&app_dir).expect("Failed to create app directory");

            // Initialize database
            let db_path = app_dir.join("seeva.db");
            let database = Arc::new(Database::new(db_path).expect("Failed to initialize database"));

            // Initialize ThreadManager
            let thread_manager = Arc::new(ThreadManager::new(database));

            // Initialize ScreenshotService
            let screenshot_service = Arc::new(ScreenshotService::new());

            // Initialize Settings
            let settings: SettingsState = Arc::new(Mutex::new(AppSettings::default()));

            // Manage state
            app.manage(thread_manager);
            app.manage(screenshot_service);
            app.manage(settings);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Thread commands
            commands::create_thread,
            commands::list_threads,
            commands::get_thread,
            commands::switch_thread,
            commands::delete_thread,
            commands::update_thread_name,
            commands::get_current_thread_id,
            // Chat commands
            commands::send_message,
            commands::get_messages,
            commands::delete_message,
            // Settings commands
            commands::get_settings,
            commands::update_settings,
            commands::set_default_provider,
            commands::set_api_key,
            commands::validate_api_key,
            // Screenshot commands
            commands::capture_screenshot,
            commands::capture_all_screenshots,
            commands::capture_screen_by_index,
            commands::get_screen_count,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
