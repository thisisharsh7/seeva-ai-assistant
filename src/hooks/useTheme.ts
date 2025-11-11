import { useSettingsStore } from '../stores/settingsStore';

/**
 * Custom hook to access and manage theme state
 * @returns Object containing current theme and helper utilities
 */
export const useTheme = () => {
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);

  const theme = settings.theme || 'dark';

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    await updateSettings({
      ...settings,
      theme: newTheme,
    });
  };

  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  return {
    theme,
    isDark,
    isLight,
    toggleTheme,
  };
};
