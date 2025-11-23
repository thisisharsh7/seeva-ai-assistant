import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useUIStore } from '../stores/uiStore';
import type { ScreenContext } from '../lib/types';

export function useContextListener() {
  useEffect(() => {
    console.log('🔍 [CONTEXT LISTENER] Registering screen-context-detected event listener');

    const unlisten = listen<ScreenContext>('screen-context-detected', (event) => {
      console.log('✅ [CONTEXT LISTENER] Context event received:', event.payload);

      const context = event.payload;

      // Update UI store with context
      useUIStore.getState().setScreenContext(context);

      console.log('📝 [CONTEXT LISTENER] Context stored in UI state');
      console.log('   App:', context.app_name);
      console.log('   Window:', context.window_title);
    });

    return () => {
      console.log('🔌 [CONTEXT LISTENER] Unregistering event listener');
      unlisten.then(fn => fn());
    };
  }, []);
}
