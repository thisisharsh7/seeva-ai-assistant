use crate::services::ScreenshotService;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn capture_screenshot(
    screenshot_service: State<'_, Arc<ScreenshotService>>,
) -> Result<String, String> {
    screenshot_service
        .capture_primary_screen()
        .map_err(|e| e.to_string())
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
