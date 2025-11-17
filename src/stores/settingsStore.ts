import { create } from 'zustand';
import { AIProvider } from '../lib/types';
import { settingsAPI, type AppSettings } from '../lib/tauri-api';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;

  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
  setDefaultProvider: (provider: string) => Promise<void>;
  setApiKey: (provider: string, apiKey: string) => Promise<void>;

  // Getters
  getProviderConfig: (provider: AIProvider) => any;
}

// Default settings matching Rust backend structure
const defaultSettings: AppSettings = {
  defaultProvider: 'anthropic',
  anthropic: {
    enabled: true,
    apiKey: '',
    defaultModel: 'claude-sonnet-4-5-20250929',
    temperature: 0.7,
    maxTokens: 64000,
    isValidated: false,
  },
  openai: {
    enabled: false,
    apiKey: '',
    defaultModel: 'gpt-5-mini',
    temperature: 0.7,
    maxTokens: 32000,
    isValidated: false,
  },
  openrouter: {
    enabled: false,
    apiKey: '',
    defaultModel: 'openai/gpt-5.1',
    temperature: 0.7,
    maxTokens: 32000,
    isValidated: false,
  },
  gemini: {
    enabled: false,
    apiKey: '',
    defaultModel: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 32000,
    isValidated: false,
  },
  ollama: {
    enabled: false,
    apiKey: '',
    defaultModel: 'llama2',
    temperature: 0.7,
    maxTokens: 16000,
    isValidated: false,
  },
  theme: 'dark',
  shortcut: 'CommandOrControl+Shift+Space',
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings, // Start with defaults instead of null
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const settings = await settingsAPI.get();
      set({ settings, isLoading: false });
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Keep default settings on error
      set({ isLoading: false });
    }
  },

  updateSettings: async (newSettings) => {
    try {
      await settingsAPI.update(newSettings);
      set({ settings: newSettings });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  },

  setDefaultProvider: async (provider) => {
    try {
      await settingsAPI.setDefaultProvider(provider);
      set((state) => {
        if (!state.settings) return state;
        return {
          settings: {
            ...state.settings,
            defaultProvider: provider,
          },
        };
      });
    } catch (error) {
      console.error('Failed to set default provider:', error);
    }
  },

  setApiKey: async (provider, apiKey) => {
    try {
      await settingsAPI.setApiKey(provider, apiKey);
      set((state) => {
        if (!state.settings) return state;
        return {
          settings: {
            ...state.settings,
            [provider]: {
              ...(state.settings as any)[provider],
              apiKey,
            },
          },
        };
      });
    } catch (error) {
      console.error('Failed to set API key:', error);
    }
  },

  getProviderConfig: (provider) => {
    const state = get();
    if (!state.settings) return null;
    return (state.settings as any)[provider];
  },
}));

// Initialize store by loading settings
if (typeof window !== 'undefined') {
  useSettingsStore.getState().loadSettings();
}
