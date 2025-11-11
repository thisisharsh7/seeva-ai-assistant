use rusqlite::{Connection, params, Result};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use crate::models::{Message, Thread, MessageRole};

pub struct Database {
    conn: Arc<Mutex<Connection>>,
}

impl Database {
    pub fn new(db_path: PathBuf) -> Result<Self> {
        let conn = Connection::open(db_path)?;

        // Enable foreign key constraints
        conn.execute("PRAGMA foreign_keys = ON", [])?;

        let db = Self {
            conn: Arc::new(Mutex::new(conn)),
        };
        db.init_schema()?;
        Ok(db)
    }

    fn init_schema(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();

        // Create threads table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS threads (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                metadata TEXT
            )",
            [],
        )?;

        // Create messages table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                thread_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                metadata TEXT,
                FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
            )",
            [],
        )?;

        // Create images table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS images (
                id TEXT PRIMARY KEY,
                message_id TEXT NOT NULL,
                data TEXT NOT NULL,
                mime_type TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
            )",
            [],
        )?;

        // Create indexes
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id)",
            [],
        )?;
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at)",
            [],
        )?;
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_images_message ON images(message_id)",
            [],
        )?;

        Ok(())
    }

    // Thread operations
    pub fn create_thread(&self, thread: &Thread) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO threads (id, name, created_at, updated_at, metadata) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![thread.id, thread.name, thread.created_at, thread.updated_at, Option::<String>::None],
        )?;
        Ok(())
    }

    pub fn get_thread(&self, id: &str) -> Result<Option<Thread>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT t.id, t.name, t.created_at, t.updated_at,
                    COUNT(m.id) as message_count,
                    (SELECT content FROM messages WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1) as last_message
             FROM threads t
             LEFT JOIN messages m ON m.thread_id = t.id
             WHERE t.id = ?1
             GROUP BY t.id"
        )?;

        let thread = stmt.query_row(params![id], |row| {
            Ok(Thread {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: row.get(2)?,
                updated_at: row.get(3)?,
                message_count: row.get(4).ok(),
                last_message: row.get(5).ok(),
            })
        });

        match thread {
            Ok(t) => Ok(Some(t)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn list_threads(&self) -> Result<Vec<Thread>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT t.id, t.name, t.created_at, t.updated_at,
                    COUNT(m.id) as message_count,
                    (SELECT content FROM messages WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1) as last_message
             FROM threads t
             LEFT JOIN messages m ON m.thread_id = t.id
             GROUP BY t.id
             ORDER BY t.updated_at DESC"
        )?;

        let threads = stmt.query_map([], |row| {
            Ok(Thread {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: row.get(2)?,
                updated_at: row.get(3)?,
                message_count: row.get(4).ok(),
                last_message: row.get(5).ok(),
            })
        })?;

        threads.collect()
    }

    pub fn update_thread(&self, thread: &Thread) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE threads SET name = ?1, updated_at = ?2 WHERE id = ?3",
            params![thread.name, thread.updated_at, thread.id],
        )?;
        Ok(())
    }

    pub fn delete_thread(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM threads WHERE id = ?1", params![id])?;
        Ok(())
    }

    // Message operations
    pub fn create_message(&self, message: &Message) -> Result<()> {
        let conn = self.conn.lock().unwrap();

        // Insert message
        conn.execute(
            "INSERT INTO messages (id, thread_id, role, content, created_at, metadata) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                message.id,
                message.thread_id,
                message.role.as_str(),
                message.content,
                message.created_at,
                message.metadata.as_ref().map(|m| serde_json::to_string(m).ok()).flatten()
            ],
        )?;

        // Insert images if present
        if let Some(images) = &message.images {
            for (idx, img_data) in images.iter().enumerate() {
                let image_id = format!("{}-{}", message.id, idx);
                conn.execute(
                    "INSERT INTO images (id, message_id, data, mime_type, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
                    params![image_id, message.id, img_data, "image/png", message.created_at],
                )?;
            }
        }

        Ok(())
    }

    pub fn get_messages(&self, thread_id: &str) -> Result<Vec<Message>> {
        let conn = self.conn.lock().unwrap();

        // Get messages
        let mut stmt = conn.prepare(
            "SELECT id, thread_id, role, content, created_at, metadata FROM messages WHERE thread_id = ?1 ORDER BY created_at ASC"
        )?;

        let messages = stmt.query_map(params![thread_id], |row| {
            let id: String = row.get(0)?;
            let thread_id: String = row.get(1)?;
            let role_str: String = row.get(2)?;
            let role = MessageRole::from_str(&role_str).unwrap_or(MessageRole::User);
            let content: String = row.get(3)?;
            let created_at: i64 = row.get(4)?;
            let metadata_str: Option<String> = row.get(5)?;
            let metadata = metadata_str.and_then(|s| serde_json::from_str(&s).ok());

            Ok((id, thread_id, role, content, created_at, metadata))
        })?;

        let mut result = Vec::new();
        for msg in messages {
            let (id, thread_id, role, content, created_at, metadata) = msg?;

            // Get images for this message
            let mut img_stmt = conn.prepare("SELECT data FROM images WHERE message_id = ?1 ORDER BY id")?;
            let images: Result<Vec<String>> = img_stmt
                .query_map(params![&id], |row| row.get(0))?
                .collect();
            let images = images.ok().filter(|v| !v.is_empty());

            result.push(Message {
                id,
                thread_id,
                role,
                content,
                created_at,
                metadata,
                images,
            });
        }

        Ok(result)
    }

    pub fn delete_message(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM messages WHERE id = ?1", params![id])?;
        Ok(())
    }
}
