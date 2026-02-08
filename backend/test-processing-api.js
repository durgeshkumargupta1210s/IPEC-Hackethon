const axios = require('axios');

async function testProcessingAPI() {
  try {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║      Testing Sentinel Hub Processing API           ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
    
    // Step 1: Get OAuth token
    console.log('1️⃣ Requesting OAuth token...');
    const tokenRes = await axios.post('https://services.sentinel-hub.com/oauth/token', 
      'grant_type=client_credentials&client_id=93c64bb2-9165-4e49-8db1-a01652bf26b5&client_secret=S1J56EhAW7FCADIRaZ6nLFUvKT8D3VZv',
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15000 }
    );
    
    const token = tokenRes.data.access_token;
    console.log('✅ Token obtained\n');
    
    // Step 2: Request Processing API
    console.log('2️⃣ Testing Processing API with real data...');
    
    const bbox = [15, 35, 15.5, 35.5]; // Very small Sahara region (~50km x 50km)
    const evalscript = `
      //VERSION=3
      function setup() {
        return {
          input: ["B02", "B03", "B04", "B08"],
          output: { bands: 4, sampleType: "FLOAT32" }
        };
      }
      function evaluatePixel(sample) {
        return [sample.B02, sample.B03, sample.B04, sample.B08];
      }
    `;

    const payload = {
      input: {
        bounds: {
          bbox: bbox
        },
        data: [{
          type: "sentinel-2-l2a",
          dataFilter: {
            timeRange: {
              from: "2024-02-01T00:00:00Z",
              to: "2024-02-08T23:59:59Z"
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

    console.log('📍 BBOX:', bbox, '(~50km x 50km)');
    console.log('📅 Date: 2024-02-01 to 2024-02-08');
    console.log('📐 Resolution: 256x256 pixels (~195m per pixel)\n');

    const startTime = Date.now();
    const response = await axios.post(
      'https://services.sentinel-hub.com/api/v1/process',
      payload,
      {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          'Accept': 'image/tiff'
        },
        responseType: 'arraybuffer',
        timeout: 30000
      }
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const dataSize = (response.data.byteLength / 1024 / 1024).toFixed(2);

    console.log('✅ Processing API SUCCESS!\n');
    console.log('📊 Real Data Retrieved:');
    console.log(`   ✓ Data Size: ${dataSize} MB`);
    console.log(`   ✓ Response Time: ${duration}s`);
    console.log(`   ✓ Status Code: ${response.status}`);
    console.log(`   ✓ Content-Type: ${response.headers['content-type']}`);
    console.log('\n🎯 Your system IS NOW WORKING ON REAL SENTINEL-2 DATA!');
    console.log('   → Use this Processing API in your application');
    console.log('   → Fallback to region-aware dummy data if it fails\n');

  } catch (err) {
    console.log('❌ ERROR:\n');
    console.log('Status:', err.response?.status);
    console.log('Message:', err.message);
    
    if(err.response?.data) {
      console.log('Response:', err.response.data.toString('utf8').substring(0, 500));
    }
    
    console.log('\n🔍 Diagnosis:');
    if(err.response?.status === 503) {
      console.log('⚠️  Sentinel Hub is temporarily unavailable');
      console.log('   → Will use region-aware fallback data');
      console.log('   → Try again in a few minutes');
    } else if(err.response?.status === 401) {
      console.log('❌ Authentication failed');
      console.log('   → Check credentials');
    } else {
      console.log('⚠️  API request failed:', err.message);
    }
  }
}

testProcessingAPI();
