use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::State;
use crate::services::ai::anthropic::AnthropicProvider;
use crate::services::ai::provider::AIProvider;
use crate::services::SettingsManager;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub default_provider: String,
    pub anthropic: ProviderSettings,
    pub openai: ProviderSettings,
    pub gemini: ProviderSettings,
    pub ollama: ProviderSettings,
    pub theme: String,
    pub shortcut: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderSettings {
    pub enabled: bool,
    pub api_key: String,
    pub default_model: String,
    pub temperature: f32,
    pub max_tokens: u32,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            default_provider: "anthropic".to_string(),
            anthropic: ProviderSettings {
                enabled: true,
                api_key: String::new(),
                default_model: "claude-sonnet-4-5-20250929".to_string(),
                temperature: 0.7,
                max_tokens: 4096,
            },
            openai: ProviderSettings {
                enabled: false,
                api_key: String::new(),
                default_model: "gpt-4".to_string(),
                temperature: 0.7,
                max_tokens: 4096,
            },
            gemini: ProviderSettings {
                enabled: false,
                api_key: String::new(),
                default_model: "gemini-pro".to_string(),
                temperature: 0.7,
                max_tokens: 4096,
            },
            ollama: ProviderSettings {
                enabled: false,
                api_key: String::new(),
                default_model: "llama2".to_string(),
                temperature: 0.7,
                max_tokens: 4096,
            },
            theme: "dark".to_string(),
            shortcut: "CommandOrControl+Shift+Space".to_string(),
        }
    }
}

pub type SettingsState = Arc<SettingsManager>;

#[tauri::command]
pub async fn get_settings(settings: State<'_, SettingsState>) -> Result<AppSettings, String> {
    settings.get().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_settings(
    new_settings: AppSettings,
    settings: State<'_, SettingsState>,
) -> Result<(), String> {
    settings.update(new_settings).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_default_provider(
    provider: String,
    settings: State<'_, SettingsState>,
) -> Result<(), String> {
    settings
        .update_field(|s| {
            s.default_provider = provider;
        })
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_api_key(
    provider: String,
    api_key: String,
    settings: State<'_, SettingsState>,
) -> Result<(), String> {
    settings
        .update_field(|s| match provider.as_str() {
            "anthropic" => s.anthropic.api_key = api_key.clone(),
            "openai" => s.openai.api_key = api_key.clone(),
            "gemini" => s.gemini.api_key = api_key.clone(),
            "ollama" => s.ollama.api_key = api_key.clone(),
            _ => {}
        })
        .map_err(|e| e.to_string())
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ValidationResult {
    pub valid: bool,
    pub available_models: Vec<String>,
    pub default_model: String,
}

#[tauri::command]
pub async fn validate_api_key(
    provider: String,
    api_key: String,
) -> Result<ValidationResult, String> {
    match provider.as_str() {
        "anthropic" => {
            let anthropic = AnthropicProvider::new(api_key.clone());
            let is_valid = anthropic
                .validate_api_key(&api_key)
                .await
                .map_err(|e| format!("Validation failed: {}", e))?;

            if is_valid {
                let models = anthropic.available_models();
                let default_model = models.first().unwrap_or(&"claude-sonnet-4-5-20250929".to_string()).clone();

                Ok(ValidationResult {
                    valid: true,
                    available_models: models,
                    default_model,
                })
            } else {
                Err("Invalid API key".to_string())
            }
        }
        _ => Err(format!("Provider {} validation not implemented", provider)),
    }
}
