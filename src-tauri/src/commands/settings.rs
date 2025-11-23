use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::State;
use crate::services::ai::{AnthropicProvider, OpenAIProvider, OpenRouterProvider};
use crate::services::ai::provider::AIProvider;
use crate::services::SettingsManager;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub default_provider: String,
    pub anthropic: ProviderSettings,
    pub openai: ProviderSettings,
    pub openrouter: ProviderSettings,
    pub gemini: ProviderSettings,
    pub ollama: ProviderSettings,
    pub theme: String,
    pub shortcut: String,
    #[serde(default = "default_enable_context_detection")]
    pub enable_context_detection: bool,
}

fn default_enable_context_detection() -> bool {
    true
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderSettings {
    pub enabled: bool,
    pub api_key: String,
    pub default_model: String,
    pub temperature: f32,
    pub max_tokens: u32,
    pub is_validated: bool,
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
                is_validated: false,
            },
            openai: ProviderSettings {
                enabled: false,
                api_key: String::new(),
                default_model: "gpt-5-mini".to_string(),
                temperature: 0.7,
                max_tokens: 4096,
                is_validated: false,
            },
            openrouter: ProviderSettings {
                enabled: false,
                api_key: String::new(),
                default_model: "anthropic/claude-3.5-sonnet".to_string(),
                temperature: 0.7,
                max_tokens: 4096,
                is_validated: false,
            },
            gemini: ProviderSettings {
                enabled: false,
                api_key: String::new(),
                default_model: "gemini-pro".to_string(),
                temperature: 0.7,
                max_tokens: 4096,
                is_validated: false,
            },
            ollama: ProviderSettings {
                enabled: false,
                api_key: String::new(),
                default_model: "llama2".to_string(),
                temperature: 0.7,
                max_tokens: 4096,
                is_validated: false,
            },
            theme: "dark".to_string(),
            shortcut: "Control+Shift+Space".to_string(),
            enable_context_detection: true,
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
            "openrouter" => s.openrouter.api_key = api_key.clone(),
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
        "openai" => {
            let openai = OpenAIProvider::new(api_key.clone());
            let is_valid = openai
                .validate_api_key(&api_key)
                .await
                .map_err(|e| format!("Validation failed: {}", e))?;

            if is_valid {
                let models = openai.available_models();
                let default_model = models.first().unwrap_or(&"gpt-5-mini".to_string()).clone();

                Ok(ValidationResult {
                    valid: true,
                    available_models: models,
                    default_model,
                })
            } else {
                Err("Invalid API key".to_string())
            }
        }
        "openrouter" => {
            let openrouter = OpenRouterProvider::new(api_key.clone());
            let is_valid = openrouter
                .validate_api_key(&api_key)
                .await
                .map_err(|e| format!("Validation failed: {}", e))?;

            if is_valid {
                let models = openrouter.available_models();
                let default_model = models.first().unwrap_or(&"anthropic/claude-3.5-sonnet".to_string()).clone();

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

#[tauri::command]
pub async fn set_validation_state(
    provider: String,
    is_validated: bool,
    settings: State<'_, SettingsState>,
) -> Result<(), String> {
    settings
        .update_field(|s| match provider.as_str() {
            "anthropic" => s.anthropic.is_validated = is_validated,
            "openai" => s.openai.is_validated = is_validated,
            "openrouter" => s.openrouter.is_validated = is_validated,
            "gemini" => s.gemini.is_validated = is_validated,
            "ollama" => s.ollama.is_validated = is_validated,
            _ => {}
        })
        .map_err(|e| e.to_string())
}
