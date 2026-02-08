/**
 * Sentinel Hub OAuth2 Token Service
 * Generates access tokens using OAuth2 client credentials flow
 */

const axios = require('axios');

// OAuth2 Credentials
const SENTINEL_HUB_CLIENT_ID = process.env.SENTINEL_HUB_CLIENT_ID || '93c64bb2-9165-4e49-8db1-a01652bf26b5';
const SENTINEL_HUB_CLIENT_SECRET = process.env.SENTINEL_HUB_CLIENT_SECRET || 'S1J56EhAW7FCADIRaZ6nLFUvKT8D3VZv';
const TOKEN_URL = 'https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token';

// Token cache
let cachedToken = null;
let tokenExpiry = null;

/**
 * Generate OAuth2 access token
 * Token expires in 60 minutes
 */
async function generateAccessToken() {
  try {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║      SENTINEL HUB OAUTH2 TOKEN GENERATION           ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log(`[OAuth2] 🔐 Requesting new access token...`);
    console.log(`[OAuth2] 📍 Endpoint: ${TOKEN_URL}`);
    console.log(`[OAuth2] 🆔 Client ID: ${SENTINEL_HUB_CLIENT_ID.substring(0, 8)}...`);
    
    const response = await axios.post(TOKEN_URL, 
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: SENTINEL_HUB_CLIENT_ID,
        client_secret: SENTINEL_HUB_CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    );

    const token = response.data.access_token;
    const expiresIn = response.data.expires_in || 3600; // 60 minutes default

    // Cache token and set expiry (refresh 5 minutes before actual expiry)
    cachedToken = token;
    tokenExpiry = Date.now() + (expiresIn * 1000) - (5 * 60 * 1000);

    console.log(`[OAuth2] ✅ Token generated successfully!`);
    console.log(`[OAuth2] ⏱️  Token expires in: ${expiresIn}s (~${(expiresIn / 60).toFixed(0)} minutes)`);
    console.log(`[OAuth2] 🎯 Token preview: ${token.substring(0, 20)}...`);
    console.log('');
    return token;
  } catch (error) {
    console.error('╔════════════════════════════════════════════════════╗');
    console.error('║      ❌ OAUTH2 TOKEN GENERATION FAILED               ║');
    console.error('╚════════════════════════════════════════════════════╝');
    console.error(`[OAuth2] Error: ${error.message}`);
    if (error.response) {
      console.error(`[OAuth2] HTTP Status: ${error.response.status}`);
      console.error(`[OAuth2] Response Data:`, JSON.stringify(error.response.data).substring(0, 300));
    }
    console.error('[OAuth2] Please verify:');
    console.error('  1. SENTINEL_HUB_CLIENT_ID is correct');
    console.error('  2. SENTINEL_HUB_CLIENT_SECRET is correct');
    console.error('  3. Network access to sentinel-hub.com');
  }
}

/**
 * Get valid access token (use cached if still valid)
 */
async function getAccessToken() {
  // Check if token is still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('[OAuth2] Using cached token');
    return cachedToken;
  }

  // Generate new token
  return await generateAccessToken();
}

module.exports = {
  generateAccessToken,
  getAccessToken,
};
