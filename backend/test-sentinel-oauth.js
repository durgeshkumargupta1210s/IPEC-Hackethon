/**
 * Quick test to verify Sentinel Hub OAuth2 credentials
 * Run: node test-sentinel-oauth.js
 */

require('dotenv').config();
const axios = require('axios');

const CLIENT_ID = process.env.SENTINEL_HUB_CLIENT_ID;
const CLIENT_SECRET = process.env.SENTINEL_HUB_CLIENT_SECRET;
const TOKEN_URL = 'https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token';

console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║    SENTINEL HUB OAUTH2 CREDENTIALS TEST             ║');
console.log('╚════════════════════════════════════════════════════╝\n');

console.log(`CLIENT_ID: ${CLIENT_ID ? '✓ LOADED' : '✗ MISSING'}`);
console.log(`CLIENT_SECRET: ${CLIENT_SECRET ? '✓ LOADED' : '✗ MISSING'}`);
console.log(`TOKEN_URL: ${TOKEN_URL}\n`);

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ ERROR: Credentials missing in .env file');
  process.exit(1);
}

async function testOAuth() {
  try {
    console.log('[TEST] Attempting OAuth2 token generation...\n');
    
    const response = await axios.post(TOKEN_URL, 
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    );

    const token = response.data.access_token;
    const expiresIn = response.data.expires_in || 3600;

    console.log('✅ SUCCESS: OAuth2 token generated!\n');
    console.log(`Token (first 50 chars): ${token.substring(0, 50)}...`);
    console.log(`Expires in: ${expiresIn} seconds (${(expiresIn / 60).toFixed(1)} minutes)`);
    console.log(`Response status: ${response.status}\n`);
    
    console.log('════════════════════════════════════════════════════');
    console.log('✅ Your Sentinel Hub credentials are VALID!');
    console.log('════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ FAILED: Could not generate token\n');
    console.error(`Error: ${error.message}`);
    
    if (error.response) {
      console.error(`HTTP Status: ${error.response.status}`);
      console.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    console.log('\n════════════════════════════════════════════════════');
    console.log('⚠️  Your Sentinel Hub credentials may be INVALID');
    console.log('════════════════════════════════════════════════════\n');
    
    process.exit(1);
  }
}

testOAuth();
