#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// Test configuration
const REQUIRED_FILES = [
  'MEMORY.md',
  'SOUL.md', 
  'USER.md',
  'IDENTITY.md',
  'HEARTBEAT.md',
  'tasks/pending.md'
];

const REQUIRED_SCRIPTS = [
  'scripts/google-drive-setup.js',
  'scripts/google-drive-sync.js',
  'scripts/google-drive-watch.js',
  'scripts/setup-google-drive.sh'
];

async function testSetup() {
  console.log('🧪 Testing Google Drive sync setup...\n');
  
  let allGood = true;
  
  // Test 1: Check required files exist
  console.log('📁 Checking source files...');
  for (const file of REQUIRED_FILES) {
    try {
      await fs.access(file);
      console.log(`✅ ${file}`);
    } catch (error) {
      console.log(`❌ ${file} - FILE NOT FOUND`);
      allGood = false;
    }
  }
  
  // Test 2: Check scripts exist and are executable
  console.log('\n🔧 Checking scripts...');
  for (const script of REQUIRED_SCRIPTS) {
    try {
      const stats = await fs.stat(script);
      const isExecutable = !!(stats.mode & parseInt('111', 8));
      if (isExecutable) {
        console.log(`✅ ${script}`);
      } else {
        console.log(`⚠️  ${script} - NOT EXECUTABLE`);
      }
    } catch (error) {
      console.log(`❌ ${script} - FILE NOT FOUND`);
      allGood = false;
    }
  }
  
  // Test 3: Check memory directory
  console.log('\n📅 Checking memory directory...');
  try {
    const memoryFiles = await fs.readdir('memory');
    const dailyFiles = memoryFiles.filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f));
    console.log(`✅ memory/ directory exists with ${dailyFiles.length} daily files`);
    
    // Show recent files
    if (dailyFiles.length > 0) {
      const recent = dailyFiles.sort().slice(-3);
      console.log(`   Recent files: ${recent.join(', ')}`);
    }
  } catch (error) {
    console.log('❌ memory/ directory not found');
    allGood = false;
  }
  
  // Test 4: Check package.json dependencies
  console.log('\n📦 Checking dependencies...');
  try {
    const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'));
    const deps = pkg.dependencies || {};
    
    const requiredDeps = ['googleapis', 'google-auth-library'];
    for (const dep of requiredDeps) {
      if (deps[dep]) {
        console.log(`✅ ${dep}: ${deps[dep]}`);
      } else {
        console.log(`❌ ${dep} - NOT INSTALLED`);
        allGood = false;
      }
    }
  } catch (error) {
    console.log('❌ Could not read package.json');
    allGood = false;
  }
  
  // Test 5: Check credentials setup
  console.log('\n🔑 Checking credentials...');
  const credFiles = [
    '.credentials/google-drive-credentials.json',
    '.credentials/google-drive-token.json'
  ];
  
  for (const credFile of credFiles) {
    try {
      await fs.access(credFile);
      console.log(`✅ ${credFile}`);
    } catch (error) {
      console.log(`⚠️  ${credFile} - NOT FOUND (run setup first)`);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (allGood) {
    console.log('✅ All required files and scripts are ready!');
    console.log('\n🚀 Next steps:');
    console.log('1. Run: ./scripts/setup-google-drive.sh');
    console.log('2. Follow the authentication prompts');
    console.log('3. Share the Google Drive URL with Kevin');
    console.log('4. Start real-time sync: node scripts/google-drive-watch.js');
  } else {
    console.log('❌ Some issues found. Please fix the missing files above.');
    console.log('\n🔧 Common fixes:');
    console.log('- Make sure you\'re in the workspace directory');
    console.log('- Run: npm install');
    console.log('- Check that all source files exist');
  }
  
  console.log('\n📖 Documentation: GOOGLE-DRIVE-SYNC.md');
}

if (require.main === module) {
  testSetup().catch(console.error);
}

module.exports = { testSetup };