import { MessageList } from './MessageList';
import { InputBar } from './InputBar';
import { ThreadSelector } from './ThreadSelector';
import { SettingsModal } from '../settings';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useUIStore } from '../../stores/uiStore';
import { Settings, GripVertical } from 'lucide-react';

export function ChatWindow() {
  const { openSettings } = useUIStore();

  return (
    <div className="w-full h-screen flex overflow-hidden relative">
      {/* Main Chat Area - Full width, no sidebar */}
      <div className="flex-1 flex flex-col glass-window min-w-[360px]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border-subtle">
          {/* Left Side - Settings & Thread Selector */}
          <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
            <button
              onClick={openSettings}
              className="p-1.5 rounded hover:bg-glass-darker transition-colors flex-shrink-0"
              title="Settings"
            >
              <Settings size={18} className="text-secondary" />
            </button>

            <div className="min-w-0 flex-1 max-w-[200px]">
              <ThreadSelector />
            </div>
          </div>

          {/* Right Side - Window Controls */}
          <div className="flex gap-1.5 flex-shrink-0">
            {/* Theme Toggle */}
            <div>
              <ThemeToggle />
            </div>

             {/* Drag Handle */}
            <div
              data-tauri-drag-region
              style={{ cursor: 'move' }}
              className="p-1.5 hover:bg-glass-darker rounded transition-colors"
              title="Drag to move window"
            >
              <GripVertical size={18} style={{ pointerEvents: 'none' }} className="text-secondary" />
            </div>

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
