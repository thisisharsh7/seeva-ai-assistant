import { ModelInfo, Settings } from './types';

// App metadata
export const APP_NAME = 'Seeva AI Assistant';
export const APP_VERSION = '0.1.6';

// Default settings
export const DEFAULT_SETTINGS: Settings = {
  version: '1.0.0',
  general: {
    theme: 'dark',
    fontSize: 'medium',
    launchOnStartup: false,
    minimizeToTray: true,
    showNotifications: true,
  },
  aiProviders: {
    default: 'anthropic',
    anthropic: {
      model: 'claude-sonnet-4-5-20250929',
      maxTokens: 4096,
      temperature: 1.0,
    },
    openai: {
      model: 'gpt-4o',
      maxTokens: 4096,
      temperature: 1.0,
    },
    openrouter: {
      model: 'anthropic/claude-3.5-sonnet',
      maxTokens: 4096,
      temperature: 1.0,
    },
    gemini: {
      model: 'gemini-1.5-pro',
      maxTokens: 4096,
      temperature: 1.0,
    },
    ollama: {
      baseUrl: 'http://localhost:11434',
      model: 'llama3',
      maxTokens: 4096,
      temperature: 1.0,
    },
  },
  shortcuts: {
    toggleWindow: 'CommandOrControl+Shift+C',
    screenshot: 'CommandOrControl+Shift+S',
    newThread: 'CommandOrControl+N',
  },
  appearance: {
    glassmorphism: true,
    transparency: 0.85,
    blurRadius: 20,
    accentColor: '#3b82f6',
  },
  advanced: {
    debug: false,
    logLevel: 'info',
    autoSave: true,
    contextLimit: 50,
  },
};

// Available models per provider
export const AVAILABLE_MODELS: Record<string, ModelInfo[]> = {
  anthropic: [
    {
      id: 'claude-sonnet-4-5-20250929',
      name: 'Claude Sonnet 4.5',
      provider: 'anthropic',
      contextWindow: 200000,
      supportsVision: true,
    },
    {
      id: 'claude-haiku-4-5-20251001',
      name: 'Claude Haiku 4.5',
      provider: 'anthropic',
      contextWindow: 200000,
      supportsVision: true,
    },
    {
      id: 'claude-opus-4-1-20250805',
      name: 'Claude Opus 4.1',
      provider: 'anthropic',
      contextWindow: 200000,
      supportsVision: true,
    },
  ],
  openai: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      contextWindow: 128000,
      supportsVision: true,
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      contextWindow: 128000,
      supportsVision: true,
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      contextWindow: 8192,
      supportsVision: true,
    },
  ],
  gemini: [
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'gemini',
      contextWindow: 1000000,
      supportsVision: true,
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'gemini',
      contextWindow: 1000000,
      supportsVision: true,
    },
  ],
  ollama: [
    // Ollama models are user-installed, this is just examples
    {
      id: 'llama3',
      name: 'Llama 3',
      provider: 'ollama',
      contextWindow: 8192,
      supportsVision: false,
    },
    {
      id: 'mistral',
      name: 'Mistral',
      provider: 'ollama',
      contextWindow: 8192,
      supportsVision: false,
    },
    {
      id: 'codellama',
      name: 'Code Llama',
      provider: 'ollama',
      contextWindow: 16384,
      supportsVision: false,
    },
  ],
};

// UI Constants
export const WINDOW_SIZES = {
  default: { width: 480, height: 700 },
  min: { width: 400, height: 500 },
  max: { width: 800, height: 1200 },
};

export const FONT_SIZES = {
  small: '14px',
  medium: '16px',
  large: '18px',
};

// API Endpoints (base URLs)
export const API_ENDPOINTS = {
  anthropic: 'https://api.anthropic.com/v1',
  openai: 'https://api.openai.com/v1',
  gemini: 'https://generativelanguage.googleapis.com/v1',
  ollama: 'http://localhost:11434',
};

// Error codes
export const ERROR_CODES = {
  API_KEY_MISSING: 'API_KEY_MISSING',
  API_KEY_INVALID: 'API_KEY_INVALID',
  NETWORK_ERROR: 'NETWORK_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  INVALID_REQUEST: 'INVALID_REQUEST',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

// Keyboard shortcuts help text
export const SHORTCUT_DESCRIPTIONS = {
  'CommandOrControl+Shift+C': 'Toggle window visibility',
  'CommandOrControl+Shift+S': 'Capture screenshot',
  'CommandOrControl+N': 'Create new thread',
  'Control+Enter': 'Send message',
  'Escape': 'Close window/modal',
};
