import { useState, useEffect } from 'react';
import { Modal, Button, Select } from '../ui';
import { ProviderSettingsTab } from './ProviderSettingsTab';
import { useUIStore } from '../../stores/uiStore';
import { useSettingsStore } from '../../stores/settingsStore';
import type { AIProvider } from '../../lib/types';
import type { AppSettings } from '../../lib/tauri-api';

export function SettingsModal() {
  const { isSettingsOpen, closeSettings } = useUIStore();
  const { settings: storeSettings, updateSettings, isLoading } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<AIProvider>('anthropic');
  const [localSettings, setLocalSettings] = useState<AppSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize local settings when modal opens
  useEffect(() => {
    if (isSettingsOpen && storeSettings) {
      setLocalSettings(JSON.parse(JSON.stringify(storeSettings)));
      setHasChanges(false);
    }
  }, [isSettingsOpen, storeSettings]);

  const handleProviderChange = (provider: AIProvider, providerSettings: any) => {
    if (!localSettings) return;

    setLocalSettings({
      ...localSettings,
      [provider]: providerSettings,
    });
    setHasChanges(true);
  };

  const handleDefaultProviderChange = (provider: string) => {
    if (!localSettings) return;

    setLocalSettings({
      ...localSettings,
      defaultProvider: provider,
    });
    setHasChanges(true);
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

  const tabs: Array<{ id: AIProvider; label: string }> = [
    { id: 'anthropic', label: 'Anthropic' },
    { id: 'openai', label: 'OpenAI' },
    { id: 'gemini', label: 'Gemini' },
    { id: 'ollama', label: 'Ollama' },
  ];

  if (!localSettings || isLoading) {
    return null;
  }

  return (
    <Modal
      isOpen={isSettingsOpen}
      onClose={handleCancel}
      title="Settings"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Default Provider Selection */}
        <div className="pb-6 border-b border-border-subtle">
          <Select
            label="Default AI Provider"
            value={localSettings.defaultProvider}
            onChange={(e) => handleDefaultProviderChange(e.target.value)}
            options={[
              { value: 'anthropic', label: 'Anthropic Claude' },
              { value: 'openai', label: 'OpenAI GPT' },
              { value: 'gemini', label: 'Google Gemini' },
              { value: 'ollama', label: 'Ollama (Local)' },
            ]}
          />
          <p className="mt-2 text-xs text-text-tertiary">
            This provider will be used by default for new conversations
          </p>
        </div>

        {/* Provider Tabs */}
        <div>
          <div className="flex gap-2 border-b border-border-subtle">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2 text-sm font-medium transition-all
                  border-b-2 -mb-px
                  ${activeTab === tab.id
                    ? 'border-accent-blue text-accent-blue'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={activeTab === tab.id ? 'block' : 'hidden'}
              >
                <ProviderSettingsTab
                  provider={tab.id}
                  settings={(localSettings as any)[tab.id]}
                  onChange={(settings) => handleProviderChange(tab.id, settings)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
          <div className="text-xs text-text-tertiary">
            {hasChanges && 'You have unsaved changes'}
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
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
      </div>
    </Modal>
  );
}
