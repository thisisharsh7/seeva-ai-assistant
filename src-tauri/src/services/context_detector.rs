use active_win_pos_rs::get_active_window;
use serde::{Deserialize, Serialize};

#[derive(Debug, thiserror::Error)]
pub enum ContextError {
    #[error("Failed to detect active window: {0}")]
    DetectionError(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScreenContext {
    pub app_name: String,
    pub window_title: String,
    pub timestamp: i64,
}

pub struct ContextDetector;

impl ContextDetector {
    pub fn new() -> Self {
        Self
    }

    /// Detect the current screen context (active window info only, no screenshot)
    pub async fn detect_context() -> Result<ScreenContext, ContextError> {
        println!("🔍 [CONTEXT] Starting context detection...");

        // Small delay to ensure we capture the correct window (before focus changes)
        tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;

        // Get active window information
        println!("🔍 [CONTEXT] Detecting active window...");
        let active_window = get_active_window()
            .map_err(|e| {
                eprintln!("⚠️  [CONTEXT] Failed to get active window: {:?}", e);
                ContextError::DetectionError(format!("Failed to get active window: {:?}", e))
            })?;

        let app_name = active_window.app_name.clone();
        let window_title = active_window.title.clone();

        // Skip if the detected window is Seeva itself
        if app_name.to_lowercase().contains("seeva") || app_name.to_lowercase().contains("tauri") {
            println!("⚠️  [CONTEXT] Detected Seeva itself, skipping context");
            return Err(ContextError::DetectionError("Cannot detect context: Seeva is the active window".to_string()));
        }

        println!("✅ [CONTEXT] Active window detected:");
        println!("   App: {}", app_name);
        println!("   Title: {}", window_title);

        // Get current timestamp
        let timestamp = chrono::Utc::now().timestamp();

        let context = ScreenContext {
            app_name,
            window_title,
            timestamp,
        };

        println!("🎉 [CONTEXT] Context detection complete!");

        Ok(context)
    }
}

impl Default for ContextDetector {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_context_detector_creation() {
        let _detector = ContextDetector::new();
    }

    #[tokio::test]
    async fn test_detect_context() {
        // This test may fail in CI environments without a GUI
        let result = ContextDetector::detect_context().await;

        // Don't fail the test if no GUI is available
        if let Ok(context) = result {
            assert!(!context.app_name.is_empty());
            assert!(context.timestamp > 0);
        }
    }
}
