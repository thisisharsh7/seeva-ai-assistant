import { useEffect, useRef } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useUIStore } from '../../stores/uiStore';
import { MessageBubble } from './MessageBubble';
import { ScreenshotPreview } from './ScreenshotPreview';
import { ContextPill } from './ContextPill';
import { Spinner } from '../ui';
import { MessageSquare } from 'lucide-react';

export function MessageList() {
  const { currentThreadId, isStreaming, streamingContent, getThreadMessages } = useChatStore();
  const { currentScreenshot, isCapturingScreenshot, clearScreenshot, screenContext } = useUIStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentMessages = currentThreadId ? getThreadMessages(currentThreadId) : [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, streamingContent]);

  if (!currentThreadId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-tertiary">
          <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-[13px]">No conversation selected</p>
          <p className="text-[12px] mt-1">Create a new thread to start chatting</p>
        </div>
      </div>
    );
  }

  if (currentMessages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-tertiary max-w-md">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-[13px]">Start a conversation</p>
          <p className="text-[12px] mt-1">
            Type a message below or click to capture a screenshot
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      <div
        ref={containerRef}
        className="h-full overflow-y-auto overflow-x-hidden px-2 sm:px-4 py-6 space-y-3 backdrop-blur-sm"
        style={{
          backdropFilter: 'blur(8px)',
          paddingBottom: (currentScreenshot || screenContext) ? '100px' : '24px' // Add padding when screenshot or context is shown
        }}
      >
        {/* Existing messages */}
        {currentMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Streaming message (if any) */}
        {isStreaming && streamingContent && (
          <div className="flex justify-start mb-3 animate-slide-in">
            <div className="flex flex-col max-w-[90%] sm:max-w-[85%] md:max-w-[75%] min-w-[250px]">
              <div className="text-[11px] text-tertiary font-medium mb-1 ml-1">
                Seeva
              </div>
              <div className="message-assistant px-3 py-2.5">
                <div className="prose prose-sm prose-invert max-w-none text-[13.5px]">
                  <p className="my-0 leading-[1.6]">{streamingContent}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-tertiary">
                <Spinner size="sm" className="text-accent-blue" />
                <span>Generating...</span>
              </div>
            </div>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Bottom Section - Screenshot and Context */}
      {(currentScreenshot || screenContext) && (
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <div className="pointer-events-auto flex flex-col items-start gap-2 px-2 sm:px-4 pb-2">
            {currentScreenshot && (
              <ScreenshotPreview
                screenshot={currentScreenshot}
                isProcessing={isCapturingScreenshot}
                onRemove={clearScreenshot}
              />
            )}
            {screenContext && <ContextPill />}
          </div>
        </div>
      )}
    </div>
  );
}
