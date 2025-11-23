import { useUIStore } from '../../stores/uiStore';
import { X, Monitor } from 'lucide-react';

export function ContextPill() {
  const { screenContext, clearScreenContext } = useUIStore();

  if (!screenContext) return null;

  return (
    <div className="relative inline-block">
      {/* Small rectangular pill */}
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/15 dark:bg-blue-400/10 border border-blue-500/30 dark:border-blue-400/20 backdrop-blur-sm">
        <Monitor size={12} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold truncate max-w-[120px]">
            {screenContext.app_name}
          </span>
          {screenContext.window_title && (
            <>
              <span className="text-[11px] text-blue-500/60 dark:text-blue-400/50">·</span>
              <span className="text-[10px] text-blue-600/80 dark:text-blue-400/70 truncate max-w-[100px]">
                {screenContext.window_title}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={clearScreenContext}
        className="absolute -top-1 -right-1 p-0.5 bg-blue-500 dark:bg-blue-400/80 hover:bg-blue-600 dark:hover:bg-blue-400 rounded-full transition-colors shadow-lg"
        title="Clear context"
      >
        <X size={10} className="text-white" />
      </button>
    </div>
  );
}
