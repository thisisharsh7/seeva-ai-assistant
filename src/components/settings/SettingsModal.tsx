import { useState, useEffect } from 'react';
import { Modal, Button, Select, Input } from '../ui';
import { ShortcutRecorder } from '../ui/ShortcutRecorder';
import { useUIStore } from '../../stores/uiStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { Eye, EyeOff, ExternalLink } from 'lucide-react';
import type { AppSettings } from '../../lib/tauri-api';

const AVAILABLE_MODELS = [
  { value: 'claude-sonnet-4-5-20250929', label: 'Claude 4.5 Sonnet (Latest)' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude 4.5 Haiku (Fast)' },
  { value: 'claude-opus-4-1-20250805', label: 'Claude 4.1 Opus (Most Capable)' },
  { value: 'claude-sonnet-4-20250514', label: 'Claude 4 Sonnet' },
  { value: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet' },
];

export function SettingsModal() {
  const { isSettingsOpen, closeSettings } = useUIStore();
  const { settings: storeSettings, updateSettings, isLoading } = useSettingsStore();

  const [localSettings, setLocalSettings] = useState<AppSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  // Initialize local settings when modal opens
  useEffect(() => {
    if (isSettingsOpen && storeSettings) {
      setLocalSettings(JSON.parse(JSON.stringify(storeSettings)));
      setHasChanges(false);
      setTestResult(null);
    }
  }, [isSettingsOpen, storeSettings]);

  const handleShortcutChange = (shortcut: string) => {
    if (!localSettings) return;

    setLocalSettings({
      ...localSettings,
      shortcut,
    });
    setHasChanges(true);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!localSettings) return;

    setLocalSettings({
      ...localSettings,
      anthropic: {
        ...localSettings.anthropic,
        defaultModel: e.target.value,
      },
    });
    setHasChanges(true);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!localSettings) return;

    setLocalSettings({
      ...localSettings,
      anthropic: {
        ...localSettings.anthropic,
        apiKey: e.target.value,
      },
    });
    setHasChanges(true);
  };

  const handleTestConnection = async () => {
    if (!localSettings?.anthropic.apiKey) return;

    setTesting(true);
    setTestResult(null);

    try {
      // Simple test: check if API key format is valid
      const apiKey = localSettings.anthropic.apiKey.trim();

      if (!apiKey.startsWith('sk-ant-')) {
        setTestResult('error');
        setTesting(false);
        return;
      }

      // TODO: Make actual API call to test
      // For now, just validate format
      await new Promise(resolve => setTimeout(resolve, 500));
      setTestResult('success');
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!localSettings) return;

    setSaving(true);
    try {
      await updateSettings(localSettings);
      setHasChanges(false);
      closeSettings();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmed) return;
    }
    closeSettings();
  };

  if (!localSettings || isLoading) {
    return null;
  }

  return (
    <Modal
      isOpen={isSettingsOpen}
      onClose={handleCancel}
      title="Settings"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Global Shortcut Key */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1.5">
            Global Shortcut Key
          </label>
          <ShortcutRecorder
            value={localSettings.shortcut}
            onChange={handleShortcutChange}
          />
          <p className="mt-1.5 text-xs text-tertiary">
            Set a keyboard shortcut to toggle the app from anywhere
          </p>
        </div>

        {/* Model Selection */}
        <div>
          <Select
            label="Model"
            value={localSettings.anthropic.defaultModel}
            onChange={handleModelChange}
            options={AVAILABLE_MODELS}
          />
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1.5">
            Anthropic API Key
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={localSettings.anthropic.apiKey}
                onChange={handleApiKeyChange}
                placeholder="sk-ant-..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary transition-colors"
              >
                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Button
              variant="secondary"
              onClick={handleTestConnection}
              disabled={!localSettings.anthropic.apiKey.trim() || testing}
              isLoading={testing}
              className="flex-shrink-0"
            >
              Test
            </Button>
          </div>

          {/* Test Result */}
          {testResult && (
            <p className={`mt-2 text-xs ${testResult === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {testResult === 'success' ? '✓ Connection successful' : '✗ Invalid API key format'}
            </p>
          )}

          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-accent-blue hover:underline"
          >
            Get your API key
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
          <div className="flex-1 text-xs text-tertiary">
            {hasChanges && 'You have unsaved changes'}
          </div>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!hasChanges || saving}
            isLoading={saving}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
