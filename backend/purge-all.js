const mongoose = require('mongoose');

async function purgeAllRegions() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hcakethon-ipec';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');
    
    // Get the regions collection
    const db = mongoose.connection;
    const collections = await db.db.listCollections().toArray();
    console.log('\n📋 Collections in database:');
    collections.forEach(c => console.log(`  - ${c.name}`));

    // Try to find and drop the regions collection
    try {
      await db.db.dropCollection('regions');
      console.log('\n✅ Dropped regions collection');
    } catch (e) {
      console.log(`\n⚠️  Could not drop regions collection: ${e.message}`);
    }

    // Also check if there's a  'monitoredregions' collection
    try {
      const count = await db.db.collection('monitoredregions').countDocuments();
      if (count > 0) {
        console.log(`\n📊 Found monitoredregions collection with ${count} documents`);
        await db.db.dropCollection('monitoredregions');
        console.log('✅ Dropped monitoredregions collection');
      }
    } catch (e) {}

    // Verify regions is empty
    const Region = require('./src/models/Region');
    const count = await Region.countDocuments();
    console.log(`\n✅ Final region count: ${count}`);

    await mongoose.connection.close();
    console.log('\n✅ Purge complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

purgeAllRegions();
