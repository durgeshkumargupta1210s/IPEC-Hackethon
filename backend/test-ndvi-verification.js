const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testRealData() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║    TESTING REAL SENTINEL-2 DATA PROCESSING (v2)   ║');
  console.log('║    Amazon Rainforest - Expected NDVI: 0.6-0.8     ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  try {
    // Test with Amazon Rainforest coordinates
    const analyzePayload = {
      latitude: -3,
      longitude: -60,
      sizeKm: 10,
      name: '🌴 Amazon Rainforest, Brazil'
    };

    console.log('[Test] 📍 Request Parameters:');
    console.log(`  Location: (${analyzePayload.latitude}, ${analyzePayload.longitude})`);
    console.log(`  Area: ${analyzePayload.sizeKm}km × ${analyzePayload.sizeKm}km\n`);

    console.log('[Test] 🚀 Sending analysis request...');
    console.log(`[Test] 📡 Endpoint: POST ${API_BASE}/analysis/analyze\n`);

    const startTime = Date.now();
    const response = await axios.post(`${API_BASE}/analysis/analyze`, analyzePayload, {
      timeout: 30000
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('[Test] ✅ Response received!\n');

    const result = response.data.analysis;

    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║              NDVI ANALYSIS RESULTS                 ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    console.log('[Results] Region:', result.regionName);
    console.log('[Results] Execution Time:', result.executionTime);
    console.log('[Results] Data Source:', result.satelliteData.dataSource);
    console.log('[Results] Fallback Used:', result.satelliteData.fallbackUsed);
    console.log('[Results] ML API Status:', result.satelliteData.mlApiStatus);

    console.log('\n[NDVI Stats]');
    console.log('  Mean:', result.ndvi.mean.toFixed(4));
    console.log('  Min:', result.ndvi.min.toFixed(4));
    console.log('  Max:', result.ndvi.max.toFixed(4));
    console.log('  StdDev:', result.ndvi.stdDev.toFixed(4));
    console.log('  Valid Pixels:', result.ndvi.validPixels);

    console.log('\n[Classification]');
    console.log('  Risk Level:', result.riskClassification.riskLevel);
    console.log('  Risk Score:', result.riskClassification.riskScore);

    console.log('\n[Area Analysis]');
    console.log('  Vegetation Loss:', result.vegetationLossPercentage + '%');
    console.log('  Area Affected:', result.areaAffected + ' km²');
    console.log('  Confidence Score:', (result.confidenceScore * 100).toFixed(1) + '%');

    // Analyze data quality
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║            DATA QUALITY ASSESSMENT                 ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    const ndviMean = result.ndvi.mean;
    const isRealRainforest = ndviMean >= 0.5;  // Real rainforest > 0.5
    const isDegraded = ndviMean >= 0.2 && ndviMean < 0.5;  // Degraded/mixed
    const isSynthetic = ndviMean < 0.2;  // Too low, likely synthetic

    if (isRealRainforest) {
      console.log('✅ REAL SENTINEL-2 DATA DETECTED');
      console.log('   NDVI 0.5-0.8+: Healthy vegetation detected');
      console.log('   Amazon Rainforest characteristics confirmed');
    } else if (isDegraded) {
      console.log('⚠️  POSSIBLE REAL DATA (Degraded area)');
      console.log('   NDVI 0.2-0.5: Mixed vegetation or partial cloud cover');
      console.log('   Could be real data from cloudy/sparse area');
    } else if (isSynthetic) {
      console.log('❌ LIKELY SYNTHETIC DATA or PROCESSING API FAILED');
      console.log('   NDVI < 0.2: Too low for healthy vegetation');
      console.log('   May indicate Processing API failure with fallback');
    }

    console.log(`\nFinal NDVI Mean: ${ndviMean.toFixed(4)}`);
    console.log(`Total Execution: ${duration}s\n`);

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testRealData();
