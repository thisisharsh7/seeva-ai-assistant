import { useEffect } from 'react';
import { chatAPI } from '../lib/tauri-api';
import { useChatStore } from '../stores/chatStore';

export function useStreamListener() {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      unsubscribe = await chatAPI.onStreamEvent((event) => {
        const store = useChatStore.getState();

        switch (event.type) {
          case 'message_start':
            store.setStreaming(true);
            store.clearStreamingContent();
            break;

          case 'content_delta':
            store.appendStreamingContent(event.delta);
            break;

          case 'message_stop':
            store.setStreaming(false);
            // The full message will be added by the sendMessage function
            break;

          case 'error':
            console.error('Stream error:', event.error);
            store.setStreaming(false);
            store.clearStreamingContent();
            break;
        }
      });
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);
}
