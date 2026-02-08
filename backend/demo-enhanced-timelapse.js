/**
 * DEMO: Enhanced Time-Lapse Mock Data
 * Shows the new difficulty levels: EASY, MEDIUM (MIX), HARD
 */

const { generateMockHistoryForRegion } = require('./src/utils/mockHistoryGenerator');

console.log('\n╔════════════════════════════════════════════════════════════════════╗');
console.log('║     ENHANCED TIME-LAPSE MOCK DATA - ANIMATION PREVIEW           ║');
console.log('║  Difficulty Levels: EASY | MIX | HARD                           ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');

// Generate data for each difficulty level
const regions = [
  { name: '🌲 EASY - Black Forest (Stable)', risk: 'LOW' },
  { name: '🏜️ MIX - Sahara (Fluctuating)', risk: 'MEDIUM' },
  { name: '🌴 HARD - Amazon (Degrading)', risk: 'HIGH' },
];

regions.forEach((region) => {
  const history = generateMockHistoryForRegion(region.name, region.risk, region.risk);

  console.log(`\n${'═'.repeat(75)}`);
  console.log(`${region.name}`);
  console.log(`${'═'.repeat(75)}`);

  // Create animation timeline display
  console.log('\n📊 ANIMATION FRAMES (10x for smooth playback):');
  console.log('─'.repeat(130));
  console.log(
    'Frame │ Date       │ NDVI  │ Loss%  │ Area(km²) │ Risk      │ Confidence │ Status'
  );
  console.log('─'.repeat(130));

  history.forEach((frame, idx) => {
    const frameNum = String(idx + 1).padStart(2, '0');
    const date = frame.timestamp.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
    });
    const ndvi = frame.ndvi.mean.toFixed(3);
    const loss = frame.vegetationLossPercentage.toFixed(2);
    const area = frame.riskClassification.areaAffected.toFixed(1);
    const riskLevel = frame.riskClassification.riskLevel.toUpperCase().padEnd(10);
    const confidence = (frame.riskClassification.confidenceScore * 100).toFixed(0);
    const emoji = risk => {
      if (loss >= 50) return '🔴';
      if (loss >= 30) return '🟠';
      if (loss >= 15) return '🟡';
      return '🟢';
    };

    console.log(
      `${frameNum}    │ ${date}   │ ${ndvi} │ ${loss.padStart(6)} │ ${area.padStart(9)} │ ${riskLevel} │ ${confidence.padStart(2)}%       │ ${emoji(loss)}`
    );
  });

  // Calculate animation statistics
  console.log('─'.repeat(130));
  const lossValues = history.map(h => h.vegetationLossPercentage);
  const ndviValues = history.map(h => h.ndvi.mean);
  const minLoss = Math.min(...lossValues);
  const maxLoss = Math.max(...lossValues);
  const avgLoss = (lossValues.reduce((a, b) => a + b) / lossValues.length).toFixed(2);
  const lossChange = (maxLoss - minLoss).toFixed(2);

  const minNdvi = Math.min(...ndviValues);
  const maxNdvi = Math.max(...ndviValues);
  const avgNdvi = (ndviValues.reduce((a, b) => a + b) / ndviValues.length).toFixed(4);

  console.log(`\n📈 ANIMATION STATISTICS:`);
  console.log(`   Vegetation Loss:  Min=${minLoss.toFixed(2)}% → Max=${maxLoss.toFixed(2)}% (Δ=${lossChange}%, Avg=${avgLoss}%)`);
  console.log(`   NDVI Health:      Min=${minNdvi.toFixed(4)} → Max=${maxNdvi.toFixed(4)} (Avg=${avgNdvi})`);
  console.log(`   Animation Frames: 10 frames`);
  console.log(`   Duration:         8.00s (at 800ms/frame)`);
  console.log(`   Playback:         Play▶️ Pause⏸️ Loop🔄 Speed⚡`);
});

console.log(`\n${'═'.repeat(75)}`);
console.log('✅ ANIMATION QUALITY IMPROVEMENTS:');
console.log('═'.repeat(75));
console.log('  ✓ 10 time points per animation (was 6)');
console.log('  ✓ Varied vegetation loss between frames (EASY/MIX/HARD)');
console.log('  ✓ Dynamic NDVI progression showing real changes');
console.log('  ✓ Progressive risk level changes throughout timeline');
console.log('  ✓ Realistic confidence scores varying by data quality');
console.log('  ✓ Area affected calculated dynamically');
console.log('  ✓ Weekly snapshots for detailed animation');
console.log(`\n${'═'.repeat(75)}\n`);
