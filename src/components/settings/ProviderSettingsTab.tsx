import { useState } from 'react';
import { Input, Toggle, Slider, Button } from '../ui';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import type { AIProvider } from '../../lib/types';
import type { ProviderSettings } from '../../lib/tauri-api';
import { settingsAPI } from '../../lib/tauri-api';

interface ProviderSettingsTabProps {
  provider: AIProvider;
  settings: ProviderSettings;
  onChange: (settings: ProviderSettings) => void;
}

export function ProviderSettingsTab({ provider, settings, onChange }: ProviderSettingsTabProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const providerInfo = {
    anthropic: {
      name: 'Anthropic Claude',
      description: 'Advanced reasoning and analysis with Claude models',
      keyLabel: 'Anthropic API Key',
      keyPlaceholder: 'sk-ant-...',
      docsUrl: 'https://console.anthropic.com/settings/keys',
    },
    openai: {
      name: 'OpenAI GPT',
      description: 'Powerful language models from OpenAI',
      keyLabel: 'OpenAI API Key',
      keyPlaceholder: 'sk-...',
      docsUrl: 'https://platform.openai.com/api-keys',
    },
    gemini: {
      name: 'Google Gemini',
      description: 'Google\'s multimodal AI models',
      keyLabel: 'Google AI API Key',
      keyPlaceholder: 'AIza...',
      docsUrl: 'https://makersuite.google.com/app/apikey',
    },
    ollama: {
      name: 'Ollama (Local)',
      description: 'Run open-source models locally on your machine',
      keyLabel: 'Ollama Base URL',
      keyPlaceholder: 'http://localhost:11434',
      docsUrl: 'https://ollama.ai',
    },
  };

  const info = providerInfo[provider];

  const handleTestConnection = async () => {
    if (!settings.apiKey || settings.apiKey.trim() === '') {
      setTestResult({ success: false, message: 'Please enter an API key' });
      setTimeout(() => setTestResult(null), 3000);
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const result = await settingsAPI.validateApiKey(provider, settings.apiKey);

      if (result.valid) {
        // Auto-select the best model
        onChange({
          ...settings,
          defaultModel: result.defaultModel
        });

        setTestResult({
          success: true,
          message: `Connected! Using ${result.defaultModel}`
        });
      } else {
        setTestResult({
          success: false,
          message: 'Invalid API key'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      });
    } finally {
      setTesting(false);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">{info.name}</h3>
        <p className="text-sm text-text-secondary">{info.description}</p>
      </div>

      {/* Enable/Disable Toggle */}
      <Toggle
        label="Enable Provider"
        description="Allow this provider to be used for AI conversations"
        checked={settings.enabled}
        onChange={(e) => onChange({ ...settings, enabled: e.target.checked })}
      />

      <div className="border-t border-border-subtle pt-6" />

      {/* API Key */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-text-secondary">
            {info.keyLabel}
          </label>
          <a
            href={info.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors"
          >
            Get API Key →
          </a>
        </div>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={settings.apiKey}
            onChange={(e) => onChange({ ...settings, apiKey: e.target.value })}
            placeholder={info.keyPlaceholder}
            disabled={!settings.enabled}
            className="w-full px-4 py-2.5 pr-20
                     bg-glass-light/50 border border-border-subtle rounded-lg
                     text-text-primary placeholder-text-tertiary
                     focus:outline-none focus:ring-2 focus:ring-accent-blue/50
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all font-mono text-sm"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            disabled={!settings.enabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2
                     text-text-secondary hover:text-text-primary
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
          >
            {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Test Connection Button */}
        <div className="mt-2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTestConnection}
            disabled={!settings.enabled || !settings.apiKey || testing}
            isLoading={testing}
          >
            Test Connection
          </Button>
          {testResult?.success && (
            <span className="flex items-center gap-1 text-sm text-green-400">
              <CheckCircle size={16} />
              {testResult.message}
            </span>
          )}
          {testResult && !testResult.success && (
            <span className="flex items-center gap-1 text-sm text-red-400">
              <XCircle size={16} />
              {testResult.message}
            </span>
          )}
        </div>
        <p className="text-xs text-text-tertiary mt-2">
          Test your API key to automatically select the best available model
        </p>
      </div>

      {/* Temperature Slider */}
      <Slider
        label="Temperature"
        min={0}
        max={1}
        step={0.1}
        value={settings.temperature}
        onChange={(e) => onChange({ ...settings, temperature: parseFloat(e.target.value) })}
        disabled={!settings.enabled}
        valueLabel={settings.temperature.toFixed(1)}
      />
      <p className="text-xs text-text-tertiary -mt-4">
        Controls randomness: 0 = focused and deterministic, 1 = creative and varied
      </p>

      {/* Max Tokens */}
      <div>
        <Input
          type="number"
          label="Max Tokens"
          value={settings.maxTokens}
          onChange={(e) => onChange({ ...settings, maxTokens: parseInt(e.target.value) || 4096 })}
          disabled={!settings.enabled}
          min={100}
          max={32000}
          step={100}
        />
        <p className="text-xs text-text-tertiary mt-1">
          Maximum length of the AI's response (higher = longer responses, more cost)
        </p>
      </div>
    </div>
  );
}
