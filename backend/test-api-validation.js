#!/usr/bin/env node

/**
 * Test API validation - make a request and verify returned values are realistic
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api/analysis';

async function testAPIValidation() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║      API VALIDATION TEST - Testing /analyze Endpoint      ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // Test request - small area near Black Forest
    const testRegion = {
      name: 'Test Validation Region',
      latitude: 48.5,
      longitude: 8.2,
      sizeKm: 5,
    };

    console.log('📍 Testing region:');
    console.log(`   Name: ${testRegion.name}`);
    console.log(`   Location: (${testRegion.latitude}, ${testRegion.longitude})`);
    console.log(`   Size: ${testRegion.sizeKm} km\n`);

    console.log('🚀 Sending request to /api/analysis/analyze...\n');

    const response = await axios.post(`${API_URL}/analyze`, testRegion, {
      timeout: 60000,
    });

    const analysis = response.data.analysis;

    console.log('✅ Response received:\n');
    console.log(`Region: ${analysis.regionName}`);
    console.log(`Vegetation Loss: ${analysis.vegetationLossPercentage}%`);
    console.log(`Area Affected: ${analysis.areaAffected} km²`);
    console.log(`Risk Level: ${analysis.riskClassification?.riskLevel || 'N/A'}`);
    console.log(`Risk Score: ${(analysis.riskClassification?.riskScore * 100 || 0).toFixed(0)}%`);
    console.log(`Data Source: ${analysis.satelliteData?.dataSource || 'N/A'}`);
    console.log(`Fallback Used: ${analysis.satelliteData?.fallbackUsed ? 'Yes (Mock data)' : 'No (Real data)'}\n`);

    // Validate results
    const vegLoss = analysis.vegetationLossPercentage;
    const area = analysis.areaAffected;

    console.log('📊 Validation Results:\n');

    if (vegLoss <= 85) {
      console.log(`✅ Vegetation loss ${vegLoss}% is within realistic range (0-85%)`);
    } else {
      console.log(`❌ FAIL: Vegetation loss ${vegLoss}% exceeds realistic max of 85%`);
      return;
    }

    if (area <= 2000) {
      console.log(`✅ Area affected ${area} km² is within realistic range (0-2000 km²)`);
    } else {
      console.log(`❌ FAIL: Area affected ${area} km² exceeds realistic max of 2000 km²`);
      return;
    }

    if (vegLoss >= 0) {
      console.log(`✅ Vegetation loss ${vegLoss}% is non-negative`);
    } else {
      console.log(`❌ FAIL: Vegetation loss is negative`);
      return;
    }

    if (area >= 0) {
      console.log(`✅ Area affected ${area} km² is non-negative`);
    } else {
      console.log(`❌ FAIL: Area is negative`);
      return;
    }

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  ✅ API VALIDATION TEST PASSED!                         ║');
    console.log('║                                                         ║');
    console.log('║  The API correctly returns realistic values that are    ║');
    console.log('║  validated against the realistic range limits.         ║');
    console.log('║                                                         ║');
    console.log(`║  Example result: ${vegLoss}% loss, ${area} km² affected     ║`);
    console.log('╚════════════════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

testAPIValidation();
