mod models;
mod services;
mod managers;
mod commands;

use commands::settings::SettingsState;
use managers::ThreadManager;
use services::{Database, ScreenshotService, SettingsManager};
use std::sync::Arc;
use tauri::Manager;

// Define a custom Panel for macOS
#[cfg(target_os = "macos")]
use tauri_nspanel::tauri_panel;

#[cfg(target_os = "macos")]
tauri_panel! {
    panel!(SeevaPanel {
        config: {
            can_become_key_window: true,
            is_floating_panel: true
        }
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize logging
    tracing_subscriber::fmt::init();

    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build());

    // Initialize NSPanel plugin only on macOS
    #[cfg(target_os = "macos")]
    {
        builder = builder.plugin(tauri_nspanel::init());
    }

    builder.setup(|app| {
            // Configure window for macOS transparency effects and convert to NSPanel
            #[cfg(target_os = "macos")]
            {
                use tauri::TitleBarStyle;
                use tauri_nspanel::WebviewWindowExt;

                if let Some(window) = app.get_webview_window("main") {
                    // Set title bar style to overlay for better transparency
                    let _ = window.set_title_bar_style(TitleBarStyle::Overlay);

                    // Convert to NSPanel to allow appearing over fullscreen apps
                    // Panel operations must run on main thread
                    let app_handle = app.handle().clone();
                    app_handle.run_on_main_thread(move || {
                        match window.to_panel::<SeevaPanel>() {
                            Ok(panel) => {
                                use tauri_nspanel::panel::NSWindowCollectionBehavior;

                                println!("✅ Successfully converted window to NSPanel");

                                // CRITICAL: Set NonactivatingPanel style mask
                                // This allows the panel to show over fullscreen apps without activating our app
                                use tauri_nspanel::panel::NSWindowStyleMask;
                                panel.set_style_mask(NSWindowStyleMask::NonactivatingPanel);
                                println!("✅ Panel style mask set to NonactivatingPanel");

                                // Configure panel to appear on all spaces and above fullscreen apps
                                // Window levels: Normal=0, Floating=3, Main menu=24, Status=25
                                // We use mainMenu level + 1
                                panel.set_level(25);

                                // Make panel appear on all spaces (including fullscreen app spaces)
                                panel.set_collection_behavior(
                                    NSWindowCollectionBehavior::CanJoinAllSpaces
                                    | NSWindowCollectionBehavior::FullScreenAuxiliary
                                );
                                println!("✅ Panel collection behavior set successfully");

                                println!("✅ Panel configured to appear on all spaces and above fullscreen apps");
                            }
                            Err(e) => {
                                eprintln!("❌ Failed to convert window to panel: {}", e);
                            }
                        }
                    }).ok();
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
