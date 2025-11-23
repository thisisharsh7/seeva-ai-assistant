use std::sync::{Arc, Mutex};
use crate::models::{Message, Thread, MessageRole};
use crate::services::Database;
use rusqlite::Result;

pub struct ThreadManager {
    db: Arc<Database>,
    current_thread_id: Arc<Mutex<Option<String>>>,
}

impl ThreadManager {
    pub fn new(db: Arc<Database>) -> Self {
        Self {
            db,
            current_thread_id: Arc::new(Mutex::new(None)),
        }
    }

    // Thread operations
    pub fn create_thread(&self, name: String) -> Result<Thread> {
        let thread = Thread::new(name);
        self.db.create_thread(&thread)?;

        // Set as current thread
        let mut current = self.current_thread_id.lock().unwrap();
        *current = Some(thread.id.clone());

        Ok(thread)
    }

    pub fn list_threads(&self) -> Result<Vec<Thread>> {
        self.db.list_threads()
    }

    pub fn get_thread(&self, id: &str) -> Result<Option<Thread>> {
        self.db.get_thread(id)
    }

    pub fn switch_thread(&self, thread_id: String) -> Result<()> {
        // Verify thread exists
        match self.db.get_thread(&thread_id)? {
            Some(_) => {
                let mut current = self.current_thread_id.lock().unwrap();
                *current = Some(thread_id);
                Ok(())
            }
            None => Err(rusqlite::Error::QueryReturnedNoRows),
        }
    }

    pub fn get_current_thread_id(&self) -> Option<String> {
        self.current_thread_id.lock().unwrap().clone()
    }

    pub fn delete_thread(&self, id: &str) -> Result<()> {
        self.db.delete_thread(id)?;

        // Clear current thread if it was deleted
        let mut current = self.current_thread_id.lock().unwrap();
        if current.as_ref().map_or(false, |cid| cid == id) {
            *current = None;
        }

        Ok(())
    }

    pub fn update_thread_name(&self, id: &str, name: String) -> Result<()> {
        if let Some(mut thread) = self.db.get_thread(id)? {
            thread.name = name;
            thread.updated_at = chrono::Utc::now().timestamp_millis();
            self.db.update_thread(&thread)?;
            Ok(())
        } else {
            Err(rusqlite::Error::QueryReturnedNoRows)
        }
    }

    // Message operations
    pub fn add_message(
        &self,
        thread_id: String,
        role: MessageRole,
        content: String,
        images: Option<Vec<String>>,
    ) -> Result<Message> {
        // Verify thread exists
        let thread = self.db.get_thread(&thread_id)?
            .ok_or(rusqlite::Error::QueryReturnedNoRows)?;

        // Create message
        let mut message = Message::new(thread_id.clone(), role, content);
        message.images = images;

        self.db.create_message(&message)?;

        // Update thread timestamp
        let mut updated_thread = thread;
        updated_thread.updated_at = chrono::Utc::now().timestamp_millis();
        self.db.update_thread(&updated_thread)?;

        Ok(message)
    }

    pub fn get_messages(&self, thread_id: &str) -> Result<Vec<Message>> {
        self.db.get_messages(thread_id)
    }

    pub fn delete_message(&self, id: &str) -> Result<()> {
        self.db.delete_message(id)
    }

    pub fn create_message(&self, message: &Message) -> Result<()> {
        self.db.create_message(message)?;

        // Update thread timestamp
        if let Some(thread) = self.db.get_thread(&message.thread_id)? {
            let mut updated_thread = thread;
            updated_thread.updated_at = chrono::Utc::now().timestamp_millis();
            self.db.update_thread(&updated_thread)?;
        }

        Ok(())
    }

    // Utility methods
    #[allow(dead_code)]
    pub fn ensure_thread_exists(&self) -> Result<String> {
        // Check if current thread exists
        if let Some(thread_id) = self.get_current_thread_id() {
            if self.db.get_thread(&thread_id)?.is_some() {
                return Ok(thread_id);
            }
        }

        // Get or create default thread
        let threads = self.db.list_threads()?;
        if let Some(first_thread) = threads.first() {
            let thread_id = first_thread.id.clone();
            let mut current = self.current_thread_id.lock().unwrap();
            *current = Some(thread_id.clone());
            Ok(thread_id)
        } else {
            // Create new default thread
            let thread = self.create_thread("New Conversation".to_string())?;
            Ok(thread.id)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;
    use tempfile::TempDir;

    fn setup_test_db() -> (Arc<Database>, TempDir) {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("test.db");
        let db = Database::new(db_path).unwrap();
        (Arc::new(db), temp_dir)
    }

    #[test]
    fn test_create_and_switch_thread() {
        let (db, _temp) = setup_test_db();
        let manager = ThreadManager::new(db);

        let thread = manager.create_thread("Test Thread".to_string()).unwrap();
        assert_eq!(thread.name, "Test Thread");
        assert_eq!(manager.get_current_thread_id(), Some(thread.id.clone()));

        let thread2 = manager.create_thread("Thread 2".to_string()).unwrap();
        assert_eq!(manager.get_current_thread_id(), Some(thread2.id.clone()));

        manager.switch_thread(thread.id.clone()).unwrap();
        assert_eq!(manager.get_current_thread_id(), Some(thread.id));
    }

    #[test]
    fn test_add_message_updates_thread() {
        let (db, _temp) = setup_test_db();
        let manager = ThreadManager::new(db);

        let thread = manager.create_thread("Test".to_string()).unwrap();
        let old_updated_at = thread.updated_at;

        std::thread::sleep(std::time::Duration::from_millis(10));

        let message = manager.add_message(
            thread.id.clone(),
            MessageRole::User,
            "Hello".to_string(),
            None,
        ).unwrap();

        assert_eq!(message.content, "Hello");

        let updated_thread = manager.get_thread(&thread.id).unwrap().unwrap();
        assert!(updated_thread.updated_at > old_updated_at);
    }

    #[test]
    fn test_ensure_thread_exists() {
        let (db, _temp) = setup_test_db();
        let manager = ThreadManager::new(db);

        // Should create a default thread if none exists
        let thread_id = manager.ensure_thread_exists().unwrap();
        assert!(!thread_id.is_empty());

        let thread = manager.get_thread(&thread_id).unwrap().unwrap();
        assert_eq!(thread.name, "New Conversation");
    }

    #[test]
    fn test_delete_thread_clears_current() {
        let (db, _temp) = setup_test_db();
        let manager = ThreadManager::new(db);

        let thread = manager.create_thread("Test".to_string()).unwrap();
        assert_eq!(manager.get_current_thread_id(), Some(thread.id.clone()));

        manager.delete_thread(&thread.id).unwrap();
        assert_eq!(manager.get_current_thread_id(), None);
    }
}
