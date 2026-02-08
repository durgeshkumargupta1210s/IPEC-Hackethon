/**
 * Test Full System - Real Data Pipeline
 * Simulates frontend analysis request through backend to verify real data usage
 */

const axios = require('axios');

async function testFullPipeline() {
  try {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║  Testing Full Real Data Pipeline                   ║');
    console.log('║  Frontend → Backend → Processing API → ML Models   ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    // Test with Amazon Rainforest coordinates from your UI
    const testRegion = {
      name: '🌴 Amazon Rainforest, Brazil',
      latitude: -3,
      longitude: -60,
      sizeKm: 10
    };

    console.log('📍 Test Region:', testRegion.name);
    console.log(`   Coordinates: (${testRegion.latitude}, ${testRegion.longitude})`);
    console.log(`   Size: ${testRegion.sizeKm}km × ${testRegion.sizeKm}km\n`);

    console.log('🚀 Starting Analysis...\n');
    const startTime = Date.now();

    // Call backend analysis endpoint
    const response = await axios.post('http://localhost:3000/api/analysis/analyze', {
      latitude: testRegion.latitude,
      longitude: testRegion.longitude,
      name: testRegion.name,
      sizeKm: testRegion.sizeKm
    }, { timeout: 60000 });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('✅ Backend Response Received!\n');
    console.log(`📊 Analysis Results (${duration}s):`);
    console.log('═══════════════════════════════════════════════════════\n');

    const result = response.data;
    
    // Debug: Log full response
    console.log('Full Response:');
    console.log(JSON.stringify(result, null, 2).substring(0, 1000));
    console.log('\n═══════════════════════════════════════════════════════\n');

    // Check data source
    if (result.dataSource) {
      console.log(`📡 Data Source: ${result.dataSource}`);
    }

    // Check NDVI results
    if (result.ndvi) {
      console.log('\n🟢 NDVI Analysis:');
      console.log(`  Mean NDVI: ${result.ndvi.statistics?.mean?.toFixed(4) || 'N/A'}`);
      console.log(`  Min: ${result.ndvi.statistics?.min?.toFixed(4) || 'N/A'}`);
      console.log(`  Max: ${result.ndvi.statistics?.max?.toFixed(4) || 'N/A'}`);
      console.log(`  Valid Pixels: ${result.ndvi.statistics?.validPixels || 'N/A'}`);
    }

    // Check vegetation loss
    if (result.vegetationLossPercentage !== undefined) {
      console.log(`\n🌱 Vegetation Loss: ${result.vegetationLossPercentage.toFixed(2)}%`);
    }

    // Check area affected
    if (result.areaAffected !== undefined) {
      console.log(`📏 Area Affected: ${result.areaAffected.toFixed(2)} km²`);
    }

    // Check risk classification
    if (result.riskClassification) {
      console.log(`\n⚠️  Risk Level: ${result.riskClassification.riskLevel || 'Unknown'}`);
      console.log(`   Risk Score: ${result.riskClassification.riskScore?.toFixed(2) || 'N/A'}`);
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ Full data pipeline test completed!');
    
    // Determine if using real data
    console.log('\n🔍 Data Quality Check:');
    const meanNDVI = result.ndvi?.statistics?.mean || 0;
    
    if (meanNDVI > 0.4 && meanNDVI < 0.8) {
      console.log('✅ NDVI values look realistic for vegetation analysis');
      console.log('✅ Likely using REAL Sentinel-2 satellite data');
    } else if (meanNDVI === 0 || result.vegetationLossPercentage === 50 || result.vegetationLossPercentage === 100) {
      console.log('⚠️  Values appear synthetic or region-aware fallback');
      console.log('⚠️  May be using dummy data (Processing API failed)');
    } else {
      console.log('✅ Values appear realistic');
    }

  } catch (error) {
    console.log('❌ ERROR:\n');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.message);
    
    if (error.response?.data) {
      console.log('\nBackend Error:');
      console.log(JSON.stringify(error.response.data, null, 2).substring(0, 500));
    }

    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if backend is running: netstat -ano | findstr :3000');
    console.log('2. Check backend logs for errors');
    console.log('3. Verify Sentinel Hub credentials in .env');
  }
}

testFullPipeline();
