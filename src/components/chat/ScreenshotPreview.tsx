import { useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';

interface ScreenshotPreviewProps {
  screenshot: string;
  isProcessing: boolean;
  onRemove: () => void;
}

export function ScreenshotPreview({ screenshot, isProcessing, onRemove }: ScreenshotPreviewProps) {
  const { setCachedScreenshot } = useUIStore();

  // Keep cache synchronized whenever screenshot changes
  useEffect(() => {
    if (screenshot && !isProcessing) {
      setCachedScreenshot(screenshot);
    }
  }, [screenshot, isProcessing, setCachedScreenshot]);

  return (
    <div className="relative px-4 pb-2">
      <div className="relative inline-block">
        {/* Screenshot Image - Small corner thumbnail */}
        <img
          src={`data:image/jpeg;base64,${screenshot}`}
          alt="Screenshot preview"
          className={`w-24 h-16 object-cover rounded-lg border-2 border-border-subtle transition-all duration-300 ${
            isProcessing ? 'blur-sm opacity-70' : 'blur-0 opacity-100'
          }`}
        />

        {/* Loading Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg backdrop-blur-sm">
            {/* Just spinner for small thumbnail - no text */}
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          </div>
        )}

        {/* Remove button - only show when not processing */}
        {!isProcessing && (
          <button
            onClick={onRemove}
            className="absolute -top-1 -right-1 p-1 bg-red-500/90 hover:bg-red-600 rounded-full transition-colors shadow-lg"
            title="Remove screenshot"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
