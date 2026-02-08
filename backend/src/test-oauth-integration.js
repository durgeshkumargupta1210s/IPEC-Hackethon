/**
 * OAuth2 and Sentinel Hub Process API Integration Test
 * Tests the complete flow: OAuth token generation -> Process API call
 */

const axios = require('axios');
require('dotenv').config();

// OAuth2 Configuration
const CLIENT_ID = process.env.SENTINEL_HUB_CLIENT_ID || '93c64bb2-9165-4e49-8db1-a01652bf26b5';
const CLIENT_SECRET = process.env.SENTINEL_HUB_CLIENT_SECRET || 'S1J56EhAW7FCADIRaZ6nLFUvKT8D3VZv';
const TOKEN_URL = 'https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token';
const PROCESS_API_URL = 'https://services.sentinel-hub.com/api/v1/process';

/**
 * Step 1: Generate OAuth2 access token
 */
async function generateToken() {
  console.log('📋 Step 1: Requesting OAuth2 access token...\n');
  
  try {
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
    const expiresIn = response.data.expires_in;

    console.log('✅ Token Generated Successfully!');
    console.log(`   Token: ${token.substring(0, 50)}...`);
    console.log(`   Expires in: ${expiresIn} seconds (${(expiresIn / 60).toFixed(1)} minutes)\n`);

    return token;
  } catch (error) {
    console.error('❌ Token generation failed:', error.message);
    if (error.response?.data) {
      console.error('   Error details:', error.response.data);
    }
    throw error;
  }
}

/**
 * Step 2: Call Process API with token
 */
async function fetchProcessedImagery(token, latitude, longitude) {
  console.log('📋 Step 2: Calling Sentinel Hub Process API...\n');
  
  const degreesPerKm = 0.009;
  const sizeKm = 10;
  const halfSizeDegrees = (sizeKm / 2) * degreesPerKm;

  const bbox = [
    longitude - halfSizeDegrees,
    latitude - halfSizeDegrees,
    longitude + halfSizeDegrees,
    latitude + halfSizeDegrees,
  ];

  const evalscript = `
    //VERSION=3
    function setup() {
      return {
        input: ["B02", "B03", "B04", "B08"],
        output: { bands: 4 }
      };
    }

    function evaluatePixel(sample) {
      return [sample.B02, sample.B03, sample.B04, sample.B08];
    }
  `;

  const payload = {
    input: {
      bounds: {
        bbox: bbox,
        properties: [{ name: "datetime", value: "2024-01-15" }]
      },
      data: [{
        type: "sentinel-2-l2a",
        dataFilter: {
          timeRange: {
            from: "2024-01-01T00:00:00Z",
            to: "2024-01-31T23:59:59Z"
          }
        }
      }]
    },
    output: {
      width: 256,
      height: 256,
      responses: [{
        identifier: "default",
        format: { type: "image/tiff" }
      }]
    },
    evalscript: evalscript
  };

  try {
    console.log(`   Coordinates: (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
    console.log(`   BBox: [${bbox.map(v => v.toFixed(4)).join(', ')}]`);
    console.log(`   Time Range: 2024-01-01 to 2024-01-31`);
    console.log(`   Output: 256x256 TIFF\n`);

    const response = await axios.post(PROCESS_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000,
      maxRedirects: 5,
    });

    console.log('✅ Process API Call Successful!');
    console.log(`   Status: ${response.status}`);
    console.log(`   Data received: ${response.data ? response.data.length : 0} bytes`);
    console.log(`   Content-Type: ${response.headers['content-type']}\n`);

    return response.data;
  } catch (error) {
    console.error('❌ Process API call failed:', error.message);
    if (error.response?.data) {
      console.error('   Status:', error.response.status);
      console.error('   Error details:', error.response.data.toString().substring(0, 500));
    }
    throw error;
  }
}

/**
 * Main test function
 */
async function runIntegrationTest() {
  console.log('🚀 Sentinel Hub OAuth2 + Process API Integration Test\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Step 1: Get token
    const token = await generateToken();

    // Step 2: Call Process API
    const result = await fetchProcessedImagery(token, 40.7128, -74.0060); // NYC coordinates

    console.log('✅ Integration Test Passed!\n');
    console.log('Next steps:');
    console.log('  1. Deploy to backend');
    console.log('  2. Update satelliteService.js to use fetchProcessedImagery()');
    console.log('  3. Process TIFF output through ML pipeline');
    console.log('  4. Integrate with NDVI/NDBI analysis\n');

    return { success: true, token, result };
  } catch (error) {
    console.error('\n❌ Integration Test Failed!');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  runIntegrationTest().then(result => {
    console.log('Test completed');
    process.exit(0);
  });
}

module.exports = {
  generateToken,
  fetchProcessedImagery,
  runIntegrationTest,
};
