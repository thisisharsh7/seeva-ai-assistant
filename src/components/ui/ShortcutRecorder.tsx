import { useState, useRef, useEffect } from 'react';
import { Command } from 'lucide-react';

interface ShortcutRecorderProps {
  value: string;
  onChange: (shortcut: string) => void;
}

export function ShortcutRecorder({ value, onChange }: ShortcutRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedKeys, setRecordedKeys] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const keys = new Set(recordedKeys);

      // Add modifier keys
      if (e.ctrlKey || e.metaKey) keys.add(e.metaKey ? 'Command' : 'Control');
      if (e.shiftKey) keys.add('Shift');
      if (e.altKey) keys.add('Alt');

      // Add the actual key (if it's not a modifier)
      if (!['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        keys.add(e.key.toUpperCase());
      }

      setRecordedKeys(keys);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Finish recording when all keys are released
      if (recordedKeys.size > 0) {
        const shortcutString = buildShortcutString(recordedKeys);
        onChange(shortcutString);
        setIsRecording(false);
        setRecordedKeys(new Set());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRecording, recordedKeys, onChange]);

  const buildShortcutString = (keys: Set<string>): string => {
    const keyArray = Array.from(keys);
    const modifiers: string[] = [];
    let mainKey = '';

    // Separate modifiers from main key
    keyArray.forEach(key => {
      if (['Command', 'Control', 'Shift', 'Alt'].includes(key)) {
        if (key === 'Command' || key === 'Control') {
          modifiers.push('CommandOrControl');
        } else {
          modifiers.push(key);
        }
      } else {
        mainKey = key;
      }
    });

    // Remove duplicates and build string
    const uniqueModifiers = Array.from(new Set(modifiers));
    return mainKey ? [...uniqueModifiers, mainKey].join('+') : value;
  };

  const formatShortcutDisplay = (shortcut: string): string => {
    return shortcut
      .replace(/CommandOrControl/g, '⌘/Ctrl')
      .replace(/Command/g, '⌘')
      .replace(/Control/g, 'Ctrl')
      .replace(/Shift/g, '⇧')
      .replace(/Alt/g, '⌥')
      .replace(/\+/g, ' + ');
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordedKeys(new Set());
  };

  const handleClearShortcut = () => {
    onChange('');
    setRecordedKeys(new Set());
  };

  return (
    <div className="space-y-2">
      <div
        ref={inputRef}
        className={`
          flex items-center justify-between px-3 py-1.5 rounded-lg border-2 transition-all
          ${isRecording
            ? 'border-accent-blue bg-accent-blue/10'
            : 'glass-card hover:border-accent-blue/30'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <Command size={18} className="text-secondary" />
          <span className={`text-sm ${isRecording ? 'text-accent-blue' : 'text-primary'}`}>
            {isRecording ? (
              recordedKeys.size > 0 ? (
                <span className="font-medium">
                  {formatShortcutDisplay(buildShortcutString(recordedKeys))}
                </span>
              ) : (
                <span className="text-tertiary">Press keys...</span>
              )
            ) : (
              <span className="font-medium">
                {value ? formatShortcutDisplay(value) : 'No shortcut set'}
              </span>
            )}
          </span>
        </div>

        <div className="flex gap-2">
          {!isRecording && value && (
            <button
              onClick={handleClearShortcut}
              className="px-3 py-1 text-xs text-secondary hover:text-primary transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={handleStartRecording}
            disabled={isRecording}
            className={`
              px-3 py-1 text-xs transition-all
              ${isRecording
                ? 'bg-accent-blue/20 text-accent-blue cursor-not-allowed border border-accent-blue/50 rounded'
                : 'glass-button'
              }
            `}
          >
            {isRecording ? 'Recording...' : 'Record'}
          </button>
        </div>
      </div>

      {isRecording && (
        <p className="text-xs text-accent-blue">
          Press your desired key combination, then release to save
        </p>
      )}
    </div>
  );
}
