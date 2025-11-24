import { ModelInfo, Settings } from './types';

// App metadata
export const APP_NAME = 'Seeva AI Assistant';
export const APP_VERSION = '0.2.0';

// Default settings
export const DEFAULT_SETTINGS: Settings = {
  version: '1.0.0',
  general: {
    theme: 'dark',
    fontSize: 'medium',
    launchOnStartup: false,
    minimizeToTray: true,
    showNotifications: true,
    enableContextDetection: true,
  },
  aiProviders: {
    default: 'anthropic',
    anthropic: {
      model: 'claude-sonnet-4-5-20250929',
      maxTokens: 64000,
      temperature: 1.0,
    },
    openai: {
      model: 'gpt-5-mini',
      maxTokens: 32000,
      temperature: 1.0,
    },
    openrouter: {
      model: 'openai/gpt-5.1',
      maxTokens: 32000,
      temperature: 1.0,
    },
    gemini: {
      model: 'gemini-1.5-pro',
      maxTokens: 32000,
      temperature: 1.0,
    },
    ollama: {
      baseUrl: 'http://localhost:11434',
      model: 'llama3',
      maxTokens: 16000,
      temperature: 1.0,
    },
  },
  shortcuts: {
    toggleWindow: 'Control+Shift+Space',
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
      id: 'gpt-5-mini',
      name: 'GPT-5 Mini',
      provider: 'openai',
      contextWindow: 400000,
      supportsVision: true,
    },
    {
      id: 'gpt-5-nano',
      name: 'GPT-5 Nano',
      provider: 'openai',
      contextWindow: 400000,
      supportsVision: true,
    },
  ],
  openrouter: [
    {
      id: 'openai/gpt-5.1',
      name: 'GPT-5.1 (OpenRouter)',
      provider: 'openrouter',
      contextWindow: 200000,
      supportsVision: true,
    },
    {
      id: 'nvidia/nemotron-nano-12b-v2-vl:free',
      name: 'NVIDIA Nemotron Nano 12B Vision (Free)',
      provider: 'openrouter',
      contextWindow: 32000,
      supportsVision: true,
    },
    {
      id: 'google/gemini-2.5-flash-lite-preview-09-2025',
      name: 'Gemini 2.5 Flash Lite Preview',
      provider: 'openrouter',
      contextWindow: 1000000,
      supportsVision: true,
    },
    {
      id: 'qwen/qwen3-vl-235b-a22b-thinking',
      name: 'Qwen 3 VL 235B Thinking',
      provider: 'openrouter',
      contextWindow: 32000,
      supportsVision: true,
    },
    {
      id: 'anthropic/claude-sonnet-4',
      name: 'Claude Sonnet 4 (OpenRouter)',
      provider: 'openrouter',
      contextWindow: 200000,
      supportsVision: true,
    },
    {
      id: 'anthropic/claude-3.7-sonnet',
      name: 'Claude 3.7 Sonnet (OpenRouter)',
      provider: 'openrouter',
      contextWindow: 200000,
      supportsVision: true,
    },
    {
      id: 'google/gemini-2.0-flash-exp',
      name: 'Gemini 2.0 Flash Exp (OpenRouter)',
      provider: 'openrouter',
      contextWindow: 1000000,
      supportsVision: true,
    },
    {
      id: 'openai/gpt-4o',
      name: 'GPT-4o (OpenRouter)',
      provider: 'openrouter',
      contextWindow: 128000,
      supportsVision: true,
    },
    {
      id: 'meta-llama/llama-3.2-90b-vision-instruct',
      name: 'Llama 3.2 90B Vision (OpenRouter)',
      provider: 'openrouter',
      contextWindow: 128000,
      supportsVision: true,
    },
    {
      id: 'x-ai/grok-2-vision-1212',
      name: 'Grok 2 Vision (OpenRouter)',
      provider: 'openrouter',
      contextWindow: 128000,
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
  openrouter: 'https://openrouter.ai/api/v1',
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
  'Control+Shift+Space': 'Toggle window visibility',
  'CommandOrControl+Shift+S': 'Capture screenshot',
  'CommandOrControl+N': 'Create new thread',
  'Control+Enter': 'Send message',
  'Escape': 'Close window/modal',
};
