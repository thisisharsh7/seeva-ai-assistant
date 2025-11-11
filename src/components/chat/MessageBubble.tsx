import { Message } from '../../lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 animate-slide-in`}>
      <div className={`flex flex-col ${isUser ? 'max-w-[55%]' : 'max-w-[75%]'}`}>
        {/* Seeva branding label for assistant messages */}
        {isAssistant && (
          <div className="text-xs text-tertiary font-medium mb-1 ml-1">
            Seeva
          </div>
        )}

        {/* Message bubble */}
        <div className={`${isUser ? 'message-user self-end' : 'message-assistant self-start'} px-3 py-2.5`}>
          {/* Message content with markdown */}
          <div className="prose prose-sm prose-invert max-w-none text-[14px]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-md my-1.5 text-[13px]"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-glass-darker px-1.5 py-0.5 rounded text-accent-blue text-[13px]" {...props}>
                      {children}
                    </code>
                  );
                },
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-blue hover:underline"
                  >
                    {children}
                  </a>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 my-1.5">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 my-1.5">{children}</ol>
                ),
                p: ({ children }) => (
                  <p className="my-1.5 leading-[1.5]">{children}</p>
                ),
                h1: ({ children }) => (
                  <h1 className="text-lg font-bold mt-3 mb-1.5">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-bold mt-2.5 mb-1.5">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Images if present */}
          {message.images && message.images.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-2">
              {message.images.map((img, idx) => (
                <img
                  key={idx}
                  src={`data:image/png;base64,${img}`}
                  alt={`Screenshot ${idx + 1}`}
                  className="w-full max-w-sm h-auto rounded border border-border-subtle"
                />
              ))}
            </div>
          )}
        </div>

        {/* Timestamp below bubble */}
        <div className={`flex items-center gap-2 mt-1 px-1 text-xs text-tertiary ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span>{formatTime(message.createdAt)}</span>
          {isAssistant && message.metadata?.model && (
            <>
              <span>•</span>
              <span>{message.metadata.model.split('-')[0]}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
