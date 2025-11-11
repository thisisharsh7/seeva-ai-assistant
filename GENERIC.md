# Generic Workflow for Updates & Releases

This document contains the standard commands you'll use every time you make changes and want to publish updates.

## 📦 Standard Development → Release Workflow

### 1. Make Your Changes
Edit your code as needed, then test locally:

```bash
# Run in development mode
bun run tauri dev

# Test the changes work correctly
```

### 2. Update Version Number

Edit `src-tauri/tauri.conf.json` and bump the version:

```json
{
  "version": "0.2.0"  // Change from 0.1.0 to 0.2.0, etc.
}
```

**Version Numbering (Semantic Versioning):**
- **Major** (1.0.0 → 2.0.0): Breaking changes, major rewrites
- **Minor** (0.1.0 → 0.2.0): New features, backwards compatible
- **Patch** (0.1.0 → 0.1.1): Bug fixes, small improvements

### 3. Update CHANGELOG.md

Add your changes to `CHANGELOG.md`:

```markdown
## [0.2.0] - 2025-11-12

### Added
- New feature X
- New feature Y

### Fixed
- Bug fix Z

### Changed
- Improved performance of feature A
```

### 4. Commit Your Changes

```bash
# Add all changes
git add .

# Create a descriptive commit
git commit -m "feat: add new feature X

- Detailed description of changes
- Any breaking changes
- Related issue numbers (#123)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Commit Message Convention:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### 5. Push to GitHub

```bash
# Push to main branch
git push origin main
```

### 6. Create Release via GitHub Actions

**Option A: Via GitHub Web UI** (Recommended)
1. Go to https://github.com/YOUR_USERNAME/seeva-ai-assistant/actions
2. Click "Release" workflow on the left
3. Click "Run workflow" button (top right)
4. Select branch: `main`
5. Click "Run workflow"
6. Wait for builds to complete (~10-15 minutes)
7. Go to Releases page
8. Edit the draft release (add notes if needed)
9. Click "Publish release"

**Option B: Via GitHub CLI** (Advanced)
```bash
# Install GitHub CLI if not already installed
brew install gh

# Trigger release workflow
gh workflow run release.yml

# Check workflow status
gh run list --workflow=release.yml

# View run details
gh run view
```

### 7. Verify Auto-Update Works

After publishing the release:
1. Install the previous version on a test machine
2. Open the app → Settings
3. Check if "Update available" appears
4. Click to install
5. Verify app relaunches with new version

---

## 🔧 Common Commands Reference

### Development
```bash
# Install dependencies
bun install

# Run in development mode
bun run tauri dev

# Build for production (local testing)
bun run tauri build

# Run frontend only (without Tauri)
bun run dev
```

### Git Operations
```bash
# Check status
git status

# View changes
git diff

# Add specific files
git add src/path/to/file.ts

# Add all changes
git add .

# Commit with message
git commit -m "type: description"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# View commit history
git log --oneline

# Create a new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# Merge branch
git merge feature/new-feature
```

### Tauri Specific
```bash
# Generate new signing keys (rarely needed)
bun run tauri signer generate -w .tauri/seeva.key

# Check Tauri info
bun run tauri info

# Clean build artifacts
rm -rf src-tauri/target
rm -rf dist
```

### Cargo (Rust) Operations
```bash
# Check Rust code
cargo check --manifest-path=src-tauri/Cargo.toml

# Run Rust tests
cargo test --manifest-path=src-tauri/Cargo.toml

# Format Rust code
cargo fmt --manifest-path=src-tauri/Cargo.toml

# Lint Rust code
cargo clippy --manifest-path=src-tauri/Cargo.toml
```

---

## 🐛 Troubleshooting

### Build Failed Locally
```bash
# Clean everything and rebuild
rm -rf node_modules
rm -rf src-tauri/target
rm -rf dist
bun install
bun run tauri build
```

### GitHub Actions Failed
1. Go to Actions tab
2. Click on failed workflow
3. Check error logs
4. Fix the issue locally
5. Commit and push fix
6. Re-run the workflow

### Can't Push to GitHub
```bash
# Check remote URL
git remote -v

# Update remote URL if needed
git remote set-url origin https://github.com/YOUR_USERNAME/seeva-ai-assistant.git

# Force push (use carefully!)
git push --force origin main
```

### Updates Not Working
1. Check `tauri.conf.json` has correct public key
2. Verify GitHub release is published (not draft)
3. Check endpoint URL in `tauri.conf.json` points to your repo
4. Ensure release includes `.sig` files

---

## 📝 Quick Release Checklist

Before creating a release, check:

- [ ] Version bumped in `src-tauri/tauri.conf.json`
- [ ] CHANGELOG.md updated with changes
- [ ] All changes committed and pushed to GitHub
- [ ] Local build works (`bun run tauri build`)
- [ ] No sensitive data in commits (API keys, secrets)
- [ ] GitHub secrets are configured (TAURI_SIGNING_PRIVATE_KEY)

Then:

1. Go to GitHub Actions
2. Run "Release" workflow
3. Wait for all builds to complete
4. Review draft release notes
5. Publish release
6. Test auto-update from previous version

---

## 🚀 Pro Tips

**Faster Development:**
- Use `bun run dev` for frontend-only changes (faster reload)
- Use `bun run tauri dev` when changing Rust code
- Keep the dev server running while coding

**Better Commits:**
- Make small, focused commits
- Use descriptive commit messages
- Reference issue numbers (#123)
- Test before committing

**Release Strategy:**
- Batch related changes into releases
- Don't release too frequently (confuses users)
- Use patch versions (0.1.1) for quick fixes
- Use minor versions (0.2.0) for new features
- Always test the release before publishing

**Keep Organized:**
- Update CHANGELOG.md as you go
- Delete old git branches after merging
- Tag important commits for reference
- Backup your `.tauri/seeva.key` file securely

---

## 📞 Need Help?

- **Setup Issues**: See `.tauri/SETUP_NOTES.md`
- **Tauri Docs**: https://v2.tauri.app
- **GitHub Actions**: https://docs.github.com/en/actions
- **Create Issue**: https://github.com/YOUR_USERNAME/seeva-ai-assistant/issues
