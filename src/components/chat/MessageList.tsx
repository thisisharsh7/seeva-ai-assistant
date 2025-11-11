import { useEffect, useRef } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useUIStore } from '../../stores/uiStore';
import { MessageBubble } from './MessageBubble';
import { Spinner } from '../ui';
import { MessageSquare } from 'lucide-react';

export function MessageList() {
  const { currentThreadId, isStreaming, streamingContent, getThreadMessages } = useChatStore();
  const { currentScreenshot, isCapturingScreenshot, isCompressingScreenshot } = useUIStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentMessages = currentThreadId ? getThreadMessages(currentThreadId) : [];

  // Auto-scroll to bottom when new messages arrive or screenshot appears
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, streamingContent, currentScreenshot, isCompressingScreenshot]);

  if (!currentThreadId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-tertiary">
          <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No conversation selected</p>
          <p className="text-xs mt-1">Create a new thread to start chatting</p>
        </div>
      </div>
    );
  }

  if (currentMessages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-tertiary max-w-md">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-sm">Start a conversation</p>
          <p className="text-xs mt-1">
            Type a message below or click to capture a screenshot
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 pb-32 space-y-3"
    >
      {/* Existing messages */}
      {currentMessages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {/* Screenshot being captured - show preview once captured */}
      {currentScreenshot && isCapturingScreenshot && (
        <div className="flex justify-end mb-3 animate-slide-in">
          <div className="relative max-w-md">
            <img
              src={`data:image/jpeg;base64,${currentScreenshot}`}
              alt="Screenshot preview"
              className="rounded-lg border border-border-subtle"
            />
          </div>
        </div>
      )}

      {/* Streaming message (if any) */}
      {isStreaming && streamingContent && (
        <div className="flex justify-start mb-3 animate-slide-in">
          <div className="flex flex-col max-w-[75%]">
            <div className="text-xs text-tertiary font-medium mb-1 ml-1">
              Seeva
            </div>
            <div className="message-assistant px-3 py-2.5">
              <div className="prose prose-sm prose-invert max-w-none text-[14px]">
                <p className="my-0 leading-[1.5]">{streamingContent}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1 px-1 text-xs text-tertiary">
              <Spinner size="sm" className="text-accent-blue" />
              <span>Generating...</span>
            </div>
          </div>
        </div>
      )}

      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
