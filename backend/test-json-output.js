/**
 * Test analysis with full JSON output
 */

require('dotenv').config();
const { performAnalysis } = require('./src/services/analysisService');

const testRegion = {
  name: 'Test Forest (2km)',
  latitude: 25.65,
  longitude: 84.12,
  sizeKm: 2,
};

console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║    FULL ANALYSIS WITH JSON OUTPUT                   ║');
console.log('╚════════════════════════════════════════════════════╝\n');

async function runTest() {
  try {
    const result = await performAnalysis(testRegion);
    
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║    COMPLETE ANALYSIS RESPONSE (JSON)                ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
    
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║    KEY METRICS SUMMARY                              ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
    
    console.log(`✅ Success: ${result.success}`);
    console.log(`📊 Region: ${result.regionName}`);
    console.log(`⏱️  Execution: ${result.executionTime}`);
    console.log(`\n🌱 NDVI Analysis:`);
    console.log(`   Mean: ${result.ndvi?.statistics?.mean?.toFixed(4)}`);
    console.log(`   Min: ${result.ndvi?.statistics?.min?.toFixed(4)}`);
    console.log(`   Max: ${result.ndvi?.statistics?.max?.toFixed(4)}`);
    console.log(`   Std Dev: ${result.ndvi?.statistics?.stdDev?.toFixed(4)}`);
    console.log(`\n⚠️  Risk Assessment:`);
    console.log(`   Risk Level: ${result.riskClassification?.riskLevel}`);
    console.log(`   Risk Score: ${result.riskClassification?.riskScore?.toFixed(2)}`);
    console.log(`   Vegetation Loss: ${result.vegetationLossPercentage?.toFixed(2)}%`);
    console.log(`   Area Affected: ${result.areaAffected?.toFixed(2)} km²`);
    console.log(`   Confidence: ${result.confidenceScore?.toFixed(2)}`);
    console.log(`\n📡 Data Source: ${result.satelliteData?.dataSource}`);
    console.log(`   Fallback Used: ${result.satelliteData?.fallbackUsed}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runTest();
