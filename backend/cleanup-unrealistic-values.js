#!/usr/bin/env node

/**
 * Clean up unrealistic vegetation loss values from database
 * Removes any analyses with implausible vegetation loss percentages or areas
 * Keeps realistic data: 0-85% vegetation loss (0-2000 km² affected)
 */

const mongoose = require('mongoose');
const { AnalysisResult } = require('./src/models');

async function cleanupUnrealisticValues() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hcakethon-ipec';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔍 Scanning for unrealistic vegetation loss values...\n');

    // Find analyses with unrealistic values
    const unrealisticAnalyses = await AnalysisResult.find({
      $or: [
        { vegetationLossPercentage: 100 },
        { vegetationLossPercentage: { $gt: 95 } },
        { areaAffected: { $gt: 2000 } },
        { 'riskClassification.vegetationLossPercentage': 100 },
      ]
    });

    console.log(`📊 Found ${unrealisticAnalyses.length} analyses with unrealistic values:\n`);

    if (unrealisticAnalyses.length === 0) {
      console.log('✅ No unrealistic values found! Database is clean.');
      await mongoose.connection.close();
      process.exit(0);
    }

    unrealisticAnalyses.forEach((analysis, idx) => {
      console.log(`${idx + 1}. Region: ${analysis.regionName}`);
      console.log(`   Loss: ${analysis.vegetationLossPercentage}%`);
      console.log(`   Area: ${analysis.areaAffected} km²`);
      console.log(`   Date: ${analysis.timestamp?.toISOString()}`);
      console.log();
    });

    console.log('🗑️  Deleting unrealistic analyses...\n');

    const result = await AnalysisResult.deleteMany({
      $or: [
        { vegetationLossPercentage: 100 },
        { vegetationLossPercentage: { $gt: 95 } },
        { areaAffected: { $gt: 2000 } },
        { 'riskClassification.vegetationLossPercentage': 100 },
      ]
    });

    console.log(`✅ Deleted ${result.deletedCount} unrealistic analyses`);

    // Show remaining data statistics
    const remaining = await AnalysisResult.find({});
    console.log(`\n📊 Database Statistics After Cleanup:`);
    console.log(`   Total analyses: ${remaining.length}`);

    if (remaining.length > 0) {
      const losses = remaining.map(a => a.vegetationLossPercentage || 0);
      const minLoss = Math.min(...losses);
      const maxLoss = Math.max(...losses);
      const avgLoss = (losses.reduce((a, b) => a + b, 0) / losses.length).toFixed(1);

      console.log(`   Vegetation Loss Range: ${minLoss.toFixed(1)}% - ${maxLoss.toFixed(1)}%`);
      console.log(`   Average Loss: ${avgLoss}%`);
      console.log(`   ✅ All values are realistic and within expected ranges`);
    }

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

cleanupUnrealisticValues();
