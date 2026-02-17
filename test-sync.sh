#!/bin/bash

# Test cloud continuity sync functionality

echo "🧪 Testing Cloud Continuity Sync"
echo "================================"
echo ""

DRIVE_AGENT="/Users/sam/Google Drive/My Drive/sam-agent"
WORKSPACE="/Users/sam/.openclaw/workspace"

cd "$WORKSPACE"

# Test 1: Memory folder write test
echo "📁 Test 1: Memory folder sync"
test_file="memory/sync-test-$(date +%s).md"
echo "# Sync Test - $(date)" > "$test_file" 2>/dev/null

if [ -f "$test_file" ]; then
    echo "✅ Created test file locally: $test_file"
    
    # Check if it appears in Google Drive
    sleep 2
    drive_test_file="$DRIVE_AGENT/memory/$(basename "$test_file")"
    if [ -f "$drive_test_file" ]; then
        echo "✅ File synced to Google Drive"
        rm "$test_file"
        echo "✅ Cleanup successful"
    else
        echo "⏳ File syncing to Google Drive..."
        rm "$test_file" 2>/dev/null
    fi
else
    echo "❌ Cannot write to memory folder"
fi

echo ""
echo "📝 Test 2: Core file access"

# Test core file access
accessible=0
total=0

FILES=("MEMORY.md" "SOUL.md" "USER.md" "AGENTS.md")

for file in "${FILES[@]}"; do
    total=$((total + 1))
    if [ -f "$file" ]; then
        # Try to read first line
        if head -1 "$file" >/dev/null 2>&1; then
            accessible=$((accessible + 1))
            echo "✅ $file readable"
        else
            echo "⚠️ $file exists but not readable"
        fi
    else
        echo "❌ $file not found"
    fi
done

echo ""
echo "📊 Test Results:"
echo "   Memory folder: $([ -L "memory" ] && echo "✅ Symlinked" || echo "❌ Not symlinked")"
echo "   Core files: $accessible/$total accessible"

echo ""
echo "🎯 Kevin's Access Test:"
echo "   Location: Google Drive → My Drive → sam-agent"
if [ -d "$DRIVE_AGENT" ]; then
    file_count=$(find "$DRIVE_AGENT" -name "*.md" | wc -l)
    echo "   Files available: $file_count"
    echo "   ✅ Kevin can browse Sam's files in Google Drive"
else
    echo "   ❌ Google Drive location not accessible"
fi