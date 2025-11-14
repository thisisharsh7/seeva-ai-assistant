# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Seeva is a cross-platform desktop AI assistant built with Tauri 2.9 (Rust) and React 19. It appears instantly via global hotkey (Cmd/Ctrl+Shift+C), supports screen capture with AI vision APIs, and maintains local-first conversation storage in SQLite.

**Key Value Proposition**: Eliminates context-switching by providing instant AI assistance without leaving your current application. Press hotkey → capture screen → get AI help → return to work.

## Development Commands

### Running the Application

```bash
# Development mode (hot reload for both frontend and Rust)
bun run tauri dev

# Build for production
bun run tauri build

# Frontend only (for UI work without Tauri)
bun run dev
```

### Building & Releases

```bash
# Generate signing keys for auto-updater (one-time setup)
bun run tauri signer generate -w .tauri/seeva.key

# TypeScript compilation check
bun run build  # Runs tsc && vite build
```

**Note**: Production releases are handled by GitHub Actions workflow `.github/workflows/release.yml` with code signing and multi-platform builds.

### Package Management

```bash
# Install dependencies
bun install

# Add frontend dependency
bun add <package>

# Add Rust dependency (in src-tauri/)
cargo add <crate>
```

## Architecture

### Frontend-Backend Communication (Tauri IPC)

Seeva uses Tauri's command/event system to bridge React (frontend) and Rust (backend):

**Commands** (Frontend → Backend):
- TypeScript: `invoke('command_name', { params })`
- Rust: `#[tauri::command]` functions registered in `src-tauri/src/lib.rs`
- All commands defined in `src-tauri/src/commands/`

**Events** (Backend → Frontend):
- Rust: `app_handle.emit("event-name", &payload)`
- TypeScript: `listen<T>('event-name', (event) => callback(event.payload))`
- Used for real-time AI streaming (`chat-stream` events)

### AI Streaming Architecture

The codebase implements server-sent events (SSE) streaming from AI providers:

1. **Frontend** calls `chatAPI.sendMessage()` → invokes Tauri command
2. **Rust backend**:
   - Creates AI provider (currently `AnthropicProvider`)
   - Makes streaming HTTP request to AI API
   - Parses SSE format: `"data: {...}\n\n"`
   - Emits `StreamEvent` to frontend via Tauri events
3. **Frontend** accumulates streaming content in `chatStore.streamingContent`
4. **Database** persists complete message after stream finishes

**Key Files**:
- `src-tauri/src/services/ai/provider.rs` - Trait defining AI provider interface
- `src-tauri/src/services/ai/anthropic.rs` - Anthropic implementation with SSE parsing
- `src-tauri/src/commands/chat.rs:11` - `send_message` command with streaming loop
- `src/stores/chatStore.ts:252` - Frontend streaming state management

### State Management (Zustand)

Three separate stores following atomic selector pattern:

- **chatStore** (`src/stores/chatStore.ts`) - Threads, messages, streaming state
- **settingsStore** - API keys, provider configs, shortcuts
- **uiStore** - Modal visibility, UI state

**Pattern**: Each store exports actions in a separate object and uses custom hooks with selectors to prevent unnecessary re-renders.

### Database Schema (SQLite)

Located at: `~/.config/ai.seeva.assistant/seeva.db` (macOS/Linux) or `%APPDATA%\ai.seeva.assistant\seeva.db` (Windows)

```sql
threads (id, name, created_at, updated_at, metadata)
  ↓ (foreign key with CASCADE DELETE)
messages (id, thread_id, role, content, created_at, metadata)
  ↓ (foreign key with CASCADE DELETE)
images (id, message_id, data, mime_type, created_at)
```

**Key Details**:
- Images stored as base64-encoded JPEG strings in `images.data`
- Indexes on `messages.thread_id` and `messages.created_at` for performance
- Database managed by `Database` service (`src-tauri/src/services/database.rs`)
- Thread-safe via `Arc<Mutex<Connection>>`

### Screen Capture Flow

1. Frontend calls `screenshotAPI.capture()` → Tauri IPC
2. Rust uses `screenshots` crate (0.8) to capture display
3. `image` crate converts to JPEG (quality 85%)
4. `base64` crate encodes to string
5. Returns to frontend, optionally attached to message
6. Sent to AI provider as `ContentBlock::Image` with vision-capable models

**Implementation**: `src-tauri/src/services/screenshot.rs`

## Code Structure

### Rust Backend (`src-tauri/`)

```
src-tauri/src/
├── commands/          # Tauri IPC command handlers
│   ├── chat.rs       # send_message, get_messages (streaming logic)
│   ├── threads.rs    # Thread CRUD operations
│   ├── screenshot.rs # Screen capture commands
│   ├── settings.rs   # Settings persistence
│   └── shortcut.rs   # Global hotkey registration
├── services/         # Business logic layer
│   ├── ai/          # AI provider implementations
│   │   ├── provider.rs    # Trait definition with streaming
│   │   └── anthropic.rs   # Anthropic API + SSE parsing
│   ├── database.rs   # SQLite operations with rusqlite
│   ├── screenshot.rs # Image capture with screenshots crate
│   └── settings_manager.rs # JSON file persistence
├── managers/         # Domain coordination
│   └── thread_manager.rs # Orchestrates DB + thread operations
├── models/           # Data structures
│   ├── thread.rs
│   └── message.rs
└── lib.rs           # App setup, plugin registration, state management
```

### React Frontend (`src/`)

```
src/
├── components/
│   ├── chat/         # ChatWindow, MessageList, ChatInput
│   ├── settings/     # Settings modal and panels
│   └── ui/           # Reusable components (Button, Modal, etc.)
├── stores/           # Zustand state management
│   ├── chatStore.ts     # Thread/message state + streaming
│   ├── settingsStore.ts # User preferences + API keys
│   └── uiStore.ts       # UI visibility state
├── lib/
│   ├── tauri-api.ts  # Typed wrappers for Tauri IPC
│   └── types.ts      # TypeScript interfaces (Message, Thread, etc.)
├── hooks/            # Custom React hooks
└── styles/           # Global CSS (Tailwind)
```

## Important Patterns

### Adding a New AI Provider

To add support for OpenAI, Gemini, or Ollama:

1. **Create provider**: `src-tauri/src/services/ai/<provider>.rs`
2. **Implement trait**: `impl AIProvider for <Provider>`
   - `chat()` - Non-streaming request
   - `chat_stream()` - Returns `StreamResult` (pinned async stream)
   - `validate_api_key()` - Test API key validity
   - `available_models()` - List supported models
3. **Register in chat command**: `src-tauri/src/commands/chat.rs:56`
   ```rust
   let ai_provider: Box<dyn AIProvider> = match provider.as_str() {
       "anthropic" => Box::new(AnthropicProvider::new(api_key)),
       "openai" => Box::new(OpenAIProvider::new(api_key)),  // Add here
       _ => return Err(format!("Unsupported provider: {}", provider)),
   };
   ```
4. **Update TypeScript types**: `src/lib/types.ts:5`
   ```typescript
   export type AIProvider = 'anthropic' | 'openai' | 'gemini' | 'ollama';
   ```

### Working with Tauri Commands

**Create new command**:

1. Define in `src-tauri/src/commands/<domain>.rs`:
   ```rust
   #[tauri::command]
   pub async fn my_command(
       param: String,
       state: State<'_, Arc<MyService>>,
   ) -> Result<MyType, String> {
       // Implementation
       Ok(result)
   }
   ```

2. Register in `src-tauri/src/lib.rs:66`:
   ```rust
   .invoke_handler(tauri::generate_handler![
       commands::my_command,
       // ... other commands
   ])
   ```

3. Call from TypeScript:
   ```typescript
   import { invoke } from '@tauri-apps/api/core';
   const result = await invoke<MyType>('my_command', { param: 'value' });
   ```

### Zustand Store Updates

When modifying state, always use immutable updates:

```typescript
set((state) => ({
  messages: [...state.messages, newMessage],  // ✅ Create new array
  count: state.count + 1
}));

// ❌ WRONG - Don't mutate directly
set((state) => {
  state.messages.push(newMessage);
  return state;
});
```

### Database Migrations

The database schema is initialized in `src-tauri/src/services/database.rs:24`. To modify schema:

1. Add migration logic in `init_schema()` or create versioned migrations
2. Use `ALTER TABLE` or create new tables
3. **Important**: Test with existing database files - no automatic migration system exists

## Configuration Files

- **`src-tauri/tauri.conf.json`** - Tauri app configuration
  - Window properties (transparent, always-on-top, decorations: false)
  - Auto-updater settings + public key
  - Plugin configurations (store, sql, globalShortcut)
  - Bundle settings for icons, installers

- **`src-tauri/Cargo.toml`** - Rust dependencies
  - Tauri plugins: store, sql, global-shortcut, updater, fs, clipboard-manager
  - Core dependencies: reqwest (HTTP), rusqlite (database), tokio (async), screenshots, image, base64

- **`package.json`** - Frontend dependencies
  - React 19, TypeScript 5.8, Vite 7, Tailwind 4
  - Tauri API packages (@tauri-apps/api, plugins)
  - Bun as package manager

- **`vite.config.ts`** - Vite build configuration
  - Fixed port 1420 for Tauri dev server
  - HMR on port 1421
  - React + Tailwind plugins

## Testing

**Current State**: No test framework configured. No test files exist.

**To Add Testing**:

**Rust**:
```toml
# In src-tauri/Cargo.toml [dev-dependencies]
[dev-dependencies]
tokio-test = "0.4"
```

**TypeScript**:
```bash
bun add -d vitest @testing-library/react @testing-library/jest-dom
```

See examples in `src-tauri/src/services/ai/anthropic.rs:346` (existing unit tests for message conversion).

## Security Notes

- **API Keys**: Stored in plaintext in `settings.json`. Ensure file permissions are restrictive.
- **Local Database**: No encryption. Contains all messages and base64-encoded screenshots.
- **Auto-Updates**: Cryptographically signed using minisign. Public key in tauri.conf.json.
- **Markdown Rendering**: Uses `react-markdown` with `react-syntax-highlighter`. Ensure no XSS vectors when rendering AI responses.
- **Foreign Key Constraints**: Enabled in SQLite to maintain data integrity.

## Common Development Tasks

### Modify Window Appearance

Edit `src-tauri/tauri.conf.json:14-33` for window properties (size, transparency, decorations).

Glassmorphism styling in `src/styles/` and component-level Tailwind classes.

### Add New Tauri Plugin

1. Add to `src-tauri/Cargo.toml`:
   ```toml
   tauri-plugin-<name> = "2"
   ```

2. Register in `src-tauri/src/lib.rs:18`:
   ```rust
   .plugin(tauri_plugin_<name>::init())
   ```

3. Add to `package.json` if it has a JS API:
   ```json
   "@tauri-apps/plugin-<name>": "^2"
   ```

### Debug Tauri IPC Issues

Enable Rust logging (already configured via `tracing-subscriber::fmt::init()` in `lib.rs:15`):

```bash
RUST_LOG=debug bun run tauri dev
```

Frontend debugging: Open DevTools in the app window (Cmd+Option+I on macOS).

### Change Database Location

Modify app directory retrieval in `src-tauri/src/lib.rs:23`:
```rust
let app_dir = app.path().app_data_dir().expect("Failed to get app data directory");
```

## Build & Release

GitHub Actions automatically builds for all platforms when creating a release:

1. Update version in `src-tauri/tauri.conf.json:4`
2. Trigger `.github/workflows/release.yml` manually
3. Workflow builds: macOS (ARM + Intel), Ubuntu (22.04 + 24.04), Windows
4. Generates signed installers: `.dmg`, `.app`, `.deb`, `.rpm`, `.AppImage`, `.msi`, `.exe`
5. Creates `latest.json` for auto-updater

**Signing Requirements**:
- GitHub Secrets: `TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- macOS: `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `KEYCHAIN_PASSWORD`

## Known Limitations

- Only Anthropic provider implemented (OpenAI, Gemini, Ollama planned)
- No test coverage
- No linting/formatting configuration
- API keys stored in plaintext
- No database encryption
- Race condition handling via 200ms delay (chatStore.ts:327) - should be event-driven
- Uses older Tauri emit/listen pattern instead of newer `Channel` API for streaming
