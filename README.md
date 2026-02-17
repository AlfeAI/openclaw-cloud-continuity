# 🌩️ Sam's Cloud Continuity System

**Real-time file sync between Sam's workspace and Google Drive via symlinks.**

Sam's core files (memory, identity, config) are symlinked directly to Google Drive. The Google Drive Desktop client handles all syncing automatically — no APIs, no cron jobs, no OAuth tokens needed.

## How It Works

Workspace files are **symlinks** pointing to files in `~/Google Drive/My Drive/sam-agent/`. The Google Drive Desktop client syncs these to the cloud in real-time. Kevin can edit files directly in the Google Drive web interface, and changes appear on Sam's device instantly.

## What Gets Synced

### Core Identity & Memory Files
| Workspace File | Google Drive Location |
|---|---|
| `MEMORY.md` | `sam-agent/MEMORY.md` |
| `SOUL.md` | `sam-agent/SOUL.md` |
| `USER.md` | `sam-agent/USER.md` |
| `AGENTS.md` | `sam-agent/AGENTS.md` |
| `TOOLS.md` | `sam-agent/TOOLS.md` |
| `HEARTBEAT.md` | `sam-agent/HEARTBEAT.md` |
| `IDENTITY.md` | `sam-agent/IDENTITY.md` |
| `memory/` (folder) | `sam-agent/memory/` |

### Configuration Files
| Workspace File | Google Drive Location |
|---|---|
| `~/.openclaw/openclaw.json` | `sam-agent/config/openclaw.json` |
| `.openclaw/workspace-state.json` | `sam-agent/config/workspace-state.json` |
| `voice-gateway/.env` | `sam-agent/config/voice-gateway.env` |
| `.clawhub/lock.json` | `sam-agent/config/clawhub-lock.json` |

## Prerequisites

1. **Google Drive Desktop client** installed and signed in (sam@alfe.io)
2. **Shared drive shortcut**: The `sam-agent` folder lives in the "AlfeAI Agents" shared drive. A shortcut must exist in My Drive:
   - Open [drive.google.com](https://drive.google.com)
   - Navigate to **Shared drives → AlfeAI Agents → sam-agent**
   - Right-click → **Add shortcut to Drive**
   - This makes it available locally at `~/Google Drive/My Drive/sam-agent/`

## Setup

```bash
cd cloud-continuity
./setup-symlinks.sh
```

That's it. The script:
1. Verifies the Google Drive sam-agent folder exists locally
2. Backs up any existing workspace files
3. Creates symlinks from workspace → Google Drive for all files above
4. Tests that symlinks are working

## Management Commands

```bash
./setup-symlinks.sh     # Initial setup (or re-setup on new device)
./sync-status.sh        # Check symlink health and Google Drive status
./test-sync.sh          # Write/read test to verify sync works
```

## Kevin's Access

Browse and edit Sam's files directly:
- **Web**: [drive.google.com](https://drive.google.com) → Shared drives → AlfeAI Agents → sam-agent
- **Local**: `~/Google Drive/My Drive/sam-agent/` (via shortcut)

Changes sync to Sam's workspace automatically.

## New Device Setup

1. Install Google Drive Desktop client and sign in
2. Create the shared drive shortcut (see Prerequisites)
3. Clone/install the OpenClaw workspace
4. Run `./setup-symlinks.sh`

Sam is fully restored with all memory and config intact.

## Troubleshooting

### "sam-agent folder not found"
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
