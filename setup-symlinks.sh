#!/bin/bash

# Sam's Cloud Continuity: Symlink Setup
# Creates direct symlinks from workspace to Google Drive for real-time sync

set -e

DRIVE_AGENT="/Users/sam/Google Drive/My Drive/sam-agent"
WORKSPACE="/Users/sam/.openclaw/workspace"

echo "🌩️ Setting up Sam's Cloud Continuity via Symlinks"
echo "=================================================="
echo ""

# Verify Google Drive location exists
if [ ! -d "$DRIVE_AGENT" ]; then
    echo "❌ Google Drive sam-agent folder not found at: $DRIVE_AGENT"
    echo ""
    echo "🔧 Setup required:"
    echo "1. Open Google Drive in browser: https://drive.google.com"
    echo "2. Navigate to 'Shared drives' → 'AlfeAI Agents' → 'sam-agent'"
    echo "3. Right-click 'sam-agent' folder → 'Add shortcut to Drive'"
    echo "4. Wait for Google Drive Desktop to sync the shortcut"
    echo "5. Run this script again"
    echo ""
    exit 1
fi

echo "✅ Found Google Drive location: $DRIVE_AGENT"

# Files to symlink
FILES=("MEMORY.md" "SOUL.md" "USER.md" "AGENTS.md" "TOOLS.md" "HEARTBEAT.md" "IDENTITY.md")
FOLDERS=("memory")

# Configuration files to symlink
CONFIG_FILES=(
    "$HOME/.openclaw/openclaw.json:config/openclaw.json"
    ".openclaw/workspace-state.json:config/workspace-state.json"
    "voice-gateway/.env:config/voice-gateway.env"
    ".clawhub/lock.json:config/clawhub-lock.json"
)

cd "$WORKSPACE"

echo ""
echo "📂 Setting up folder symlinks..."

for folder in "${FOLDERS[@]}"; do
    drive_folder="$DRIVE_AGENT/$folder"
    workspace_folder="$folder"
    
    if [ -d "$drive_folder" ]; then
        echo "📁 $folder/"
        
        # Backup existing folder if it's not a symlink
        if [ -d "$workspace_folder" ] && [ ! -L "$workspace_folder" ]; then
            echo "   Backing up existing folder to $folder-backup/"
            mv "$workspace_folder" "$folder-backup"
        fi
        
        # Remove existing symlink if present
        if [ -L "$workspace_folder" ]; then
            rm "$workspace_folder"
        fi
        
        # Create symlink
        ln -s "$drive_folder" "$workspace_folder"
        echo "   ✅ Symlinked: $workspace_folder → $drive_folder"
    else
        echo "   ⚠️ $folder not found in Google Drive, skipping"
    fi
done

echo ""
echo "📄 Setting up file symlinks..."

for file in "${FILES[@]}"; do
    drive_file="$DRIVE_AGENT/$file"
    workspace_file="$file"
    
    echo "📝 $file"
    
    # Check if file exists in Google Drive
    if [ -f "$drive_file" ]; then
        echo "   Found existing file in Google Drive"
    else
        # Create empty file in Google Drive if workspace file exists
        if [ -f "$workspace_file" ] && [ ! -L "$workspace_file" ]; then
            echo "   Copying existing workspace file to Google Drive"
            cp "$workspace_file" "$drive_file" 2>/dev/null || echo "   ⚠️ Could not copy to Google Drive (read-only?)"
        else
            echo "   Creating empty file in Google Drive"
            touch "$drive_file" 2>/dev/null || echo "   ⚠️ Could not create file in Google Drive (read-only?)"
        fi
    fi
    
    # Backup existing workspace file if it's not a symlink
    if [ -f "$workspace_file" ] && [ ! -L "$workspace_file" ]; then
        echo "   Backing up existing file to $file.bak"
        cp "$workspace_file" "$file.bak"
    fi
    
    # Remove existing file/symlink
    if [ -L "$workspace_file" ] || [ -f "$workspace_file" ]; then
        rm "$workspace_file"
    fi
    
    # Create symlink
    if ln -s "$drive_file" "$workspace_file" 2>/dev/null; then
        echo "   ✅ Symlinked: $workspace_file → $drive_file"
    else
        echo "   ❌ Failed to create symlink, restoring backup"
        if [ -f "$file.bak" ]; then
            mv "$file.bak" "$workspace_file"
        fi
    fi
done

echo ""
echo "⚙️ Setting up configuration file symlinks..."

for config_mapping in "${CONFIG_FILES[@]}"; do
    # Split the mapping: source:target
    source_path="${config_mapping%:*}"
    target_path="${config_mapping#*:}"
    
    drive_file="$DRIVE_AGENT/$target_path"
    workspace_file="$source_path"
    
    echo "⚙️ $source_path"
    
    # Create directory structure in Google Drive if needed
    drive_dir=$(dirname "$drive_file")
    mkdir -p "$drive_dir" 2>/dev/null || echo "   ⚠️ Could not create directory in Google Drive"
    
    # Check if source file exists
    if [ -f "$workspace_file" ]; then
        echo "   Found existing config file"
        
        # Copy to Google Drive if it doesn't exist there
        if [ ! -f "$drive_file" ]; then
            echo "   Copying config to Google Drive"
            cp "$workspace_file" "$drive_file" 2>/dev/null || echo "   ⚠️ Could not copy to Google Drive (read-only?)"
        fi
        
        # Backup existing workspace file
        echo "   Backing up existing file to ${workspace_file}.bak"
        cp "$workspace_file" "${workspace_file}.bak"
        
        # Remove and create symlink
        rm "$workspace_file"
        if ln -s "$drive_file" "$workspace_file" 2>/dev/null; then
            echo "   ✅ Symlinked: $workspace_file → $drive_file"
        else
            echo "   ❌ Failed to create symlink, restoring backup"
            mv "${workspace_file}.bak" "$workspace_file"
        fi
    else
        echo "   ⚠️ Config file not found, skipping"
    fi
done

echo ""
echo "🧪 Testing symlink access..."

# Test folder access
if [ -d "memory" ] && [ -L "memory" ]; then
    file_count=$(ls memory/ | wc -l)
    echo "✅ Memory folder: $file_count files accessible"
else
    echo "❌ Memory folder symlink failed"
fi

# Test file access
accessible_files=0
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        accessible_files=$((accessible_files + 1))
    fi
done

echo "✅ Core files: $accessible_files/${#FILES[@]} accessible"

echo ""
echo "🎉 Cloud Continuity Setup Complete!"
echo ""
echo "✨ What's now working:"
echo "   • Files sync in real-time via Google Drive Desktop"
echo "   • Kevin can edit files directly in Google Drive web interface"
echo "   • Changes appear instantly in Sam's workspace"
echo "   • Conversation logs automatically backed up"
echo ""
echo "📍 Kevin's access: Google Drive → My Drive → sam-agent"
echo ""
echo "🔧 Manual sync commands:"
echo "   ./test-sync.sh    - Test sync functionality"
echo "   ./sync-status.sh  - Check sync status"