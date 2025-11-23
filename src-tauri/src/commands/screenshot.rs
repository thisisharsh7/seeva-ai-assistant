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
    // Increased delay to account for animation variance and compositor timing
    println!("⏳ [SCREENSHOT] Waiting 400ms for window hide animation to complete...");
    tokio::time::sleep(tokio::time::Duration::from_millis(400)).await;
    println!("✅ [SCREENSHOT] Window hide delay complete");

    // Capture screenshot - this will take time (400-500ms for full processing)
    println!("📸 [SCREENSHOT] Starting screenshot capture in background...");

    // Clone Arc for async task
    let service = Arc::clone(screenshot_service.inner());

    // Spawn capture task
    let capture_handle = tokio::task::spawn_blocking(move || {
        service.capture_primary_screen()
    });

    // CRITICAL: Show window after capture task has started
    // Don't wait for capture to finish - restore window while processing happens
    // Increased delay to ensure thread pool has time to pick up and start the capture task
    println!("👁️  [SCREENSHOT] Restoring window visibility while capture processes...");
    tokio::time::sleep(tokio::time::Duration::from_millis(200)).await; // Wait for capture to actually start

    let mut restore_success = false;
    let max_retries = 3;

    for attempt in 1..=max_retries {
        println!("🔄 [SCREENSHOT] Window restore attempt {}/{}", attempt, max_retries);

        match window.show() {
            Ok(_) => {
                println!("✅ [SCREENSHOT] Window restored successfully on attempt {} (capture still processing)", attempt);
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
                    // Try to cancel capture task
                    capture_handle.abort();
                    return Err(format!(
                        "CRITICAL: Failed to restore window after screenshot. Last error: {}. Please manually show the window.",
                        e
                    ));
                }
            }
        }
    }

    if restore_success {
        println!("🎉 [SCREENSHOT] Window restored - waiting for capture to complete");
    }

    // Now wait for capture to finish
    let result = capture_handle.await
        .map_err(|e| format!("Screenshot task failed: {}", e))?;

    // Log the result
    match &result {
        Ok(base64_data) => {
            println!("✅ [SCREENSHOT] Screenshot captured successfully (base64 length: {} chars)", base64_data.len());
        }
        Err(e) => {
            eprintln!("❌ [SCREENSHOT] Screenshot capture failed: {}", e);
        }
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
