# Auto-Update & Distribution Setup Notes

## ✅ What's Been Configured

### 1. Auto-Update Infrastructure
- **Tauri Updater Plugin**: Added to both Rust (`Cargo.toml`) and frontend (`package.json`)
- **Configuration**: Updated `tauri.conf.json` with:
  - `createUpdaterArtifacts: true` - generates `.sig` files for update verification
  - macOS hardened runtime and entitlements
  - Updater plugin configuration (needs public key - see below)
- **Entitlements.plist**: Created with necessary macOS permissions

### 2. GitHub Actions Workflows
- **build.yml**: Reusable workflow for multi-platform builds
  - Supports macOS (Intel + Apple Silicon), Linux (Ubuntu 22.04/24.04), Windows
  - Handles code signing when secrets are configured
  - Creates DMG, .deb, .rpm, AppImage, MSI, NSIS installers
- **release.yml**: Main release workflow
  - Manually triggered via GitHub Actions UI
  - Creates draft release first
  - Builds for all platforms in parallel
  - Uploads artifacts to GitHub Releases

### 3. Frontend Update UI
- **UpdateChecker Component**: Created and integrated into Settings modal
  - Auto-checks for updates on app launch
  - Manual check button
  - Download progress indicator
  - Auto-relaunch after installation

### 4. Documentation
- **CHANGELOG.md**: Created with initial version history
- **README.md**: Updated with installation instructions and auto-update info

## ⚠️ Required Manual Steps

### 1. Generate Signing Keys (REQUIRED FOR UPDATES)

Run this command **interactively** (it will prompt for a password):
```bash
bun run tauri signer generate -w .tauri/seeva.key
```

This will output:
- Private key saved to `.tauri/seeva.key` (keep this SECRET!)
- Public key printed to console (copy this)

**Then update `src-tauri/tauri.conf.json`:**
Replace `PLACEHOLDER_PUBLIC_KEY_REPLACE_AFTER_RUNNING_TAURI_SIGNER_GENERATE` with your actual public key.

### 2. Set Up GitHub Repository Secrets

For signed releases and auto-updates, add these secrets in your GitHub repo settings:

**Required for all platforms:**
- `TAURI_SIGNING_PRIVATE_KEY` - Contents of `.tauri/seeva.key`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` - Password you set when generating the key

**For macOS code signing (optional but recommended):**
- `APPLE_CERTIFICATE` - Base64 encoded .p12 certificate
- `APPLE_CERTIFICATE_PASSWORD` - Certificate password
- `APPLE_ID` - Apple Developer email
- `APPLE_PASSWORD` - App-specific password
- `APPLE_TEAM_ID` - Team ID from Apple Developer
- `KEYCHAIN_PASSWORD` - Random secure password for CI keychain

**For Windows code signing (optional):**
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `AZURE_TENANT_ID`

### 3. Update GitHub Repository URLs

Replace `YOUR_USERNAME` in these files with your actual GitHub username:
- `src-tauri/tauri.conf.json` - Line 72: Update the updater endpoint URL
- `README.md` - Lines 36, 59: Update repository URLs

### 4. Create Your First Release

1. Ensure signing keys are generated and configured (steps 1-3 above)
2. Go to your GitHub repository
3. Click "Actions" tab
4. Click "Release" workflow
5. Click "Run workflow" button
6. Select branch (usually `main`)
7. Click "Run workflow"

This will:
- Read version from `src-tauri/tauri.conf.json` (currently 0.1.0)
- Create a draft release with tag `v0.1.0`
- Build for all platforms in parallel
- Upload installers and update artifacts to the release
- You can then edit the release notes and publish it

## 📝 How It Works

### For End Users:
1. User downloads and installs the app from GitHub Releases
2. App checks for updates on launch (via UpdateChecker component)
3. When a new release is published, "Update available" appears in Settings
4. User clicks to download and install
5. App verifies the update signature using the public key
6. App downloads, installs, and relaunches

### For Developers:
1. Update version in `src-tauri/tauri.conf.json`
2. Update `CHANGELOG.md` with changes
3. Commit and push to GitHub
4. Run the "Release" workflow manually
5. GitHub Actions builds for all platforms
6. Review the draft release, edit notes if needed
7. Publish the release
8. Tauri automatically creates `latest.json` file
9. Users' apps will detect the new version

## 🔒 Security Notes

- The private signing key (`.tauri/seeva.key`) is in `.gitignore` - NEVER commit it
- Store it securely (password manager, encrypted backup)
- Public key is safe to commit (it's in `tauri.conf.json`)
- Update signatures ensure users only install legitimate updates
- Without the private key, nobody can create valid updates for your app

## 🐛 Troubleshooting

**Updates not working?**
- Check that public key in `tauri.conf.json` matches the private key
- Verify GitHub endpoint URL is correct
- Ensure release is published (not draft)

**Build failing on macOS?**
- For local builds without signing, the `.app` bundle still works
- DMG creation requires either: proper signing, CI environment, or manual creation

**Can't generate signing keys?**
- Must run `tauri signer generate` interactively (it needs password input)
- Can't use `Bash` tool for this - run directly in your terminal

## 📚 References

- [Tauri Updater Documentation](https://v2.tauri.app/plugin/updater/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)
