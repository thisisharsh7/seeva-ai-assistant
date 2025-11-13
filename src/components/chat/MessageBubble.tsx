import { useState } from 'react';
import { Message } from '../../lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { openUrl } from '@tauri-apps/plugin-opener';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const [copied, setCopied] = useState(false);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleLinkClick = async (e: React.MouseEvent<HTMLAnchorElement>, href?: string) => {
    e.preventDefault();
    if (href) {
      try {
        await openUrl(href);
      } catch (error) {
        console.error('Failed to open URL:', error);
      }
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 animate-slide-in`}>
      <div className={`flex flex-col ${isUser ? 'max-w-[75%] sm:max-w-[65%] md:max-w-[55%] min-w-[200px]' : 'max-w-[90%] sm:max-w-[85%] md:max-w-[75%] min-w-[250px]'} group`}>
        {/* Seeva branding label for assistant messages */}
        {isAssistant && (
          <div className="text-[11px] text-tertiary font-medium mb-1 ml-1">
            Seeva
          </div>
        )}

        {/* Message bubble */}
        <div className={`${isUser ? 'message-user self-end' : 'message-assistant self-start'} px-3 py-2.5 min-w-0 w-full`}>
          {/* Message content with markdown */}
          <div className="prose prose-sm prose-invert max-w-none text-[13.5px] min-w-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="overflow-x-auto min-w-0 rounded-md" style={{ maxWidth: '100%' }}>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="my-1.5 text-[12.5px]"
                        wrapLongLines={false}
                        customStyle={{ margin: 0, maxWidth: '100%' }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="bg-glass-darker px-1.5 py-0.5 rounded text-accent-blue text-[12.5px] inline-block max-w-full overflow-x-auto" {...props}>
                      {children}
                    </code>
                  );
                },
                a: ({ children, href }) => (
                  <a
                    href={href}
                    onClick={(e) => handleLinkClick(e, href)}
                    className="text-accent-blue hover:underline cursor-pointer"
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
                  <p className="my-1.5 leading-[1.6]">{children}</p>
                ),
                h1: ({ children }) => (
                  <h1 className="text-[16px] font-bold mt-3 mb-1.5">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-[14.5px] font-bold mt-2.5 mb-1.5">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-[13.5px] font-bold mt-2 mb-1">{children}</h3>
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
        <div className={`flex items-center gap-2 mt-1 px-1 text-[11px] text-tertiary ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span>{formatTime(message.createdAt)}</span>
          {isAssistant && message.metadata?.model && (
            <>
              <span>•</span>
              <span>{message.metadata.model.split('-')[0]}</span>
            </>
          )}
        </div>

        {/* Copy button for assistant messages */}
        {isAssistant && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 mt-1 px-2 py-1 text-[11px] transition-all duration-200
                       opacity-0 group-hover:opacity-100
                       text-gray-600 dark:text-gray-400
                       hover:text-blue-600 hover:dark:text-blue-400"
            title={copied ? 'Copied!' : 'Copy message'}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
