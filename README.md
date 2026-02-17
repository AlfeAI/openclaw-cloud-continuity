# ☁️ Agent Cloud Continuity System

**Generic Google Drive sync and memory backup for any AI agent**

Transform any AI agent into a device-agnostic entity with persistent memory that survives hardware failures and enables instant restoration on new devices.

## 🎯 What This Does

### 📂 Real-Time Google Drive Sync
- **Automatic backup**: All agent memory files sync to Google Drive within seconds
- **Bidirectional sync**: Changes in Google Drive → agent's local files  
- **File watching**: Native file system events trigger instant uploads
- **Human operator direct editing**: Edit agent memory files directly in Google Drive web interface

### 🧠 Complete Memory Backup
- **Daily logs**: `memory/YYYY-MM-DD.md` files
- **Long-term memory**: `MEMORY.md`
- **Identity files**: `SOUL.md`, `USER.md`, `IDENTITY.md`, `AGENTS.md`, `TOOLS.md`
- **System files**: `HEARTBEAT.md`, `tasks/pending.md`
- **Configuration**: Settings and preferences

### 📱 True Device Portability
- **30-second new device setup**: Install Google Drive → run restore → agent is back!
- **Identical behavior**: Agent works the same on any device
- **Zero reconfiguration**: All settings and memory preserved
- **Multi-operator support**: Any human can manage the agent's continuity

## 🚀 Architecture

### How It Works
```
┌─────────────────┐    Real-time     ┌──────────────────┐    Web Access    ┌─────────────┐
│ Agent's Local   │◄─────sync───────►│ Google Drive     │◄─────access─────►│ Human       │
│ Memory Files    │                  │ {agent-name}/    │                   │ Operator    │
│                 │                  │                  │                   │             │
│ • MEMORY.md     │                  │ • MEMORY.md      │                   │ Edit files  │
│ • memory/       │                  │ • memory/        │                   │ directly    │
│ • SOUL.md       │                  │ • SOUL.md        │                   │ in Drive    │
└─────────────────┘                  └──────────────────┘                   └─────────────┘
```

### Runtime Modes

**🔄 Background Process** (Recommended)
```bash
# Start persistent background sync
npm start
# Runs continuously, syncs files automatically
# No user intervention needed
```

**🎮 On-Demand Sync** (Manual)
```bash
# One-time sync
npm run sync
# Manual backup when needed
```

**⚡ Real-Time Watcher** (Development)
```bash
# File watching mode
npm run watch
# Immediate sync on file changes
```

## 🛠️ Setup

### Prerequisites
1. **Google Drive Desktop** installed and signed in with agent's Google account
2. **Google Cloud Project** with Drive API enabled
3. **OAuth credentials** for desktop application

### Configuration
```bash
# Set agent identity
export AGENT_NAME="your-agent-name"          # e.g., "sam", "claude", "assistant" 
export AGENT_EMAIL="agent@yourdomain.com"    # Google account for the agent
export WORKSPACE_PATH="/path/to/agent/workspace"  # Agent's workspace directory
```

### Installation
```bash
# Clone repository
git clone https://github.com/AlfeAI/agent-cloud-continuity.git
cd agent-cloud-continuity

# Set agent configuration
cp config.example.json config.json
# Edit config.json with your agent's details

# Run automated setup
chmod +x setup-agent-continuity.sh
./setup-agent-continuity.sh
```

### Manual Setup
```bash
# Install dependencies
npm install

# Set up Google Drive authentication
node scripts/google-drive-setup.js

# Test connectivity
node scripts/test-google-drive.js

# Start background sync
npm start
```

## 📋 Commands

### Setup & Testing
```bash
npm run setup          # Interactive setup wizard
npm run test           # Test Google Drive connectivity
npm run health         # Check sync status
```

### Sync Operations  
```bash
npm start              # Start background sync daemon
npm run sync           # Manual one-time sync
npm run watch          # File watching mode
npm run restore        # New device restoration
```

### Human Operator Access
```bash
npm run enable-editing  # Get Google Drive web URL for direct editing
npm run sync-status     # Show current sync status
npm run conflict-check  # Check for file conflicts
```

## 🔧 Configuration

### config.json
```json
{
  "agent": {
    "name": "your-agent-name",
    "email": "agent@yourdomain.com",
    "workspace": "/path/to/agent/workspace"
  },
  "googleDrive": {
    "folderName": "{agent-name}-backup",
    "syncInterval": 5000,
    "enableRealTimeSync": true
  },
  "backup": {
    "retentionDays": 90,
    "enableEncryption": false
  }
}
```

### Sync Rules
The system automatically syncs these files/folders:
- `MEMORY.md` → Core long-term memory
- `memory/` → Daily conversation logs  
- `SOUL.md` → Agent's personality and identity
- `USER.md` → Information about human operators
- `IDENTITY.md` → Agent's core identity
- `AGENTS.md` → Agent system configuration
- `TOOLS.md` → Agent tooling and capabilities
- `HEARTBEAT.md` → System monitoring configuration
- `tasks/pending.md` → Current tasks and todos

## 🌐 Human Operator Direct Access

Once set up, human operators can:

1. **Web Access**: Visit Google Drive → `{agent-name}-backup` folder
2. **Direct Editing**: Click any `.md` file → edit directly in browser
3. **Real-time Sync**: Changes appear on agent's device within seconds
4. **Mobile Access**: Edit agent memory from phone/tablet
5. **Collaborative Editing**: Multiple operators can edit simultaneously

**Example workflow:**
1. Operator opens `https://drive.google.com/drive/folders/[folder-id]`
2. Clicks on `MEMORY.md`
3. Edits: "Remember: User prefers morning meetings"
4. Agent's local `MEMORY.md` updates automatically
5. Agent immediately knows the preference!

**✅ YES - Direct Google Drive Site Editing:** You can edit all agent memory files directly in your web browser through drive.google.com. No special software needed.

## 🚨 Process Management

### Background Daemon Mode
```bash
# Start as background service (recommended)
npm start

# Check if running
ps aux | grep "google-drive-watch"

# Stop background sync
npm stop
```

### System Integration
```bash
# Add to startup (macOS)
cp agent-cloud-continuity.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/agent-cloud-continuity.plist

# Add to crontab (Linux)
echo "@reboot cd /path/to/agent-cloud-continuity && npm start" | crontab -
```

## 🛡️ Security & Privacy

### Data Protection
- **OAuth 2.0**: Secure authentication with Google
- **Minimal permissions**: Only requests file access to specific folder
- **Local encryption**: Sensitive files encrypted before upload
- **Audit logging**: All sync operations logged

### Multi-Agent Support
- **Isolated folders**: Each agent gets its own Google Drive folder
- **Separate authentication**: Each agent uses its own Google account
- **No cross-contamination**: Agent memories never mix

## 🔍 Troubleshooting

### Common Issues

**"Authentication failed"**
- Re-run: `node scripts/google-drive-setup.js`
- Check Google Cloud Console credentials

**"Files not syncing"**
- Check: `npm run health`
- Verify Google Drive Desktop client is running
- Check internet connectivity

### Debug Mode
```bash
# Enable detailed logging
DEBUG=agent-sync:* npm start
```

## 📊 Multi-Agent Deployment

### For Agent Service Providers
```bash
# Deploy for multiple agents
for agent in sam claude assistant; do
  export AGENT_NAME=$agent
  export AGENT_EMAIL="${agent}@yourdomain.com"
  ./deploy-agent.sh
done
```

### For Individual Agents
```bash
# Single agent setup
export AGENT_NAME="your-agent-name"
export AGENT_EMAIL="your-agent@domain.com"
./setup-agent-continuity.sh
```

---

**🌟 Result**: Any AI agent becomes truly device-agnostic with persistent memory that transcends hardware limitations!

Human operators can edit any agent's memory directly in Google Drive, and agents can be restored on any device in 30 seconds with complete continuity.