# Seeva AI Assistant v0.2.2

Critical bug fixes and improvements for better stability and user experience.

## 🐛 What's Fixed

### Critical Fixes
- **Auto-Updater Now Works**: Fixed issue where updates downloaded but failed to install
  - Removed app-sandbox restriction that prevented installation
  - Updates now install successfully and restart automatically

- **Screenshot/Context Clearing**: Fixed bug where screenshot persisted after clicking "New Chat"
  - Screenshot and context now properly cleared when starting new conversation

- **Version Display**: Fixed issue where settings showed wrong version number
  - Version now dynamically syncs with actual installed version

### AI Experience
- **Consistent Identity**: AI now identifies as "Seeva AI Assistant" across all providers
  - No more "I am Claude" or "I am ChatGPT" responses
  - Works with Anthropic, OpenAI, OpenRouter, Gemini, and Ollama

### UI Polish
- **Improved App Icon**: Updated icon design following macOS Big Sur guidelines
  - Added rounded corners and proper padding
  - Better visual appearance in Dock and App Switcher

### Better Error Messages
- **Update Feedback**: Enhanced error reporting for auto-updater
  - Shows detailed error messages instead of generic failures
  - Displays "Update installed! Please restart" if auto-restart fails

## 📥 Download

### **macOS**

**DMG Installers (Recommended):**
- **[Download for Apple Silicon (M1/M2/M3/M4)](https://github.com/thisisharsh7/seeva-ai-assistant/releases/download/v0.2.2/Seeva.AI.Assistant_0.2.2_aarch64.dmg)** - ~12 MB
- **[Download for Intel Mac](https://github.com/thisisharsh7/seeva-ai-assistant/releases/download/v0.2.2/Seeva.AI.Assistant_0.2.2_x64.dmg)** - ~12 MB

**Update Packages (for existing users):**
- [Seeva.AI.Assistant_aarch64.app.tar.gz](https://github.com/thisisharsh7/seeva-ai-assistant/releases/download/v0.2.2/Seeva.AI.Assistant_aarch64.app.tar.gz) - Apple Silicon
- [Seeva.AI.Assistant_x64.app.tar.gz](https://github.com/thisisharsh7/seeva-ai-assistant/releases/download/v0.2.2/Seeva.AI.Assistant_x64.app.tar.gz) - Intel

**First launch**: The app is properly signed and notarized. If you see security warnings:
```bash
xattr -d com.apple.quarantine "/Applications/Seeva AI Assistant.app"
```

---

### **Windows**

- **[Download EXE Installer](https://github.com/thisisharsh7/seeva-ai-assistant/releases/download/v0.2.2/Seeva.AI.Assistant_0.2.2_x64-setup.exe)** - ~9 MB (Recommended)
- **[Download MSI Installer](https://github.com/thisisharsh7/seeva-ai-assistant/releases/download/v0.2.2/Seeva.AI.Assistant_0.2.2_x64_en-US.msi)** - ~11 MB

---

### **Linux**

- **[Download DEB Package](https://github.com/thisisharsh7/seeva-ai-assistant/releases/download/v0.2.2/Seeva.AI.Assistant_0.2.2_amd64.deb)** - ~15 MB (Debian/Ubuntu)
- **[Download RPM Package](https://github.com/thisisharsh7/seeva-ai-assistant/releases/download/v0.2.2/Seeva.AI.Assistant-0.2.2-1.x86_64.rpm)** - ~15 MB (Fedora/RHEL)
- **[Download AppImage](https://github.com/thisisharsh7/seeva-ai-assistant/releases/download/v0.2.2/Seeva.AI.Assistant_0.2.2_amd64.AppImage)** - ~84 MB (Universal)

## 🔧 Requirements

- **macOS**: 10.13 (High Sierra) or later
- **Windows**: Windows 10 (64-bit) or later
- **Linux**: Ubuntu 20.04+ / Fedora 34+ / Any distro with AppImage support

## ⚠️ Important Notes

- **Auto-updater is now fixed!** Future updates will install automatically
- All AI providers now consistently identify as Seeva AI Assistant
- If you're on v0.2.1 or earlier, the auto-updater should work to install this version

## 🐛 Issues?

Report bugs or request features: https://github.com/thisisharsh7/seeva-ai-assistant/issues

**Full Changelog**: https://github.com/thisisharsh7/seeva-ai-assistant/compare/v0.2.1...v0.2.2
