use crate::managers::ThreadManager;
use crate::models::{Message, MessageRole};
use crate::services::ai::provider::{AIProvider, ChatMessage, ChatRequest, StreamEvent};
use crate::services::ai::{AnthropicProvider, OpenAIProvider, OpenRouterProvider};
use futures::StreamExt;
use std::collections::HashMap;
use std::sync::Arc;
use tauri::{Emitter, State};

#[tauri::command]
pub async fn send_message(
    thread_id: String,
    content: String,
    images: Option<Vec<String>>,
    provider: String,
    api_key: String,
    model: String,
    max_tokens: Option<u32>,
    include_context: Option<bool>,
    thread_manager: State<'_, Arc<ThreadManager>>,
    app_handle: tauri::AppHandle,
) -> Result<Message, String> {
    println!("📨 Sending message to {} using model {}", provider, model);
    println!("   Thread ID: {}", thread_id);
    println!("   Content length: {} chars", content.len());
    if let Some(ref imgs) = images {
        println!("   Images: {} attached", imgs.len());
    }

    // Add user message to database
    let user_message = thread_manager
        .add_message(
            thread_id.clone(),
            MessageRole::User,
            content.clone(),
            images.clone(),
        )
        .map_err(|e| e.to_string())?;

    // Get conversation history
    let messages = thread_manager
        .get_messages(&thread_id)
        .map_err(|e| e.to_string())?;

    // Convert to API format
    let api_messages: Vec<ChatMessage> = messages
        .iter()
        .filter(|m| m.role != MessageRole::System)
        .map(|m| ChatMessage {
            role: m.role.as_str().to_string(),
            content: m.content.clone(),
            images: m.images.clone(),
        })
        .collect();

    // Create AI provider
    let ai_provider: Box<dyn AIProvider> = match provider.as_str() {
        "anthropic" => Box::new(AnthropicProvider::new(api_key)),
        "openai" => Box::new(OpenAIProvider::new(api_key)),
        "openrouter" => Box::new(OpenRouterProvider::new(api_key)),
        _ => return Err(format!("Unsupported provider: {}", provider)),
    };

    // Build system prompt
    let system_prompt = "You are a helpful AI assistant.".to_string();

    // Create chat request
    let chat_request = ChatRequest {
        messages: api_messages,
        model: model.clone(),
        system: Some(system_prompt),
        temperature: Some(0.7),
        max_tokens: max_tokens.or(Some(4096)), // Use provided max_tokens or default to 4096
        stream: true,
    };

    // Stream response
    let mut stream = ai_provider
        .chat_stream(chat_request)
        .await
        .map_err(|e| e.to_string())?;

    let mut full_content = String::new();
    let mut token_usage = None;

    while let Some(event_result) = stream.next().await {
        match event_result {
            Ok(event) => {
                // Emit event to frontend
                app_handle
                    .emit("chat-stream", &event)
                    .map_err(|e| e.to_string())?;

                // Handle event
                match event {
                    StreamEvent::ContentDelta { delta } => {
                        full_content.push_str(&delta);
                    }
                    StreamEvent::MessageStop { usage } => {
                        token_usage = usage;
                    }
                    StreamEvent::Error { error } => {
                        eprintln!("❌ Stream error: {}", error);
                        return Err(error);
                    }
                    _ => {}
                }
            }
            Err(e) => {
                eprintln!("❌ Stream processing error: {}", e);
                return Err(e.to_string());
            }
        }
    }

    println!("✅ Received complete response ({} chars)", full_content.len());
    if let Some(usage) = &token_usage {
        println!("   Tokens used: {} input, {} output", usage.input_tokens, usage.output_tokens);
    }

    // Create metadata
    let mut metadata = HashMap::new();
    metadata.insert("model".to_string(), serde_json::json!(model));
    metadata.insert("provider".to_string(), serde_json::json!(provider));
    if let Some(usage) = token_usage {
        metadata.insert(
            "tokens".to_string(),
            serde_json::json!({
                "input": usage.input_tokens,
                "output": usage.output_tokens,
            }),
        );
    }

    // Add assistant message to database
    let mut assistant_message = Message::new(thread_id, MessageRole::Assistant, full_content);
    assistant_message.metadata = Some(metadata);

    thread_manager
        .create_message(&assistant_message)
        .map_err(|e| e.to_string())?;

    Ok(assistant_message)
}

#[tauri::command]
pub async fn get_messages(
    thread_id: String,
    thread_manager: State<'_, Arc<ThreadManager>>,
) -> Result<Vec<Message>, String> {
    thread_manager
        .get_messages(&thread_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_message(
    id: String,
    thread_manager: State<'_, Arc<ThreadManager>>,
) -> Result<(), String> {
    thread_manager.delete_message(&id).map_err(|e| e.to_string())
}
