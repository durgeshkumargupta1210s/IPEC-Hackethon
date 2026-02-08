const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testDataDrivenCalculation() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║    TESTING DATA-DRIVEN VEGETATION LOSS CALCULATION  ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  try {
    // Multiple regions with different vegetation profiles
    const regions = [
      { name: '🌴 Amazon Rainforest, Brazil', lat: -3, lon: -60, expected: 'Low loss (healthy forest)' },
      { name: '🏜️ Sahara Desert, Egypt', lat: 24, lon: 30, expected: 'High loss (sparse vegetation)' },
      { name: '🌾 Midwest Farm, USA', lat: 41.5, lon: -93.5, expected: 'Medium loss (agricultural)' },
    ];

    for (const region of regions) {
      console.log(`\n${'='.repeat(55)}`);
      console.log(`Testing: ${region.name}`);
      console.log(`Expected: ${region.expected}`);
      console.log(`${'='.repeat(55)}`);

      const payload = {
        latitude: region.lat,
        longitude: region.lon,
        sizeKm: 10,
        name: region.name
      };

      try {
        const response = await axios.post(`${API_BASE}/analysis/analyze`, payload, {
          timeout: 30000
        });

        const result = response.data.analysis;
        console.log(`\n✅ ANALYSIS RESULTS:`);
        console.log(`   Region: ${result.regionName}`);
        console.log(`   NDVI Mean: ${result.ndvi.mean.toFixed(4)}`);
        console.log(`   NDVI Range: ${result.ndvi.min.toFixed(4)} to ${result.ndvi.max.toFixed(4)}`);
        console.log(`   Vegetation Loss: ${result.vegetationLossPercentage}%`);
        console.log(`   Area Affected: ${result.areaAffected} km²`);
        console.log(`   Risk Level: ${result.riskClassification.riskLevel}`);
        console.log(`   Data Source: ${result.satelliteData.dataSource}`);
        
        // Check if loss is data-driven or hardcoded
        const loss = result.vegetationLossPercentage;
        if (loss === 50 || loss === 5 || loss === 80) {
          console.log(`   ⚠️  ALERT: Loss appears HARDCODED (${loss}%)`);
        } else {
          console.log(`   ✅ GOOD: Loss appears CALCULATED (${loss}%)`);
        }
        
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
      }

      console.log('\n');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between requests
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

testDataDrivenCalculation();
