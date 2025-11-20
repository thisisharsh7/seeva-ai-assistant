import { useState, useEffect } from 'react';
import { Modal, Button, Select, Input, UpdateChecker } from '../ui';
import { ShortcutRecorder } from '../ui/ShortcutRecorder';
import { useUIStore } from '../../stores/uiStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useToast } from '../../hooks/useToast';
import { Eye, EyeOff, ExternalLink, Loader2 } from 'lucide-react';
import type { AppSettings, ProviderSettings } from '../../lib/tauri-api';
import { settingsAPI } from '../../lib/tauri-api';
import { openUrl } from '@tauri-apps/plugin-opener';
import { APP_VERSION } from '../../lib/constants';

const PROVIDER_MODELS = {
  anthropic: [
    { value: 'claude-sonnet-4-5-20250929', label: 'Claude 4.5 Sonnet (Latest)' },
    { value: 'claude-haiku-4-5-20251001', label: 'Claude 4.5 Haiku (Fast)' },
    { value: 'claude-opus-4-1-20250805', label: 'Claude 4.1 Opus (Most Capable)' },
    { value: 'claude-sonnet-4-20250514', label: 'Claude 4 Sonnet' },
    { value: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet' },
  ],
  openai: [
    { value: 'gpt-5-mini', label: 'GPT-5 Mini' },
    { value: 'gpt-5-nano', label: 'GPT-5 Nano' },
  ],
  openrouter: [
    // Vision-capable models
    { value: 'openai/gpt-5.1', label: 'GPT-5.1 (Vision)' },
    { value: 'nvidia/nemotron-nano-12b-v2-vl:free', label: 'NVIDIA Nemotron Nano 12B Vision (Free)' },
    { value: 'google/gemini-2.5-flash-lite-preview-09-2025', label: 'Gemini 2.5 Flash Lite Preview (Vision)' },
    { value: 'qwen/qwen3-vl-235b-a22b-thinking', label: 'Qwen 3 VL 235B Thinking (Vision)' },
    // Additional popular models
    { value: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4' },
    { value: 'anthropic/claude-3.7-sonnet', label: 'Claude 3.7 Sonnet' },
    { value: 'google/gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash Exp' },
    { value: 'openai/gpt-4o', label: 'GPT-4o' },
    { value: 'meta-llama/llama-3.2-90b-vision-instruct', label: 'Llama 3.2 90B Vision' },
    { value: 'x-ai/grok-2-vision-1212', label: 'Grok 2 Vision' },
  ],
};

const MAX_TOKENS_OPTIONS = [
  { value: '1024', label: '1024 tokens (Short responses)' },
  { value: '2048', label: '2048 tokens (Medium responses)' },
  { value: '4096', label: '4096 tokens (Long - Recommended)' },
  { value: '8192', label: '8192 tokens (Very long responses)' },
  { value: '16384', label: '16384 tokens (Maximum)' },
];

const PROVIDER_INFO = {
  anthropic: {
    name: 'Anthropic (Claude)',
    keyPrefix: 'sk-ant-api',
    keyUrl: 'https://console.anthropic.com/settings/keys',
  },
  openai: {
    name: 'OpenAI (GPT)',
    keyPrefix: 'sk-',
    keyUrl: 'https://platform.openai.com/api-keys',
  },
  openrouter: {
    name: 'OpenRouter (100+ Models)',
    keyPrefix: 'sk-or-v1',
    keyUrl: 'https://openrouter.ai/keys',
  },
};

type ProviderKey = 'anthropic' | 'openai' | 'openrouter';

export function SettingsModal() {
  const { isSettingsOpen, closeSettings } = useUIStore();
  const { settings: storeSettings, updateSettings, isLoading } = useSettingsStore();
  const toast = useToast();

  const [localSettings, setLocalSettings] = useState<AppSettings | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<Record<ProviderKey, boolean>>({
    anthropic: false,
    openai: false,
    openrouter: false,
  });
  const [testingProviders, setTestingProviders] = useState<Record<ProviderKey, boolean>>({
    anthropic: false,
    openai: false,
    openrouter: false,
  });
  const [selectedProvider, setSelectedProvider] = useState<ProviderKey>('anthropic');

  // Initialize local settings when modal opens
  useEffect(() => {
    if (isSettingsOpen && storeSettings) {
      setLocalSettings(JSON.parse(JSON.stringify(storeSettings)));
      // Select the default provider tab
      setSelectedProvider((storeSettings.defaultProvider as ProviderKey) || 'anthropic');
    }
  }, [isSettingsOpen]);

  // Auto-save helper
  const autoSave = async (updates: Partial<AppSettings>) => {
    if (!localSettings) return null;

    const newSettings = { ...localSettings, ...updates };
    setLocalSettings(newSettings);

    try {
      await updateSettings(newSettings);
      // Reload from backend to ensure localSettings stays in sync
      const freshSettings = await settingsAPI.get();
      setLocalSettings(freshSettings);
      return freshSettings;
    } catch (error) {
      console.error('Failed to auto-save settings:', error);
      return null;
    }
  };

  const handleShortcutChange = (shortcut: string) => {
    if (!localSettings) return;
    autoSave({ shortcut });
  };

  // Handle provider selection (radio button)
  const handleProviderSelect = async (provider: ProviderKey) => {
    if (!localSettings) return;

    // Disable all providers except the selected one
    const updates: Partial<AppSettings> = {
      defaultProvider: provider,
      anthropic: { ...localSettings.anthropic, enabled: provider === 'anthropic' },
      openai: { ...localSettings.openai, enabled: provider === 'openai' },
      openrouter: { ...localSettings.openrouter, enabled: provider === 'openrouter' },
    };

    await autoSave(updates);
  };

  const handleProviderSettingChange = async (
    provider: ProviderKey,
    field: keyof ProviderSettings,
    value: string | number | boolean
  ) => {
    if (!localSettings) return;

    const updates = {
      [provider]: {
        ...localSettings[provider],
        [field]: value,
      },
    };

    await autoSave(updates);
  };

  const handleApiKeyBlur = async (provider: ProviderKey, value: string) => {
    // Save when user finishes typing (on blur)
    await handleProviderSettingChange(provider, 'apiKey', value);

    // Auto-validate if API key is not empty
    if (value.trim()) {
      await handleTestConnection(provider, true); // true = auto-validation
    }
  };

  const handleTestConnection = async (provider: ProviderKey, _isAutoValidation = false) => {
    if (!localSettings) return;
    const providerSettings = localSettings[provider];
    if (!providerSettings.apiKey) return;

    setTestingProviders({ ...testingProviders, [provider]: true });

    try {
      const result = await settingsAPI.validateApiKey(provider, providerSettings.apiKey.trim());

      // Show success toast
      toast.success('✓ API key validated successfully', 3000);

      // Save validation state and get fresh settings
      await settingsAPI.setValidationState(provider, true);
      const freshSettings = await autoSave({
        [provider]: {
          ...localSettings[provider],
          isValidated: true,
        },
      });

      // Update available models using fresh settings
      if (result.availableModels && result.availableModels.length > 0 && freshSettings) {
        await autoSave({
          [provider]: {
            ...freshSettings[provider],
            defaultModel: result.defaultModel,
          },
        });
      }
    } catch (error) {
      console.error('Connection test failed:', error);

      // Show error toast
      toast.error('✗ Invalid API key. Please check and try again', 4000);

      // Save validation state as false
      await settingsAPI.setValidationState(provider, false);
      await handleProviderSettingChange(provider, 'isValidated', false);
    } finally {
      setTestingProviders({ ...testingProviders, [provider]: false });
    }
  };

  const handleOpenApiKeyUrl = async (provider: ProviderKey) => {
    try {
      await openUrl(PROVIDER_INFO[provider].keyUrl);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  if (!localSettings || isLoading) {
    return null;
  }

  const renderProviderSection = (provider: ProviderKey) => {
    const providerSettings = localSettings[provider];
    const info = PROVIDER_INFO[provider];
    const models = PROVIDER_MODELS[provider];
    const isActive = localSettings.defaultProvider === provider;

    return (
      <div key={provider} className="space-y-4 p-4 rounded-lg border border-border-subtle bg-surface-secondary/30">
        {/* Radio Button - Use this provider */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="radio"
            name="provider"
            checked={isActive}
            onChange={() => handleProviderSelect(provider)}
            className="w-4.5 h-4 text-accent-blue focus:ring-2 focus:ring-accent-blue"
          />
          <span className="text-sm font-semibold text-primary group-hover:text-accent-blue transition-colors">
            Use this provider
          </span>
        </label>

        {/* API Key */}
        <div>
          <label className="block text-xs font-medium text-primary mb-1.5">
            API Key
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showApiKeys[provider] ? 'text' : 'password'}
                value={providerSettings.apiKey}
                onChange={async (e) => {
                  // Update local state immediately for responsive UI
                  setLocalSettings({
                    ...localSettings,
                    [provider]: {
                      ...providerSettings,
                      apiKey: e.target.value,
                      isValidated: false, // Reset validation when key changes
                    },
                  });
                  // Reset validation state in backend
                  await settingsAPI.setValidationState(provider, false);
                }}
                onBlur={(e) => handleApiKeyBlur(provider, e.target.value)}
                placeholder={`${info.keyPrefix}...`}
                className="pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowApiKeys({ ...showApiKeys, [provider]: !showApiKeys[provider] })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary transition-colors"
              >
                {showApiKeys[provider] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Button
              variant="secondary"
              onClick={() => handleTestConnection(provider, false)}
              disabled={!providerSettings.apiKey.trim() || testingProviders[provider]}
              isLoading={testingProviders[provider]}
              className="flex-shrink-0 text-xs px-3"
            >
              {testingProviders[provider] ? <Loader2 size={14} className="animate-spin" /> : 'Test'}
            </Button>
          </div>

          <button
            type="button"
            onClick={() => handleOpenApiKeyUrl(provider)}
            className="mt-1.5 inline-flex items-center gap-1 text-xs text-accent-blue hover:underline"
          >
            Get your API key
            <ExternalLink size={10} />
          </button>
        </div>

        {/* Model Selection */}
        <div>
          <Select
            label="Model"
            value={providerSettings.defaultModel}
            onChange={(e) => handleProviderSettingChange(provider, 'defaultModel', e.target.value)}
            options={models}
            className="text-sm"
          />
        </div>

        {/* Max Tokens */}
        <div>
          <Select
            label="Max Response Tokens"
            value={providerSettings.maxTokens.toString()}
            onChange={(e) => handleProviderSettingChange(provider, 'maxTokens', parseInt(e.target.value, 10))}
            options={MAX_TOKENS_OPTIONS}
            className="text-sm"
          />
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isSettingsOpen}
      onClose={closeSettings}
      title="Settings"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Global Shortcut Key */}
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
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

        {/* Context Detection Section - Coming Soon */}
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 px-3 rounded-lg border border-border-subtle bg-surface-secondary/30 opacity-60">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-primary">Context Detection</span>
              <span className="text-xs px-2 py-0.5 bg-accent-blue/20 text-accent-blue rounded-full font-medium">
                Soon
              </span>
            </div>
            <button
              disabled
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-accent-blue/10 cursor-not-allowed"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white/50 shadow-sm translate-x-1" />
            </button>
          </div>
        </div>

        {/* AI Providers Section */}
        <div className="space-y-4">

          {/* Provider Tabs */}
          <div className="flex gap-2 border-b border-border-subtle">
            {(['anthropic', 'openai', 'openrouter'] as ProviderKey[]).map((provider) => {
              const isActive = localSettings.defaultProvider === provider;
              return (
                <button
                  key={provider}
                  onClick={() => setSelectedProvider(provider)}
                  className={`px-4 py-2 text-xs font-medium transition-colors relative ${
                    selectedProvider === provider
                      ? 'text-accent-blue'
                      : 'text-tertiary hover:text-primary'
                  }`}
                >
                  {PROVIDER_INFO[provider].name.split(' ')[0]}
                  {isActive && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                  {selectedProvider === provider && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Provider Settings */}
          {renderProviderSection(selectedProvider)}
        </div>

        {/* Footer with Update Checker and Version */}
        <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
          <span className="text-xs text-tertiary">v{APP_VERSION}</span>
          <UpdateChecker />
        </div>
      </div>
    </Modal>
  );
}
