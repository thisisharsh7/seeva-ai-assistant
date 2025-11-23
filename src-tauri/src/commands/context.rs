use crate::services::context_detector::{ContextDetector, ScreenContext};

#[tauri::command]
pub async fn detect_screen_context() -> Result<ScreenContext, String> {
    println!("🔍 [COMMAND] detect_screen_context called");

    ContextDetector::detect_context()
        .await
        .map_err(|e| {
            eprintln!("❌ [COMMAND] Context detection failed: {}", e);
            e.to_string()
        })
}
