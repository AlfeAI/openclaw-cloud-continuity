#!/bin/bash

echo "🚀 Setting up Google Drive sync for memory backup..."
echo ""

# Ensure scripts directory exists
mkdir -p scripts

# Make scripts executable
chmod +x scripts/google-drive-setup.js
chmod +x scripts/google-drive-sync.js
chmod +x scripts/google-drive-watch.js

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔑 Setting up Google Drive authentication..."
echo "This will guide you through the Google API setup process."
echo ""

node scripts/google-drive-setup.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Authentication setup complete!"
    echo ""
    echo "🔄 Running initial sync..."
    node scripts/google-drive-sync.js sync
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🔗 Getting shareable folder URL..."
        node scripts/google-drive-sync.js url
        
        echo ""
        echo "✅ Google Drive sync setup complete!"
        echo ""
        echo "📖 Usage:"
        echo "  Manual sync:      node scripts/google-drive-sync.js sync"
        echo "  Get folder URL:   node scripts/google-drive-sync.js url"
        echo "  Real-time sync:   node scripts/google-drive-watch.js"
        echo ""
        echo "🎯 Next steps:"
        echo "1. Copy the Google Drive URL above"
        echo "2. Share it with Kevin for direct editing access"
        echo "3. Run real-time sync: node scripts/google-drive-watch.js"
    else
        echo "❌ Initial sync failed. Please check the error messages above."
        exit 1
    fi
else
    echo "❌ Authentication setup failed. Please try again."
    exit 1
fi