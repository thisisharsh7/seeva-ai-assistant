use async_trait::async_trait;
use futures::{Stream, StreamExt};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::pin::Pin;

use super::provider::{
    AIError, AIProvider, ChatMessage, ChatRequest, ChatResponse, StreamEvent, StreamResult,
    TokenUsage,
};

const ANTHROPIC_API_URL: &str = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_API_VERSION: &str = "2023-06-01";

#[derive(Debug)]
pub struct AnthropicProvider {
    api_key: String,
    client: Client,
}

#[derive(Debug, Serialize)]
struct AnthropicRequest {
    model: String,
    messages: Vec<AnthropicMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    system: Option<String>,
    max_tokens: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    temperature: Option<f32>,
    stream: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct AnthropicMessage {
    role: String,
    content: AnthropicContent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
enum AnthropicContent {
    Text(String),
    ContentBlocks(Vec<ContentBlock>),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
enum ContentBlock {
    Text { text: String },
    Image { source: ImageSource },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ImageSource {
    #[serde(rename = "type")]
    source_type: String, // "base64"
    media_type: String,  // "image/png", "image/jpeg", etc.
    data: String,        // Base64 encoded image data
}

#[derive(Debug, Deserialize)]
struct AnthropicResponse {
    id: String,
    model: String,
    content: Vec<ContentBlock>,
    usage: AnthropicUsage,
}

#[derive(Debug, Deserialize)]
struct AnthropicUsage {
    input_tokens: u32,
    output_tokens: u32,
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
enum AnthropicStreamEvent {
    MessageStart {
        message: MessageStartData,
    },
    ContentBlockStart {
        index: u32,
        content_block: ContentBlock,
    },
    ContentBlockDelta {
        index: u32,
        delta: ContentDelta,
    },
    ContentBlockStop {
        index: u32,
    },
    MessageDelta {
        delta: MessageDeltaData,
        usage: AnthropicUsage,
    },
    MessageStop,
    Ping,
    Error {
        error: ErrorData,
    },
}

#[derive(Debug, Deserialize)]
struct MessageStartData {
    id: String,
    model: String,
    usage: AnthropicUsage,
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
enum ContentDelta {
    TextDelta { text: String },
}

#[derive(Debug, Deserialize)]
struct MessageDeltaData {
    stop_reason: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ErrorData {
    #[serde(rename = "type")]
    error_type: String,
    message: String,
}

impl AnthropicProvider {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: Client::new(),
        }
    }

    fn convert_messages(&self, messages: Vec<ChatMessage>) -> Vec<AnthropicMessage> {
        messages
            .into_iter()
            .map(|msg| {
                let content = if let Some(images) = msg.images {
                    let mut blocks: Vec<ContentBlock> = images
                        .into_iter()
                        .map(|img_data| ContentBlock::Image {
                            source: ImageSource {
                                source_type: "base64".to_string(),
                                media_type: "image/jpeg".to_string(), // Changed from PNG to JPEG
                                data: img_data,
                            },
                        })
                        .collect();

                    // Add text content after images
                    if !msg.content.is_empty() {
                        blocks.push(ContentBlock::Text { text: msg.content });
                    }

                    AnthropicContent::ContentBlocks(blocks)
                } else {
                    AnthropicContent::Text(msg.content)
                };

                AnthropicMessage {
                    role: msg.role,
                    content,
                }
            })
            .collect()
    }

    fn extract_text_from_response(&self, content: Vec<ContentBlock>) -> String {
        content
            .into_iter()
            .filter_map(|block| match block {
                ContentBlock::Text { text } => Some(text),
                _ => None,
            })
            .collect::<Vec<_>>()
            .join("\n")
    }

    async fn send_request(&self, request: AnthropicRequest) -> Result<reqwest::Response, AIError> {
        let response = self
            .client
            .post(ANTHROPIC_API_URL)
            .header("x-api-key", &self.api_key)
            .header("anthropic-version", ANTHROPIC_API_VERSION)
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await?;

            return Err(match status.as_u16() {
                401 => AIError::InvalidApiKey,
                429 => AIError::RateLimitExceeded,
                404 => AIError::ModelNotFound(request.model),
                _ => AIError::ApiError(format!("{}: {}", status, error_text)),
            });
        }

        Ok(response)
    }
}

#[async_trait]
impl AIProvider for AnthropicProvider {
    fn name(&self) -> &str {
        "anthropic"
    }

    async fn chat(&self, request: ChatRequest) -> Result<ChatResponse, AIError> {
        let anthropic_request = AnthropicRequest {
            model: request.model.clone(),
            messages: self.convert_messages(request.messages),
            system: request.system,
            max_tokens: request.max_tokens.unwrap_or(4096),
            temperature: request.temperature,
            stream: false,
        };

        let response = self.send_request(anthropic_request).await?;
        let anthropic_response: AnthropicResponse = response.json().await?;

        Ok(ChatResponse {
            content: self.extract_text_from_response(anthropic_response.content),
            model: anthropic_response.model,
            usage: Some(TokenUsage {
                input_tokens: anthropic_response.usage.input_tokens,
                output_tokens: anthropic_response.usage.output_tokens,
            }),
        })
    }

    async fn chat_stream(&self, request: ChatRequest) -> Result<StreamResult, AIError> {
        let anthropic_request = AnthropicRequest {
            model: request.model.clone(),
            messages: self.convert_messages(request.messages),
            system: request.system,
            max_tokens: request.max_tokens.unwrap_or(4096),
            temperature: request.temperature,
            stream: true,
        };

        let response = self.send_request(anthropic_request).await?;

        let stream = response.bytes_stream().filter_map(move |chunk_result| {
            async move {
                match chunk_result {
                    Ok(bytes) => {
                        let text = String::from_utf8_lossy(&bytes);

                        // Parse SSE format: "data: {...}\n\n"
                        for line in text.lines() {
                            if let Some(json_str) = line.strip_prefix("data: ") {
                                if let Ok(event) =
                                    serde_json::from_str::<AnthropicStreamEvent>(json_str)
                                {
                                    let stream_event = match event {
                                        AnthropicStreamEvent::MessageStart { .. } => {
                                            Some(StreamEvent::MessageStart)
                                        }
                                        AnthropicStreamEvent::ContentBlockDelta { delta, .. } => {
                                            match delta {
                                                ContentDelta::TextDelta { text } => {
                                                    Some(StreamEvent::ContentDelta { delta: text })
                                                }
                                            }
                                        }
                                        AnthropicStreamEvent::MessageDelta { usage, .. } => {
                                            Some(StreamEvent::MessageStop {
                                                usage: Some(TokenUsage {
                                                    input_tokens: usage.input_tokens,
                                                    output_tokens: usage.output_tokens,
                                                }),
                                            })
                                        }
                                        AnthropicStreamEvent::MessageStop => {
                                            Some(StreamEvent::MessageStop { usage: None })
                                        }
                                        AnthropicStreamEvent::Error { error } => Some(StreamEvent::Error {
                                            error: error.message,
                                        }),
                                        _ => None, // Skip other events like Ping, ContentBlockStart, ContentBlockStop
                                    };

                                    // If we got a valid event, return it
                                    if let Some(evt) = stream_event {
                                        return Some(Ok(evt));
                                    }
                                }
                            }
                        }

                        // If we didn't find any useful event, skip this chunk (return None)
                        None
                    }
                    Err(e) => Some(Err(AIError::RequestError(e))),
                }
            }
        });

        Ok(Box::pin(stream))
    }

    async fn validate_api_key(&self, api_key: &str) -> Result<bool, AIError> {
        let test_request = AnthropicRequest {
            model: "claude-sonnet-4-5-20250929".to_string(),
            messages: vec![AnthropicMessage {
                role: "user".to_string(),
                content: AnthropicContent::Text("Hi".to_string()),
            }],
            system: None,
            max_tokens: 10,
            temperature: None,
            stream: false,
        };

        let response = self
            .client
            .post(ANTHROPIC_API_URL)
            .header("x-api-key", api_key)
            .header("anthropic-version", ANTHROPIC_API_VERSION)
            .header("content-type", "application/json")
            .json(&test_request)
            .send()
            .await?;

        Ok(response.status().is_success())
    }

    fn available_models(&self) -> Vec<String> {
        vec![
            "claude-sonnet-4-5-20250929".to_string(),
            "claude-haiku-4-5-20251001".to_string(),
            "claude-opus-4-1-20250805".to_string(),
            "claude-sonnet-4-20250514".to_string(),
            "claude-3-7-sonnet-20250219".to_string(),
        ]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_convert_text_only_message() {
        let provider = AnthropicProvider::new("test-key".to_string());
        let messages = vec![ChatMessage {
            role: "user".to_string(),
            content: "Hello".to_string(),
            images: None,
        }];

        let converted = provider.convert_messages(messages);
        assert_eq!(converted.len(), 1);
        assert_eq!(converted[0].role, "user");

        match &converted[0].content {
            AnthropicContent::Text(text) => assert_eq!(text, "Hello"),
            _ => panic!("Expected text content"),
        }
    }

    #[test]
    fn test_convert_message_with_images() {
        let provider = AnthropicProvider::new("test-key".to_string());
        let messages = vec![ChatMessage {
            role: "user".to_string(),
            content: "What is this?".to_string(),
            images: Some(vec!["base64data".to_string()]),
        }];

        let converted = provider.convert_messages(messages);
        assert_eq!(converted.len(), 1);

        match &converted[0].content {
            AnthropicContent::ContentBlocks(blocks) => {
                assert_eq!(blocks.len(), 2);
                // First should be image, second should be text
                matches!(blocks[0], ContentBlock::Image { .. });
                matches!(blocks[1], ContentBlock::Text { .. });
            }
            _ => panic!("Expected content blocks"),
        }
    }

    #[test]
    fn test_available_models() {
        let provider = AnthropicProvider::new("test-key".to_string());
        let models = provider.available_models();
        assert!(models.contains(&"claude-3-5-sonnet-20241022".to_string()));
        assert!(models.len() > 0);
    }
}
