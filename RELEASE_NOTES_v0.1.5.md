## What's Changed

**Test release for auto-update functionality.** This release adds version display in Settings footer, making it easy to verify which version you're running. This is primarily a test release to verify that auto-updates from v0.1.4 work correctly.

### New Features
- Added version number display in Settings footer (shows "v0.1.5")
- Easy visual confirmation of successful updates

**Auto-update test:** Users on v0.1.4 should see "Update available" in Settings and be able to one-click update to v0.1.5. After update, Settings footer will show "v0.1.5" confirming the update worked.

## Download

### macOS
- **Apple Silicon (M1/M2/M3/M4):** [Seeva.AI.Assistant_aarch64.app.tar.gz](https://github.com/thisisharsh7/seeva-ai-assistant/releases/download/v0.1.5/Seeva.AI.Assistant_aarch64.app.tar.gz)
- **Intel:** [Seeva.AI.Assistant_x64.app.tar.gz](https://github.com/thisisharsh7/seeva-ai-assistant/releases/download/v0.1.5/Seeva.AI.Assistant_x64.app.tar.gz)

**First launch:** Right-click → Open. If "app is damaged" error appears, run:
```bash
xattr -d com.apple.quarantine "/path/to/Seeva AI Assistant.app"

# Example if in Downloads:
xattr -d com.apple.quarantine "~/Downloads/Seeva AI Assistant.app"

# Example if in Applications:
xattr -d com.apple.quarantine "/Applications/Seeva AI Assistant.app"
```

### Windows
- **EXE Installer:** [Seeva.AI.Assistant_0.1.5_x64-setup.exe](https://github.com/thisisharsh7/seeva-ai-assistant/releases/download/v0.1.5/Seeva.AI.Assistant_0.1.5_x64-setup.exe)
- **MSI Installer:** [Seeva.AI.Assistant_0.1.5_x64_en-US.msi](https://github.com/thisisharsh7/seeva-ai-assistant/releases/download/v0.1.5/Seeva.AI.Assistant_0.1.5_x64_en-US.msi)

### Linux
- **Debian/Ubuntu:** [Seeva.AI.Assistant_0.1.5_amd64.deb](https://github.com/thisisharsh7/seeva-ai-assistant/releases/download/v0.1.5/Seeva.AI.Assistant_0.1.5_amd64.deb)
- **Fedora/RHEL:** [Seeva.AI.Assistant-0.1.5-1.x86_64.rpm](https://github.com/thisisharsh7/seeva-ai-assistant/releases/download/v0.1.5/Seeva.AI.Assistant-0.1.5-1.x86_64.rpm)
- **AppImage:** [Seeva.AI.Assistant_0.1.5_amd64.AppImage](https://github.com/thisisharsh7/seeva-ai-assistant/releases/download/v0.1.5/Seeva.AI.Assistant_0.1.5_amd64.AppImage)

## Requirements
- **macOS:** 10.15 (Catalina) or later
- **Windows:** Windows 10 (64-bit) or later
- **Linux:** Ubuntu 20.04+ / Fedora 34+ / Any distro with AppImage support

**Issues?** https://github.com/thisisharsh7/seeva-ai-assistant/issues
