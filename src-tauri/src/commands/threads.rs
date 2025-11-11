use crate::managers::ThreadManager;
use crate::models::Thread;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_thread(
    name: String,
    thread_manager: State<'_, Arc<ThreadManager>>,
) -> Result<Thread, String> {
    println!("🧵 Creating new thread with name: {}", name);

    match thread_manager.create_thread(name) {
        Ok(thread) => {
            println!("   ✅ Thread created successfully: {} (ID: {})", thread.name, thread.id);
            Ok(thread)
        }
        Err(e) => {
            eprintln!("   ❌ Failed to create thread: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
pub async fn list_threads(
    thread_manager: State<'_, Arc<ThreadManager>>,
) -> Result<Vec<Thread>, String> {
    println!("🧵 Listing all threads...");

    match thread_manager.list_threads() {
        Ok(threads) => {
            println!("   ✅ Found {} thread(s)", threads.len());
            for (i, thread) in threads.iter().enumerate() {
                println!("      {}. {} (ID: {})", i + 1, thread.name, thread.id);
            }
            Ok(threads)
        }
        Err(e) => {
            eprintln!("   ❌ Failed to list threads: {}", e);
            Err(e.to_string())
        }
    }
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
    println!("🧵 Switching to thread: {}", thread_id);

    match thread_manager.switch_thread(thread_id.clone()) {
        Ok(_) => {
            println!("   ✅ Successfully switched to thread: {}", thread_id);
            Ok(())
        }
        Err(e) => {
            eprintln!("   ❌ Failed to switch thread: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
pub async fn delete_thread(
    id: String,
    thread_manager: State<'_, Arc<ThreadManager>>,
) -> Result<(), String> {
    println!("🧵 Deleting thread: {}", id);

    match thread_manager.delete_thread(&id) {
        Ok(_) => {
            println!("   ✅ Thread deleted successfully: {}", id);
            Ok(())
        }
        Err(e) => {
            eprintln!("   ❌ Failed to delete thread: {}", e);
            Err(e.to_string())
        }
    }
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
    let current_id = thread_manager.get_current_thread_id();
    println!("🧵 Getting current thread ID: {:?}", current_id);
    Ok(current_id)
}
