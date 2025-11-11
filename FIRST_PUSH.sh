#!/bin/bash
# First-time GitHub setup and push commands for Seeva AI Assistant

set -e  # Exit on any error

echo "🚀 Setting up repository for first push..."
echo ""

# 1. Generate signing keys (interactive - will prompt for password)
echo "📝 Step 1: Generate signing keys"
echo "⚠️  You will be prompted to enter a password (remember this!)"
read -p "Press Enter to continue..."
bun run tauri signer generate -w .tauri/seeva.key

echo ""
echo "✅ Keys generated!"
echo "📋 IMPORTANT: Copy the public key shown above"
echo ""
read -p "Have you copied the public key? Press Enter to continue..."

# 2. Open tauri.conf.json for manual edit
echo ""
echo "📝 Step 2: Update tauri.conf.json"
echo "Opening tauri.conf.json - Replace PLACEHOLDER_PUBLIC_KEY... with your public key"
echo "Press Ctrl+C when done editing, then run this script again"
open -t src-tauri/tauri.conf.json
read -p "Press Enter after you've updated the public key..."

# 3. Update GitHub URLs
echo ""
echo "📝 Step 3: Enter your GitHub username"
read -p "GitHub username: " GITHUB_USER

echo "Updating repository URLs..."
# Update tauri.conf.json
sed -i '' "s|YOUR_USERNAME|$GITHUB_USER|g" src-tauri/tauri.conf.json
# Update README.md
sed -i '' "s|YOUR_USERNAME|$GITHUB_USER|g" README.md

echo "✅ URLs updated!"

# 4. Git setup
echo ""
echo "📝 Step 4: Git setup"

# Check if git is initialized
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
fi

# Add all files
echo "Adding files to git..."
git add .

# Create commit
echo "Creating commit..."
git commit -m "feat: initial release with auto-update system

- Auto-update functionality with signature verification
- GitHub Actions CI/CD workflows
- Multi-platform build support (macOS, Linux, Windows)
- Update checker UI in settings
- Screenshot capture and AI chat features
- Thread management for conversations
- Dark mode support

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 5. Set up remote
echo ""
echo "📝 Step 5: Set up GitHub remote"
echo "Repository URL format: https://github.com/$GITHUB_USER/seeva-ai-assistant.git"
read -p "Is this correct? (y/n): " CONFIRM

if [ "$CONFIRM" = "y" ]; then
    REPO_URL="https://github.com/$GITHUB_USER/seeva-ai-assistant.git"

    # Check if remote already exists
    if git remote | grep -q origin; then
        echo "Remote 'origin' already exists. Updating URL..."
        git remote set-url origin $REPO_URL
    else
        echo "Adding remote 'origin'..."
        git remote add origin $REPO_URL
    fi

    echo "✅ Remote configured!"
else
    read -p "Enter your repository URL: " REPO_URL
    if git remote | grep -q origin; then
        git remote set-url origin $REPO_URL
    else
        git remote add origin $REPO_URL
    fi
fi

# 6. Push to GitHub
echo ""
echo "📝 Step 6: Push to GitHub"
echo "Pushing to main branch..."

# Check if main branch exists on remote
if git ls-remote --heads origin main | grep -q main; then
    echo "Branch 'main' exists on remote. Pushing..."
    git push -u origin main
else
    echo "Creating new 'main' branch on remote..."
    git branch -M main
    git push -u origin main
fi

echo ""
echo "🎉 SUCCESS! Your code is now on GitHub!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://github.com/$GITHUB_USER/seeva-ai-assistant/settings/secrets/actions"
echo "2. Add these secrets:"
echo "   - TAURI_SIGNING_PRIVATE_KEY (contents of .tauri/seeva.key)"
echo "   - TAURI_SIGNING_PRIVATE_KEY_PASSWORD (password you used)"
echo ""
echo "3. To create your first release:"
echo "   - Go to Actions tab"
echo "   - Click 'Release' workflow"
echo "   - Click 'Run workflow'"
echo ""
echo "📖 See .tauri/SETUP_NOTES.md for detailed instructions"
