# Seeva

AI that appears anywhere. Sees your screen.

![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey.svg)

![Seeva Product Demo](public/seeva-product-demo.png)

---

## The Problem

Let me tell you what happens fifty times a day.

You're deep in your work. You hit a problem. You need AI help.

So you stop what you're doing. You open a browser. You navigate to ChatGPT or Claude. You try to describe what you're looking at. You wait. You copy the answer. You switch back to your work.

Fifteen seconds later, you've forgotten what you were doing.

Your flow state is dead.

This happens *fifty times a day*. And every time, you're breaking your concentration. You're context switching. You're losing precious mental energy just trying to explain what's on your screen.

We thought: there has to be a better way.

## So We Built Seeva

Press one key. Seeva appears over whatever you're doing. Click "Watch Screen" and it sees exactly what you see. Ask your question. Get your answer. Press the key again. Back to work.

No browser tabs. No context switching. No describing what you're looking at. No breaking your flow.

## How It Works

**It appears anywhere**
Works over fullscreen apps, games, browsers, code editors. It just appears. Like Spotlight or Raycast, but for AI conversations.

**It sees your screen when you need it to**
One click, and it captures what you're looking at. No more typing out descriptions. No more "here's what I'm seeing..." It already knows.

**It knows your context**
Seeva automatically detects which app you're in. Chrome, VS Code, whatever. That context helps it give you better answers.

**It organizes your conversations**
Every conversation is saved in threads. So you can come back to them. Reference them. Build on them.

## The AI You Want

We didn't lock you into one AI provider. That would be like building a computer that only runs one program.

**Choose your AI:**
- Anthropic Claude
- OpenAI GPT 
- OpenRouter

Switch between them anytime. Use the one that's best for what you're doing right now.

## Your Data Stays Yours

Everything lives on your computer. Conversations. Screenshots. Settings. All stored locally in SQLite.

Your data only leaves your machine when you send a message to your chosen AI provider. That's it.

No cloud services. No tracking. No telemetry. No analytics.

We didn't build this to collect your data. We built it to help you work better.

**Where your data lives:**
- macOS/Linux: `~/.config/ai.seeva.assistant/`
- Windows: `%APPDATA%\ai.seeva.assistant\`

## Getting Started

**Step 1: Download Seeva**

[Download from Releases](https://github.com/thisisharsh7/seeva-ai-assistant/releases) (v0.2.0)

- **macOS**: Download `.app.tar.gz` for your chip (Apple Silicon or Intel). Right-click and "Open" on first launch.
- **Windows**: Download `.exe` or `.msi` installer. Requires Windows 10 or later.
- **Linux**: Download `.deb`, `.rpm`, or `.AppImage` for your distro.

Updates happen automatically. When there's a new version, you'll see "Update available" in Settings.

**Step 2: Get an API key**

Pick one:
- Anthropic Claude: [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
- OpenAI GPT: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- OpenRouter: [openrouter.ai/keys](https://openrouter.ai/keys)

**Step 3: Add it to Seeva**

Open Settings. Paste your API key. Done.

**Step 4: Grant permissions**

On macOS, you'll need to grant Screen Recording permission. This lets Seeva capture your screen and detect which app you're in. Without it, the "Watch Screen" feature won't work.

**Step 5: Use it**

Press `Ctrl+Shift+Space` anywhere. Click "Watch Screen" if you want the AI to see what you're looking at. Ask your question. Get your answer.

That's it.

## What's Different About This Release (v0.2.0)

I showed Seeva to some friends. They loved it. They wanted to use it. But macOS kept showing "unidentified developer" warnings. That's not how this should work.

So we focused on getting this right:

**Proper Code Signing & Notarization**
Seeva is now fully signed and notarized for macOS. No more security warnings. It just works.

**Secure Auto-Updates**
Update packages are cryptographically signed. Your computer verifies them before installing. The way it should be.

**Better Distribution**
We've solved the distribution challenges. You can download it, open it, and start using it. No fighting with your operating system.

**Context Detection**
Seeva automatically knows which app you're in when you summon it. This helps it understand your context better.

**Fullscreen Support**
Works over fullscreen apps on macOS, Windows, and Linux. Like Raycast or Spotlight. Just appears when you need it.

## Keyboard Shortcuts

- `Ctrl+Shift+Space` - Show/hide Seeva (customizable)
- `Ctrl+N` - New conversation thread
- `Ctrl+Enter` - Send message
- `Escape` - Hide window

## A Note on Fullscreen Apps

Seeva works over fullscreen applications on macOS, Windows, and Linux. Modern apps and browsers work great.

Some older games using exclusive fullscreen mode might not show overlays. That's a limitation of how those games interact with the operating system, not Seeva.

## For Developers

If you want to build from source or contribute:

```bash
git clone https://github.com/thisisharsh7/seeva-ai-assistant.git
cd seeva-ai-assistant
bun install
bun run tauri dev
```

Built with Tauri, React, TypeScript, and Rust. The same technologies we use to make it fast, secure, and native-feeling on every platform.

## Why We Built This

I built the first version because I was tired of switching to ChatGPT fifty times a day while coding. Tired of explaining what I was looking at. Tired of breaking my flow state.

So I built something that appears when I need it, sees what I'm looking at, and gets out of my way. Started using it immediately. Could not go back.

Showed it to developer friends. They all wanted it. That's when I knew this needed to exist.

We've been refining it. Making it better. Making it something you can actually use every day. Making it something that respects your data, your privacy, your workflow.

This is Seeva. We think once you use it, you won't want to go back either.

## Questions or Issues?

Discord: `thisisharsh7`

File bugs or feature requests: [GitHub Issues](https://github.com/thisisharsh7/seeva-ai-assistant/issues)

## License

TBD
