import { useState, useRef, KeyboardEvent } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useUIStore } from '../../stores/uiStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { screenshotAPI } from '../../lib/tauri-api';
import { Button } from '../ui';
import { Camera, Send, X, Settings } from 'lucide-react';

export function InputBar() {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { sendMessage, isStreaming } = useChatStore();
  const { currentScreenshot, setScreenshot, clearScreenshot, isSending, setIsSending, openSettings } = useUIStore();
  const { settings: appSettings } = useSettingsStore();

  // Check if API key is configured
  const provider = appSettings.defaultProvider;
  const providerSettings = (appSettings as any)[provider];
  const hasApiKey = providerSettings?.apiKey && providerSettings.apiKey.trim() !== '';

  const handleScreenshot = async () => {
    try {
      setIsSending(true);
      const screenshot = await screenshotAPI.capture();
      setScreenshot(screenshot);
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    } finally {
      setIsSending(false);
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
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4">
      {/* Screenshot Preview */}
      {currentScreenshot && (
        <div className="mb-4">
          <div className="relative inline-block">
            <img
              src={`data:image/png;base64,${currentScreenshot}`}
              alt="Screenshot preview"
              className="max-h-32 rounded-lg border border-border-subtle"
            />
            <button
              onClick={clearScreenshot}
              className="absolute -top-2 -right-2 p-1 rounded-full bg-glass-dark/90 hover:bg-glass-light transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* API Key Warning */}
      {!hasApiKey && (
        <div className="mb-4">
          <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <span className="text-sm text-yellow-200 flex-1">
              API key not configured. Please add your API key to send messages.
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={openSettings}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <Settings size={16} />
              Settings
            </Button>
          </div>
        </div>
      )}

      {/* Input Container - Floating */}
      <div className="relative border border-border-subtle rounded-xl bg-glass-dark/80 backdrop-blur-md focus-within:border-accent-blue/50 transition-all overflow-hidden">
        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          disabled={isStreaming || isSending}
          rows={1}
          className="w-full bg-transparent px-4 py-2 pr-24
                     text-text-primary placeholder-text-tertiary
                     focus:outline-none
                     resize-none transition-all overflow-y-auto
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Buttons Container - Bottom Right */}
        <div className="absolute bottom-2 right-3 flex items-center gap-2">
          {/* Screenshot Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleScreenshot}
            disabled={isStreaming || isSending}
            className="flex-shrink-0"
            title="Capture screenshot"
          >
            <Camera size={20} />
          </Button>

          {/* Send Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming || isSending || !hasApiKey}
            isLoading={isSending}
            className="flex-shrink-0"
            title={!hasApiKey ? 'Configure API key first' : 'Send message'}
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
