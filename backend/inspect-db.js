const mongoose = require('mongoose');

async function inspectDatabase() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hcakethon-ipec';
    console.log(`🔗 Connecting to: ${uri}`);
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection;
    
    // List all collections
    const collections = await db.db.listCollections().toArray();
    console.log('📊 Collections in database:');
    collections.forEach(c => console.log(`  - ${c.name}`));

    // Check if regions collection exists
    const regionsExists = collections.some(c => c.name === 'regions');
    
    if (regionsExists) {
      const count = await db.db.collection('regions').countDocuments();
      console.log(`\n📋 Regions collection has ${count} documents`);
      
      if (count > 0) {
        const docs = await db.db.collection('regions').find({}).limit(5).toArray();
        console.log('\nSample regions:');
        docs.forEach((doc, i) => {
          console.log(`  ${i + 1}. ${doc.name} (isCustom: ${doc.isCustom})`);
        });
      }
    } else {
      console.log('\n✅ Regions collection does NOT exist');
    }

    await mongoose.connection.close();
    console.log('\n✅ Inspection complete');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

inspectDatabase();
