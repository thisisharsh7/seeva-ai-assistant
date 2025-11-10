// Core types for Seeva AI Assistant

export type MessageRole = 'user' | 'assistant' | 'system';

export type AIProvider = 'anthropic' | 'openai' | 'gemini' | 'ollama';

export interface Message {
  id: string;
  threadId: string;
  role: MessageRole;
  content: string;
  images?: string[]; // Base64 encoded images
  createdAt: number;
  metadata?: {
    model?: string;
    tokens?: number;
    provider?: AIProvider;
    error?: string;
  };
}

export interface Thread {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  messageCount?: number;
  lastMessage?: string;
}

export interface ProviderConfig {
  apiKey?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  baseUrl?: string; // For Ollama
}

export interface Settings {
  version: string;
  general: {
    theme: 'dark' | 'light';
    fontSize: 'small' | 'medium' | 'large';
    launchOnStartup: boolean;
    minimizeToTray: boolean;
    showNotifications: boolean;
  };
  aiProviders: {
    default: AIProvider;
    anthropic: ProviderConfig;
    openai: ProviderConfig;
    gemini: ProviderConfig;
    ollama: ProviderConfig;
  };
  shortcuts: {
    toggleWindow: string;
    screenshot: string;
    newThread: string;
  };
  appearance: {
    glassmorphism: boolean;
    transparency: number;
    blurRadius: number;
    accentColor: string;
  };
  advanced: {
    debug: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    autoSave: boolean;
    contextLimit: number;
  };
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: AIProvider;
  contextWindow: number;
  supportsVision: boolean;
}

// API Response types
export interface SendMessageRequest {
  threadId: string;
  content: string;
  images?: string[];
  provider?: AIProvider;
}

export interface SendMessageResponse {
  message: Message;
  tokensUsed?: number;
}

// UI State types
export interface UIState {
  isSettingsOpen: boolean;
  isScreenshotPreviewOpen: boolean;
  currentThreadId: string | null;
  isStreaming: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}
