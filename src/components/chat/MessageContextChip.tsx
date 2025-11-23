import { Monitor } from 'lucide-react';

interface MessageContextChipProps {
  appName: string;
  windowTitle?: string;
}

export function MessageContextChip({ appName, windowTitle }: MessageContextChipProps) {
  return (
    <div className="context-chip inline-flex items-center gap-1.5 px-2.5 py-1 mb-2 rounded-md">
      <Monitor size={11} className="chip-icon flex-shrink-0" />
      <span className="text-[11px] chip-text-primary font-semibold">
        {appName}
      </span>
      {windowTitle && (
        <>
          <span className="text-[11px] chip-text-secondary">·</span>
          <span className="text-[10px] chip-text-secondary truncate max-w-[150px]">
            {windowTitle}
          </span>
        </>
      )}
    </div>
  );
}
