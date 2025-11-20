# Seeva

AI assistant that appears anywhere, sees your screen.

![Version](https://img.shields.io/badge/version-0.1.7-blue.svg)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey.svg)

discord username  - thisisharsh7


## What It Does

Seeva is a universal AI assistant that appears instantly with a single keystroke, no matter what you are doing on your computer. Press a hotkey, click "Watch Screen", and get AI help with what you are looking at without breaking your flow.

The problem it solves: When you need AI help today, you have to stop what you are doing, open a browser or app, navigate to ChatGPT or Claude, describe what you are looking at, wait for a response, then switch back to your work. This context switching takes 10-15 seconds per interaction and breaks your flow state dozens of times a day.

Seeva works differently. Press the hotkey from anywhere, the floating window appears, click "Watch Screen", and it captures your screen and analyzes it with AI vision. Ask questions about what you are seeing and get instant answers without leaving your work.

## Why I Built This

I was switching to AI tools 50+ times per day while coding. The constant context switching was destroying my productivity. One weekend I built a simple hotkey that opened an AI chat window. Then I thought, what if the AI could just see my screen automatically? Built the first version and started using it myself immediately. Could not go back to the old way. Showed it to some developer friends and they all wanted it. That is when I knew this needed to be a real product.

## Key Features

- **Instant Access**: Press Ctrl+Shift+Space from anywhere to show or hide the window
- **Screen Vision**: Click "Watch Screen" and AI sees your screen automatically
- **Works Everywhere**: Use it in any application, not just code editors or browsers
- **Multi-Thread Conversations**: Organize different topics into separate conversation threads
- **Multiple AI Providers**: Support for Anthropic Claude, OpenAI GPT, OpenRouter (100+ models)
- **Always On Top**: Floating window that never gets lost behind other apps
- **Local Storage**: All conversations and settings stored on your device using SQLite
- **Privacy First**: Your data stays on your machine except when calling your chosen AI provider
- **Fast and Lightweight**: Built with Tauri for optimal performance

## Installation

### Download Pre-built App

Download the latest version (v0.1.7) for your platform from the [Releases](https://github.com/thisisharsh7/seeva-ai-assistant/releases) page:

#### macOS
- **Apple Silicon (M1/M2/M3/M4)**: Download the `darwin_aarch64.app.tar.gz` file
- **Intel**: Download the `darwin_x64.app.tar.gz` file
- **First launch**: Right-click the app and select "Open". If you see an "app is damaged" error, run: `xattr -cr "/Applications/Seeva AI Assistant.app"`

#### Windows
- **EXE Installer**: Download the `x64-setup_windows.exe` file
- **MSI Installer**: Download the `x64_en-US_windows.msi` file
- **Requirements**: Windows 10 (64-bit) or later

#### Linux
- **Debian/Ubuntu**: Download the `.deb` file
- **Fedora/RHEL**: Download the `.rpm` file
- **Universal**: Download the `.AppImage` file (works on any distro)
- **Requirements**: Ubuntu 20.04+ / Fedora 34+ or equivalent

### Auto-Updates

Starting from v0.1.4, Seeva AI Assistant includes automatic update checking. When a new version is available:
1. Open Settings (click the gear icon)
2. Click "Update available" in the footer
3. The update will download and install automatically
4. The app will relaunch with the new version

All updates are cryptographically signed to ensure security and authenticity.

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/thisisharsh7/seeva-ai-assistant.git
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

### Building Releases

To create a signed release (requires setup of signing keys):

1. Generate signing keys:
   ```bash
   bun run tauri signer generate -w .tauri/seeva.key
   ```

2. Add the public key to `src-tauri/tauri.conf.json` under `plugins.updater.pubkey`

3. Set up GitHub secrets for code signing (see `.github/workflows/release.yml`)

4. Create a release by running the GitHub Actions workflow manually

## Quick Start

1. Launch the app and go to Settings
2. Choose your AI provider and add your API key:
   - **Anthropic Claude**: Get your API key from [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
   - **OpenAI GPT**: Get your API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - **OpenRouter**: Get your API key from [openrouter.ai/keys](https://openrouter.ai/keys) (gives access to 100+ models from multiple providers)
3. Grant screen capture permissions when prompted
4. Press `Ctrl+Shift+Space` to toggle the window from anywhere
5. Click "Watch Screen" to capture and analyze your screen
6. Ask questions about what you are seeing
7. Press the hotkey again to hide the window and return to work

### Choosing a Provider

- **Anthropic (Claude)**: Best for general use. Latest models: Claude 4.5 Sonnet, Claude 4.1 Opus, Claude 4.5 Haiku
- **OpenAI (GPT)**: Great for ChatGPT-style interactions. Models: GPT-4o, GPT-4 Turbo, GPT-3.5
- **OpenRouter**: Access 100+ models including Claude, GPT, Gemini, Llama, DeepSeek, and more with a single API key. Perfect for experimentation and trying different models

## Tech Stack

**Frontend**: React 19, TypeScript, Tailwind CSS, Zustand
**Backend**: Tauri 2.9, Rust, SQLite, reqwest
**Platforms**: macOS (10.15+), Windows (10+), Linux (Ubuntu 20.04+, Fedora 34+)

## Development

### Project Structure

```
src/          - React frontend
src-tauri/    - Rust backend
```

## Keyboard Shortcuts

- `Ctrl+Shift+Space` - Toggle window visibility from anywhere (customizable)
- `Cmd+N` (macOS) / `Ctrl+N` (Windows/Linux) - Create new conversation thread
- `Ctrl+Enter` - Send message
- `Escape` - Hide window

## Data Storage

Seeva stores all data locally on your computer. No cloud services or external servers are used for storing your conversations.

### What Gets Stored

**Database (SQLite)**
- Location:
  - macOS/Linux: `~/.config/ai.seeva.assistant/seeva.db`
  - Windows: `%APPDATA%\ai.seeva.assistant\seeva.db`
- Contents:
  - All conversation threads and messages
  - Screen captures when you use "Watch Screen"
  - Message metadata including timestamps and token usage

**Settings File (JSON)**
- Location:
  - macOS/Linux: `~/.config/ai.seeva.assistant/settings.json`
  - Windows: `%APPDATA%\ai.seeva.assistant\settings.json`
- Contents:
  - API keys for AI providers (Anthropic, OpenAI, OpenRouter)
  - Default provider and model settings
  - UI preferences including theme
  - Keyboard shortcut configuration

### Privacy Notes

- Your conversations and screen captures are only sent to the AI provider you select (Anthropic, OpenAI, OpenRouter, etc.)
- API keys are stored in plain text in the settings file. Ensure your system has appropriate file permissions
- No analytics or telemetry data is collected by Seeva itself
- Screen captures are stored as base64-encoded JPEG images in the database
- You can delete individual messages, entire threads, or clear all data by removing the database file
- Screen Recording permission is required for the "Watch Screen" feature to function
- Each provider has their own data retention policies - check their documentation for details

## License

TBD

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
