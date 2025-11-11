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
        println!("🖥️  [SERVICE] capture_primary_screen() called");

        // Get all screens from OS
        println!("🔍 [SERVICE] Querying OS for available screens...");
        let screens = Screen::all()
            .map_err(|e| {
                eprintln!("❌ [SERVICE] Failed to get screens from OS: {}", e);
                ScreenshotError::CaptureError(e.to_string())
            })?;

        println!("✅ [SERVICE] Found {} screen(s)", screens.len());

        if screens.is_empty() {
            eprintln!("❌ [SERVICE] No screens available - cannot capture screenshot");
            return Err(ScreenshotError::NoScreensAvailable);
        }

        // Get primary screen (index 0)
        let screen = &screens[0];
        println!("📱 [SERVICE] Using primary screen (index 0)");
        println!("📏 [SERVICE] Screen dimensions: {}x{}", screen.display_info.width, screen.display_info.height);

        // Capture screenshot
        println!("📸 [SERVICE] Capturing screenshot from primary screen...");
        let screenshot = screen
            .capture()
            .map_err(|e| {
                eprintln!("❌ [SERVICE] Screen capture failed: {}", e);
                ScreenshotError::CaptureError(e.to_string())
            })?;

        println!("✅ [SERVICE] Raw screenshot captured: {}x{} pixels", screenshot.width(), screenshot.height());

        // Convert to RgbaImage
        println!("🔄 [SERVICE] Converting raw bytes to RGBA image...");
        let rgba_image = image::RgbaImage::from_raw(
            screenshot.width(),
            screenshot.height(),
            screenshot.as_raw().to_vec()
        ).ok_or_else(|| {
            eprintln!("❌ [SERVICE] Failed to convert raw bytes to RGBA image");
            ScreenshotError::EncodeError("Failed to create RgbaImage".to_string())
        })?;

        println!("✅ [SERVICE] RGBA image created successfully");
        println!("🎨 [SERVICE] Starting image encoding pipeline...");

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

    /// Resize image if it exceeds max dimensions (maintaining aspect ratio)
    fn resize_image(&self, img: &image::RgbaImage, max_width: u32) -> image::RgbaImage {
        let (width, height) = img.dimensions();

        // If image is already smaller than max, return as-is
        if width <= max_width {
            return img.clone();
        }

        // Calculate new dimensions maintaining aspect ratio
        let scale = max_width as f32 / width as f32;
        let new_width = max_width;
        let new_height = (height as f32 * scale) as u32;

        image::imageops::resize(
            img,
            new_width,
            new_height,
            image::imageops::FilterType::Lanczos3,
        )
    }

    /// Encode image buffer to base64 JPEG string with compression
    fn encode_image_to_base64(
        &self,
        img: &image::RgbaImage,
    ) -> Result<String, ScreenshotError> {
        println!("📐 [ENCODE] Input image dimensions: {}x{}", img.width(), img.height());

        // Resize image to max 2048px width to reduce size
        println!("🔄 [ENCODE] Resizing image (max width: 2048px)...");
        let resized_img = self.resize_image(img, 2048);
        println!("✅ [ENCODE] Image resized to: {}x{}", resized_img.width(), resized_img.height());

        // Convert RGBA to RGB (JPEG doesn't support alpha channel)
        println!("🔄 [ENCODE] Converting RGBA → RGB (JPEG requirement)...");
        let rgb_img = image::DynamicImage::ImageRgba8(resized_img).to_rgb8();
        println!("✅ [ENCODE] RGB conversion complete");

        // Convert to JPEG bytes with quality 85
        println!("🗜️  [ENCODE] Encoding to JPEG (quality: 85)...");
        let mut jpeg_bytes = Vec::new();
        let mut cursor = Cursor::new(&mut jpeg_bytes);

        image::codecs::jpeg::JpegEncoder::new_with_quality(&mut cursor, 85)
            .write_image(
                &rgb_img.as_raw()[..],
                rgb_img.width(),
                rgb_img.height(),
                image::ExtendedColorType::Rgb8,
            )
            .map_err(|e| {
                eprintln!("❌ [ENCODE] JPEG encoding failed: {}", e);
                ScreenshotError::EncodeError(e.to_string())
            })?;

        // Log compression results
        let jpeg_size_kb = jpeg_bytes.len() / 1024;
        println!("✅ [ENCODE] JPEG encoding complete: {} KB", jpeg_size_kb);
        println!("📊 [ENCODE] Compression summary: {}x{} → JPEG {} KB",
            img.width(), img.height(),
            jpeg_size_kb
        );

        // Encode to base64
        println!("🔄 [ENCODE] Converting JPEG to base64 string...");
        let base64_string = general_purpose::STANDARD.encode(&jpeg_bytes);
        println!("✅ [ENCODE] Base64 encoding complete ({} chars)", base64_string.len());

        println!("🎉 [ENCODE] Image encoding pipeline complete!");

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
