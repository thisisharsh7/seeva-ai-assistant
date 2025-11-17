use async_trait::async_trait;
use futures::{Stream, StreamExt};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::pin::Pin;

use super::provider::{
    AIError, AIProvider, ChatMessage, ChatRequest, ChatResponse, StreamEvent, StreamResult,
    TokenUsage,
};

const OPENAI_API_URL: &str = "https://api.openai.com/v1/chat/completions";

#[derive(Debug)]
pub struct OpenAIProvider {
    api_key: String,
    client: Client,
}

#[derive(Debug, Serialize)]
struct OpenAIRequest {
    model: String,
    messages: Vec<OpenAIMessage>,
    // Temperature is not supported by GPT-5 models - only default value of 1 is used
    // #[serde(skip_serializing_if = "Option::is_none")]
    // temperature: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    max_completion_tokens: Option<u32>,
    stream: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct OpenAIMessage {
    role: String,
    content: OpenAIContent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
enum OpenAIContent {
    Text(String),
    ContentParts(Vec<ContentPart>),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
enum ContentPart {
    Text { text: String },
    ImageUrl { image_url: ImageUrl },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ImageUrl {
    url: String, // Can be URL or data:image/jpeg;base64,...
}

#[derive(Debug, Deserialize)]
struct OpenAIResponse {
    id: String,
    model: String,
    choices: Vec<Choice>,
    usage: OpenAIUsage,
}

#[derive(Debug, Deserialize)]
struct Choice {
    message: OpenAIMessage,
    finish_reason: Option<String>,
}

#[derive(Debug, Deserialize)]
struct OpenAIUsage {
    prompt_tokens: u32,
    completion_tokens: u32,
    total_tokens: u32,
}

#[derive(Debug, Deserialize)]
struct OpenAIStreamResponse {
    id: String,
    choices: Vec<StreamChoice>,
}

#[derive(Debug, Deserialize)]
struct StreamChoice {
    delta: Delta,
    finish_reason: Option<String>,
}

#[derive(Debug, Deserialize)]
struct Delta {
    role: Option<String>,
    content: Option<String>,
}

#[derive(Debug, Deserialize)]
struct OpenAIErrorResponse {
    error: OpenAIErrorDetail,
}

#[derive(Debug, Deserialize)]
struct OpenAIErrorDetail {
    message: String,
    #[serde(rename = "type")]
    error_type: String,
    code: Option<String>,
}

impl OpenAIProvider {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: Client::new(),
        }
    }

    fn convert_messages(&self, messages: Vec<ChatMessage>) -> Vec<OpenAIMessage> {
        messages
            .into_iter()
            .map(|msg| {
                let content = if let Some(images) = msg.images {
                    let mut parts: Vec<ContentPart> = Vec::new();

                    // Add text content first if present
                    if !msg.content.is_empty() {
                        parts.push(ContentPart::Text {
                            text: msg.content.clone(),
                        });
                    }

                    // Add images
                    for img_data in images {
                        parts.push(ContentPart::ImageUrl {
                            image_url: ImageUrl {
                                url: format!("data:image/jpeg;base64,{}", img_data),
                            },
                        });
                    }

                    OpenAIContent::ContentParts(parts)
                } else {
                    OpenAIContent::Text(msg.content)
                };

                OpenAIMessage {
                    role: msg.role,
                    content,
                }
            })
            .collect()
    }

    fn extract_text_from_message(&self, message: OpenAIMessage) -> String {
        match message.content {
            OpenAIContent::Text(text) => text,
            OpenAIContent::ContentParts(parts) => parts
                .into_iter()
                .filter_map(|part| match part {
                    ContentPart::Text { text } => Some(text),
                    _ => None,
                })
                .collect::<Vec<_>>()
                .join("\n"),
        }
    }

    async fn send_request(&self, request: OpenAIRequest) -> Result<reqwest::Response, AIError> {
        let response = self
            .client
            .post(OPENAI_API_URL)
            .header("Authorization", format!("Bearer {}", &self.api_key))
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await?;

            // Try to parse as OpenAI error format
            if let Ok(error_response) = serde_json::from_str::<OpenAIErrorResponse>(&error_text) {
                return Err(match status.as_u16() {
                    401 | 403 => AIError::InvalidApiKey,
                    429 => AIError::RateLimitExceeded,
                    404 => AIError::ModelNotFound(request.model),
                    _ => AIError::ApiError(error_response.error.message),
                });
            }

            return Err(match status.as_u16() {
                401 | 403 => AIError::InvalidApiKey,
                429 => AIError::RateLimitExceeded,
                404 => AIError::ModelNotFound(request.model),
                _ => AIError::ApiError(format!("{}: {}", status, error_text)),
            });
        }

        Ok(response)
    }
}

#[async_trait]
impl AIProvider for OpenAIProvider {
    fn name(&self) -> &str {
        "openai"
    }

    async fn chat(&self, request: ChatRequest) -> Result<ChatResponse, AIError> {
        let mut messages = self.convert_messages(request.messages);

        // OpenAI doesn't have a separate system parameter, add as system message
        if let Some(system) = request.system {
            messages.insert(
                0,
                OpenAIMessage {
                    role: "system".to_string(),
                    content: OpenAIContent::Text(system),
                },
            );
        }

        let openai_request = OpenAIRequest {
            model: request.model.clone(),
            messages,
            max_completion_tokens: request.max_tokens,
            stream: false,
        };

        let response = self.send_request(openai_request).await?;
        let openai_response: OpenAIResponse = response.json().await?;

        let first_choice = openai_response
            .choices
            .into_iter()
            .next()
            .ok_or_else(|| AIError::ApiError("No choices in response".to_string()))?;

        Ok(ChatResponse {
            content: self.extract_text_from_message(first_choice.message),
            model: openai_response.model,
            usage: Some(TokenUsage {
                input_tokens: openai_response.usage.prompt_tokens,
                output_tokens: openai_response.usage.completion_tokens,
            }),
        })
    }

    async fn chat_stream(&self, request: ChatRequest) -> Result<StreamResult, AIError> {
        let mut messages = self.convert_messages(request.messages);

        // OpenAI doesn't have a separate system parameter, add as system message
        if let Some(system) = request.system {
            messages.insert(
                0,
                OpenAIMessage {
                    role: "system".to_string(),
                    content: OpenAIContent::Text(system),
                },
            );
        }

        let openai_request = OpenAIRequest {
            model: request.model.clone(),
            messages,
            max_completion_tokens: request.max_tokens,
            stream: true,
        };

        let response = self.send_request(openai_request).await?;

        // Use scan to maintain a buffer across chunks
        let stream = response
            .bytes_stream()
            .scan(String::new(), |buffer, chunk_result| {
                let result = match chunk_result {
                    Ok(bytes) => {
                        // Append new data to buffer
                        buffer.push_str(&String::from_utf8_lossy(&bytes));

                        let mut events = Vec::new();

                        // Process complete lines (ending with \n)
                        while let Some(newline_pos) = buffer.find('\n') {
                            let line = buffer[..newline_pos].trim().to_string();
                            buffer.drain(..=newline_pos);

                            // Skip empty lines
                            if line.is_empty() {
                                continue;
                            }

                            // Check for stream end
                            if line.contains("data: [DONE]") {
                                events.push(Ok(StreamEvent::MessageStop { usage: None }));
                                continue;
                            }

                            if let Some(json_str) = line.strip_prefix("data: ") {
                                if let Ok(stream_response) =
                                    serde_json::from_str::<OpenAIStreamResponse>(json_str)
                                {
                                    if let Some(choice) = stream_response.choices.first() {
                                        // Check for finish
                                        if choice.finish_reason.is_some() {
                                            events.push(Ok(StreamEvent::MessageStop {
                                                usage: None,
                                            }));
                                            continue;
                                        }

                                        // Check for content delta
                                        if let Some(content) = &choice.delta.content {
                                            if !content.is_empty() {
                                                events.push(Ok(StreamEvent::ContentDelta {
                                                    delta: content.clone(),
                                                }));
                                            }
                                        }

                                        // Check for role (start of message)
                                        if choice.delta.role.is_some() {
                                            events.push(Ok(StreamEvent::MessageStart));
                                        }
                                    }
                                }
                            }
                        }

                        Some(events)
                    }
                    Err(e) => Some(vec![Err(AIError::RequestError(e))]),
                };

                futures::future::ready(result)
            })
            .flat_map(futures::stream::iter);

        Ok(Box::pin(stream))
    }

    async fn validate_api_key(&self, api_key: &str) -> Result<bool, AIError> {
        let test_request = OpenAIRequest {
            model: "gpt-5-nano".to_string(),
            messages: vec![OpenAIMessage {
                role: "user".to_string(),
                content: OpenAIContent::Text("Hi".to_string()),
            }],
            max_completion_tokens: Some(5),
            stream: false,
        };

        let response = self
            .client
            .post(OPENAI_API_URL)
            .header("Authorization", format!("Bearer {}", api_key))
            .header("content-type", "application/json")
            .json(&test_request)
            .send()
            .await?;

        Ok(response.status().is_success())
    }

    fn available_models(&self) -> Vec<String> {
        vec![
            "gpt-5-mini".to_string(),
            "gpt-5-nano".to_string(),
        ]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_convert_text_only_message() {
        let provider = OpenAIProvider::new("test-key".to_string());
        let messages = vec![ChatMessage {
            role: "user".to_string(),
            content: "Hello".to_string(),
            images: None,
        }];

        let converted = provider.convert_messages(messages);
        assert_eq!(converted.len(), 1);
        assert_eq!(converted[0].role, "user");

        match &converted[0].content {
            OpenAIContent::Text(text) => assert_eq!(text, "Hello"),
            _ => panic!("Expected text content"),
        }
    }

    #[test]
    fn test_convert_message_with_images() {
        let provider = OpenAIProvider::new("test-key".to_string());
        let messages = vec![ChatMessage {
            role: "user".to_string(),
            content: "What is this?".to_string(),
            images: Some(vec!["base64data".to_string()]),
        }];

        let converted = provider.convert_messages(messages);
        assert_eq!(converted.len(), 1);

        match &converted[0].content {
            OpenAIContent::ContentParts(parts) => {
                assert_eq!(parts.len(), 2);
                // First should be text, second should be image
                matches!(parts[0], ContentPart::Text { .. });
                matches!(parts[1], ContentPart::ImageUrl { .. });
            }
            _ => panic!("Expected content parts"),
        }
    }

    #[test]
    fn test_available_models() {
        let provider = OpenAIProvider::new("test-key".to_string());
        let models = provider.available_models();
        assert!(models.contains(&"gpt-5-mini".to_string()));
        assert!(models.len() > 0);
    }
}
