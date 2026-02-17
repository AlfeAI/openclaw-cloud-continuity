#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const GoogleDriveSync = require('./google-drive-sync');

// Files and directories to watch
const WATCH_FILES = [
  'MEMORY.md',
  'SOUL.md', 
  'USER.md',
  'IDENTITY.md',
  'HEARTBEAT.md',
  'tasks/pending.md'
];

const WATCH_DIRS = ['memory'];

class DriveWatcher {
  constructor() {
    this.sync = new GoogleDriveSync();
    this.watchers = new Map();
    this.uploadQueue = new Set();
    this.isProcessing = false;
  }

  async start() {
    console.log('🔄 Initializing Google Drive real-time sync...');
    
    await this.sync.initialize();
    
    console.log('👀 Starting file watchers...');
    
    // Watch individual files
    for (const file of WATCH_FILES) {
      this.watchFile(file);
    }
    
    // Watch memory directory
    for (const dir of WATCH_DIRS) {
      this.watchDirectory(dir);
    }
    
    console.log('✅ Google Drive real-time sync started');
    console.log('📁 Backup folder:', await this.sync.getFolderUrl());
    console.log('\nWatching for changes...\n');
    
    // Keep process alive
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down watchers...');
      this.stop();
      process.exit(0);
    });
  }

  watchFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return;
      }

      const watcher = fs.watch(filePath, (eventType) => {
        if (eventType === 'change') {
          this.queueUpload(filePath);
        }
      });

      this.watchers.set(filePath, watcher);
      console.log(`👀 Watching: ${filePath}`);
      
    } catch (error) {
      console.error(`❌ Failed to watch ${filePath}:`, error.message);
    }
  }

  watchDirectory(dirPath) {
    try {
      if (!fs.existsSync(dirPath)) {
        console.log(`⚠️  Directory not found: ${dirPath}`);
        return;
      }

      const watcher = fs.watch(dirPath, (eventType, filename) => {
        if (filename && (eventType === 'change' || eventType === 'rename')) {
          const fullPath = path.join(dirPath, filename);
          
          // Check if it's a memory file we care about
          if (filename.match(/^\d{4}-\d{2}-\d{2}\.md$/)) {
            // Small delay to ensure file is fully written
            setTimeout(() => {
              if (fs.existsSync(fullPath)) {
                this.queueUpload(fullPath);
              }
            }, 1000);
          }
        }
      });

      this.watchers.set(dirPath, watcher);
      console.log(`👀 Watching directory: ${dirPath}/`);
      
    } catch (error) {
      console.error(`❌ Failed to watch ${dirPath}:`, error.message);
    }
  }

  queueUpload(filePath) {
    if (this.uploadQueue.has(filePath)) {
      return; // Already queued
    }
    
    this.uploadQueue.add(filePath);
    
    // Process queue after a short delay (debounce)
    setTimeout(() => {
      this.processQueue();
    }, 2000);
  }

  async processQueue() {
    if (this.isProcessing || this.uploadQueue.size === 0) {
      return;
    }

    this.isProcessing = true;
    
    try {
      const files = Array.from(this.uploadQueue);
      this.uploadQueue.clear();
      
      for (const file of files) {
        await this.uploadFile(file);
      }
      
    } finally {
      this.isProcessing = false;
    }
  }

  async uploadFile(filePath) {
    try {
      console.log(`🔄 File changed: ${filePath}`);
      
      // Determine parent folder
      let parentFolder = null;
      let fileName = path.basename(filePath);
      
      if (filePath.startsWith('memory/')) {
        parentFolder = this.sync.memoryFolderId;
      }
      
      const result = await this.sync.uploadFile(filePath, fileName, parentFolder);
      console.log(`✅ Synced: ${filePath}`);
      
    } catch (error) {
      console.error(`❌ Failed to sync ${filePath}:`, error.message);
    }
  }

  stop() {
    for (const [path, watcher] of this.watchers) {
      watcher.close();
      console.log(`❌ Stopped watching: ${path}`);
    }
    this.watchers.clear();
  }
}

// CLI interface
if (require.main === module) {
  const watcher = new DriveWatcher();
  watcher.start().catch(console.error);
}

module.exports = DriveWatcher;