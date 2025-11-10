import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type { Message, Thread, AIProvider } from './types';

// Thread API
export const threadAPI = {
  create: async (name: string): Promise<Thread> => {
    return await invoke('create_thread', { name });
  },

  list: async (): Promise<Thread[]> => {
    return await invoke('list_threads');
  },

  get: async (id: string): Promise<Thread | null> => {
    return await invoke('get_thread', { id });
  },

  switch: async (threadId: string): Promise<void> => {
    return await invoke('switch_thread', { threadId });
  },

  delete: async (id: string): Promise<void> => {
    return await invoke('delete_thread', { id });
  },

  updateName: async (id: string, name: string): Promise<void> => {
    return await invoke('update_thread_name', { id, name });
  },

  getCurrentId: async (): Promise<string | null> => {
    return await invoke('get_current_thread_id');
  },
};

// Chat API
export const chatAPI = {
  sendMessage: async (
    threadId: string,
    content: string,
    images: string[] | null,
    provider: AIProvider,
    apiKey: string,
    model: string
  ): Promise<Message> => {
    return await invoke('send_message', {
      threadId,
      content,
      images,
      provider,
      apiKey,
      model,
    });
  },

  getMessages: async (threadId: string): Promise<Message[]> => {
    return await invoke('get_messages', { threadId });
  },

  deleteMessage: async (id: string): Promise<void> => {
    return await invoke('delete_message', { id });
  },

  // Listen for streaming events
  onStreamEvent: (callback: (event: StreamEvent) => void) => {
    return listen<StreamEvent>('chat-stream', (event) => {
      callback(event.payload);
    });
  },
};

// Settings API
export interface ProviderSettings {
  enabled: boolean;
  apiKey: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
}

export interface AppSettings {
  defaultProvider: string;
  anthropic: ProviderSettings;
  openai: ProviderSettings;
  gemini: ProviderSettings;
  ollama: ProviderSettings;
  theme: string;
  shortcut: string;
}

export const settingsAPI = {
  get: async (): Promise<AppSettings> => {
    return await invoke('get_settings');
  },

  update: async (settings: AppSettings): Promise<void> => {
    return await invoke('update_settings', { newSettings: settings });
  },

  setDefaultProvider: async (provider: string): Promise<void> => {
    return await invoke('set_default_provider', { provider });
  },

  setApiKey: async (provider: string, apiKey: string): Promise<void> => {
    return await invoke('set_api_key', { provider, apiKey });
  },

  validateApiKey: async (provider: string, apiKey: string): Promise<{ valid: boolean; availableModels: string[]; defaultModel: string }> => {
    return await invoke('validate_api_key', { provider, apiKey });
  },
};

// Screenshot API
export const screenshotAPI = {
  capture: async (): Promise<string> => {
    return await invoke('capture_screenshot');
  },

  captureAll: async (): Promise<string[]> => {
    return await invoke('capture_all_screenshots');
  },

  captureByIndex: async (index: number): Promise<string> => {
    return await invoke('capture_screen_by_index', { index });
  },

  getScreenCount: async (): Promise<number> => {
    return await invoke('get_screen_count');
  },
};

// Stream event types
export type StreamEvent =
  | { type: 'content_delta'; delta: string }
  | { type: 'message_start' }
  | { type: 'message_stop'; usage?: { inputTokens: number; outputTokens: number } }
  | { type: 'error'; error: string };
