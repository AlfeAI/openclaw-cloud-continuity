#!/bin/bash

# Generic Agent Cloud Continuity Setup Script
# Works with any AI agent

set -e  # Exit on any error

echo "☁️ Agent Cloud Continuity Setup"
echo "================================"
echo ""
echo "This script will set up complete cloud continuity for any AI agent:"
echo "✅ Google Drive real-time sync for all memory files"
echo "✅ Human operator direct editing capability in Google Drive"
echo "✅ 30-second new device restoration"
echo ""

# Get agent configuration
if [ ! -f "config.json" ]; then
    echo "📋 Agent Configuration Setup"
    echo "Please provide your agent details:"
    echo ""
    
    read -p "Agent name (e.g., 'sam', 'claude', 'assistant'): " AGENT_NAME
    read -p "Agent Google email: " AGENT_EMAIL  
    read -p "Agent workspace path: " WORKSPACE_PATH
    
    # Create config from template
    cp config.example.json config.json
    
    # Update config with user values
    sed -i.bak "s|your-agent-name|$AGENT_NAME|g" config.json
    sed -i.bak "s|agent@yourdomain.com|$AGENT_EMAIL|g" config.json
    sed -i.bak "s|/path/to/agent/workspace|$WORKSPACE_PATH|g" config.json
    sed -i.bak "s|{agent-name}|$AGENT_NAME|g" config.json
    
    rm config.json.bak
    
    echo "✅ Configuration saved to config.json"
    echo ""
fi

# Load configuration
AGENT_NAME=$(node -e "console.log(require('./config.json').agent.name)")
AGENT_EMAIL=$(node -e "console.log(require('./config.json').agent.email)")
WORKSPACE_PATH=$(node -e "console.log(require('./config.json').agent.workspace)")

echo "🤖 Setting up continuity for agent: $AGENT_NAME"
echo "📧 Using Google account: $AGENT_EMAIL"
echo "📁 Workspace: $WORKSPACE_PATH"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

# Check workspace exists
if [ ! -d "$WORKSPACE_PATH" ]; then
    echo "❌ Agent workspace not found: $WORKSPACE_PATH"
    echo "   Please ensure the agent workspace directory exists."
    exit 1
fi

# Check Google Drive Desktop client
GOOGLE_DRIVE_PATH=""
if [ -d "$HOME/Google Drive" ]; then
    GOOGLE_DRIVE_PATH="$HOME/Google Drive"
elif [ -d "$HOME/GoogleDrive" ]; then
    GOOGLE_DRIVE_PATH="$HOME/GoogleDrive"
fi

if [ -z "$GOOGLE_DRIVE_PATH" ]; then
    echo "⚠️ Google Drive Desktop client not detected"
    echo "   Install from: https://drive.google.com"
    echo "   Sign in with: $AGENT_EMAIL"
    echo ""
    read -p "Press Enter once Google Drive is installed and synced..."
    echo ""
fi

echo "✅ Prerequisites check complete"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install --silent
echo "✅ Dependencies installed"
echo ""

# Set up Google Drive authentication
echo "🔑 Setting up Google Drive authentication..."
if [ ! -f ".credentials/google-drive-credentials.json" ]; then
    echo ""
    echo "You need to set up Google OAuth credentials:"
    echo "1. Go to https://console.cloud.google.com/"
    echo "2. Create a project and enable Google Drive API" 
    echo "3. Create OAuth 2.0 credentials (Desktop application)"
    echo "4. Download credentials JSON file"
    echo "5. Save as: .credentials/google-drive-credentials.json"
    echo ""
    read -p "Press Enter once credentials are set up..."
fi

node google-drive-setup.js
echo "✅ Google Drive authentication complete"
echo ""

# Test connectivity
echo "🧪 Testing Google Drive connectivity..."
node test-google-drive.js
echo "✅ Google Drive test successful"
echo ""

# Start initial sync
echo "🔄 Running initial sync..."
node google-drive-sync.js
echo "✅ Initial sync complete"
echo ""

# Get Google Drive folder URL
FOLDER_ID=$(node -e "
const fs = require('fs');
try {
  const sync = require('./google-drive-sync.js');
  sync.getFolderUrl().then(url => console.log(url));
} catch(e) {
  console.log('Run sync first to get folder URL');
}
")

echo "🎉 Agent Cloud Continuity Setup Complete!"
echo ""
echo "📂 Your agent's Google Drive backup folder:"
echo "   https://drive.google.com/drive/folders/[folder-id]"
echo ""
echo "🚀 To start real-time sync:"
echo "   npm start"
echo ""
echo "📝 Human operators can now edit $AGENT_NAME's memory files directly"
echo "   in the Google Drive web interface!"
echo ""

# Offer to start sync immediately
read -p "Start real-time sync now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Starting real-time sync..."
    npm start &
    echo "✅ Real-time sync started in background"
    echo "   Use 'npm stop' to stop the sync process"
fi

echo ""
echo "Setup complete! Your agent now has full cloud continuity. ☁️✨"