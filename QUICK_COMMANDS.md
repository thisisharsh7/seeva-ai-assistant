# Quick Commands - Copy & Paste

## 🎯 First Time Setup (Run Once)

```bash
# Make the script executable and run it
chmod +x FIRST_PUSH.sh && ./FIRST_PUSH.sh
```

**Manual steps after script:**
1. Copy your GitHub repo's signing keys to GitHub Secrets
2. Run your first release via GitHub Actions

---

## 🔄 Every Time You Make Changes

### Quick Update (All-in-One)

```bash
# 1. Update version in tauri.conf.json first, then run:
git add . && \
git commit -m "feat: your change description" && \
git push origin main

# 2. Then go to GitHub → Actions → Release → Run workflow
```

### Step-by-Step (Recommended First Few Times)

```bash
# 1. Test your changes
bun run tauri dev

# 2. Update version in src-tauri/tauri.conf.json manually
# Change "version": "0.1.0" to "0.2.0" (or appropriate)

# 3. Update CHANGELOG.md manually with your changes

# 4. Add all changes
git add .

# 5. Commit with message
git commit -m "feat: describe your changes

- Detailed point 1
- Detailed point 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 6. Push to GitHub
git push origin main

# 7. Create release via GitHub Actions
# Go to: https://github.com/YOUR_USERNAME/seeva-ai-assistant/actions
# Click: Release workflow → Run workflow
```

---

## 📦 Build Locally (Testing Only)

```bash
# Build for local testing (debug mode, no signing)
bun run tauri build --debug

# Find the built app:
# macOS: src-tauri/target/debug/bundle/macos/Seeva AI Assistant.app
# You can run it directly from there
```

---

## 🔧 Fix Common Issues

### Clean Build
```bash
rm -rf node_modules dist src-tauri/target && \
bun install && \
bun run tauri build --debug
```

### Reset Git (Undo Last Commit)
```bash
git reset HEAD~1  # Keeps your changes, undoes commit
```

### Force Push (Use Carefully!)
```bash
git push --force origin main
```

---

## 💡 Super Quick Reference

| Task | Command |
|------|---------|
| Dev mode | `bun run tauri dev` |
| Build | `bun run tauri build` |
| Status | `git status` |
| Add all | `git add .` |
| Commit | `git commit -m "message"` |
| Push | `git push origin main` |
| Pull | `git pull origin main` |

---

## 🎬 Your Typical Workflow

```bash
# 1. Make changes to code
# 2. Test it
bun run tauri dev

# 3. Commit and push
git add .
git commit -m "feat: what you changed"
git push origin main

# 4. Go to GitHub Actions and run Release workflow
# 5. Wait ~10 minutes
# 6. Publish the draft release
# 7. Done! Users can auto-update
```
