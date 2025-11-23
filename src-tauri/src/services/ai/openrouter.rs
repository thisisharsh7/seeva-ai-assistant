use async_trait::async_trait;
use futures::StreamExt;
use reqwest::Client;
use serde::{Deserialize, Serialize};

use super::provider::{
    AIError, AIProvider, ChatMessage, ChatRequest, StreamEvent, StreamResult,
};

const OPENROUTER_API_URL: &str = "https://openrouter.ai/api/v1/chat/completions";

#[derive(Debug)]
pub struct OpenRouterProvider {
    api_key: String,
    client: Client,
}

#[derive(Debug, Serialize)]
struct OpenRouterRequest {
    model: String,
    messages: Vec<OpenRouterMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    temperature: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    max_tokens: Option<u32>,
    stream: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct OpenRouterMessage {
    role: String,
    content: OpenRouterContent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
enum OpenRouterContent {
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
    url: String,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct OpenRouterResponse {
    id: String,
    model: String,
    choices: Vec<Choice>,
    usage: Option<OpenRouterUsage>,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct Choice {
    message: OpenRouterMessage,
    finish_reason: Option<String>,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct OpenRouterUsage {
    prompt_tokens: u32,
    completion_tokens: u32,
    total_tokens: u32,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct OpenRouterStreamResponse {
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
struct OpenRouterErrorResponse {
    error: OpenRouterErrorDetail,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct OpenRouterErrorDetail {
    message: String,
    code: Option<String>,
}

impl OpenRouterProvider {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: Client::new(),
        }
    }

    fn convert_messages(&self, messages: Vec<ChatMessage>) -> Vec<OpenRouterMessage> {
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

                    OpenRouterContent::ContentParts(parts)
                } else {
                    OpenRouterContent::Text(msg.content)
                };

                OpenRouterMessage {
                    role: msg.role,
                    content,
                }
            })
            .collect()
    }


    async fn send_request(
        &self,
        request: OpenRouterRequest,
    ) -> Result<reqwest::Response, AIError> {
        let response = self
            .client
            .post(OPENROUTER_API_URL)
            .header("Authorization", format!("Bearer {}", &self.api_key))
            .header("HTTP-Referer", "https://seeva.ai") // Optional but recommended
            .header("X-Title", "Seeva AI Assistant") // Optional but recommended
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await?;

            // Try to parse as OpenRouter error format
            if let Ok(error_response) =
                serde_json::from_str::<OpenRouterErrorResponse>(&error_text)
            {
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
impl AIProvider for OpenRouterProvider {
    async fn chat_stream(&self, request: ChatRequest) -> Result<StreamResult, AIError> {
        let mut messages = self.convert_messages(request.messages);

        // Add system message if provided
        if let Some(system) = request.system {
            messages.insert(
                0,
                OpenRouterMessage {
                    role: "system".to_string(),
                    content: OpenRouterContent::Text(system),
                },
            );
        }

        let openrouter_request = OpenRouterRequest {
            model: request.model.clone(),
            messages,
            temperature: request.temperature,
            max_tokens: request.max_tokens,
            stream: true,
        };

        let response = self.send_request(openrouter_request).await?;

        let stream = response.bytes_stream().filter_map(move |chunk_result| {
            async move {
                match chunk_result {
                    Ok(bytes) => {
                        let text = String::from_utf8_lossy(&bytes);

                        // Parse SSE format: "data: {...}\n\n"
                        for line in text.lines() {
                            // Skip empty lines
                            if line.trim().is_empty() {
                                continue;
                            }

                            // Check for stream end
                            if line.contains("data: [DONE]") {
                                return Some(Ok(StreamEvent::MessageStop { usage: None }));
                            }

                            if let Some(json_str) = line.strip_prefix("data: ") {
                                if let Ok(stream_response) =
                                    serde_json::from_str::<OpenRouterStreamResponse>(json_str)
                                {
                                    if let Some(choice) = stream_response.choices.first() {
                                        // Check for finish
                                        if choice.finish_reason.is_some() {
                                            return Some(Ok(StreamEvent::MessageStop {
                                                usage: None,
                                            }));
                                        }

                                        // Check for content delta
                                        if let Some(content) = &choice.delta.content {
                                            if !content.is_empty() {
                                                return Some(Ok(StreamEvent::ContentDelta {
                                                    delta: content.clone(),
                                                }));
                                            }
                                        }

                                        // Check for role (start of message)
                                        if choice.delta.role.is_some() {
                                            return Some(Ok(StreamEvent::MessageStart));
                                        }
                                    }
                                }
                            }
                        }

                        // If we didn't find any useful event, skip this chunk
                        None
                    }
                    Err(e) => Some(Err(AIError::RequestError(e))),
                }
            }
        });

        Ok(Box::pin(stream))
    }

    async fn validate_api_key(&self, api_key: &str) -> Result<bool, AIError> {
        let test_request = OpenRouterRequest {
            model: "anthropic/claude-3.5-haiku".to_string(),
            messages: vec![OpenRouterMessage {
                role: "user".to_string(),
                content: OpenRouterContent::Text("Hi".to_string()),
            }],
            temperature: None,
            max_tokens: Some(5),
            stream: false,
        };

        let response = self
            .client
            .post(OPENROUTER_API_URL)
            .header("Authorization", format!("Bearer {}", api_key))
            .header("HTTP-Referer", "https://seeva.ai")
            .header("X-Title", "Seeva AI Assistant")
            .header("content-type", "application/json")
            .json(&test_request)
            .send()
            .await?;

        Ok(response.status().is_success())
    }

    fn available_models(&self) -> Vec<String> {
        vec![
            // Anthropic Models
            "anthropic/claude-sonnet-4".to_string(),
            "anthropic/claude-3.7-sonnet".to_string(),
            "anthropic/claude-3.5-sonnet".to_string(),
            "anthropic/claude-3.5-haiku".to_string(),
            "anthropic/claude-opus-4".to_string(),
            // OpenAI Models
            "openai/gpt-5.1".to_string(), // Vision-capable
            "openai/gpt-4o".to_string(),
            "openai/gpt-4o-mini".to_string(),
            "openai/gpt-4-turbo".to_string(),
            "openai/chatgpt-4o-latest".to_string(),
            // Google Models (Vision-capable)
            "google/gemini-2.5-flash-lite-preview-09-2025".to_string(), // Vision-capable
            "google/gemini-2.0-flash-exp".to_string(),
            "google/gemini-2.0-flash-thinking-exp:free".to_string(),
            "google/gemini-pro-1.5".to_string(),
            "google/gemini-flash-1.5".to_string(),
            // Meta Llama Models
            "meta-llama/llama-3.3-70b-instruct".to_string(),
            "meta-llama/llama-3.2-90b-vision-instruct".to_string(),
            "meta-llama/llama-3.1-405b-instruct".to_string(),
            // DeepSeek Models
            "deepseek/deepseek-r1".to_string(),
            "deepseek/deepseek-chat".to_string(),
            // Mistral Models
            "mistralai/mistral-large".to_string(),
            "mistralai/mistral-small".to_string(),
            // Qwen Models (Vision-capable)
            "qwen/qwen3-vl-235b-a22b-thinking".to_string(), // Vision-capable
            "qwen/qwen-2.5-72b-instruct".to_string(),
            // NVIDIA Models (Vision-capable)
            "nvidia/nemotron-nano-12b-v2-vl:free".to_string(), // Vision-capable
            // Others
            "x-ai/grok-2-vision-1212".to_string(),
            "perplexity/llama-3.1-sonar-huge-128k-online".to_string(),
        ]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_convert_text_only_message() {
        let provider = OpenRouterProvider::new("test-key".to_string());
        let messages = vec![ChatMessage {
            role: "user".to_string(),
            content: "Hello".to_string(),
            images: None,
        }];

        let converted = provider.convert_messages(messages);
        assert_eq!(converted.len(), 1);
        assert_eq!(converted[0].role, "user");

        match &converted[0].content {
            OpenRouterContent::Text(text) => assert_eq!(text, "Hello"),
            _ => panic!("Expected text content"),
        }
    }

    #[test]
    fn test_convert_message_with_images() {
        let provider = OpenRouterProvider::new("test-key".to_string());
        let messages = vec![ChatMessage {
            role: "user".to_string(),
            content: "What is this?".to_string(),
            images: Some(vec!["base64data".to_string()]),
        }];

        let converted = provider.convert_messages(messages);
        assert_eq!(converted.len(), 1);

        match &converted[0].content {
            OpenRouterContent::ContentParts(parts) => {
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
        let provider = OpenRouterProvider::new("test-key".to_string());
        let models = provider.available_models();
        assert!(models.contains(&"anthropic/claude-3.5-sonnet".to_string()));
        assert!(models.contains(&"openai/gpt-4o".to_string()));
        assert!(!models.is_empty());
    }
}
