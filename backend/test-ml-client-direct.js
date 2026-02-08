// Direct test of ML Model Client risk classification

const mlModelClient = require('./src/models/mlModelClient');

async function testRiskClassification() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║    DIRECT ML CLIENT RISK CLASSIFICATION TEST       ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  const testCases = [
    {
      name: 'Desert (NDVI 0.07)',
      ndviStats: {
        mean: 0.0738,
        min: -0.11,
        max: 0.26,
        stdDev: 0.08,
        validPixels: 65536,
        totalPixels: 65536,
        ndvi: new Array(65536).fill(0).map(() => Math.random() * 0.2) // Simulated desert pixels
      }
    },
    {
      name: 'Rainforest (NDVI 0.36)',
      ndviStats: {
        mean: 0.3593,
        min: 0.2,
        max: 0.5,
        stdDev: 0.055,
        validPixels: 65536,
        totalPixels: 65536,
        ndvi: new Array(65536).fill(0).map(() => 0.2 + Math.random() * 0.35) // Simulated rainforest pixels
      }
    },
    {
      name: 'Healthy Farm (NDVI 0.60)',
      ndviStats: {
        mean: 0.6037,
        min: 0.48,
        max: 0.71,
        stdDev: 0.055,
        validPixels: 65536,
        totalPixels: 65536,
        ndvi: new Array(65536).fill(0).map(() => 0.48 + Math.random() * 0.23) // Simulated farm pixels
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(55)}`);
    console.log(`Testing: ${testCase.name}`);
    console.log(`${'='.repeat(55)}`);
    
    // Call risk classification directly
    const result = mlModelClient.classifyRiskFallback(0, 0, testCase.ndviStats);
    
    console.log(`\nResult:`);
    console.log(`  riskLevel: ${result.riskLevel}`);
    console.log(`  riskScore: ${result.riskScore?.toFixed(3) || 'undefined'}`);
    console.log(`  vegetationLossPercentage: ${result.vegetationLossPercentage}`);
    console.log(`  model_used: ${result.model_used}`);
    
    if (result.vegetationLossPercentage === 50) {
      console.log(`  ⚠️  HARDCODED VALUE!`);
    } else {
      console.log(`  ✅ CALCULATED VALUE`);
    }
  }
}

testRiskClassification();
