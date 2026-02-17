# 🌩️ Agent Cloud Continuity System - Symlink Implementation

**Real-time file sync between any OpenClaw agent workspace and Google Drive via symlinks.**

Agent core files (memory, identity, config) are symlinked directly to Google Drive. The Google Drive Desktop client handles all syncing automatically — **no APIs, no cron jobs, no OAuth tokens needed**.

## How It Works

Workspace files are **symlinks** pointing to files in `~/Google Drive/My Drive/{agent-name}/`. The Google Drive Desktop client syncs these to the cloud in real-time. Human operators can edit files directly in the Google Drive web interface, and changes appear on the agent's device instantly.

## What Gets Synced

### Core Identity & Memory Files
| Workspace File | Google Drive Location |
|---|---|
| `MEMORY.md` | `{agent-name}/MEMORY.md` |
| `SOUL.md` | `{agent-name}/SOUL.md` |
| `USER.md` | `{agent-name}/USER.md` |
| `AGENTS.md` | `{agent-name}/AGENTS.md` |
| `TOOLS.md` | `{agent-name}/TOOLS.md` |
| `HEARTBEAT.md` | `{agent-name}/HEARTBEAT.md` |
| `IDENTITY.md` | `{agent-name}/IDENTITY.md` |
| `memory/` (folder) | `{agent-name}/memory/` |

### Configuration Files
| Workspace File | Google Drive Location |
|---|---|
| `~/.openclaw/openclaw.json` | `{agent-name}/config/openclaw.json` |
| `.openclaw/workspace-state.json` | `{agent-name}/config/workspace-state.json` |
| `voice-gateway/.env` | `{agent-name}/config/voice-gateway.env` |
| `.clawhub/lock.json` | `{agent-name}/config/clawhub-lock.json` |

## Prerequisites

1. **Google Drive Desktop client** installed and signed in with agent's Google account
2. **Shared drive shortcut**: The `{agent-name}` folder lives in the "AlfeAI Agents" shared drive. A shortcut must exist in My Drive:
   - Open [drive.google.com](https://drive.google.com)
   - Navigate to **Shared drives → AlfeAI Agents → {agent-name}**
   - Right-click → **Add shortcut to Drive**
   - This makes it available locally at `~/Google Drive/My Drive/{agent-name}/`

## Setup

```bash
cd agent-cloud-continuity
./setup-symlinks.sh
```

That's it. The script:
1. Verifies the Google Drive {agent-name} folder exists locally
2. Backs up any existing workspace files
3. Creates symlinks from workspace → Google Drive for all files above
4. Tests that symlinks are working

## Management Commands

```bash
./setup-symlinks.sh     # Initial setup (or re-setup on new device)
./sync-status.sh        # Check symlink health and Google Drive status
./test-sync.sh          # Write/read test to verify sync works
```

## Human Operator Access

Browse and edit the agent's files directly:
- **Web**: [drive.google.com](https://drive.google.com) → Shared drives → AlfeAI Agents → {agent-name}
- **Local**: `~/Google Drive/My Drive/{agent-name}/` (via shortcut)

Changes sync to the agent's workspace automatically.

## New Device Setup

1. Install Google Drive Desktop client and sign in
2. Create the shared drive shortcut (see Prerequisites)
3. Clone/install the OpenClaw workspace
4. Run `./setup-symlinks.sh`

The agent is fully restored with all memory and config intact.

## Troubleshooting

### "{agent-name} folder not found"
The shared drive shortcut is missing. Create it via the browser (see Prerequisites).

### Symlinks broken after OS update
Re-run `./setup-symlinks.sh` — it handles existing symlinks gracefully.

### Google Drive not syncing
Check that the Google Drive Desktop client is running: `pgrep -f "Google Drive"`.

### Check symlink status
```bash
ls -la *.md              # Should show symlink arrows (→)
./sync-status.sh         # Full status check
```

## Why Symlinks Over API?

✅ **Zero configuration**: No OAuth setup, credentials, or API tokens  
✅ **Instant sync**: Google Drive Desktop client handles everything  
✅ **Reliable**: No network issues, rate limits, or authentication failures  
✅ **Simple**: One script setup, works on any device  
✅ **Human-friendly**: Direct editing in Google Drive web interface  

This approach transforms any OpenClaw agent into a truly portable, cloud-persistent entity that survives device failures and enables instant restoration anywhere.