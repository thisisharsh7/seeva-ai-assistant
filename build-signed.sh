#!/bin/bash

# Seeva AI Assistant - Signed and Notarized Build Script
# This script builds your app with proper code signing and notarization for macOS

set -e  # Exit on error

echo "🔐 Setting up signing credentials..."

# Apple Developer credentials for code signing and notarization
export APPLE_SIGNING_IDENTITY="Developer ID Application: Harsh Kumar (M949N3D3HT)"
export APPLE_ID="thisisharsh7@icloud.com"
export APPLE_PASSWORD="ozob-idaw-ozsl-pvai"  # App-specific password
export APPLE_TEAM_ID="M949N3D3HT"

# Tauri updater signing (for auto-updates)
export TAURI_SIGNING_PRIVATE_KEY=$(cat ~/.tauri/seeva.key)
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD=""  # No password set

echo "✅ Credentials configured"
echo ""
echo "🔨 Building Seeva AI Assistant..."
echo "   - Code signing: ✓"
echo "   - Notarization: ✓"
echo "   - Update signing: ✓"
echo ""

# Build the app
bun run tauri build

echo ""
echo "✨ Build complete!"
echo ""
echo "📦 Your signed and notarized app is ready at:"
echo "   src-tauri/target/release/bundle/macos/Seeva AI Assistant.app"
echo ""
echo "💿 DMG installer:"
echo "   src-tauri/target/release/bundle/dmg/Seeva AI Assistant_*.dmg"
echo ""
echo "🔄 Update package (for GitHub releases):"
echo "   src-tauri/target/release/bundle/macos/Seeva AI Assistant.app.tar.gz"
