import { ThreadSidebar } from './ThreadSidebar';
import { MessageList } from './MessageList';
import { InputBar } from './InputBar';
import { SettingsModal } from '../settings';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useUIStore } from '../../stores/uiStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { ChevronRight, Move, Minus, Command } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export function ChatWindow() {
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { settings } = useSettingsStore();

  const formatShortcutDisplay = (shortcut: string): string => {
    return shortcut
      .replace(/CommandOrControl/g, '⌘/Ctrl')
      .replace(/Command/g, '⌘')
      .replace(/Control/g, 'Ctrl')
      .replace(/Shift/g, '⇧')
      .replace(/Alt/g, '⌥')
      .replace(/\+/g, '');
  };

  const handleMinimize = async () => {
    const appWindow = getCurrentWindow();
    await appWindow.minimize();
  };

  const handleDragStart = async () => {
    const appWindow = getCurrentWindow();
    await appWindow.startDragging();
  };

  return (
    <div className="w-full h-screen flex gap-4 bg-transparent overflow-hidden">
      {/* Thread Sidebar */}
      <ThreadSidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col glass-window min-w-[280px]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border-subtle -webkit-app-region-drag">
          {/* Left Side - Toggle Button and Shortcut Hint */}
          <div className="flex items-center gap-3 -webkit-app-region-no-drag">
            {!isSidebarOpen && (
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-lg bg-glass-dark/10 hover:bg-glass-light border border-border-subtle transition-all"
                title="Open sidebar"
              >
                <ChevronRight size={18} className="text-secondary" />
              </button>
            )}
          </div>

          {/* Right Side - Window Controls */}
          <div className="flex gap-1.5 -webkit-app-region-no-drag">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Drag Handle */}
            <button
              onClick={handleDragStart}
              className="p-1.5 hover:bg-glass-darker rounded transition-colors"
              title="Drag to move window"
            >
              <Move size={16} className="text-secondary" />
            </button>

            {/* Minimize Button */}
            <button
              onClick={handleMinimize}
              className="p-1.5 hover:bg-glass-darker rounded transition-colors"
              title="Minimize"
            >
              <Minus size={18} className="text-secondary" />
            </button>
          </div>
        </div>

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
