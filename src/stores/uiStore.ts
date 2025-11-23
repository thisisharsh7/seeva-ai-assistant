import { create } from 'zustand';
import type { ScreenContext } from '../lib/types';

interface UIState {
  // Modals
  isSettingsOpen: boolean;
  isScreenshotPreviewOpen: boolean;

  // Screenshot
  currentScreenshot: string | null; // Base64 encoded image
  screenshotCache: string | null; // Persistent cache for window reopens
  isCapturingScreenshot: boolean;
  isCompressingScreenshot: boolean;

  // Screen Context
  screenContext: ScreenContext | null;

  // Loading states
  isSending: boolean;

  // Sidebar
  isSidebarOpen: boolean;

  // Actions
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;

  openScreenshotPreview: (screenshot: string) => void;
  closeScreenshotPreview: () => void;

  setScreenshot: (screenshot: string | null) => void;
  clearScreenshot: () => void;
  setCachedScreenshot: (screenshot: string | null) => void;
  setCapturingScreenshot: (isCapturing: boolean) => void;
  setCompressingScreenshot: (isCompressing: boolean) => void;

  // Screen Context actions
  setScreenContext: (context: ScreenContext | null) => void;
  clearScreenContext: () => void;

  setIsSending: (isSending: boolean) => void;

  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  isSettingsOpen: false,
  isScreenshotPreviewOpen: false,
  currentScreenshot: null,
  screenshotCache: null,
  isCapturingScreenshot: false,
  isCompressingScreenshot: false,
  screenContext: null,
  isSending: false,
  isSidebarOpen: true,

  // Settings actions
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

  // Screenshot actions
  openScreenshotPreview: (screenshot) =>
    set({ isScreenshotPreviewOpen: true, currentScreenshot: screenshot }),
  closeScreenshotPreview: () =>
    set({ isScreenshotPreviewOpen: false }),

  setScreenshot: (screenshot) => set({ currentScreenshot: screenshot }),
  clearScreenshot: () => set({ currentScreenshot: null }),
  setCachedScreenshot: (screenshot) => set({ screenshotCache: screenshot }),
  setCapturingScreenshot: (isCapturing) => set({ isCapturingScreenshot: isCapturing }),
  setCompressingScreenshot: (isCompressing) => set({ isCompressingScreenshot: isCompressing }),

  // Screen Context actions
  setScreenContext: (context) => set({ screenContext: context }),
  clearScreenContext: () => set({ screenContext: null }),

  // Loading actions
  setIsSending: (isSending) => set({ isSending }),

  // Sidebar actions
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
