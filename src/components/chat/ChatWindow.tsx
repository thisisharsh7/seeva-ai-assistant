import { ThreadSidebar } from './ThreadSidebar';
import { MessageList } from './MessageList';
import { InputBar } from './InputBar';
import { SettingsModal } from '../settings';
import { useUIStore } from '../../stores/uiStore';
import { ChevronRight } from 'lucide-react';

export function ChatWindow() {
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className="w-full h-screen flex bg-transparent">
      {/* Thread Sidebar */}
      <ThreadSidebar />

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col glass-window relative transition-all duration-300 ${
        isSidebarOpen ? 'ml-4' : 'ml-0'
      }`}>
        {/* Toggle Button - Appears when sidebar is closed */}
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute left-4 top-4 z-50 p-2 rounded-full bg-glass-dark/90 hover:bg-glass-light border border-border-subtle transition-all"
            title="Open sidebar"
          >
            <ChevronRight size={20} className="text-text-secondary" />
          </button>
        )}

        {/* Messages */}
        <MessageList />

        {/* Input Bar - Floating */}
        <InputBar />
      </div>

      {/* Settings Modal */}
      <SettingsModal />
    </div>
  );
}
