/**
 * Full Sentinel Hub API test - Catalog Search
 * Run: node test-sentinel-full.js
 */

require('dotenv').config();
const axios = require('axios');

const CLIENT_ID = process.env.SENTINEL_HUB_CLIENT_ID;
const CLIENT_SECRET = process.env.SENTINEL_HUB_CLIENT_SECRET;
const TOKEN_URL = 'https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token';
const CATALOG_URL = 'https://services.sentinel-hub.com/api/v1/catalog/search';

console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║    SENTINEL HUB FULL API TEST                       ║');
console.log('╚════════════════════════════════════════════════════╝\n');

// Test location: Valmiki Nagar Forest, Bihar (2km area)
const latitude = 25.65;
const longitude = 84.12;
const sizeKm = 2;
const degreesPerKm = 0.009;
const halfSizeDegrees = (sizeKm / 2) * degreesPerKm;

const bbox = {
  west: longitude - halfSizeDegrees,
  south: latitude - halfSizeDegrees,
  east: longitude + halfSizeDegrees,
  north: latitude + halfSizeDegrees,
};

const startDate = new Date();
startDate.setDate(startDate.getDate() - 7);
const endDate = new Date();

console.log(`Test Location: Valmiki Nagar Forest, Bihar`);
console.log(`Coordinates: ${latitude}, ${longitude}`);
console.log(`Area: ${sizeKm}km × ${sizeKm}km`);
console.log(`BBox: [${bbox.west.toFixed(4)}, ${bbox.south.toFixed(4)}, ${bbox.east.toFixed(4)}, ${bbox.north.toFixed(4)}]`);
console.log(`Date Range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}\n`);

async function testFullAPI() {
  try {
    // Step 1: Get token
    console.log('[1/2] Getting OAuth2 token...');
    const tokenResponse = await axios.post(TOKEN_URL, 
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000,
      }
    );

    const token = tokenResponse.data.access_token;
    console.log('✅ Token received\n');

    // Step 2: Search catalog
    console.log('[2/2] Searching Sentinel Hub catalog...');
    const catalogResponse = await axios.post(CATALOG_URL, {
      bbox: [bbox.west, bbox.south, bbox.east, bbox.north],
      datetime: `${startDate.toISOString().split('T')[0]}T00:00:00Z/${endDate.toISOString().split('T')[0]}T23:59:59Z`,
      collections: ['sentinel-2-l2a'],
      limit: 10,
    }, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const featuresCount = catalogResponse.data?.features?.length || 0;
    
    console.log('✅ Catalog search successful\n');
    console.log(`Features found: ${featuresCount}`);
    
    if (featuresCount > 0) {
      const firstFeature = catalogResponse.data.features[0];
      console.log(`\nFirst imagery details:`);
      console.log(`  - DateTime: ${firstFeature.properties?.datetime || 'N/A'}`);
      console.log(`  - Cloud Cover: ${firstFeature.properties?.['eo:cloud_cover'] || 'N/A'}%`);
      console.log(`  - Platform: ${firstFeature.properties?.platform || 'N/A'}`);
    }

    console.log('\n════════════════════════════════════════════════════');
    console.log('✅ SENTINEL HUB IS FULLY OPERATIONAL!');
    console.log('════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ FAILED\n');
    console.error(`Error: ${error.message}`);
    
    if (error.response) {
      console.error(`HTTP Status: ${error.response.status}`);
      console.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    console.log('\n════════════════════════════════════════════════════');
    console.log('⚠️  Sentinel Hub API call failed');
    console.log('════════════════════════════════════════════════════\n');
    
    process.exit(1);
  }
}

testFullAPI();
