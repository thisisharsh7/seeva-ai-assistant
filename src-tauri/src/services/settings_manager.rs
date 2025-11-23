use crate::commands::settings::AppSettings;
use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

#[derive(Debug, thiserror::Error)]
pub enum SettingsError {
    #[error("Failed to write settings file: {0}")]
    WriteError(String),

    #[error("Failed to serialize/deserialize settings: {0}")]
    SerializationError(String),

    #[error("Failed to acquire settings lock: {0}")]
    LockError(String),
}

pub struct SettingsManager {
    settings_path: PathBuf,
    settings: Arc<Mutex<AppSettings>>,
}

impl SettingsManager {
    /// Create a new SettingsManager and load settings from file (or create defaults)
    pub fn new(settings_path: PathBuf) -> Result<Self, SettingsError> {
        println!("⚙️  Initializing settings from: {:?}", settings_path);

        // Load settings from file if it exists, otherwise use defaults
        let settings = if settings_path.exists() {
            println!("   Loading existing settings...");
            match fs::read_to_string(&settings_path) {
                Ok(data) => {
                    match serde_json::from_str::<AppSettings>(&data) {
                        Ok(loaded_settings) => {
                            println!("   ✅ Settings loaded successfully");
                            loaded_settings
                        }
                        Err(e) => {
                            eprintln!("   ⚠️  Failed to parse settings, using defaults: {}", e);
                            AppSettings::default()
                        }
                    }
                }
                Err(e) => {
                    eprintln!("   ⚠️  Failed to read settings file, using defaults: {}", e);
                    AppSettings::default()
                }
            }
        } else {
            println!("   No existing settings found, creating defaults");
            let defaults = AppSettings::default();

            // Try to save defaults to disk
            if let Err(e) = Self::save_to_disk(&settings_path, &defaults) {
                eprintln!("   ⚠️  Failed to save default settings: {}", e);
            }

            defaults
        };

        Ok(Self {
            settings_path,
            settings: Arc::new(Mutex::new(settings)),
        })
    }

    /// Get current settings
    pub fn get(&self) -> Result<AppSettings, SettingsError> {
        let settings = self
            .settings
            .lock()
            .map_err(|e| SettingsError::LockError(e.to_string()))?;
        Ok(settings.clone())
    }

    /// Update settings and save to disk
    pub fn update(&self, new_settings: AppSettings) -> Result<(), SettingsError> {
        println!("⚙️  Updating settings...");

        // Update in-memory settings
        {
            let mut settings = self
                .settings
                .lock()
                .map_err(|e| SettingsError::LockError(e.to_string()))?;
            *settings = new_settings.clone();
        }

        // Save to disk
        Self::save_to_disk(&self.settings_path, &new_settings)?;

        println!("   ✅ Settings saved successfully");
        Ok(())
    }

    /// Update a specific field and save
    pub fn update_field<F>(&self, update_fn: F) -> Result<(), SettingsError>
    where
        F: FnOnce(&mut AppSettings),
    {
        let updated_settings = {
            let mut settings = self
                .settings
                .lock()
                .map_err(|e| SettingsError::LockError(e.to_string()))?;

            update_fn(&mut settings);
            settings.clone()
        };

        Self::save_to_disk(&self.settings_path, &updated_settings)?;
        Ok(())
    }

    /// Save settings to disk
    fn save_to_disk(path: &PathBuf, settings: &AppSettings) -> Result<(), SettingsError> {
        let json = serde_json::to_string_pretty(settings)
            .map_err(|e| SettingsError::SerializationError(e.to_string()))?;

        fs::write(path, json)
            .map_err(|e| SettingsError::WriteError(e.to_string()))?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[test]
    fn test_settings_manager_creation() {
        let temp_dir = env::temp_dir();
        let settings_path = temp_dir.join("test_settings.json");

        // Clean up if exists
        let _ = fs::remove_file(&settings_path);

        let manager = SettingsManager::new(settings_path.clone());
        assert!(manager.is_ok());

        // Clean up
        let _ = fs::remove_file(&settings_path);
    }

    #[test]
    fn test_settings_persistence() {
        let temp_dir = env::temp_dir();
        let settings_path = temp_dir.join("test_persistence.json");

        // Clean up if exists
        let _ = fs::remove_file(&settings_path);

        // Create manager and update settings
        let manager = SettingsManager::new(settings_path.clone()).unwrap();
        let mut settings = manager.get().unwrap();
        settings.anthropic.api_key = "test-key".to_string();
        manager.update(settings.clone()).unwrap();

        // Create new manager and verify persistence
        let manager2 = SettingsManager::new(settings_path.clone()).unwrap();
        let loaded_settings = manager2.get().unwrap();
        assert_eq!(loaded_settings.anthropic.api_key, "test-key");

        // Clean up
        let _ = fs::remove_file(&settings_path);
    }
}
