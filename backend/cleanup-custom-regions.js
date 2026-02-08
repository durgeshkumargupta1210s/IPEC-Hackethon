#!/usr/bin/env node

const mongoose = require('mongoose');
const Region = require('./src/models/Region');

const PREDEFINED_PATTERNS = [
  'Valmiki Nagar Forest',
  'Murchison Falls',
  'Odzala-Kokoua',
  'Black Forest',
  'Sahara Desert',
  'Amazon Rainforest',  // Should NOT match "Test Amazon"
  'Siberian Taiga',
  'Serengeti Plains',
];

async function cleanup() {
  try {
    console.log('🧹 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/hcakethon-ipec', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('📊 Fetching all regions...');
    const allRegions = await Region.find({});
    console.log(`Found ${allRegions.length} total regions`);

    // Find custom regions that should NOT be predefined
    const customRegionsToDelete = allRegions.filter(r => {
      // Keep if it's a predefined emoji region
      if (r.name.startsWith('🟢') || r.name.startsWith('🟡') || r.name.startsWith('🔴') ||
          r.name.startsWith('🌲') || r.name.startsWith('🏜️') || r.name.startsWith('🌴') ||
          r.name.startsWith('❄️') || r.name.startsWith('🌾')) {
        return false;
      }
      
      // Delete if marked as custom
      if (r.isCustom) {
        return true;
      }
      
      return false;
    });

    console.log(`\n📋 Found ${customRegionsToDelete.length} custom regions to delete:`);
    customRegionsToDelete.forEach(r => {
      console.log(`  - ${r.name} (id: ${r._id})`);
    });

    if (customRegionsToDelete.length === 0) {
      console.log('\n✅ No custom regions to delete!');
      await mongoose.disconnect();
      return;
    }

    // Delete them
    const regionIds = customRegionsToDelete.map(r => r._id);
    const result = await Region.deleteMany({ _id: { $in: regionIds } });
    
    console.log(`\n🗑️  Deleted ${result.deletedCount} regions`);
    
    // Verify
    const remaining = await Region.find({});
    console.log(`\n📊 Remaining regions: ${remaining.length}`);
    remaining.forEach(r => {
      console.log(`  - ${r.name} (custom: ${r.isCustom})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Cleanup complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanup();
