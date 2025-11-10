import { useState } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { Button } from '../ui';
import { Plus, MessageSquare, Trash2, Settings, ChevronLeft } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

export function ThreadSidebar() {
  const { threads, currentThreadId, setCurrentThread, createThread, deleteThread } = useChatStore();
  const { openSettings, isSidebarOpen, toggleSidebar } = useUIStore();
  const [isCreatingThread, setIsCreatingThread] = useState(false);

  const handleCreateThread = () => {
    const name = prompt('Enter thread name:');
    if (name?.trim()) {
      createThread(name.trim());
    }
  };

  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this thread?')) {
      deleteThread(threadId);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className={`relative glass-card flex flex-col h-full transition-all duration-300 ${
      isSidebarOpen ? 'w-56' : 'w-0 opacity-0 pointer-events-none'
    }`}>
      {/* Toggle Button - At right edge */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 z-50 p-1.5 rounded-full bg-glass-dark/90 hover:bg-glass-light border border-border-subtle transition-all"
        title="Toggle sidebar"
      >
        <ChevronLeft size={16} className="text-text-secondary" />
      </button>

      {/* Header */}
      <div className="p-4 border-b border-border-subtle flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary">Threads</h2>
        <div className="flex gap-2">
          <button
            onClick={openSettings}
            className="p-2 hover:bg-glass-darker rounded transition-colors"
            title="Settings"
          >
            <Settings size={18} className="text-secondary" />
          </button>
          <button
            onClick={handleCreateThread}
            className="p-2 hover:bg-glass-darker rounded transition-colors"
            title="New thread (Cmd+N)"
          >
            <Plus size={18} className="text-secondary" />
          </button>
        </div>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="p-4 text-center text-tertiary">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No threads yet</p>
            <p className="text-xs mt-1">Click + to create one</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setCurrentThread(thread.id)}
                className={`w-full p-3 rounded-lg text-left transition-all group ${
                  currentThreadId === thread.id
                    ? 'bg-accent-blue/20 border border-accent-blue/40'
                    : 'hover:bg-glass-darker border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-secondary flex-shrink-0" />
                      <h3 className="font-medium text-primary text-sm truncate">
                        {thread.name}
                      </h3>
                    </div>
                    {thread.lastMessage && (
                      <p className="text-xs text-tertiary truncate mt-1">
                        {thread.lastMessage}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-tertiary">
                        {formatDate(thread.updatedAt)}
                      </span>
                      {thread.messageCount !== undefined && (
                        <span className="text-xs text-tertiary">
                          • {thread.messageCount} msg{thread.messageCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteThread(thread.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-glass-darker rounded transition-all flex-shrink-0"
                    title="Delete thread"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border-subtle">
        <Button
          variant="primary"
          size="sm"
          onClick={handleCreateThread}
          className="w-full"
        >
          <Plus size={16} className="mr-2" />
          New Thread
        </Button>
      </div>
    </div>
  );
}
