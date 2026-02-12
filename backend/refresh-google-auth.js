import { google } from 'googleapis';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your OAuth2 credentials from .env
const CLIENT_ID = '5743098001-p63elpe9thbkdfl99q6tag17g9t7co1i.apps.googleusercontent.com';
const CLIENT_SECRET = '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'; // Get from your .env
const REDIRECT_URI = 'http://localhost:5000/api/oauth/google/callback';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Scopes required for Google Calendar and Meet
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

console.log('\n🔐 Google OAuth Re-authentication Tool\n');
console.log('This will generate new access and refresh tokens for Google Meet.\n');

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent' // Force consent screen to get new refresh token
});

console.log('📋 Step 1: Authorize this app by visiting this URL:\n');
console.log(authUrl);
console.log('\n📝 Step 2: After authorizing, you\'ll be redirected to a URL.');
console.log('Copy the ENTIRE redirect URL and paste it here.\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Paste the redirect URL here: ', async (redirectUrl) => {
  try {
    // Extract code from URL
    const url = new URL(redirectUrl);
    const code = url.searchParams.get('code');
    
    if (!code) {
      console.error('❌ No authorization code found in URL');
      rl.close();
      return;
    }
    
    console.log('\n🔄 Exchanging authorization code for tokens...');
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('\n✅ Tokens received successfully!\n');
    console.log('📝 Add these to your backend/.env file:\n');
    console.log(`GOOGLE_ACCESS_TOKEN=${tokens.access_token}`);
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    
    // Optionally auto-update .env file
    console.log('\n💾 Would you like to automatically update your .env file? (y/n)');
    
    rl.question('> ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        try {
          const envPath = path.join(__dirname, '.env');
          let envContent = fs.readFileSync(envPath, 'utf8');
          
          // Update or add tokens
          if (envContent.includes('GOOGLE_ACCESS_TOKEN=')) {
            envContent = envContent.replace(/GOOGLE_ACCESS_TOKEN=.*/g, `GOOGLE_ACCESS_TOKEN=${tokens.access_token}`);
          } else {
            envContent += `\nGOOGLE_ACCESS_TOKEN=${tokens.access_token}`;
          }
          
          if (envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
            envContent = envContent.replace(/GOOGLE_REFRESH_TOKEN=.*/g, `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
          } else {
            envContent += `\nGOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`;
          }
          
          fs.writeFileSync(envPath, envContent);
          console.log('\n✅ .env file updated successfully!');
          console.log('🔄 Restart your backend server to use the new tokens.');
        } catch (err) {
          console.error('\n❌ Error updating .env file:', err.message);
          console.log('Please manually add the tokens above to your .env file.');
        }
      } else {
        console.log('\n📝 Please manually add the tokens above to your .env file.');
      }
      
      rl.close();
    });
    
  } catch (error) {
    console.error('\n❌ Error getting tokens:', error.message);
    rl.close();
  }
});
