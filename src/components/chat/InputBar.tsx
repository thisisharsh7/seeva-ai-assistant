import { useState, useRef, KeyboardEvent } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useUIStore } from '../../stores/uiStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { screenshotAPI } from '../../lib/tauri-api';
import { Button } from '../ui';
import { Camera, Send, Settings } from 'lucide-react';

export function InputBar() {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { sendMessage, isStreaming } = useChatStore();
  const {
    currentScreenshot,
    setScreenshot,
    clearScreenshot,
    isSending,
    setIsSending,
    openSettings,
    isCapturingScreenshot,
    isCompressingScreenshot,
    setCapturingScreenshot,
    setCompressingScreenshot
  } = useUIStore();
  const { settings: appSettings } = useSettingsStore();

  // Check if API key is configured
  const provider = appSettings.defaultProvider;
  const providerSettings = (appSettings as any)[provider];
  const hasApiKey = providerSettings?.apiKey && providerSettings.apiKey.trim() !== '';

  const handleScreenshot = async () => {
    console.log('🎬 [UI] Camera button clicked - starting screenshot capture');

    try {
      console.log('⏳ [UI] Setting capturing state to true...');
      setCapturingScreenshot(true);

      console.log('📡 [UI] Calling Tauri screenshot API...');
      const startTime = performance.now();
      const screenshot = await screenshotAPI.capture();
      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(0);

      console.log(`✅ [UI] Screenshot received from backend (took ${duration}ms)`);
      console.log(`📊 [UI] Screenshot base64 length: ${screenshot.length} characters`);

      console.log('🖼️  [UI] Setting screenshot in state...');
      setScreenshot(screenshot);

      console.log('✅ [UI] Screenshot capture complete - resetting states');
      setCapturingScreenshot(false);
      // NOTE: Compression happens in backend (Rust), no need for fake UI state
      // The backend already resizes, converts to JPEG, and encodes to base64
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ [UI] Screenshot capture failed: ${errorMessage}`);
      console.error('[UI] Full error object:', error);

      console.log('🔄 [UI] Resetting screenshot states due to error');
      setCapturingScreenshot(false);
      setCompressingScreenshot(false);

      // TODO: Add toast notification to inform user about the error
      // toast.error(`Screenshot failed: ${errorMessage}`);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming || isSending) return;

    const messageContent = input.trim();
    const images = currentScreenshot ? [currentScreenshot] : null;

    // Clear input and screenshot immediately
    setInput('');
    clearScreenshot();
    setIsSending(true);

    try {
      await sendMessage(messageContent, images);
    } finally {
      setIsSending(false);
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const formatShortcutDisplay = (shortcut: string): string => {
    return shortcut
      .replace(/CommandOrControl/g, '⌘/Ctrl')
      .replace(/Command/g, '⌘')
      .replace(/Control/g, 'Ctrl')
      .replace(/Shift/g, '⇧')
      .replace(/Alt/g, '⌥')
      .replace(/\+/g, '');
  };

  return (
    <div className="absolute bottom-0 left-0 right-0">
      {/* API Key Warning */}
      {!hasApiKey && (
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <span className="text-sm text-yellow-200 flex-1">
              API key not configured. Please add your API key to send messages.
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={openSettings}
              className="flex-shrink-0"
            >
              <Settings size={16} />
              Settings
            </Button>
          </div>
        </div>
      )}

      {/* Input Bar - Full Width */}
      <div className="border-t border-border-subtle glass-card backdrop-blur-sm">
        <div className="flex items-start gap-2 px-4 py-3">
          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            disabled={isStreaming || isSending}
            rows={1}
            className="flex-1 bg-transparent text-primary placeholder-text-tertiary
                       focus:outline-none resize-none overflow-y-auto max-h-40
                       disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* Buttons */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleScreenshot}
            disabled={isStreaming || isSending || isCapturingScreenshot || isCompressingScreenshot || !hasApiKey}
            className="flex-shrink-0 p-2"
            title="Capture screenshot"
          >
            <Camera size={22} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming || isSending || isCapturingScreenshot || isCompressingScreenshot || !hasApiKey}
            isLoading={isSending}
            className="flex-shrink-0 p-2"
            title={!hasApiKey ? 'Configure API key first' : 'Send message'}
          >
            <Send size={22} />
          </Button>
        </div>

        {/* Shortcut hint */}
        {appSettings?.shortcut && (
          <div className="pb-2 text-center text-xs text-tertiary">
            Press {formatShortcutDisplay(appSettings.shortcut)} to toggle overlay
          </div>
        )}
      </div>

    </div>
  );
}
