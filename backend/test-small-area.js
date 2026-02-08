// Direct test with small area

const { performAnalysis } = require('./src/services/analysisService');

async function testSmallArea() {
  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║  Testing with SMALL 2KM AREA (Amazon)  ║');
  console.log('╚═══════════════════════════════════════╝\n');

  const region = {
    name: 'Amazon Test (2km)',
    latitude: -3.4653,
    longitude: -62.2159,
    sizeKm: 2,
  };

  console.log('Test Region:', region);
  console.log('\nCalling performAnalysis...\n');

  try {
    const result = await performAnalysis(region);
    
    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║          ANALYSIS RESULT               ║');
    console.log('╚═══════════════════════════════════════╝\n');
    
    console.log('Success:', result.success);
    console.log('Region:', result.regionName);
    console.log('Satellite Source:', result.satelliteData?.source);
    console.log('API Status:', result.satelliteData?.apiStatus);
    
    if (result.ndvi) {
      console.log('\nNDVI Statistics:');
      console.log('  Mean:', result.ndvi.statistics?.mean?.toFixed(4));
      console.log('  Min:', result.ndvi.statistics?.min?.toFixed(4));
      console.log('  Max:', result.ndvi.statistics?.max?.toFixed(4));
      console.log('  Std Dev:', result.ndvi.statistics?.stdDev?.toFixed(4));
      
      // Check if these are mock values (exact boundaries)
      const isMockData = 
        (result.ndvi.statistics?.min === -1 && result.ndvi.statistics?.max === 1) ||
        (result.ndvi.statistics?.mean === 0 && result.ndvi.statistics?.min === 0 && result.ndvi.statistics?.max === 0);
      
      console.log('\nMock Data?', isMockData ? '🚨 YES (Exact boundaries)' : '✅ LIKELY REAL (Natural variation)');
    }
    
    if (result.changeDetection) {
      console.log('\nChange Detection:');
      console.log('  Status:', result.changeDetection.statistics);
    }
    
    if (result.riskClassification) {
      console.log('\nRisk Classification:');
      console.log('  Risk Level:', result.riskClassification?.riskLevel);
      console.log('  Confidence:', result.riskClassification?.confidence?.toFixed(2));
    }
    
    console.log('\nExecution Time:', result.executionTime, 'ms');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}

testSmallArea();
