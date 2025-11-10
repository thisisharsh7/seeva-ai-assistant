import { create } from 'zustand';

interface UIState {
  // Modals
  isSettingsOpen: boolean;
  isScreenshotPreviewOpen: boolean;

  // Screenshot
  currentScreenshot: string | null; // Base64 encoded image

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

  setIsSending: (isSending: boolean) => void;

  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  isSettingsOpen: false,
  isScreenshotPreviewOpen: false,
  currentScreenshot: null,
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

  // Loading actions
  setIsSending: (isSending) => set({ isSending }),

  // Sidebar actions
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
