import { create } from 'zustand';
import { Message, Thread } from '../lib/types';
import { threadAPI, chatAPI } from '../lib/tauri-api';

interface ChatState {
  // Threads
  threads: Thread[];
  currentThreadId: string | null;
  isLoadingThreads: boolean;

  // Messages
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  isLoadingMessages: boolean;

  // Actions
  loadThreads: () => Promise<void>;
  setCurrentThread: (threadId: string) => Promise<void>;
  createThread: (name: string) => Promise<void>;
  deleteThread: (threadId: string) => Promise<void>;
  clearAllThreads: () => Promise<void>;
  renameThread: (threadId: string, name: string) => Promise<void>;

  loadMessages: (threadId: string) => Promise<void>;
  sendMessage: (content: string, images: string[] | null) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;

  setStreaming: (isStreaming: boolean) => void;
  appendStreamingContent: (content: string) => void;
  clearStreamingContent: () => void;

  // Getters
  getCurrentThread: () => Thread | undefined;
  getThreadMessages: (threadId: string) => Message[];
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  threads: [],
  currentThreadId: null,
  isLoadingThreads: false,
  messages: [],
  isStreaming: false,
  streamingContent: '',
  isLoadingMessages: false,

  // Thread actions
  loadThreads: async () => {
    set({ isLoadingThreads: true });
    try {
      let threads = await threadAPI.list();
      let currentId = await threadAPI.getCurrentId();

      // If no threads exist, create a default one
      if (threads.length === 0) {
        const newThread = await threadAPI.create('New Conversation');
        threads = [newThread];
        currentId = newThread.id;
      }

      // If backend has no current thread but threads exist, auto-select the first one
      if (!currentId && threads.length > 0) {
        currentId = threads[0].id;
        await threadAPI.switch(currentId); // Synchronize backend with frontend
        console.log('🧵 Auto-selected first thread:', currentId);
      }

      set({
        threads,
        currentThreadId: currentId || null,
        isLoadingThreads: false
      });

      // Load messages for current thread
      if (currentId) {
        await get().loadMessages(currentId);
      }
    } catch (error) {
      console.error('Failed to load threads:', error);
      set({ isLoadingThreads: false });
    }
  },

  setCurrentThread: async (threadId) => {
    try {
      await threadAPI.switch(threadId);
      set({ currentThreadId: threadId });
      await get().loadMessages(threadId);
    } catch (error) {
      console.error('Failed to switch thread:', error);
    }
  },

  createThread: async (name) => {
    const { useToastStore } = await import('../hooks/useToast');
    const { useUIStore } = await import('./uiStore');
    try {
      const newThread = await threadAPI.create(name);
      set((state) => ({
        threads: [newThread, ...state.threads],
        currentThreadId: newThread.id,
        messages: [], // Clear messages for new thread
      }));

      // Clear screenshot and context when creating new thread
      const uiStore = useUIStore.getState();
      uiStore.clearScreenshot();
      uiStore.clearScreenContext();

      useToastStore.getState().addToast({
        type: 'success',
        message: `Thread "${name}" created successfully`,
        duration: 3000
      });
    } catch (error) {
      console.error('Failed to create thread:', error);

      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      useToastStore.getState().addToast({
        type: 'error',
        message: `Failed to create thread: ${errorMessage}`,
        duration: 5000
      });

      throw error; // Re-throw so the UI can handle it
    }
  },

  deleteThread: async (threadId) => {
    const { useToastStore } = await import('../hooks/useToast');
    try {
      // Get thread name before deleting
      const thread = get().threads.find(t => t.id === threadId);
      const threadName = thread?.name || 'Thread';

      await threadAPI.delete(threadId);

      set((state) => {
        const newThreads = state.threads.filter(t => t.id !== threadId);
        const newCurrentId = state.currentThreadId === threadId
          ? (newThreads[0]?.id || null)
          : state.currentThreadId;

        return {
          threads: newThreads,
          currentThreadId: newCurrentId,
          messages: state.currentThreadId === threadId ? [] : state.messages,
        };
      });

      // Check if no threads remain after deletion
      const remainingThreads = get().threads;
      if (remainingThreads.length === 0) {
        // Create a new default thread using existing logic
        await get().loadThreads();
        return; // Exit early since loadThreads handles everything
      }

      // Load messages for new current thread
      const newCurrentId = get().currentThreadId;
      if (newCurrentId) {
        await get().loadMessages(newCurrentId);
      }

      useToastStore.getState().addToast({
        type: 'success',
        message: `Thread "${threadName}" deleted successfully`,
        duration: 3000
      });
    } catch (error) {
      console.error('Failed to delete thread:', error);

      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      useToastStore.getState().addToast({
        type: 'error',
        message: `Failed to delete thread: ${errorMessage}`,
        duration: 5000
      });

      throw error; // Re-throw so the UI can handle it
    }
  },

  clearAllThreads: async () => {
    const { useToastStore } = await import('../hooks/useToast');
    try {
      const threadIds = get().threads.map(t => t.id);

      // Delete all threads
      await Promise.all(threadIds.map(id => threadAPI.delete(id)));

      // Clear state
      set({
        threads: [],
        currentThreadId: null,
        messages: [],
      });

      // Create a new default thread
      await get().loadThreads();

      useToastStore.getState().addToast({
        type: 'success',
        message: `All threads cleared successfully`,
        duration: 3000
      });
    } catch (error) {
      console.error('Failed to clear threads:', error);

      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      useToastStore.getState().addToast({
        type: 'error',
        message: `Failed to clear threads: ${errorMessage}`,
        duration: 5000
      });

      throw error; // Re-throw so the UI can handle it
    }
  },

  renameThread: async (threadId, name) => {
    try {
      await threadAPI.updateName(threadId, name);
      set((state) => ({
        threads: state.threads.map(t =>
          t.id === threadId ? { ...t, name, updatedAt: Date.now() } : t
        ),
      }));
    } catch (error) {
      console.error('Failed to rename thread:', error);
    }
  },

  // Message actions
  loadMessages: async (threadId) => {
    set({ isLoadingMessages: true });
    try {
      const messages = await chatAPI.getMessages(threadId);
      set({ messages, isLoadingMessages: false });
    } catch (error) {
      console.error('Failed to load messages:', error);
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (content, images) => {
    const state = get();
    const currentThreadId = state.currentThreadId;

    if (!currentThreadId) {
      const { useToastStore } = await import('../hooks/useToast');
      useToastStore.getState().addToast({ type: 'error', message: 'No active conversation. Please create or select a thread.' });
      return;
    }

    // Get settings and UI stores
    const settingsStore = await import('./settingsStore').then(m => m.useSettingsStore.getState());
    const uiStore = await import('./uiStore').then(m => m.useUIStore.getState());
    const { useToastStore } = await import('../hooks/useToast');

    const settings = settingsStore.settings;
    const provider = settings.defaultProvider;
    const providerSettings = (settings as any)[provider];

    // Check if API key is configured
    if (!providerSettings?.apiKey || providerSettings.apiKey.trim() === '') {
      const providerNames: Record<string, string> = {
        anthropic: 'Anthropic Claude',
        openai: 'OpenAI',
        openrouter: 'OpenRouter',
        gemini: 'Google Gemini',
        ollama: 'Ollama'
      };

      useToastStore.getState().addToast({
        type: 'error',
        message: `API key not configured for ${providerNames[provider] || provider}. Please add your API key in settings.`,
        duration: 7000
      });

      // Auto-open settings modal
      uiStore.openSettings();
      return;
    }

    // Check if API key is validated
    if (providerSettings?.isValidated !== true) {
      const providerNames: Record<string, string> = {
        anthropic: 'Anthropic Claude',
        openai: 'OpenAI',
        openrouter: 'OpenRouter',
        gemini: 'Google Gemini',
        ollama: 'Ollama'
      };

      useToastStore.getState().addToast({
        type: 'error',
        message: `Invalid API key for ${providerNames[provider] || provider}. Please check your API key in settings.`,
        duration: 7000
      });

      // Auto-open settings modal
      uiStore.openSettings();
      return;
    }

    try {
      // Add user message immediately to UI
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        threadId: currentThreadId,
        role: 'user',
        content,
        images: images || undefined,
        createdAt: Date.now(),
      };

      set((state) => ({
        messages: [...state.messages, userMessage],
        isStreaming: true,
        streamingContent: '',
      }));

      // Send message and get streaming response
      const assistantMessage = await chatAPI.sendMessage(
        currentThreadId,
        content,
        images,
        provider as any,
        providerSettings.apiKey,
        providerSettings.defaultModel,
        providerSettings.maxTokens,
        true // includeContext - enables context detection
      );

      // Add assistant message
      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isStreaming: false,
        streamingContent: '',
      }));

      // Add a small delay before reloading to ensure backend has persisted the message
      await new Promise(resolve => setTimeout(resolve, 200));

      // Reload only the messages for the current thread instead of all threads
      // This prevents race conditions where we load messages before they're persisted
      await get().loadMessages(currentThreadId);

      // Reload threads to update counts and last message (without reloading messages again)
      try {
        const threads = await threadAPI.list();
        const currentId = await threadAPI.getCurrentId();
        set({ threads, currentThreadId: currentId || threads[0]?.id || null });
      } catch (error) {
        console.error('Failed to reload threads after message:', error);
      }
    } catch (error) {
      console.error('Failed to send message:', error);

      const { useToastStore } = await import('../hooks/useToast');

      // Extract error message from various error formats
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String((error as any).message);
      }

      useToastStore.getState().addToast({
        type: 'error',
        message: `Failed to send message: ${errorMessage}`
      });

      set({ isStreaming: false, streamingContent: '' });
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await chatAPI.deleteMessage(messageId);
      set((state) => ({
        messages: state.messages.filter(m => m.id !== messageId),
      }));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  },

  // Streaming actions
  setStreaming: (isStreaming) => {
    set({ isStreaming });
  },

  appendStreamingContent: (content) => {
    set((state) => ({
      streamingContent: state.streamingContent + content,
    }));
  },

  clearStreamingContent: () => {
    set({ streamingContent: '' });
  },

  // Getters
  getCurrentThread: () => {
    const state = get();
    return state.threads.find(t => t.id === state.currentThreadId);
  },

  getThreadMessages: (threadId) => {
    return get().messages.filter(m => m.threadId === threadId);
  },
}));

// Initialize store by loading threads
if (typeof window !== 'undefined') {
  useChatStore.getState().loadThreads();
}
