use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Thread {
    pub id: String,
    pub name: String,
    #[serde(rename = "createdAt")]
    pub created_at: i64,
    #[serde(rename = "updatedAt")]
    pub updated_at: i64,
    #[serde(skip_serializing_if = "Option::is_none", rename = "messageCount")]
    pub message_count: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none", rename = "lastMessage")]
    pub last_message: Option<String>,
}

impl Thread {
    pub fn new(name: String) -> Self {
        let now = chrono::Utc::now().timestamp_millis();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            created_at: now,
            updated_at: now,
            message_count: None,
            last_message: None,
        }
    }
}
