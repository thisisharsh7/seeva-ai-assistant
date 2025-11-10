# Seeva AI Assistant - Development Plan

## Project Overview

**Seeva AI Assistant** is a cross-platform desktop application that provides a system-wide floating chat interface for multiple AI providers with advanced screenshot capabilities. This project is a complete refactor of the Claude Overlay prototype, transforming it from a macOS-only Python application into a production-ready, cross-platform desktop app built with Tauri, React, and TypeScript.

### Core Principles
- **Cross-platform ready**: Built with Tauri for macOS, Windows, and Linux support
- **Multiple AI providers**: Support for Anthropic Claude, OpenAI, Google Gemini, and local Ollama models
- **Production quality**: Proper error handling, logging, auto-updates, and professional UX
- **Privacy-focused**: Local data storage, encrypted API keys, optional telemetry
- **Modern architecture**: React + TypeScript frontend, Rust backend

---

## Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript 5.6
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4.1 (glassmorphism design system)
- **State Management**: Zustand 5
- **Icons**: Lucide React
- **UI Components**: Custom component library
- **Validation**: Zod 3

### Backend (Rust/Tauri)
- **Framework**: Tauri 2.9+
- **Screenshot**: Platform-specific implementations (screenshots-rs)
- **Database**: SQLite via rusqlite
- **HTTP Client**: reqwest (for AI API calls)
- **Hotkeys**: Tauri global-shortcut plugin
- **Storage**: Tauri store plugin (settings persistence)
- **Encryption**: ring crate (API key encryption)

### Tauri Plugins
- `@tauri-apps/plugin-store` - Settings persistence
- `@tauri-apps/plugin-global-shortcut` - Global hotkeys
- `@tauri-apps/plugin-clipboard-manager` - Clipboard operations
- `@tauri-apps/plugin-fs` - File system access
- `@tauri-apps/plugin-sql` - SQLite database
- `@tauri-apps/plugin-updater` - Auto-updates (future)
- `@tauri-apps/plugin-autostart` - Launch on startup

---

## Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface Layer                  │
│                     (React + TypeScript)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Chat Window  │  │   Settings   │  │  Screenshot  │  │
│  │  Component   │  │     Panel    │  │   Preview    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                    Tauri IPC Bridge
                           │
┌─────────────────────────────────────────────────────────┐
│                    Backend Layer (Rust)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ AI Provider  │  │  Screenshot  │  │    Thread    │  │
│  │   Manager    │  │   Capture    │  │   Manager    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Hotkey     │  │   Settings   │  │   Database   │  │
│  │   Manager    │  │    Store     │  │   (SQLite)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                    External Services
                           │
        ┌──────────┬───────┴───────┬──────────┐
        │          │               │          │
   ┌────▼────┐ ┌──▼───┐ ┌────────▼───┐ ┌────▼────┐
   │Anthropic│ │OpenAI│ │   Gemini   │ │ Ollama  │
   │  Claude │ │ GPT  │ │  (Google)  │ │ (Local) │
   └─────────┘ └──────┘ └────────────┘ └─────────┘
```

### Frontend Architecture

```
src/
├── App.tsx                    # Main application component
├── main.tsx                   # Entry point
├── components/
│   ├── chat/
│   │   ├── ChatWindow.tsx     # Main chat interface
│   │   ├── MessageBubble.tsx  # Individual message display
│   │   ├── MessageList.tsx    # Message container with scroll
│   │   ├── InputBar.tsx       # Message input with actions
│   │   └── ThreadSidebar.tsx  # Conversation list
│   ├── settings/
│   │   ├── SettingsPanel.tsx  # Settings container
│   │   ├── GeneralSettings.tsx
│   │   ├── AIProviderSettings.tsx
│   │   ├── AppearanceSettings.tsx
│   │   ├── HotkeySettings.tsx
│   │   └── AdvancedSettings.tsx
│   ├── screenshot/
│   │   ├── ScreenshotButton.tsx
│   │   ├── ScreenshotPreview.tsx
│   │   └── ImageGallery.tsx
│   └── ui/
│       ├── Button.tsx         # Reusable button component
│       ├── Input.tsx          # Input field
│       ├── Select.tsx         # Dropdown select
│       ├── Modal.tsx          # Modal dialog
│       ├── Toast.tsx          # Toast notifications
│       └── Spinner.tsx        # Loading indicator
├── stores/
│   ├── chatStore.ts           # Chat state (threads, messages)
│   ├── settingsStore.ts       # App settings
│   └── uiStore.ts             # UI state (modals, toasts)
├── services/
│   ├── api.ts                 # Tauri command wrappers
│   └── storage.ts             # Client-side storage utilities
├── hooks/
│   ├── useChat.ts             # Chat operations hook
│   ├── useSettings.ts         # Settings hook
│   └── useScreenshot.ts       # Screenshot hook
├── lib/
│   ├── types.ts               # TypeScript type definitions
│   ├── constants.ts           # App constants
│   └── utils.ts               # Utility functions
└── styles/
    └── globals.css            # Global styles + Tailwind imports
```

### Backend Architecture (Rust)

```
src-tauri/
├── Cargo.toml                 # Rust dependencies
├── tauri.conf.json            # Tauri configuration
├── build.rs                   # Build script
├── src/
│   ├── lib.rs                 # Main library entry point
│   ├── main.rs                # Binary entry point
│   ├── commands/              # Tauri command implementations
│   │   ├── mod.rs
│   │   ├── chat.rs            # Chat-related commands
│   │   ├── screenshot.rs      # Screenshot commands
│   │   ├── settings.rs        # Settings commands
│   │   └── threads.rs         # Thread management commands
│   ├── services/              # Business logic layer
│   │   ├── mod.rs
│   │   ├── ai/
│   │   │   ├── mod.rs
│   │   │   ├── provider.rs    # AI provider trait
│   │   │   ├── anthropic.rs   # Anthropic implementation
│   │   │   ├── openai.rs      # OpenAI implementation
│   │   │   ├── gemini.rs      # Google Gemini implementation
│   │   │   └── ollama.rs      # Ollama implementation
│   │   ├── screenshot.rs      # Screenshot capture service
│   │   └── database.rs        # Database operations
│   ├── managers/              # State management
│   │   ├── mod.rs
│   │   ├── thread_manager.rs  # Thread/conversation manager
│   │   ├── hotkey_manager.rs  # Global hotkey handler
│   │   └── settings_manager.rs # Settings persistence
│   ├── models/                # Data models
│   │   ├── mod.rs
│   │   ├── message.rs         # Message model
│   │   ├── thread.rs          # Thread model
│   │   └── settings.rs        # Settings model
│   └── utils/
│       ├── mod.rs
│       ├── encryption.rs      # API key encryption
│       └── logger.rs          # Logging utilities
└── capabilities/
    └── default.json           # Permission definitions
```

---

## AI Provider Architecture

### Provider Interface

All AI providers implement a common trait to ensure consistent behavior:

```rust
#[async_trait]
pub trait AIProvider: Send + Sync {
    async fn send_message(
        &self,
        messages: Vec<Message>,
        images: Option<Vec<String>>, // Base64 encoded
        config: &ProviderConfig,
    ) -> Result<String>;

    async fn stream_message(
        &self,
        messages: Vec<Message>,
        images: Option<Vec<String>>,
        config: &ProviderConfig,
    ) -> Result<Stream<String>>;

    fn validate_api_key(&self, api_key: &str) -> Result<bool>;
    fn get_models(&self) -> Vec<ModelInfo>;
}
```

### Supported Providers

#### 1. Anthropic Claude
- **Models**: Claude Sonnet 4.5, Claude 3.5 Sonnet, Claude 3 Opus
- **Features**: Vision support, 200K context, streaming
- **API**: Anthropic Messages API
- **Implementation**: Based on current working code

#### 2. OpenAI
- **Models**: GPT-4o, GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
- **Features**: Vision support (GPT-4V), 128K context, streaming
- **API**: OpenAI Chat Completions API

#### 3. Google Gemini
- **Models**: Gemini 1.5 Pro, Gemini 1.5 Flash
- **Features**: Vision support, 1M context, streaming
- **API**: Google Generative AI API

#### 4. Ollama (Local)
- **Models**: User-installed (Llama 3, Mistral, CodeLlama, etc.)
- **Features**: Local inference, no API key required, privacy
- **API**: Ollama REST API (localhost:11434)

---

## Data Flow

### Message Send Flow

```
User types message + attaches screenshot
    │
    ├─> Frontend: InputBar.tsx
    │   └─> chatStore.addMessage(userMessage)
    │
    ├─> Tauri Command: send_message()
    │   │
    │   ├─> ThreadManager: Save message to SQLite
    │   │
    │   ├─> AIProvider: Select provider based on settings
    │   │   └─> HTTP Request to AI API
    │   │       └─> Stream response chunks
    │   │
    │   └─> Return assistant message
    │
    └─> Frontend: Display streaming response
        └─> ThreadManager: Save assistant message
```

### Screenshot Flow

```
User clicks screenshot button (or Cmd+Shift+S)
    │
    ├─> Frontend: ScreenshotButton.tsx
    │   └─> Tauri Command: capture_screenshot()
    │
    ├─> Backend: screenshot_capture.rs
    │   │
    │   ├─> macOS: screencapture CLI
    │   ├─> Windows: BitBlt API
    │   └─> Linux: X11/Wayland capture
    │
    ├─> Save to temp file
    ├─> Return base64 encoded image
    │
    └─> Frontend: Display preview
        └─> Attach to next message
```

### Settings Flow

```
User changes setting in UI
    │
    ├─> Frontend: SettingsPanel.tsx
    │   └─> settingsStore.updateSetting()
    │
    ├─> Tauri Command: save_settings()
    │   │
    │   └─> Tauri Store Plugin
    │       └─> Write to settings.json
    │
    └─> Frontend: Update UI
        └─> Apply settings (theme, hotkey, etc.)
```

---

## Database Schema

### SQLite Tables

```sql
-- Threads/Conversations
CREATE TABLE threads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    metadata TEXT -- JSON for extensibility
);

-- Messages
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL,
    role TEXT NOT NULL, -- 'user' | 'assistant' | 'system'
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    metadata TEXT, -- JSON: images, model, tokens, etc.
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
);

-- Images (for message attachments)
CREATE TABLE images (
    id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL,
    data BLOB NOT NULL, -- Base64 or binary
    mime_type TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_images_message ON images(message_id);
```

---

## Settings Structure

### Settings JSON Schema

```json
{
  "version": "1.0.0",
  "general": {
    "theme": "dark",
    "fontSize": "medium",
    "launchOnStartup": false,
    "minimizeToTray": true,
    "showNotifications": true
  },
  "aiProviders": {
    "default": "anthropic",
    "anthropic": {
      "apiKey": "encrypted:...",
      "model": "claude-sonnet-4.5-20250929",
      "maxTokens": 4096,
      "temperature": 1.0
    },
    "openai": {
      "apiKey": "encrypted:...",
      "model": "gpt-4o",
      "maxTokens": 4096,
      "temperature": 1.0
    },
    "gemini": {
      "apiKey": "encrypted:...",
      "model": "gemini-1.5-pro",
      "maxTokens": 4096,
      "temperature": 1.0
    },
    "ollama": {
      "baseUrl": "http://localhost:11434",
      "model": "llama3",
      "maxTokens": 4096,
      "temperature": 1.0
    }
  },
  "shortcuts": {
    "toggleWindow": "CommandOrControl+Shift+C",
    "screenshot": "CommandOrControl+Shift+S",
    "newThread": "CommandOrControl+N"
  },
  "appearance": {
    "glassmorphism": true,
    "transparency": 0.85,
    "blurRadius": 20,
    "accentColor": "#3b82f6"
  },
  "advanced": {
    "debug": false,
    "logLevel": "info",
    "autoSave": true,
    "contextLimit": 50
  }
}
```

---

## UI Design System (Glassmorphism)

### Color Palette

Ported from `ui_styles_v2.py`:

```css
:root {
  /* Glass surfaces */
  --glass-dark: rgba(10, 10, 15, 0.85);
  --glass-darker: rgba(5, 5, 10, 0.9);
  --glass-light: rgba(25, 25, 35, 0.7);

  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.1);
  --border-focus: rgba(59, 130, 246, 0.5);

  /* Text */
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-tertiary: rgba(255, 255, 255, 0.5);

  /* Accents */
  --accent-blue: #3b82f6;
  --accent-purple: #8b5cf6;
  --accent-gradient: linear-gradient(135deg, #3b82f6, #8b5cf6);

  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.4);

  /* Blur */
  --blur-sm: blur(10px);
  --blur-md: blur(20px);
  --blur-lg: blur(40px);

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}
```

### Component Styles

Tailwind utility classes for common patterns:

```typescript
export const glassStyles = {
  window: "bg-glass-dark backdrop-blur-md border border-border-subtle shadow-lg rounded-lg",
  card: "bg-glass-light backdrop-blur-sm border border-border-subtle shadow-md rounded-md",
  button: "bg-glass-light hover:bg-glass-darker border border-border-subtle rounded-md transition-all",
  input: "bg-glass-darker border border-border-subtle focus:border-accent-blue rounded-md",
  messageBubble: {
    user: "bg-accent-blue/20 border border-accent-blue/40 rounded-lg ml-auto",
    assistant: "bg-glass-light border border-border-subtle rounded-lg mr-auto"
  }
};
```

---

## Development Roadmap

### Phase 1: Foundation & Core (Current - Week 1-2)

**✅ Completed:**
- [x] Initialize Tauri + React + TypeScript project
- [x] Create plan.md (this document)

**🔄 In Progress:**
- [ ] Create tracking.md
- [ ] Set up project structure
- [ ] Install dependencies

**📋 Upcoming:**
- [ ] Configure Tauri (window, permissions, capabilities)
- [ ] Set up Tailwind CSS with glassmorphism tokens
- [ ] Create base UI components (Button, Input, Modal)
- [ ] Set up Zustand stores

### Phase 2: Backend Services (Week 2-3)

- [ ] Implement SQLite database schema
- [ ] Create ThreadManager (Rust)
- [ ] Implement AI provider trait
- [ ] Add Anthropic Claude provider
- [ ] Add OpenAI provider
- [ ] Add Google Gemini provider
- [ ] Add Ollama provider
- [ ] Implement screenshot capture (macOS)
- [ ] Create Tauri commands for all operations

### Phase 3: Chat Interface (Week 3-4)

- [ ] Build ChatWindow component
- [ ] Create MessageBubble component
- [ ] Implement MessageList with virtualization
- [ ] Build InputBar with screenshot button
- [ ] Create ThreadSidebar
- [ ] Implement streaming message display
- [ ] Add markdown rendering
- [ ] Add code syntax highlighting

### Phase 4: Settings & Configuration (Week 4-5)

- [ ] Build SettingsPanel container
- [ ] Create GeneralSettings page
- [ ] Create AIProviderSettings page (all 4 providers)
- [ ] Create AppearanceSettings page
- [ ] Create HotkeySettings page
- [ ] Implement settings persistence
- [ ] Add API key encryption
- [ ] Create settings import/export

### Phase 5: Advanced Features (Week 5-6)

- [ ] Implement global hotkey manager
- [ ] Add system tray integration
- [ ] Create onboarding flow
- [ ] Implement error handling UI
- [ ] Add toast notifications
- [ ] Create debug mode
- [ ] Add logging system

### Phase 6: Polish & Testing (Week 6-7)

- [ ] Write unit tests (Rust)
- [ ] Write component tests (React)
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Documentation
- [ ] User guide
- [ ] Build and packaging
- [ ] macOS app signing

### Phase 7: Future Enhancements (Post-MVP)

- [ ] Windows support
- [ ] Linux support
- [ ] Voice input (Whisper integration)
- [ ] Region screenshot selection
- [ ] Window screenshot capture
- [ ] Conversation export/import
- [ ] Custom themes
- [ ] Plugin system
- [ ] Auto-updates
- [ ] Analytics (opt-in)

---

## Migration Strategy

### From Python/PyQt6 to Tauri/React

#### What We're Keeping:
1. **Glassmorphism Design**: Entire design system from `ui_styles_v2.py`
2. **Thread Management**: Concept and data structure
3. **Screenshot Integration**: Full-screen capture with auto-analysis
4. **Global Hotkey**: Cmd+Shift+C activation
5. **Overlay Window**: Always-on-top, draggable behavior

#### What We're Improving:
1. **Cross-Platform**: Tauri enables Windows/Linux support
2. **Settings UI**: Replacing hardcoded config with UI panel
3. **Multiple Providers**: Supporting 4 AI providers instead of 1
4. **Data Persistence**: SQLite instead of JSON files
5. **Error Handling**: Comprehensive error recovery
6. **Packaging**: Professional app bundling and distribution

#### Migration Steps:

1. **Port UI Design**
   - Convert Python color constants to CSS variables
   - Recreate glassmorphism effects with Tailwind + backdrop-blur
   - Match spacing, typography, and component styles

2. **Reimplement Core Logic**
   - Chat logic: Python → TypeScript (frontend) + Rust (backend)
   - Screenshot: Python/mss → Rust platform-specific
   - Hotkeys: Python/pynput → Tauri global-shortcut plugin
   - Threads: Python/JSON → Rust/SQLite

3. **Enhance Features**
   - Add provider abstraction layer
   - Implement settings UI
   - Add proper error handling
   - Create onboarding flow

---

## Build & Distribution

### Development

```bash
# Install dependencies
bun install

# Run dev server
bun run tauri dev

# Run tests
bun test                  # Frontend tests
cargo test --manifest-path src-tauri/Cargo.toml  # Backend tests
```

### Production Build

```bash
# Build for macOS
bun run tauri build

# Output: src-tauri/target/release/bundle/
# - dmg: Seeva AI Assistant.dmg
# - app: Seeva AI Assistant.app
```

### Code Signing (macOS)

```bash
# Sign with Apple Developer certificate
codesign --deep --force --verify --verbose \
  --sign "Developer ID Application: Your Name (TEAM_ID)" \
  "Seeva AI Assistant.app"

# Notarize with Apple
xcrun notarytool submit "Seeva AI Assistant.dmg" \
  --apple-id "your@email.com" \
  --password "app-specific-password" \
  --team-id "TEAM_ID"
```

---

## Performance Considerations

### Frontend Optimization
- **Virtual scrolling**: For long message lists (react-window)
- **Lazy loading**: Code split routes and heavy components
- **Memoization**: React.memo for expensive renders
- **Debouncing**: Input handlers and API calls

### Backend Optimization
- **Connection pooling**: Reuse HTTP clients for AI APIs
- **Async operations**: Non-blocking Rust async/await
- **Database indexing**: SQLite indexes on frequently queried columns
- **Image compression**: Optimize screenshots before sending to AI

### Memory Management
- **Message limit**: Keep last N messages in memory
- **Image cleanup**: Delete temp files after sending
- **Database cleanup**: Archive old threads
- **Store cleanup**: Periodic settings compaction

---

## Security Considerations

### API Key Storage
- Encrypted with platform keychain integration
- Never logged or transmitted in plaintext
- Isolated storage per provider

### Permissions
- Request only necessary permissions
- Explain permission purpose in UI
- Graceful degradation if denied

### Network Security
- HTTPS only for API calls
- Certificate validation
- No telemetry without opt-in
- Local-first data storage

---

## Testing Strategy

### Unit Tests
- **Rust**: Test AI provider implementations, managers, utilities
- **TypeScript**: Test stores, hooks, utilities

### Integration Tests
- Tauri command invocations
- Database operations
- Provider API mocking

### E2E Tests
- Full user flows (send message, screenshot, settings)
- Cross-platform behavior
- Error scenarios

### Manual Testing Checklist
- [ ] Chat message send/receive
- [ ] Screenshot capture and attachment
- [ ] Thread creation/switching/deletion
- [ ] Settings save/load
- [ ] Hotkey activation
- [ ] Provider switching
- [ ] Error handling
- [ ] Window dragging/resizing
- [ ] Theme changes

---

## Documentation

### User Documentation
- README.md: Project overview, installation
- QUICKSTART.md: 5-minute getting started
- USER_GUIDE.md: Comprehensive feature documentation
- FAQ.md: Common questions and troubleshooting

### Developer Documentation
- CONTRIBUTING.md: How to contribute
- ARCHITECTURE.md: Technical deep dive
- API.md: Tauri command reference
- CHANGELOG.md: Version history

---

## Success Metrics

### MVP Success Criteria
- ✅ Successfully send/receive messages with all 4 providers
- ✅ Screenshot capture and auto-analysis works
- ✅ Settings UI allows configuration without editing files
- ✅ Threads persist across app restarts
- ✅ Global hotkey activation works reliably
- ✅ macOS app builds and runs without errors

### Post-MVP Goals
- Add 1000+ lines of comprehensive tests
- Achieve <100ms response time for UI interactions
- Support Windows and Linux platforms
- Implement auto-update mechanism
- Reach 90%+ feature parity with original prototype

---

## Resources & References

### Original Codebase
- Python implementation: `/Users/harsh/Developer/agentset/claude-overlay/app.py`
- Design system: `/Users/harsh/Developer/agentset/claude-overlay/ui_styles_v2.py`
- Thread management: `/Users/harsh/Developer/agentset/claude-overlay/chat_thread.py`

### Reference Implementation
- Handy (Tauri + React): `/Users/harsh/Developer/agentset/claude-overlay/it-no-check/Handy`

### Documentation
- Tauri Docs: https://tauri.app/
- React Docs: https://react.dev/
- Anthropic API: https://docs.anthropic.com/
- OpenAI API: https://platform.openai.com/docs/
- Google AI: https://ai.google.dev/
- Ollama API: https://github.com/ollama/ollama/blob/main/docs/api.md

---

## Open Questions & Decisions

### Resolved
- ✅ Technology stack: Tauri + React (chosen over Electron or PyQt6)
- ✅ Initial platform: macOS only (Windows/Linux later)
- ✅ AI providers: All 4 (Claude, OpenAI, Gemini, Ollama)
- ✅ MVP features: Chat + screenshots + settings UI

### To Be Decided
- [ ] Voice input implementation approach (Whisper local vs API?)
- [ ] Region screenshot selection UI/UX
- [ ] Plugin system architecture
- [ ] Analytics provider (if opt-in analytics added)
- [ ] Update delivery mechanism (GitHub Releases, custom server?)
- [ ] Pricing/monetization strategy (if commercial)

---

## Contact & Support

**Project**: Seeva AI Assistant
**Repository**: TBD
**License**: TBD
**Maintainer**: TBD

---

*This plan is a living document and will be updated as the project evolves.*

**Last Updated**: November 10, 2025
**Version**: 1.0.0
**Status**: Active Development
