mod models;
mod services;
mod managers;
mod commands;

use commands::settings::SettingsState;
use managers::ThreadManager;
use services::{Database, ScreenshotService, SettingsManager};
use std::sync::Arc;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize logging
    tracing_subscriber::fmt::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            // Configure window for macOS transparency effects
            #[cfg(target_os = "macos")]
            {
                use tauri::TitleBarStyle;
                if let Some(window) = app.get_webview_window("main") {
                    // Set title bar style to overlay for better transparency
                    let _ = window.set_title_bar_style(TitleBarStyle::Overlay);
                }
            }

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

            // Initialize Settings with file persistence
            let settings_path = app_dir.join("settings.json");
            let settings: SettingsState = Arc::new(
                SettingsManager::new(settings_path).expect("Failed to initialize settings")
            );

            // Manage state
            app.manage(thread_manager);
            app.manage(screenshot_service);
            app.manage(settings.clone());

            // Register global shortcut from settings
            let app_handle = app.handle().clone();
            let shortcut = settings.get().map(|s| s.shortcut.clone()).unwrap_or_default();

            if !shortcut.is_empty() {
                tauri::async_runtime::spawn(async move {
                    if let Err(e) = commands::register_global_shortcut(shortcut, app_handle).await {
                        eprintln!("Failed to register global shortcut: {}", e);
                    }
                });
            }

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
            commands::set_validation_state,
            // Screenshot commands
            commands::capture_screenshot,
            commands::capture_all_screenshots,
            commands::capture_screen_by_index,
            commands::get_screen_count,
            // Shortcut commands
            commands::register_global_shortcut,
            commands::unregister_global_shortcut,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
