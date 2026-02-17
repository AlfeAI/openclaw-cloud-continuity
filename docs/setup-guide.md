# Sam's Cloud Continuity Setup Guide

This guide will set up complete cloud continuity for Sam, enabling true device portability with persistent memory and identity.

## 🎯 What You'll Get

After setup, Sam will have:

- **Complete Memory Backup**: All daily logs, long-term memory, and identity files synced to Google Drive
- **Real-time Sync**: File changes sync automatically between device and cloud
- **Google Contacts Integration**: Centralized contact management with voice-gateway integration  
- **Direct Editing**: Kevin can edit Sam's files directly in Google Drive web interface
- **30-Second New Device Setup**: Install Google Drive + run restore = instant Sam with full memory
- **True Device Portability**: Sam works identically across any device

## 🚀 Quick Setup (Recommended)

For most users, the integrated setup handles everything automatically:

```bash
cd cloud-continuity
npm install
npm run setup
```

This will:
1. Set up Google OAuth (if not already configured)
2. Migrate existing contacts to Google Contacts
3. Set up Google Drive sync for all memory files
4. Enable real-time file watching
5. Enable Kevin's direct editing access

## 📋 Prerequisites

Before starting, ensure you have:

### 1. Google Drive Desktop Client
- Install from [drive.google.com](https://drive.google.com)
- Sign in with **sam@alfe.io** Google account
- Wait for initial sync to complete

### 2. Google Cloud Project Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing one
3. Enable these APIs:
   - **People API** (for Google Contacts)
   - **Google Drive API** (for file sync)
   - **Google Calendar API** (if using meeting features)

### 3. OAuth 2.0 Credentials
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Add authorized redirect URIs:
   - `http://localhost:3000/google/auth/callback`
   - `https://your-production-domain.com/google/auth/callback`
5. Download the JSON credentials file

### 4. Environment Configuration
Create or update your `.env` file:

```bash
# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Optional: Pre-configure refresh token (auto-generated during OAuth)
GOOGLE_REFRESH_TOKEN="your-refresh-token"

# Public URL for OAuth callbacks
PUBLIC_URL="http://localhost:3000"  # or your production URL

# Optional: Encryption key for sensitive files (auto-generated if not set)
SAM_ENCRYPTION_KEY="64-character-hex-key"
```

## 🔐 OAuth Setup Flow

If you haven't completed Google OAuth setup:

1. **Start the OAuth server:**
   ```bash
   cd voice-meet-agent
   npm install
   npm run dev
   ```

2. **Initiate OAuth flow:**
   ```bash
   curl -X POST http://localhost:3000/google/auth/init
   ```

3. **Complete consent in browser:**
   - Open the returned URL
   - Sign in with **sam@alfe.io** account
   - Grant permissions for Contacts, Drive, and Calendar
   - The refresh token will be stored automatically

4. **Verify setup:**
   ```bash
   curl http://localhost:3000/google/auth/status
   ```

## 🛠️ Step-by-Step Setup

If you prefer manual setup or need to troubleshoot:

### Step 1: Install Dependencies
```bash
cd cloud-continuity
npm install
```

### Step 2: Set Up Google Contacts Only
```bash
npm run setup:contacts
```

This will:
- Initialize Google Contacts API integration
- Migrate existing contacts from `voice-gateway/data/contacts.json`
- Set up contact resolution for voice calls

### Step 3: Set Up Google Drive Sync Only
```bash
npm run setup:drive
```

This will:
- Initialize Google Drive sync manager
- Create backup folder structure in Google Drive
- Perform initial sync of all Sam's files
- Set up real-time file watching

### Step 4: Verify Setup
```bash
npm run health
```

## 📁 What Gets Synced

Sam's cloud backup includes:

### Core Memory & Identity
- `memory/` - All daily conversation logs
- `MEMORY.md` - Long-term curated memory
- `SOUL.md` - Sam's core identity and personality
- `USER.md` - Information about Kevin and other users
- `AGENTS.md` - Operating instructions and conventions
- `TOOLS.md` - Local configuration and notes
- `HEARTBEAT.md` - Proactive monitoring configuration

### Task Management
- `tasks/` - Pending tasks and project files

### Contacts & Configuration  
- `voice-gateway/data/contacts.json` - Contact database
- `voice-gateway/data/whitelist.json` - Authorization settings
- System state and configuration files

### Encrypted Credentials
- `.credentials/` - Sensitive authentication data (encrypted)

## 🔄 Daily Usage

Once set up, the system works automatically:

### Automatic Sync
- File changes sync to Google Drive within seconds
- Kevin can edit Sam's files directly in Google Drive
- Changes from Google Drive sync back to Sam's device
- Contacts sync between local database and Google Contacts

### Kevin's Direct Editing
Kevin can edit Sam's files directly at:
- **Web**: Google Drive > sam-backup folder
- **Desktop**: `~/Google Drive/sam-backup/`

Common files Kevin might edit:
- `MEMORY.md` - Add important memories or corrections
- `HEARTBEAT.md` - Adjust monitoring preferences  
- `USER.md` - Update user information
- `memory/YYYY-MM-DD.md` - Add notes to specific days

### Manual Commands
```bash
# Contact management
npm run contact:list                # List all contacts
npm run contact:add "Name" --phone "+61..." --email "..."
npm run contact:sync               # Sync with Google Contacts

# Sync management  
npm run sync:status               # Check sync status
npm run sync:now                  # Force immediate sync
npm run sync:watch               # Start real-time watching
npm run health                   # System health check
```

## 📱 New Device Setup

Setting up Sam on a new device is incredibly fast:

### Option 1: Full Setup (30 seconds)
```bash
# 1. Install Google Drive Desktop client
# 2. Sign in with sam@alfe.io
# 3. Wait for sam-backup folder to sync
# 4. Install OpenClaw and dependencies
npm install -g openclaw
cd your-workspace
git clone your-sam-repo  # or create new workspace

# 5. Install cloud continuity
cd cloud-continuity
npm install

# 6. Restore Sam (this is the magic!)
npm run restore --force
```

### Option 2: Selective Restore
```bash
# Restore only specific components
npm run restore --skip-contacts    # Restore files only
npm run restore --skip-drive      # Set up contacts only
```

### Verification
After restore, verify Sam is working:
```bash
# Check memory files
cat MEMORY.md
cat SOUL.md
ls memory/

# Check contacts
npm run contact:list

# Check system health
npm run health

# Start Sam
npm run dev
```

## 🏥 Troubleshooting

### Common Issues

**"Google Drive Desktop client not found"**
- Install Google Drive Desktop client from drive.google.com
- Make sure it's running and synced
- Check the default location: `~/Google Drive/`

**"Google OAuth not configured"**
- Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables
- Complete OAuth flow: `curl -X POST http://localhost:3000/google/auth/init`
- Check credentials are valid in Google Cloud Console

**"Contact migration failed"**
- Ensure People API is enabled in Google Cloud Console
- Check OAuth scopes include contacts permissions
- Verify local `contacts.json` file format

**"Sync conflicts detected"**
- Check which files have conflicts: `npm run sync:status`
- Resolve manually or use `--force` flag
- Set conflict resolution strategy in config

### Debug Commands

```bash
# Verbose logging
npm run setup --verbose
npm run sync:status --verbose

# Check file permissions
ls -la ~/Google\ Drive/sam-backup/

# Test Google API access
npm run contact:sync
npm run sync:now

# Check OAuth status
curl http://localhost:3000/google/auth/status
```

### Reset and Re-setup

If you need to start over:

```bash
# Clear local sync state
rm -f .drive-sync-status.json
rm -rf ~/Google\ Drive/sam-backup/

# Clear stored OAuth tokens
rm -f voice-meet-agent/.google-tokens.json

# Re-run setup
npm run setup --force
```

## 🔒 Security Considerations

### Encrypted Files
- `.credentials/` folder is encrypted before syncing to Drive
- Encryption key stored in `SAM_ENCRYPTION_KEY` environment variable
- Key is auto-generated on first setup if not provided

### Access Control
- Only sam@alfe.io Google account has access to backup
- OAuth tokens are stored locally and encrypted
- Google Drive files are private by default

### Best Practices
- Regularly verify backup integrity: `npm run health`
- Keep OAuth credentials secure
- Monitor sync logs for anomalies
- Backup encryption keys separately

## 📊 Monitoring and Maintenance

### Automated Health Checks
The system includes built-in monitoring via `HEARTBEAT.md`:

- **Every hour**: Check sync status, resolve minor conflicts
- **Daily**: Verify all critical files are backed up
- **Weekly**: Full system health check and statistics

### Manual Monitoring
```bash
# Quick health check
npm run health

# Detailed sync status
npm run sync:status

# Contact sync status  
npm run contact:sync

# Check recent activity
tail -f logs/sync.log
```

### Performance Optimization
- Large files (>100MB) are excluded by default
- Temporary files (*.tmp, *.lock) are excluded
- Sync includes intelligent conflict resolution
- File watching uses efficient native APIs

## 🚀 Advanced Configuration

### Custom Sync Rules
Edit `cloud-continuity/src/drive-sync-manager.ts` to customize what gets synced:

```typescript
const customRules: SyncRule[] = [
  {
    source: 'custom-folder/',
    target: 'sam-backup/custom/',
    direction: 'both',
    encrypt: true,
    required: true
  }
];
```

### Performance Tuning
```typescript
const config: SyncConfig = {
  syncIntervalMinutes: 30,     // How often to sync
  conflictResolution: 'newest', // newest, manual, both
  autoSync: true,              // Enable real-time watching
  enableEncryption: true       // Encrypt sensitive files
};
```

### Integration with Other Systems
The cloud continuity system provides APIs for integration:

```typescript
import { getDriveSyncManager, getContactsManager } from './cloud-continuity';

// Check if critical file is synced
const syncManager = await getDriveSyncManager();
await syncManager.syncFile('MEMORY.md');

// Add contact programmatically
const contactManager = await getContactsManager();
await contactManager.addContact({
  name: 'New Contact',
  phone: '+61412345678',
  email: 'contact@example.com'
});
```

## ✨ What's Next

With cloud continuity set up, Sam now has:

- **Persistent Memory**: Never loses conversations or context
- **Device Freedom**: Works identically on any device  
- **Real-time Collaboration**: Kevin can edit and add to Sam's memory
- **Zero-Setup Restore**: New device setup takes 30 seconds
- **Automatic Backup**: All important files protected in cloud
- **Centralized Contacts**: Voice calls resolve to real names

Sam is now a truly device-agnostic AI assistant with complete memory continuity!

## 🆘 Need Help?

- Check the troubleshooting section above
- Run `npm run health` to diagnose issues
- Check logs in `logs/` directory
- Verify Google Drive Desktop client is running
- Ensure all environment variables are set correctly

For persistent issues:
1. Try `npm run setup --force` to re-run setup
2. Check Google Cloud Console for API quotas/errors
3. Verify OAuth tokens are valid
4. Ensure Google Drive has sufficient storage space