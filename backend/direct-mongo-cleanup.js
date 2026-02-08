#!/usr/bin/env node

// Use the exact same connection and models as server.js

const mongoose = require('mongoose');

// First, check what's in the database by counting documents directly
mongoose.connect('mongodb://localhost:27017/hcakethon-ipec', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  // Access the Region collection directly
  const regionCollection = mongoose.connection.collection('regions');
  
  // Count documents
  const count = await regionCollection.countDocuments();
  console.log(`📊 Total documents in 'regions' collection: ${count}`);
  
  // List all documents
  const allDocs = await regionCollection.find({}).toArray();
  console.log(`\n📋 All documents:`);
  allDocs.forEach((doc, i) => {
    console.log(`${i+1}. ${doc.name} (isCustom: ${doc.isCustom}, _id: ${doc._id})`);
  });
  
  // Delete all custom regions
  if (count > 0) {
    console.log('\n🗑️  Deleting all custom regions...');
    const result = await regionCollection.deleteMany({ isCustom: true });
    console.log(`✅ Deleted ${result.deletedCount} documents`);
    
    // Verify
    const remaining = await regionCollection.countDocuments();
    console.log(`\n📊 Remaining documents: ${remaining}`);
    
    const remainingDocs = await regionCollection.find({}).toArray();
    if (remainingDocs.length > 0) {
      console.log(`📋 Remaining documents:`);
      remainingDocs.forEach((doc) => {
        console.log(`  - ${doc.name} (isCustom: ${doc.isCustom})`);
      });
    }
  }
  
  await mongoose.disconnect();
  console.log('\n✅ Done!');
})
.catch(err => {
  console.error('❌ Connection error:', err.message);
  process.exit(1);
});
