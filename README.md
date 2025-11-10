# Seeva AI Assistant

A cross-platform desktop application providing a system-wide floating chat interface for multiple AI providers with advanced screenshot capabilities.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)

## Features

- 🤖 **Multiple AI Providers**: Support for Anthropic Claude, OpenAI GPT, Google Gemini, and Ollama (local models)
- 📸 **Screenshot Integration**: Capture and analyze screenshots with AI vision capabilities
- 💬 **Multi-Thread Conversations**: Organize your chats into separate threads
- 🎨 **Glassmorphism UI**: Beautiful, modern design with transparency and blur effects
- ⌨️ **Global Hotkeys**: Quick access from anywhere on your system
- 💾 **Persistent History**: All conversations saved locally with SQLite
- 🔒 **Privacy-First**: Local data storage, encrypted API keys
- ⚡ **Fast & Lightweight**: Built with Tauri for optimal performance

## Installation

### Prerequisites

- **macOS**: 10.13 (High Sierra) or later
- **Bun**: Latest version (or Node.js 18+)
- **Rust**: Latest stable version
- **API Keys**: At least one AI provider API key

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/seeva-ai-assistant.git
   cd seeva-ai-assistant
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Run in development mode**
   ```bash
   bun run tauri dev
   ```

4. **Build for production**
   ```bash
   bun run tauri build
   ```

## Quick Start

1. Launch the app and go to Settings
2. Add your API key under AI Providers
3. Grant macOS permissions (Screen Recording, Accessibility)
4. Press `Cmd+Shift+C` to toggle the window
5. Press `Cmd+Shift+S` to capture a screenshot
6. Start chatting!

## Documentation

- [plan.md](./plan.md) - Development plan and architecture
- [tracking.md](./tracking.md) - Progress tracking

## Tech Stack

**Frontend**: React 19, TypeScript, Tailwind CSS, Zustand
**Backend**: Tauri 2.9, Rust, SQLite, reqwest

## Development

See [plan.md](./plan.md) for the complete development roadmap and architecture details.

### Project Structure

```
src/          - React frontend
src-tauri/    - Rust backend
plan.md       - Architecture and roadmap
tracking.md   - Task tracking
```

## Keyboard Shortcuts

- `Cmd+Shift+C` - Toggle window
- `Cmd+Shift+S` - Capture screenshot
- `Cmd+N` - New thread
- `Ctrl+Enter` - Send message
- `Escape` - Close window

## License

TBD

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
