use crate::managers::ThreadManager;
use crate::models::Thread;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_thread(
    name: String,
    thread_manager: State<'_, Arc<ThreadManager>>,
) -> Result<Thread, String> {
    thread_manager
        .create_thread(name)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_threads(
    thread_manager: State<'_, Arc<ThreadManager>>,
) -> Result<Vec<Thread>, String> {
    thread_manager.list_threads().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_thread(
    id: String,
    thread_manager: State<'_, Arc<ThreadManager>>,
) -> Result<Option<Thread>, String> {
    thread_manager.get_thread(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn switch_thread(
    thread_id: String,
    thread_manager: State<'_, Arc<ThreadManager>>,
) -> Result<(), String> {
    thread_manager
        .switch_thread(thread_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_thread(
    id: String,
    thread_manager: State<'_, Arc<ThreadManager>>,
) -> Result<(), String> {
    thread_manager.delete_thread(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_thread_name(
    id: String,
    name: String,
    thread_manager: State<'_, Arc<ThreadManager>>,
) -> Result<(), String> {
    thread_manager
        .update_thread_name(&id, name)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_current_thread_id(
    thread_manager: State<'_, Arc<ThreadManager>>,
) -> Result<Option<String>, String> {
    Ok(thread_manager.get_current_thread_id())
}
