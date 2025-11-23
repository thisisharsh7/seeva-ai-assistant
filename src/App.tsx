import { ChatWindow } from "./components/chat";
import { ToastContainer } from "./components/ui";
import { useStreamListener } from "./hooks/useStreamListener";
import { useContextListener } from "./hooks/useContextListener";
import { useTheme } from "./hooks/useTheme";
import { useEffect } from "react";
import { shortcutAPI } from "./lib/tauri-api";
import { useSettingsStore } from "./stores/settingsStore";
import { check } from "@tauri-apps/plugin-updater";

function App() {
  // Set up event listeners
  useStreamListener();
  useContextListener();

  // Apply theme to root element
  const { theme } = useTheme();
  const { settings } = useSettingsStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Check for updates on app launch
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await check();
        if (update) {
          console.log('Update available:', update.version);
        }
      } catch (error) {
        console.error('Failed to check for updates on launch:', error);
      }
    };

    // Check for updates 2 seconds after app launch to avoid blocking startup
    const timeoutId = setTimeout(checkForUpdates, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

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
