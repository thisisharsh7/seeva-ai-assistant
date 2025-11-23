use tauri::{AppHandle, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};
use std::str::FromStr;

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

                        // For panels, we need to forcefully order it to the front
                        // order_front_regardless() brings window to front even if app is not active
                        panel.show();
                        panel.order_front_regardless();
                        panel.make_key_window();
                        println!("✅ Panel shown, ordered front regardless, and made key window");
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
                                if let Err(e) = window.show() {
                                    eprintln!("Failed to show window: {}", e);
                                }
                                if let Err(e) = window.set_focus() {
                                    eprintln!("Failed to focus window: {}", e);
                                }
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
                                if let Err(e) = window.show() {
                                    eprintln!("Failed to show window: {}", e);
                                }
                                if let Err(e) = window.set_focus() {
                                    eprintln!("Failed to focus window: {}", e);
                                }
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
