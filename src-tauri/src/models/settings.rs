use serde::{Deserialize, Serialize};

// Placeholder for settings - can be expanded later
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub version: String,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            version: "1.0.0".to_string(),
        }
    }
}
