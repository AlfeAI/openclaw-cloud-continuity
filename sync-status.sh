#!/bin/bash

# Check cloud continuity sync status

echo "🌩️ Sam's Cloud Continuity Status"
echo "==============================="
echo ""

DRIVE_AGENT="/Users/sam/Google Drive/My Drive/sam-agent"
WORKSPACE="/Users/sam/.openclaw/workspace"

# Check Google Drive location
if [ -d "$DRIVE_AGENT" ]; then
    echo "✅ Google Drive Location: $DRIVE_AGENT"
else
    echo "❌ Google Drive Location: Not found at $DRIVE_AGENT"
    exit 1
fi

cd "$WORKSPACE"

echo ""
echo "📂 Folder Symlinks:"

# Check memory folder
if [ -L "memory" ] && [ -d "memory" ]; then
    file_count=$(ls memory/ | wc -l | tr -d ' ')
    echo "✅ memory/ → ${file_count} conversation files accessible"
else
    echo "❌ memory/ → Not properly symlinked"
fi

echo ""
echo "📄 File Symlinks:"

FILES=("MEMORY.md" "SOUL.md" "USER.md" "AGENTS.md" "TOOLS.md" "HEARTBEAT.md" "IDENTITY.md")

CONFIG_FILES=(
    "$HOME/.openclaw/openclaw.json"
    ".openclaw/workspace-state.json"
    "voice-gateway/.env"
    ".clawhub/lock.json"
)

for file in "${FILES[@]}"; do
    if [ -L "$file" ] && [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || echo "0")
        echo "✅ $file → ${size} bytes"
    elif [ -L "$file" ]; then
        echo "⚠️ $file → Symlinked but not accessible"
    elif [ -f "$file" ]; then
        echo "⚠️ $file → File exists but not symlinked"
    else
        echo "❌ $file → Missing"
    fi
done

echo ""
echo "⚙️ Configuration File Symlinks:"

for config_file in "${CONFIG_FILES[@]}"; do
    if [ -L "$config_file" ] && [ -f "$config_file" ]; then
        size=$(stat -f%z "$config_file" 2>/dev/null || echo "0")
        echo "✅ $config_file → ${size} bytes"
    elif [ -L "$config_file" ]; then
        echo "⚠️ $config_file → Symlinked but not accessible"
    elif [ -f "$config_file" ]; then
        echo "⚠️ $config_file → File exists but not symlinked"
    else
        echo "❌ $config_file → Missing"
    fi
done

echo ""
echo "☁️ Google Drive Sync Status:"

# Check Google Drive Desktop client
if pgrep -f "Google Drive" > /dev/null; then
    echo "✅ Google Drive Desktop client running"
else
    echo "❌ Google Drive Desktop client not running"
fi

# Check recent file activity
if [ -d "$DRIVE_AGENT/memory" ]; then
    recent_files=$(find "$DRIVE_AGENT/memory" -name "*.md" -mtime -1 | wc -l)
    echo "📊 Recent activity: $recent_files files modified in last 24 hours"
fi

echo ""
echo "🎯 Next Steps:"
if [ -L "memory" ] && [ -d "memory" ]; then
    echo "   • Cloud continuity is operational"
    echo "   • Kevin can access files at: Google Drive → My Drive → sam-agent"
else
    echo "   • Run: ./setup-symlinks.sh to fix issues"
fi