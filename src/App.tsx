import { ChatWindow } from "./components/chat";
import { ToastContainer } from "./components/ui";
import { useStreamListener } from "./hooks/useStreamListener";
import { useTheme } from "./hooks/useTheme";
import { useEffect } from "react";
import { shortcutAPI } from "./lib/tauri-api";
import { useSettingsStore } from "./stores/settingsStore";

function App() {
  // Set up stream event listener
  useStreamListener();

  // Apply theme to root element
  const { theme } = useTheme();
  const { settings } = useSettingsStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Register global shortcut on mount and when shortcut changes
  // Note: Window toggle is now handled directly in Rust to avoid race conditions
  useEffect(() => {
    if (!settings?.shortcut) return;

    const registerShortcut = async () => {
      try {
        await shortcutAPI.register(settings.shortcut);
      } catch (error) {
        console.error('Failed to register global shortcut:', error);
      }
    };

    registerShortcut();

    // Cleanup: unregister on unmount
    return () => {
      shortcutAPI.unregister().catch(console.error);
    };
  }, [settings?.shortcut]);

  return (
    <>
      <ChatWindow />
      <ToastContainer />
    </>
  );
}

export default App;
