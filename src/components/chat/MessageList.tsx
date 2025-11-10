import { useEffect, useRef } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { MessageBubble } from './MessageBubble';
import { Spinner } from '../ui';

export function MessageList() {
  const { currentThreadId, messages, isStreaming, streamingContent, getThreadMessages } = useChatStore();
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
          <p className="text-lg mb-2">No conversation selected</p>
          <p className="text-sm">Create a new thread to start chatting</p>
        </div>
      </div>
    );
  }

  if (currentMessages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-tertiary max-w-md">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-lg mb-2">Start a conversation</p>
          <p className="text-sm">
            Type a message below or press <kbd className="px-2 py-1 bg-glass-darker rounded">Cmd+Shift+S</kbd> to capture a screenshot
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 pb-32 space-y-4"
    >
      {/* Existing messages */}
      {currentMessages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {/* Streaming message (if any) */}
      {isStreaming && streamingContent && (
        <div className="flex justify-start mb-4 animate-slide-in">
          <div className="message-assistant px-4 py-3">
            <div className="prose prose-invert max-w-none">
              <p className="my-0 leading-relaxed">{streamingContent}</p>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border-subtle/50">
              <Spinner size="sm" className="text-accent-blue" />
              <span className="text-xs text-tertiary">Generating...</span>
            </div>
          </div>
        </div>
      )}

      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
