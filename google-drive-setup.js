#!/usr/bin/env node

const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

// Configuration
const CREDENTIALS_PATH = '.credentials/google-drive-credentials.json';
const TOKEN_PATH = '.credentials/google-drive-token.json';
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata'
];

async function setupGoogleDriveAuth() {
  console.log('🔑 Setting up Google Drive authentication...\n');
  
  console.log('STEP 1: Create Google Cloud Project & Enable Drive API');
  console.log('1. Go to https://console.cloud.google.com/');
  console.log('2. Create a new project or select existing one');
  console.log('3. Enable the Google Drive API');
  console.log('4. Go to "APIs & Services" > "Credentials"');
  console.log('5. Create "OAuth 2.0 Client ID" for "Desktop application"');
  console.log('6. Download the credentials JSON file');
  console.log('7. Save it as: ' + CREDENTIALS_PATH);
  console.log('\nPress Enter when ready...');
  
  await waitForEnter();
  
  try {
    // Try to load credentials
    const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH, 'utf8'));
    console.log('✅ Credentials file loaded!');
    
    // Set up OAuth2 client
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    
    // Generate auth URL
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    
    console.log('\nSTEP 2: Authorize the application');
    console.log('Open this URL in your browser:');
    console.log(authUrl);
    console.log('\nEnter the authorization code here:');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    const code = await new Promise((resolve) => {
      rl.question('Authorization code: ', resolve);
    });
    rl.close();
    
    // Exchange code for token
    const { tokens } = await oAuth2Client.getAccessToken(code);
    oAuth2Client.setCredentials(tokens);
    
    // Save token for future use
    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
    console.log('✅ Token saved to:', TOKEN_PATH);
    
    // Test the connection
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    const user = await drive.about.get({ fields: 'user' });
    console.log('✅ Authentication successful!');
    console.log('📧 Connected as:', user.data.user.emailAddress);
    
    return oAuth2Client;
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    
    if (error.code === 'ENOENT') {
      console.log('\n📝 Please ensure you have created the credentials file:');
      console.log(CREDENTIALS_PATH);
    }
    
    process.exit(1);
  }
}

function waitForEnter() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('', () => {
      rl.close();
      resolve();
    });
  });
}

if (require.main === module) {
  setupGoogleDriveAuth().catch(console.error);
}

module.exports = { setupGoogleDriveAuth, CREDENTIALS_PATH, TOKEN_PATH, SCOPES };