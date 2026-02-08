#!/usr/bin/env node

const mongoose = require('mongoose');

async function cleanup() {
  try {
    // Connect to the CORRECT database that server.js uses
    await mongoose.connect('mongodb://localhost:27017/satellite-db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to satellite-db');
    
    const regionsCol = mongoose.connection.collection('regions');
    
    // Count before
    const countBefore = await regionsCol.countDocuments();
    console.log(`📊 Documents before: ${countBefore}`);
    
    // List all
    if (countBefore > 0) {
      const docs = await regionsCol.find({}).toArray();
      console.log(`📋 Documents:`);
      docs.forEach(d => {
        console.log(`  - ${d.name} (isCustom: ${d.isCustom})`);
      });
      
      // Delete all custom regions
      console.log(`\n🗑️  Deleting custom regions...`);
      const result = await regionsCol.deleteMany({ isCustom: true });
      console.log(`✅ Deleted ${result.deletedCount} documents`);
      
      // Count after
      const countAfter = await regionsCol.countDocuments();
      console.log(`\n📊 Documents after: ${countAfter}`);
      
      // List remaining
      if (countAfter > 0) {
        const remaining = await regionsCol.find({}).toArray();
        console.log(`📋 Remaining:`);
        remaining.forEach(d => console.log(`  - ${d.name}`));
      }
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanup();
