# Seeva

AI assistant that appears anywhere, sees your screen.

![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey.svg)

![Seeva Product Demo](public/seeva-product-demo.png)

## The Problem

You need AI help. You stop what you are doing. You open a browser. You navigate to ChatGPT or Claude. You describe what you are looking at. You wait for a response. You copy the answer. You switch back to your work.

Fifteen seconds later, you forgot what you were doing.

This happens 50 times a day. Your flow state is dead.

## The Solution

Press one key. Seeva appears over whatever you are doing. Click "Watch Screen" and it sees your screen. Ask your question. Get your answer. Press the key again. Back to work.

No context switching. No describing what you are looking at. No breaking your flow.

## Why This Exists

I built the first version one weekend because I was tired of switching to ChatGPT 50 times a day while coding. Added screen capture because explaining what I was looking at was tedious. Started using it immediately and could not go back.

Showed it to developer friends. They all wanted it. That is when I knew this needed to exist.

## What It Does

**Press a key, get help**
- Works anywhere - over fullscreen apps, games, browsers, code editors
- Sees your screen when you need it to
- Knows which app you are in (Chrome, VS Code, whatever)
- Organizes conversations into threads

**Works with the AI you want**
- Anthropic Claude (Sonnet, Opus, Haiku)
- OpenAI GPT (GPT-4o, GPT-4 Turbo, GPT-3.5)
- OpenRouter (100+ models in one place)

**Your data stays yours**
- Everything stored on your computer
- No cloud services. No tracking. No telemetry.
- Only talks to the AI provider you choose

## Installation

**Download for your platform**: [Releases](https://github.com/thisisharsh7/seeva-ai-assistant/releases) (v0.1.7)

**macOS**: Download `.app.tar.gz` for your chip (Apple Silicon or Intel). Right-click and select "Open" on first launch.

**Windows**: Download `.exe` or `.msi` installer. Requires Windows 10 or later.

**Linux**: Download `.deb`, `.rpm`, or `.AppImage` depending on your distro.

Updates are automatic. When a new version is available, click "Update available" in Settings.

## Getting Started

**1. Get an API key**

Pick one:
- Anthropic Claude: [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
- OpenAI GPT: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- OpenRouter (100+ models): [openrouter.ai/keys](https://openrouter.ai/keys)

**2. Add it to Seeva**

Open Settings, paste your API key.

**3. Grant screen permissions**

macOS will ask for Screen Recording permission. Grant it so Seeva can capture your screen and detect which app you are in.

**4. Use it**

Press `Ctrl+Shift+Space` anywhere. Click "Watch Screen" if you want the AI to see what you are looking at. Ask your question. Get your answer.

## For Developers

```bash
git clone https://github.com/thisisharsh7/seeva-ai-assistant.git
cd seeva-ai-assistant
bun install
bun run tauri dev
```

Built with Tauri, React, TypeScript, and Rust.

## Keyboard Shortcuts

- `Ctrl+Shift+Space` - Show/hide from anywhere (customizable)
- `Ctrl+N` - New conversation thread
- `Ctrl+Enter` - Send message
- `Escape` - Hide window

## Works Over Fullscreen Apps

Seeva appears over fullscreen applications on macOS, Windows, and Linux. Works with browsers, code editors, and most apps.

**Note**: Some older games using exclusive fullscreen mode may not show overlays. Most modern apps and browsers work fine.

## Privacy

Everything stays on your computer. Conversations, screenshots, settings - all stored locally in SQLite.

Your data only leaves your machine when you send a message to your chosen AI provider (Anthropic, OpenAI, or OpenRouter).

No analytics. No telemetry. No tracking.

**Data location**:
- macOS/Linux: `~/.config/ai.seeva.assistant/`
- Windows: `%APPDATA%\ai.seeva.assistant\`

## What's New (v0.1.7)

- **Context Detection**: Automatically knows which app you're in when you summon Seeva
- **Better Fullscreen Support**: Works over fullscreen apps on macOS (like Raycast or Spotlight)
- **Bug Fixes**: Global shortcut now works reliably when other apps are fullscreen

## Questions or Issues?

Discord: `thisisharsh7`

File bugs or feature requests: [GitHub Issues](https://github.com/thisisharsh7/seeva-ai-assistant/issues)

## License

TBD
