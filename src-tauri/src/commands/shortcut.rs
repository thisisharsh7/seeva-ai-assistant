use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};
use std::str::FromStr;
use crate::services::context_detector::ContextDetector;
use crate::commands::settings::SettingsState;

#[cfg(target_os = "macos")]
use tauri_nspanel::ManagerExt;

#[tauri::command]
pub async fn register_global_shortcut(
    shortcut: String,
    app: AppHandle,
) -> Result<(), String> {
    // Parse the shortcut string
    let shortcut_key = Shortcut::from_str(&shortcut)
        .map_err(|e| format!("Invalid shortcut format: {}", e))?;

    // Unregister all existing shortcuts first
    if let Err(e) = app.global_shortcut().unregister_all() {
        eprintln!("Failed to unregister existing shortcuts: {}", e);
    }

    // Register the new shortcut with direct window toggle
    app.global_shortcut()
        .on_shortcut(shortcut_key, move |app, _shortcut, event| {
            // Only handle PRESSED state, ignore RELEASED to prevent double-triggering
            if event.state() != ShortcutState::Pressed {
                return;
            }

            // Handle window/panel toggle directly in Rust to avoid race conditions
            #[cfg(target_os = "macos")]
            {
                // Try to get the panel first (macOS specific)
                if let Ok(panel) = app.get_webview_panel("main") {
                    println!("🔍 Found NSPanel, toggling visibility");
                    let is_visible = panel.is_visible();
                    if is_visible {
                        println!("👁️ Panel is visible, hiding it");
                        panel.hide();
                    } else {
                        println!("👁️ Panel is hidden, showing it");

                        // CONTEXT DETECTION: Detect context before showing window (if enabled)
                        let app_handle = app.clone();

                        tauri::async_runtime::spawn(async move {
                            // Read context detection setting
                            let enable_context = app_handle
                                .state::<SettingsState>()
                                .get()
                                .map(|s| s.enable_context_detection)
                                .unwrap_or(true); // Default to enabled if settings fail to load

                            // Only detect context if enabled in settings
                            let context_result = if enable_context {
                                println!("🔍 [SHORTCUT] Context detection enabled, detecting screen context...");
                                Some(ContextDetector::detect_context().await)
                            } else {
                                println!("⚙️  [SHORTCUT] Context detection disabled in settings");
                                None
                            };

                            // Get panel and show it on main thread
                            let app_for_show = app_handle.clone();
                            app_handle.run_on_main_thread(move || {
                                if let Ok(panel) = app_for_show.get_webview_panel("main") {
                                    panel.show();
                                    panel.order_front_regardless();
                                    panel.make_key_window();
                                    println!("✅ Panel shown, ordered front regardless, and made key window");
                                }
                            }).ok();

                            // Emit context if detection was enabled and successful
                            if let Some(result) = context_result {
                                match result {
                                    Ok(context) => {
                                        println!("✅ [SHORTCUT] Context detected successfully");

                                        // Emit context to frontend
                                        if let Err(e) = app_handle.emit("screen-context-detected", &context) {
                                            eprintln!("❌ [SHORTCUT] Failed to emit context event: {}", e);
                                        } else {
                                            println!("✅ [SHORTCUT] Context event emitted to frontend");
                                        }
                                    }
                                    Err(e) => {
                                        eprintln!("⚠️  [SHORTCUT] Context detection failed: {}", e);
                                        eprintln!("   Window shown without context.");
                                    }
                                }
                            }
                        });
                    }
                } else if let Some(window) = app.get_webview_window("main") {
                    // Fallback to window API
                    println!("🔍 Using window API (fallback)");
                    match window.is_visible() {
                        Ok(is_visible) => {
                            if is_visible {
                                if let Err(e) = window.hide() {
                                    eprintln!("Failed to hide window: {}", e);
                                }
                            } else {
                                // CONTEXT DETECTION: Detect context before showing window
                                let app_handle = app.clone();

                                tauri::async_runtime::spawn(async move {
                                    println!("🔍 [SHORTCUT] Detecting screen context before showing window...");

                                    // Detect context asynchronously
                                    let context_result = ContextDetector::detect_context().await;

                                    // Show window on main thread
                                    let app_for_show = app_handle.clone();
                                    app_handle.run_on_main_thread(move || {
                                        if let Some(window) = app_for_show.get_webview_window("main") {
                                            if let Err(e) = window.show() {
                                                eprintln!("Failed to show window: {}", e);
                                            }
                                            if let Err(e) = window.set_focus() {
                                                eprintln!("Failed to focus window: {}", e);
                                            }
                                        }
                                    }).ok();

                                    // Emit context if successfully detected
                                    match context_result {
                                        Ok(context) => {
                                            println!("✅ [SHORTCUT] Context detected successfully");

                                            // Emit context to frontend
                                            if let Err(e) = app_handle.emit("screen-context-detected", &context) {
                                                eprintln!("❌ [SHORTCUT] Failed to emit context event: {}", e);
                                            } else {
                                                println!("✅ [SHORTCUT] Context event emitted to frontend");
                                            }
                                        }
                                        Err(e) => {
                                            eprintln!("⚠️  [SHORTCUT] Context detection failed: {}", e);
                                            eprintln!("   Window shown without context.");
                                        }
                                    }
                                });
                            }
                        }
                        Err(e) => {
                            eprintln!("Failed to check window visibility: {}", e);
                        }
                    }
                } else {
                    eprintln!("❌ Failed to get main window or panel");
                }
            }

            #[cfg(not(target_os = "macos"))]
            {
                // Non-macOS: use regular window API
                if let Some(window) = app.get_webview_window("main") {
                    match window.is_visible() {
                        Ok(is_visible) => {
                            if is_visible {
                                if let Err(e) = window.hide() {
                                    eprintln!("Failed to hide window: {}", e);
                                }
                            } else {
                                // CONTEXT DETECTION: Detect context before showing window
                                let app_handle = app.clone();

                                tauri::async_runtime::spawn(async move {
                                    println!("🔍 [SHORTCUT] Detecting screen context before showing window...");

                                    // Detect context asynchronously
                                    let context_result = ContextDetector::detect_context().await;

                                    // Show window on main thread
                                    let app_for_show = app_handle.clone();
                                    app_handle.run_on_main_thread(move || {
                                        if let Some(window) = app_for_show.get_webview_window("main") {
                                            if let Err(e) = window.show() {
                                                eprintln!("Failed to show window: {}", e);
                                            }
                                            if let Err(e) = window.set_focus() {
                                                eprintln!("Failed to focus window: {}", e);
                                            }
                                        }
                                    }).ok();

                                    // Emit context if successfully detected
                                    match context_result {
                                        Ok(context) => {
                                            println!("✅ [SHORTCUT] Context detected successfully");

                                            // Emit context to frontend
                                            if let Err(e) = app_handle.emit("screen-context-detected", &context) {
                                                eprintln!("❌ [SHORTCUT] Failed to emit context event: {}", e);
                                            } else {
                                                println!("✅ [SHORTCUT] Context event emitted to frontend");
                                            }
                                        }
                                        Err(e) => {
                                            eprintln!("⚠️  [SHORTCUT] Context detection failed: {}", e);
                                            eprintln!("   Window shown without context.");
                                        }
                                    }
                                });
                            }
                        }
                        Err(e) => {
                            eprintln!("Failed to check window visibility: {}", e);
                        }
                    }
                } else {
                    eprintln!("Failed to get main window");
                }
            }
        })
        .map_err(|e| format!("Failed to register shortcut: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn unregister_global_shortcut(app: AppHandle) -> Result<(), String> {
    app.global_shortcut()
        .unregister_all()
        .map_err(|e| format!("Failed to unregister shortcuts: {}", e))?;

    Ok(())
}
