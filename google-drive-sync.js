#!/usr/bin/env node

const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Configuration
const TOKEN_PATH = '.credentials/google-drive-token.json';
const CREDENTIALS_PATH = '.credentials/google-drive-credentials.json';
const STATE_PATH = '.credentials/drive-sync-state.json';
const BACKUP_FOLDER_NAME = 'sam-backup';

// Files to sync
const SYNC_FILES = [
  'MEMORY.md',
  'SOUL.md', 
  'USER.md',
  'IDENTITY.md',
  'HEARTBEAT.md',
  'tasks/pending.md'
];

// Patterns for memory files (YYYY-MM-DD.md)
const MEMORY_PATTERN = /^\d{4}-\d{2}-\d{2}\.md$/;

class GoogleDriveSync {
  constructor() {
    this.drive = null;
    this.auth = null;
    this.backupFolderId = null;
    this.memoryFolderId = null;
    this.state = {};
  }

  async initialize() {
    console.log('🔄 Initializing Google Drive sync...');
    
    try {
      // Load credentials and token
      const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH, 'utf8'));
      const token = JSON.parse(await fs.readFile(TOKEN_PATH, 'utf8'));
      
      // Set up OAuth2 client
      const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
      this.auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
      this.auth.setCredentials(token);
      
      // Initialize Drive API
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      
      // Load sync state
      await this.loadState();
      
      // Ensure backup folder exists
      await this.ensureBackupFolder();
      
      console.log('✅ Google Drive sync initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive sync:', error.message);
      console.log('\n🔧 Please run: node scripts/google-drive-setup.js');
      throw error;
    }
  }

  async loadState() {
    try {
      this.state = JSON.parse(await fs.readFile(STATE_PATH, 'utf8'));
    } catch (error) {
      this.state = { files: {}, folders: {} };
    }
  }

  async saveState() {
    await fs.writeFile(STATE_PATH, JSON.stringify(this.state, null, 2));
  }

  async ensureBackupFolder() {
    // Check if we have the folder ID cached
    if (this.state.folders && this.state.folders.backup) {
      this.backupFolderId = this.state.folders.backup;
      
      // Verify folder still exists
      try {
        await this.drive.files.get({ fileId: this.backupFolderId });
        console.log('📁 Using existing backup folder');
      } catch (error) {
        console.log('📁 Cached folder not found, creating new one...');
        this.backupFolderId = null;
      }
    }

    // Create folder if needed
    if (!this.backupFolderId) {
      console.log(`📁 Creating "${BACKUP_FOLDER_NAME}" folder...`);
      
      const folderMetadata = {
        name: BACKUP_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder'
      };

      const folder = await this.drive.files.create({
        resource: folderMetadata,
        fields: 'id'
      });

      this.backupFolderId = folder.data.id;
      
      // Make folder publicly readable (so Kevin can access)
      await this.drive.permissions.create({
        fileId: this.backupFolderId,
        resource: {
          role: 'writer',
          type: 'anyone'
        }
      });

      this.state.folders = { backup: this.backupFolderId };
      await this.saveState();
      
      console.log('✅ Backup folder created and shared');
    }

    // Ensure memory subfolder exists
    await this.ensureMemoryFolder();
  }

  async ensureMemoryFolder() {
    if (this.state.folders && this.state.folders.memory) {
      this.memoryFolderId = this.state.folders.memory;
      try {
        await this.drive.files.get({ fileId: this.memoryFolderId });
        return;
      } catch (error) {
        this.memoryFolderId = null;
      }
    }

    console.log('📁 Creating "memory" subfolder...');
    
    const folderMetadata = {
      name: 'memory',
      mimeType: 'application/vnd.google-apps.folder',
      parents: [this.backupFolderId]
    };

    const folder = await this.drive.files.create({
      resource: folderMetadata,
      fields: 'id'
    });

    this.memoryFolderId = folder.data.id;
    this.state.folders.memory = this.memoryFolderId;
    await this.saveState();
  }

  async getFileHash(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return crypto.createHash('md5').update(content).digest('hex');
    } catch (error) {
      return null;
    }
  }

  async uploadFile(localPath, fileName = null, parentFolderId = null) {
    const name = fileName || path.basename(localPath);
    const parent = parentFolderId || this.backupFolderId;
    
    console.log(`📤 Uploading ${name}...`);
    
    const content = await fs.readFile(localPath, 'utf8');
    
    const fileMetadata = {
      name: name,
      parents: [parent]
    };

    const media = {
      mimeType: 'text/markdown',
      body: content
    };

    // Check if file already exists
    const existingFileId = this.state.files[localPath];
    
    if (existingFileId) {
      // Update existing file
      const file = await this.drive.files.update({
        fileId: existingFileId,
        resource: { name: name },
        media: media,
        fields: 'id,modifiedTime,webViewLink'
      });
      
      console.log(`✅ Updated ${name}`);
      return file.data;
    } else {
      // Create new file
      const file = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,modifiedTime,webViewLink'
      });
      
      this.state.files[localPath] = file.data.id;
      await this.saveState();
      
      console.log(`✅ Created ${name}`);
      return file.data;
    }
  }

  async syncAllFiles() {
    console.log('🔄 Starting full sync...');
    
    const results = {
      uploaded: [],
      skipped: [],
      errors: []
    };

    // Sync core files
    for (const file of SYNC_FILES) {
      try {
        const hash = await this.getFileHash(file);
        if (!hash) {
          console.log(`⚠️  File not found: ${file}`);
          results.skipped.push(file);
          continue;
        }

        // Determine parent folder
        const isTasksFile = file.startsWith('tasks/');
        const parentFolder = this.backupFolderId;
        const fileName = path.basename(file);
        
        const result = await this.uploadFile(file, fileName, parentFolder);
        results.uploaded.push({ file, id: result.id, url: result.webViewLink });
        
      } catch (error) {
        console.error(`❌ Error syncing ${file}:`, error.message);
        results.errors.push({ file, error: error.message });
      }
    }

    // Sync memory files
    try {
      const memoryFiles = await fs.readdir('memory');
      const dailyFiles = memoryFiles.filter(f => MEMORY_PATTERN.test(f));
      
      for (const file of dailyFiles) {
        const fullPath = `memory/${file}`;
        try {
          const result = await this.uploadFile(fullPath, file, this.memoryFolderId);
          results.uploaded.push({ file: fullPath, id: result.id, url: result.webViewLink });
        } catch (error) {
          console.error(`❌ Error syncing ${fullPath}:`, error.message);
          results.errors.push({ file: fullPath, error: error.message });
        }
      }
    } catch (error) {
      console.error('❌ Error reading memory directory:', error.message);
    }

    return results;
  }

  async getFolderUrl() {
    if (!this.backupFolderId) {
      throw new Error('Backup folder not initialized');
    }
    
    return `https://drive.google.com/drive/folders/${this.backupFolderId}`;
  }

  async getShareableLinks() {
    const links = {
      folder: await this.getFolderUrl(),
      files: {}
    };

    for (const [localPath, fileId] of Object.entries(this.state.files)) {
      links.files[localPath] = `https://drive.google.com/file/d/${fileId}/edit`;
    }

    return links;
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  const sync = new GoogleDriveSync();
  
  try {
    await sync.initialize();
    
    switch (command) {
      case 'sync':
        const results = await sync.syncAllFiles();
        console.log('\n📊 Sync Results:');
        console.log(`✅ Uploaded: ${results.uploaded.length} files`);
        console.log(`⚠️  Skipped: ${results.skipped.length} files`);
        console.log(`❌ Errors: ${results.errors.length} files`);
        
        if (results.errors.length > 0) {
          console.log('\n❌ Errors:');
          results.errors.forEach(e => console.log(`  ${e.file}: ${e.error}`));
        }
        break;
        
      case 'url':
        const url = await sync.getFolderUrl();
        console.log('\n🔗 Google Drive Backup Folder URL:');
        console.log(url);
        break;
        
      case 'links':
        const links = await sync.getShareableLinks();
        console.log('\n🔗 Shareable Links:');
        console.log(`📁 Backup Folder: ${links.folder}`);
        console.log('\n📄 Files:');
        Object.entries(links.files).forEach(([file, url]) => {
          console.log(`  ${file}: ${url}`);
        });
        break;
        
      default:
        console.log('Usage: node scripts/google-drive-sync.js <command>');
        console.log('Commands:');
        console.log('  sync   - Upload all files to Google Drive');
        console.log('  url    - Get backup folder URL');
        console.log('  links  - Get all shareable links');
    }
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = GoogleDriveSync;