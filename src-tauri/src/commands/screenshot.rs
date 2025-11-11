use crate::services::ScreenshotService;
use std::sync::Arc;
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub async fn capture_screenshot(
    app_handle: AppHandle,
    screenshot_service: State<'_, Arc<ScreenshotService>>,
) -> Result<String, String> {
    println!("🚀 [SCREENSHOT] Command invoked - starting screenshot capture process");

    // Get main window
    println!("🔍 [SCREENSHOT] Attempting to get main window reference...");
    let window = app_handle
        .get_webview_window("main")
        .ok_or_else(|| {
            eprintln!("❌ [SCREENSHOT] Failed to get main window reference");
            "Failed to get main window".to_string()
        })?;
    println!("✅ [SCREENSHOT] Successfully got main window reference");

    // Hide window to prevent capturing app UI
    println!("🙈 [SCREENSHOT] Hiding window to prevent capturing app UI...");
    window.hide().map_err(|e| {
        eprintln!("❌ [SCREENSHOT] Failed to hide window: {}", e);
        e.to_string()
    })?;
    println!("✅ [SCREENSHOT] Window hidden successfully");

    // Wait for window to fully hide (macOS animation takes ~100-150ms)
    // TODO: Make this delay configurable in settings
    println!("⏳ [SCREENSHOT] Waiting 250ms for window hide animation to complete...");
    tokio::time::sleep(tokio::time::Duration::from_millis(250)).await;
    println!("✅ [SCREENSHOT] Window hide delay complete");

    // Capture screenshot
    println!("📸 [SCREENSHOT] Calling screenshot service to capture primary screen...");
    let result = screenshot_service.capture_primary_screen();

    match &result {
        Ok(base64_data) => {
            println!("✅ [SCREENSHOT] Screenshot captured successfully (base64 length: {} chars)", base64_data.len());
        }
        Err(e) => {
            eprintln!("❌ [SCREENSHOT] Screenshot capture failed: {}", e);
        }
    }

    // CRITICAL: Always show window again, even if capture failed
    // Use retry logic to ensure window is restored
    println!("👁️  [SCREENSHOT] Attempting to restore window visibility...");

    let mut restore_success = false;
    let max_retries = 3;

    for attempt in 1..=max_retries {
        println!("🔄 [SCREENSHOT] Window restore attempt {}/{}", attempt, max_retries);

        match window.show() {
            Ok(_) => {
                println!("✅ [SCREENSHOT] Window restored successfully on attempt {}", attempt);
                restore_success = true;
                break;
            }
            Err(e) => {
                eprintln!("⚠️  [SCREENSHOT] Window restore attempt {} failed: {}", attempt, e);

                if attempt < max_retries {
                    println!("⏳ [SCREENSHOT] Waiting 100ms before retry...");
                    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
                } else {
                    eprintln!("❌ [SCREENSHOT] CRITICAL: All {} window restore attempts failed!", max_retries);
                    return Err(format!(
                        "CRITICAL: Failed to restore window after screenshot. Last error: {}. Please manually show the window.",
                        e
                    ));
                }
            }
        }
    }

    if restore_success {
        println!("🎉 [SCREENSHOT] Screenshot process complete - window restored");
    }

    // Return the screenshot result (or earlier error)
    result.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn capture_all_screenshots(
    screenshot_service: State<'_, Arc<ScreenshotService>>,
) -> Result<Vec<String>, String> {
    screenshot_service
        .capture_all_screens()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn capture_screen_by_index(
    index: usize,
    screenshot_service: State<'_, Arc<ScreenshotService>>,
) -> Result<String, String> {
    screenshot_service
        .capture_screen(index)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_screen_count(
    screenshot_service: State<'_, Arc<ScreenshotService>>,
) -> Result<usize, String> {
    screenshot_service.screen_count().map_err(|e| e.to_string())
}
