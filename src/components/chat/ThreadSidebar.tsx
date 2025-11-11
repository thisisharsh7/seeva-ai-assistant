import { useState } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { Button } from '../ui';
import { Plus, MessageSquare, Trash2, Settings, ChevronLeft, Trash } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { ask, message } from '@tauri-apps/plugin-dialog';

export function ThreadSidebar() {
  const { threads, currentThreadId, setCurrentThread, createThread, deleteThread, clearAllThreads } = useChatStore();
  const { openSettings, isSidebarOpen, toggleSidebar } = useUIStore();
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [isDeletingThread, setIsDeletingThread] = useState<string | null>(null);
  const [isClearingThreads, setIsClearingThreads] = useState(false);

  const handleCreateThread = async () => {
    // Generate a unique thread name
    const threadNumber = threads.length + 1;
    const threadName = `New Thread #${threadNumber}`;

    // Show confirmation dialog
    await message(`Creating thread: "${threadName}"`, {
      title: 'New Thread',
      kind: 'info',
    });

    setIsCreatingThread(true);
    try {
      await createThread(threadName);
    } catch (error) {
      // Error already shown via toast in store
    } finally {
      setIsCreatingThread(false);
    }
  };

  const handleDeleteThread = async (threadId: string, e: React.MouseEvent) => {
    console.log('🗑️ Delete button clicked for thread:', threadId);

    e.stopPropagation();
    console.log('✓ Event propagation stopped');

    const confirmed = await ask('Are you sure you want to delete this thread?', {
      title: 'Delete Thread',
      kind: 'warning',
      okLabel: 'Delete',
      cancelLabel: 'Cancel'
    });
    console.log('📊 Dialog result:', confirmed);

    if (confirmed) {
      console.log('✓ User confirmed deletion');
      setIsDeletingThread(threadId);

      try {
        console.log('📡 Calling deleteThread API...');
        await deleteThread(threadId);
        console.log('✅ Thread deleted successfully');
      } catch (error) {
        console.error('❌ Failed to delete thread:', error);
      } finally {
        setIsDeletingThread(null);
        console.log('🔄 Reset deleting state');
      }
    } else {
      console.log('❌ User cancelled deletion');
    }
  };

  const handleClearAllThreads = async () => {
    const confirmed = await ask('Are you sure you want to clear ALL threads? This action cannot be undone.', {
      title: 'Clear All Threads',
      kind: 'warning',
      okLabel: 'Clear All',
      cancelLabel: 'Cancel'
    });

    if (confirmed) {
      setIsClearingThreads(true);
      try {
        await clearAllThreads();
      } catch (error) {
        // Error already shown via toast in store
      } finally {
        setIsClearingThreads(false);
      }
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

  if (!isSidebarOpen) return null;

  return (
    <div className="w-56 glass-card flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-border-subtle flex items-center justify-between">
        <h2 className="text-base font-semibold text-primary">Threads</h2>
        <div className="flex gap-1.5 -webkit-app-region-no-drag">
          <button
            onClick={handleClearAllThreads}
            disabled={isClearingThreads || threads.length === 0}
            className="p-1.5 hover:bg-glass-darker rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear all threads"
          >
            <Trash size={16} className="text-red-400" />
          </button>
          <button
            onClick={openSettings}
            className="p-1.5 hover:bg-glass-darker rounded transition-colors"
            title="Settings"
          >
            <Settings size={16} className="text-secondary" />
          </button>
          <button
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-glass-darker rounded transition-colors"
            title="Close sidebar"
          >
            <ChevronLeft size={16} className="text-secondary" />
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
          <div className="p-2 space-y-1 -webkit-app-region-no-drag">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className={`w-full p-3 rounded-lg transition-all group cursor-pointer ${
                  currentThreadId === thread.id
                    ? 'bg-accent-blue/20 border border-accent-blue/40'
                    : 'hover:bg-glass-darker border border-transparent'
                }`}
                onClick={() => setCurrentThread(thread.id)}
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
                    disabled={isDeletingThread === thread.id}
                    className="invisible pointer-events-none group-hover:visible group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-glass-darker rounded transition-all flex-shrink-0 disabled:opacity-50 -webkit-app-region-no-drag"
                    title="Delete thread"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
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
          disabled={isCreatingThread}
          isLoading={isCreatingThread}
          className="w-full"
        >
          <Plus size={16} />
          New Thread
        </Button>
      </div>
    </div>
  );
}
