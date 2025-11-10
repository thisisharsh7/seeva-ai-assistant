use base64::{engine::general_purpose, Engine};
use image::ImageEncoder;
use screenshots::Screen;
use std::io::Cursor;

#[derive(Debug, thiserror::Error)]
pub enum ScreenshotError {
    #[error("Failed to capture screenshot: {0}")]
    CaptureError(String),

    #[error("Failed to encode image: {0}")]
    EncodeError(String),

    #[error("No screens available")]
    NoScreensAvailable,
}

pub struct ScreenshotService;

impl ScreenshotService {
    pub fn new() -> Self {
        Self
    }

    /// Capture screenshot of all screens and return as base64 encoded PNG
    pub fn capture_all_screens(&self) -> Result<Vec<String>, ScreenshotError> {
        let screens = Screen::all()
            .map_err(|e| ScreenshotError::CaptureError(e.to_string()))?;

        if screens.is_empty() {
            return Err(ScreenshotError::NoScreensAvailable);
        }

        let mut screenshots = Vec::new();

        for screen in screens {
            match screen.capture() {
                Ok(screenshot) => {
                    // Convert to RgbaImage
                    let rgba_image = image::RgbaImage::from_raw(
                        screenshot.width(),
                        screenshot.height(),
                        screenshot.as_raw().to_vec()
                    ).ok_or_else(|| ScreenshotError::EncodeError("Failed to create RgbaImage".to_string()))?;

                    let base64_data = self.encode_image_to_base64(&rgba_image)?;
                    screenshots.push(base64_data);
                }
                Err(e) => {
                    tracing::warn!("Failed to capture screen: {}", e);
                    continue;
                }
            }
        }

        if screenshots.is_empty() {
            return Err(ScreenshotError::CaptureError(
                "Failed to capture any screens".to_string(),
            ));
        }

        Ok(screenshots)
    }

    /// Capture screenshot of primary screen and return as base64 encoded PNG
    pub fn capture_primary_screen(&self) -> Result<String, ScreenshotError> {
        let screens = Screen::all()
            .map_err(|e| ScreenshotError::CaptureError(e.to_string()))?;

        if screens.is_empty() {
            return Err(ScreenshotError::NoScreensAvailable);
        }

        let screen = &screens[0];
        let screenshot = screen
            .capture()
            .map_err(|e| ScreenshotError::CaptureError(e.to_string()))?;

        // Convert to RgbaImage
        let rgba_image = image::RgbaImage::from_raw(
            screenshot.width(),
            screenshot.height(),
            screenshot.as_raw().to_vec()
        ).ok_or_else(|| ScreenshotError::EncodeError("Failed to create RgbaImage".to_string()))?;

        self.encode_image_to_base64(&rgba_image)
    }

    /// Capture screenshot of a specific screen by index
    pub fn capture_screen(&self, screen_index: usize) -> Result<String, ScreenshotError> {
        let screens = Screen::all()
            .map_err(|e| ScreenshotError::CaptureError(e.to_string()))?;

        if screen_index >= screens.len() {
            return Err(ScreenshotError::CaptureError(format!(
                "Screen index {} out of bounds (available: {})",
                screen_index,
                screens.len()
            )));
        }

        let screen = &screens[screen_index];
        let screenshot = screen
            .capture()
            .map_err(|e| ScreenshotError::CaptureError(e.to_string()))?;

        // Convert to RgbaImage
        let rgba_image = image::RgbaImage::from_raw(
            screenshot.width(),
            screenshot.height(),
            screenshot.as_raw().to_vec()
        ).ok_or_else(|| ScreenshotError::EncodeError("Failed to create RgbaImage".to_string()))?;

        self.encode_image_to_base64(&rgba_image)
    }

    /// Get number of available screens
    pub fn screen_count(&self) -> Result<usize, ScreenshotError> {
        let screens = Screen::all()
            .map_err(|e| ScreenshotError::CaptureError(e.to_string()))?;
        Ok(screens.len())
    }

    /// Encode image buffer to base64 PNG string
    fn encode_image_to_base64(
        &self,
        img: &image::RgbaImage,
    ) -> Result<String, ScreenshotError> {
        // Convert to PNG bytes
        let mut png_bytes = Vec::new();
        let mut cursor = Cursor::new(&mut png_bytes);

        image::codecs::png::PngEncoder::new(&mut cursor)
            .write_image(
                &img.as_raw()[..],
                img.width(),
                img.height(),
                image::ExtendedColorType::Rgba8,
            )
            .map_err(|e| ScreenshotError::EncodeError(e.to_string()))?;

        // Encode to base64
        let base64_string = general_purpose::STANDARD.encode(&png_bytes);

        Ok(base64_string)
    }
}

impl Default for ScreenshotService {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_screenshot_service_creation() {
        let service = ScreenshotService::new();
        assert!(service.screen_count().is_ok());
    }

    #[test]
    fn test_screen_count() {
        let service = ScreenshotService::new();
        let count = service.screen_count().unwrap();
        assert!(count > 0, "Should have at least one screen");
    }

    #[test]
    fn test_capture_primary_screen() {
        let service = ScreenshotService::new();
        let result = service.capture_primary_screen();

        // This might fail in CI environments without display
        if let Ok(base64_data) = result {
            assert!(!base64_data.is_empty());
            // Verify it's valid base64
            assert!(general_purpose::STANDARD.decode(&base64_data).is_ok());
        }
    }

    #[test]
    fn test_capture_invalid_screen_index() {
        let service = ScreenshotService::new();
        let result = service.capture_screen(999);
        assert!(result.is_err());
    }
}
