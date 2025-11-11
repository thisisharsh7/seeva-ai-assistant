import { useState, useEffect } from 'react';
import { ThreadSidebar } from './ThreadSidebar';
import { MessageList } from './MessageList';
import { InputBar } from './InputBar';
import { SettingsModal } from '../settings';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useUIStore } from '../../stores/uiStore';
import { ChevronRight, Minus } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export function ChatWindow() {
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const [windowWidth, setWindowWidth] = useState(480);

  // Track window width for responsive behavior
  useEffect(() => {
    const updateWidth = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', updateWidth);
    updateWidth(); // Set initial width

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleMinimize = async () => {
    const appWindow = getCurrentWindow();
    await appWindow.minimize();
  };

  // Determine if we should use overlay mode (drawer)
  const isOverlayMode = windowWidth < 600;

  return (
    <div className="w-full h-screen flex overflow-hidden relative" style={{ backgroundColor: 'transparent' }}>
      {/* Backdrop overlay - only shown in overlay mode when sidebar is open */}
      {isOverlayMode && isSidebarOpen && (
        <div
          className="absolute inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-200"
          onClick={toggleSidebar}
        />
      )}

      {/* Thread Sidebar - positioning changes based on mode */}
      {isSidebarOpen && (
        <div className={`
          ${isOverlayMode
            ? 'absolute left-0 top-0 bottom-0 z-50'
            : 'relative'
          }
        `}>
          <ThreadSidebar isOverlayMode={isOverlayMode} />
        </div>
      )}

      {/* Main Chat Area - margin adjusts based on mode and sidebar state */}
      <div className={`
        flex-1 flex flex-col glass-window transition-all duration-200
        ${!isOverlayMode && isSidebarOpen ? 'ml-4' : 'ml-0'}
      `}>
        {/* Header Bar */}
        <div
          data-tauri-drag-region
          className="flex items-center justify-between px-3 py-1.5 border-b border-border-subtle cursor-move"
        >
          {/* Left Side - Toggle Button (shown when sidebar closed OR in overlay mode) */}
          <div className="flex items-center gap-3">
            {(!isSidebarOpen || isOverlayMode) && (
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
          <div className="flex gap-1.5">
            {/* Theme Toggle */}
            <ThemeToggle />

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
