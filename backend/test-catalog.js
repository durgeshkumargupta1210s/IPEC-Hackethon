const axios = require('axios');

async function testCatalogAPI() {
  try {
    console.log('Testing Sentinel Hub Catalog API...\n');
    
    // First get token
    console.log('1️⃣ Requesting OAuth token...');
    const tokenRes = await axios.post('https://services.sentinel-hub.com/oauth/token', 
      'grant_type=client_credentials&client_id=93c64bb2-9165-4e49-8db1-a01652bf26b5&client_secret=S1J56EhAW7FCADIRaZ6nLFUvKT8D3VZv',
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 5000 }
    );
    
    const token = tokenRes.data.access_token;
    console.log('✅ OAuth Token obtained\n');
    
    // Test catalog search
    console.log('2️⃣ Searching Sentinel-2 Catalog...');
    const catalogRes = await axios.post('https://services.sentinel-hub.com/api/v1/catalog/search',
      {
        bbox: [0, 15, 10, 25], // Sahara region
        datetime: '2024-02-01T00:00:00Z/2024-02-08T23:59:59Z',
        collections: ['sentinel-2-l2a'],
        limit: 10
      },
      {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log('✅ Catalog API Success!');
    console.log('📊 Results:');
    console.log('   Features found:', catalogRes.data.features?.length);
    
    if(catalogRes.data.features?.length > 0) {
      const f = catalogRes.data.features[0];
      console.log('\n📅 First Result:');
      console.log('   Date:', f.properties?.datetime);
      console.log('   Cloud Cover:', f.properties?.['eo:cloud_cover'] + '%');
      console.log('   Platform:', f.properties?.platform);
      console.log('   ID:', f.id);
    } else {
      console.log('⚠️  No imagery found for this date/location');
    }
    
  } catch (err) {
    console.log('\n❌ ERROR OCCURRED:\n');
    console.log('Status Code:', err.response?.status);
    console.log('Error Message:', err.message);
    
    if(err.response?.data) {
      console.log('\nAPI Response:');
      console.log(JSON.stringify(err.response.data, null, 2));
    }
    
    console.log('\n🔍 DIAGNOSIS:');
    if(err.response?.status === 401) {
      console.log('❌ 401 Authentication Failed');
      console.log('   Reason: Invalid/Expired OAuth credentials');
      console.log('   Solution: Verify SENTINEL_HUB_CLIENT_ID and CLIENT_SECRET');
    } else if(err.response?.status === 400) {
      console.log('❌ 400 Bad Request');
      console.log('   Reason: Invalid bbox, datetime, or collection name');
      console.log('   Solution: Check bbox coordinates and date format');
    } else if(err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      console.log('❌ Network Connection Failed');
      console.log('   Reason: Cannot reach sentinel-hub.com');
      console.log('   Solution: Check internet connectivity');
    } else {
      console.log('❌ Unexpected Error');
      console.log('   Message:', err.message);
    }
  }
}

testCatalogAPI();
