/**
 * Mock History Generator - Enhanced v2.0
 * Generates realistic historical analysis data for time-lapse animations
 * Creates varied vegetation loss progressions: EASY, MEDIUM, HARD, MIX
 * Shows meaningful changes between frames for compelling animations
 */

function generateMockHistoryForRegion(regionName, riskLevel, baseVegetationLoss) {
  // Generate 10 time points for detailed animation
  const timePoints = Array.from({ length: 10 }, (_, i) => {
    const date = new Date('2026-01-01');
    date.setDate(date.getDate() + (i * 7)); // Weekly snapshots
    return {
      week: `Week ${i + 1}`,
      date: date,
    };
  });

  // Create progression based on risk level with BETTER VARIATION
  let progression = [];
  let ndviProgression = [];
  let riskProgression = [];

  if (riskLevel === 'HIGH') {
    // HIGH RISK: HARD - Rapid deforestation
    progression = [2.5, 5.8, 12.3, 18.7, 27.2, 35.1, 42.8, 48.5, 54.2, 58.7];
    ndviProgression = [0.72, 0.68, 0.61, 0.52, 0.43, 0.35, 0.28, 0.22, 0.15, 0.08];
    riskProgression = ['low', 'low', 'medium', 'medium', 'high', 'high', 'critical', 'critical', 'critical', 'critical'];
  } else if (riskLevel === 'MEDIUM') {
    // MEDIUM RISK: MIX - Fluctuating vegetation with overall decline
    progression = [4.2, 6.1, 5.8, 9.3, 8.7, 12.5, 11.9, 15.2, 14.6, 16.8];
    ndviProgression = [0.62, 0.60, 0.61, 0.57, 0.58, 0.53, 0.54, 0.49, 0.50, 0.46];
    riskProgression = ['low', 'low', 'low', 'medium', 'medium', 'medium', 'medium', 'medium', 'high', 'high'];
  } else {
    // LOW RISK: EASY - Stable vegetation with minimal change
    progression = [1.2, 1.5, 1.3, 1.8, 1.6, 1.9, 1.7, 2.1, 2.0, 2.3];
    ndviProgression = [0.78, 0.77, 0.78, 0.76, 0.77, 0.75, 0.76, 0.74, 0.75, 0.73];
    riskProgression = ['low', 'low', 'low', 'low', 'low', 'low', 'low', 'low', 'low', 'low'];
  }

  return timePoints.map((timeData, index) => {
    const loss = progression[index];
    const ndviMean = ndviProgression[index];
    const risk = riskProgression[index];

    // Calculate realistic NDVI range based on mean
    const ndviMin = ndviMean - 0.15 + Math.random() * 0.05;
    const ndviMax = ndviMean + 0.15 + Math.random() * 0.05;

    // Calculate area affected (km²)
    const areaAffected = (loss / 100) * (riskLevel === 'HIGH' ? 250 : riskLevel === 'MEDIUM' ? 120 : 80);

    // Confidence varies with data quality
    const confidence = 0.78 + Math.random() * 0.15;

    // Risk score based on loss percentage
    let riskScore = 0.2;
    if (loss < 5) riskScore = 0.2;
    else if (loss < 15) riskScore = 0.45;
    else if (loss < 30) riskScore = 0.65;
    else riskScore = 0.85;

    return {
      regionName,
      timestamp: timeData.date,
      weekLabel: timeData.week,
      riskClassification: {
        riskLevel: risk,
        riskScore: riskScore,
        vegetationLossPercentage: loss,
        areaAffected: areaAffected,
        confidenceScore: confidence,
      },
      ndvi: {
        mean: ndviMean,
        min: Math.max(0, ndviMin),
        max: Math.min(1, ndviMax),
        stdDev: 0.12 + Math.random() * 0.08,
        validPixels: Math.floor(65536 * (0.85 + Math.random() * 0.15)),
        totalPixels: 65536,
      },
      changeDetection: {
        decreaseCount: Math.floor((loss / 100) * 65536),
        stableCount: Math.floor(((100 - loss - 5) / 100) * 65536),
        increaseCount: Math.floor((5 / 100) * 65536),
      },
      satelliteData: {
        bbox: [-1, 15, 1, 17],
        dataSource: 'Mock Historical Data (Animated)',
        mlApiStatus: 'demo',
        difficulty: riskLevel === 'HIGH' ? 'HARD' : riskLevel === 'MEDIUM' ? 'MIX' : 'EASY',
      },
      vegetationLossPercentage: loss,
      executionTime: `${Math.floor(Math.random() * 15) + 8}ms`,
      success: true,
    };
  });
}

/**
 * Generate history for all demo regions with different difficulty levels
 */
function generateAllDemoHistory() {
  const demoRegions = [
    {
      name: '🌲 Black Forest, Germany',
      riskLevel: 'LOW',
      difficulty: 'EASY',
    },
    {
      name: '🏜️ Sahara Desert, Egypt',
      riskLevel: 'MEDIUM',
      difficulty: 'MIX',
    },
    {
      name: '🌴 Amazon Rainforest, Brazil',
      riskLevel: 'HIGH',
      difficulty: 'HARD',
    },
    {
      name: '🟢 Valmiki Nagar Forest, Bihar',
      riskLevel: 'LOW',
      difficulty: 'EASY',
    },
    {
      name: '🟡 Murchison Falls, Uganda',
      riskLevel: 'MEDIUM',
      difficulty: 'MIX',
    },
    {
      name: '🔴 Odzala-Kokoua, Congo',
      riskLevel: 'HIGH',
      difficulty: 'HARD',
    },
  ];

  const allHistory = {};
  demoRegions.forEach((region) => {
    allHistory[region.name] = generateMockHistoryForRegion(
      region.name,
      region.riskLevel,
      region.difficulty
    );
  });

  return allHistory;
}

module.exports = {
  generateMockHistoryForRegion,
  generateAllDemoHistory,
};
