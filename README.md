# Seeva

AI assistant that appears anywhere, sees your screen.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)

discord username  - thisisharsh7


## What It Does

Seeva is a universal AI assistant that appears instantly with a single keystroke, no matter what you are doing on your computer. Press a hotkey, click "Watch Screen", and get AI help with what you are looking at without breaking your flow.

The problem it solves: When you need AI help today, you have to stop what you are doing, open a browser or app, navigate to ChatGPT or Claude, describe what you are looking at, wait for a response, then switch back to your work. This context switching takes 10-15 seconds per interaction and breaks your flow state dozens of times a day.

Seeva works differently. Press the hotkey from anywhere, the floating window appears, click "Watch Screen", and it captures your screen and analyzes it with Claude's vision API. Ask questions about what you are seeing and get instant answers without leaving your work.

## Why I Built This

I was switching to AI tools 50+ times per day while coding. The constant context switching was destroying my productivity. One weekend I built a simple hotkey that opened an AI chat window. Then I thought, what if the AI could just see my screen automatically? Built the first version and started using it myself immediately. Could not go back to the old way. Showed it to some developer friends and they all wanted it. That is when I knew this needed to be a real product.

## Key Features

- **Instant Access**: Press Cmd+Shift+C from anywhere to show or hide the window
- **Screen Vision**: Click "Watch Screen" and AI sees your screen automatically using Claude's vision API
- **Works Everywhere**: Use it in any application, not just code editors or browsers
- **Multi-Thread Conversations**: Organize different topics into separate conversation threads
- **Multiple AI Providers**: Support for Anthropic Claude, OpenAI GPT, Google Gemini, and Ollama local models
- **Always On Top**: Floating window that never gets lost behind other apps
- **Local Storage**: All conversations and settings stored on your device using SQLite
- **Privacy First**: Your data stays on your machine except when calling your chosen AI provider
- **Fast and Lightweight**: Built with Tauri for optimal performance

## Installation

### Download Pre-built App

Download the latest version for your platform from the [Releases](https://github.com/thisisharsh7/seeva-ai-assistant/releases) page:

- **macOS**: Download the `.dmg` file
  - Apple Silicon (M1/M2/M3): `seeva-ai-assistant_aarch64.dmg`
  - Intel: `seeva-ai-assistant_x64.dmg`
- **Linux**:
  - Debian/Ubuntu: `.deb` file
  - Fedora/RHEL: `.rpm` file
  - Universal: `.AppImage` file
- **Windows**: Download the `.msi` or `.exe` installer

### Auto-Updates

Seeva AI Assistant includes automatic update checking. When a new version is available:
1. Open Settings (click the gear icon)
2. Click "Update available" in the footer
3. The update will download and install automatically
4. The app will relaunch with the new version

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
2. Add your Anthropic API key under AI Providers
3. Grant macOS permissions when prompted (Screen Recording and Accessibility are required for screen capture)
4. Press `Cmd+Shift+C` to toggle the window from anywhere
5. Click "Watch Screen" to capture and analyze your screen
6. Ask questions about what you are seeing
7. Press `Cmd+Shift+C` again to hide the window and return to work

## Tech Stack

**Frontend**: React 19, TypeScript, Tailwind CSS, Zustand
**Backend**: Tauri 2.9, Rust, SQLite, reqwest

## Development

### Project Structure

```
src/          - React frontend
src-tauri/    - Rust backend
```

## Keyboard Shortcuts

- `Cmd+Shift+C` - Toggle window visibility from anywhere
- `Cmd+N` - Create new conversation thread
- `Ctrl+Enter` - Send message
- `Escape` - Hide window

## Data Storage

Seeva stores all data locally on your computer. No cloud services or external servers are used for storing your conversations.

### What Gets Stored

**Database (SQLite)**
- Location: `~/.config/ai.seeva.assistant/seeva.db`
- Contents:
  - All conversation threads and messages
  - Screen captures when you use "Watch Screen"
  - Message metadata including timestamps and token usage

**Settings File (JSON)**
- Location: `~/.config/ai.seeva.assistant/settings.json`
- Contents:
  - API keys for AI providers
  - Default provider and model settings
  - UI preferences including theme
  - Keyboard shortcut configuration

### Privacy Notes

- Your conversations and screen captures are only sent to the AI provider you select (Anthropic, OpenAI, etc.)
- API keys are stored in plain text in the settings file. Ensure your system has appropriate file permissions
- No analytics or telemetry data is collected
- Screen captures are stored as base64-encoded JPEG images in the database
- You can delete individual messages, entire threads, or clear all data by removing the database file
- Screen Recording permission is required for the "Watch Screen" feature to function

## License

TBD

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
