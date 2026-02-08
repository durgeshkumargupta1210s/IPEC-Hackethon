// Test script to verify custom regions persist to MongoDB

const mongoose = require('mongoose');
require('dotenv').config();

const Region = require('./backend/src/models/Region');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/satellite-db';

async function testRegionsPersistence() {
  try {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║   TESTING CUSTOM REGIONS PERSISTENCE           ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Get all custom regions
    const customRegions = await Region.find({ isCustom: true });
    console.log(`📊 Found ${customRegions.length} custom regions in database:\n`);

    customRegions.forEach((region, idx) => {
      console.log(`  ${idx + 1}. ${region.name}`);
      console.log(`     Location: ${region.latitude}, ${region.longitude}`);
      console.log(`     Size: ${region.sizeKm}km`);
      console.log(`     Risk: ${region.latestMetrics?.riskLevel || 'UNKNOWN'}`);
      console.log(`     Analyses: ${region.analysisHistory?.length || 0}`);
      console.log(`     Created: ${region.createdAt?.toLocaleString()}\n`);
    });

    if (customRegions.length === 0) {
      console.log('❌ No custom regions found in database');
      console.log('   This means either:');
      console.log('   1. No custom regions have been analyzed yet');
      console.log('   2. Regions are not being saved to MongoDB\n');
    } else {
      console.log('✅ Test completed successfully');
      console.log('   Custom regions ARE persisting to MongoDB');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testRegionsPersistence();
