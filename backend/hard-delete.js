const mongoose = require('mongoose');
const Region = require('./src/models/Region');

async function hardDelete() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hcakethon-ipec';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🗑️  Hard deleting all regions from collection...\n');

    // Delete ALL regions with no filter
    const result = await Region.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} documents\n`);

    // Verify empty
    const count = await Region.countDocuments();
    console.log(`📊 Remaining documents: ${count}`);

    if (count === 0) {
      console.log('✅ Collection is now completely empty!');
    } else {
      // If still have documents, list them
      const remaining = await Region.find({});
      console.log('\n⚠️  Remaining documents:');
      remaining.forEach(r => {
        console.log(`  - ${r.name}`);
      });
    }

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

hardDelete();
