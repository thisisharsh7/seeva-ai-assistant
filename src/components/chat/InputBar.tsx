import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useUIStore } from '../../stores/uiStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { screenshotAPI, contextAPI } from '../../lib/tauri-api';
import { Button } from '../ui';
import { Camera, Send, Settings, Loader2, Plus } from 'lucide-react';
import type { ScreenContext } from '../../lib/types';

export function InputBar() {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { sendMessage, isStreaming, createThread } = useChatStore();
  const {
    currentScreenshot,
    screenshotCache,
    setScreenshot,
    clearScreenshot,
    setCachedScreenshot,
    isSending,
    setIsSending,
    openSettings,
    isCapturingScreenshot,
    isCompressingScreenshot,
    setCapturingScreenshot,
    setCompressingScreenshot,
    screenContext,
    setScreenContext,
    clearScreenContext
  } = useUIStore();
  const { settings: appSettings } = useSettingsStore();

  // Restore screenshot from cache when component mounts (after window reopen)
  useEffect(() => {
    if (!currentScreenshot && screenshotCache) {
      setScreenshot(screenshotCache);
    }
  }, []); // Empty deps = run once on mount

  // Check if API key is configured and validated
  const provider = appSettings.defaultProvider;
  const providerSettings = (appSettings as any)[provider];
  const hasApiKey = providerSettings?.apiKey && providerSettings.apiKey.trim() !== '';
  const isApiKeyValidated = providerSettings?.isValidated === true;

  const handleScreenshot = async () => {
    try {
      // Show loading placeholder IMMEDIATELY (before API call)
      // This is a 1x1 transparent PNG - super tiny, instant display
      const loadingPlaceholder = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      setScreenshot(loadingPlaceholder);
      setCapturingScreenshot(true);

      // Call API (user already sees preview area with spinner)
      const screenshot = await screenshotAPI.capture();

      // Update with real screenshot
      setScreenshot(screenshot);
      setCachedScreenshot(screenshot);

      // Detect context after screenshot capture
      try {
        console.log('🔍 Detecting screen context...');
        const context = await contextAPI.detect() as ScreenContext;
        console.log('✅ Context detected:', context);
        setScreenContext(context);
      } catch (contextError) {
        console.error('❌ Context detection failed:', contextError);
        // Don't fail the screenshot if context detection fails
      }

      // Keep processing overlay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 300));

      // Remove loading overlay
      setCapturingScreenshot(false);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Screenshot capture failed: ${errorMessage}`);
      console.error('Full error object:', error);

      setCapturingScreenshot(false);
      setCompressingScreenshot(false);
      clearScreenshot();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming || isSending) return;

    let messageContent = input.trim();

    // Prepend context info if available
    if (screenContext) {
      const contextPrefix = `[Context: ${screenContext.app_name}${screenContext.window_title ? ` - ${screenContext.window_title}` : ''}]\n\n`;
      messageContent = contextPrefix + messageContent;
    }

    // Collect images
    const images = currentScreenshot ? [currentScreenshot] : null;

    // Clear input, screenshot, cache, and context immediately
    setInput('');
    clearScreenshot();
    setCachedScreenshot(null);
    clearScreenContext();
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

  const handleNewThread = () => {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    createThread(`New Thread ${timestamp}`);
  };

  return (
    <div className="flex-shrink-0 !bg-transparent">
      {/* API Key Warning */}
      {!hasApiKey && (
        <div className="px-2 sm:px-4 pb-2">
          <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <span className="text-[13px] text-yellow-700 flex-1">
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

      {/* Invalid API Key Warning */}
      {hasApiKey && !isApiKeyValidated && (
        <div className="px-2 sm:px-4 pb-2">
          <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <span className="text-[13px] text-red-600 flex-1">
              Invalid API key. Please check your API key in settings.
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
      <div className="border-t border-border-subtle glass-card" style={{ backdropFilter: 'blur(30px) saturate(180%)' }}>
        <div className="flex items-start gap-2 px-2 sm:px-4 py-3 min-w-0">
          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            disabled={isStreaming || isSending}
            rows={1}
            className="flex-1 min-w-0 bg-transparent text-primary placeholder-text-tertiary
                       text-[15px] leading-[1.4]
                       focus:outline-none resize-none overflow-y-auto max-h-40
                       disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* Buttons - hide during loading, show spinner instead */}
          {!isSending && !isStreaming ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewThread}
                disabled={isCapturingScreenshot || isCompressingScreenshot}
                className="flex-shrink-0 p-2"
                title="New thread"
              >
                <Plus size={22} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleScreenshot}
                disabled={isCapturingScreenshot || isCompressingScreenshot || !hasApiKey || !isApiKeyValidated}
                className="flex-shrink-0 p-2"
                title={!hasApiKey ? 'Configure API key first' : !isApiKeyValidated ? 'Validate API key first' : 'Capture screenshot'}
              >
                <Camera size={22} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSend}
                disabled={!input.trim() || isCapturingScreenshot || isCompressingScreenshot || !hasApiKey || !isApiKeyValidated}
                className="flex-shrink-0 p-2"
                title={
                  !hasApiKey
                    ? 'Configure API key first'
                    : !isApiKeyValidated
                    ? 'Validate API key first'
                    : !input.trim()
                    ? 'Type a message to send'
                    : 'Send message'
                }
              >
                <Send size={22} />
              </Button>
            </>
          ) : (
            <div className="flex-shrink-0 p-2" title="Sending...">
              <Loader2 className="animate-spin text-gray-600 dark:text-gray-400" size={22} />
            </div>
          )}
        </div>

        {/* Shortcut hint */}
        {appSettings?.shortcut && (
          <div className="pb-2 text-center text-[13px] text-tertiary">
            Press {formatShortcutDisplay(appSettings.shortcut)} to toggle overlay
          </div>
        )}
      </div>

    </div>
  );
}
