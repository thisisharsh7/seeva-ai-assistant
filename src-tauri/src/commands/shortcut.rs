use tauri::{AppHandle, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};
use std::str::FromStr;

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

            // Handle window toggle directly in Rust to avoid race conditions
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
