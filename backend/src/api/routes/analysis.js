const express = require('express');
const router = express.Router();
const { performAnalysis, batchAnalyze } = require('../../services/analysisService');
const { performRealTimeAnalysis } = require('../../services/realTimeAnalysisService');
const { AnalysisResult, MonitoredRegion, Alert } = require('../../models');
const Region = require('../../models/Region');
const { validateAnalysisData, validateAnalysisArray } = require('../../utils/analysisValidator');

// List of predefined regions to prevent duplicate custom regions
const PREDEFINED_REGION_NAMES = [
  '🟢 Valmiki Nagar Forest, Bihar',
  '🟡 Murchison Falls, Uganda',
  '🔴 Odzala-Kokoua, Congo',
  '🌲 Black Forest, Germany',
  '🏜️ Sahara Desert, Egypt',
  '🌴 Amazon Rainforest, Brazil',
  '❄️ Siberian Taiga, Russia',
  '🌾 Serengeti Plains, Tanzania',
];

// Also include variants without emojis that may have been saved
const PREDEFINED_PATTERNS = [
  'Valmiki Nagar Forest',
  'Murchison Falls',
  'Odzala-Kokoua',
  'Black Forest',
  'Sahara Desert',
  'Amazon Rainforest',
  'Siberian Taiga',
  'Serengeti Plains',
];

const isPredefinedRegion = (regionName) => {
  // Check exact matches first (with emoji)
  if (PREDEFINED_REGION_NAMES.includes(regionName)) {
    return true;
  }
  // Check if name contains any predefined patterns
  return PREDEFINED_PATTERNS.some(pattern => regionName.includes(pattern));
};

router.post('/analyze', async (req, res, next) => {
  try {
    console.log('[API] Analyze request body:', JSON.stringify(req.body));
    const { latitude, longitude, sizeKm, name } = req.body;

    console.log('[API] Parsed fields:', { latitude, longitude, sizeKm, name, nameType: typeof name });

    if (latitude === undefined || latitude === null || longitude === undefined || longitude === null || !name) {
      console.error('[API] Validation failed:', { latitude, longitude, name });
      return res.status(400).json({
        error: 'Missing required fields: latitude, longitude, name',
        received: { latitude, longitude, sizeKm, name },
      });
    }

    // Try to fetch region from database (with latestMetrics)
    let region = await Region.findOne({ name });
    
    console.log(`[API] Region lookup for "${name}":`, region ? `Found in DB` : `Not found in DB`);
    if (region) {
      console.log(`[API] Region details:`, {
        name: region.name,
        hasLatestMetrics: !!region.latestMetrics,
        latestMetrics: region.latestMetrics,
      });
      
      // Update region with request parameters (use request values, not old DB values)
      region.latitude = latitude;
      region.longitude = longitude;
      region.sizeKm = sizeKm || region.sizeKm || 50;
      console.log(`[API] ⚠️  Region updated with request parameters - Lat: ${latitude}, Lon: ${longitude}, Size: ${region.sizeKm}km`);
    } else {
      // Create new region from request data
      region = { latitude, longitude, sizeKm: sizeKm || 50, name };
      console.log(`[API] ✅ New region created from request - Lat: ${latitude}, Lon: ${longitude}, Size: ${region.sizeKm}km`);
    }
    
    // Fetch previous analysis for change detection
    let previousAnalysis = null;
    try {
      const lastAnalysis = await AnalysisResult.findOne({ regionName: name }).sort({ timestamp: -1 });
      if (lastAnalysis) {
        previousAnalysis = lastAnalysis;
        console.log(`[API] ✅ Found previous analysis from ${lastAnalysis.timestamp.toISOString()}`);
      } else {
        console.log(`[API] ℹ️  No previous analysis found - first analysis for this region`);
      }
    } catch (err) {
      console.warn(`[API] Could not fetch previous analysis: ${err.message}`);
    }
    
    const result = await performAnalysis(region, previousAnalysis);

    if (!result.success) {
      console.error(`[API] Analysis failed: ${result.error}`);
      
      // In DEVELOPMENT mode, provide detailed error and hint at solutions
      if (process.env.NODE_ENV === 'development') {
        console.error(`[API] Development Mode: Returning detailed error for debugging`);
        return res.status(503).json({ 
          success: false,
          error: result.error,
          regionName: result.regionName,
          timestamp: result.timestamp,
          mode: 'development',
          help: {
            issue: 'Real Sentinel Hub API call failed',
            solutions: [
              '1. Verify SENTINEL_HUB_CLIENT_ID in .env is correct',
              '2. Verify SENTINEL_HUB_CLIENT_SECRET in .env is correct', 
              '3. Check network connectivity to sentinel-hub.com',
              '4. For testing with synthetic data, set: ALLOW_SYNTHETIC_FALLBACK=true in .env'
            ]
          }
        });
      } else {
        // PRODUCTION: Return error without revealing details
        return res.status(503).json({ 
          success: false,
          error: 'Real satellite data fetch failed. Please try again.',
          regionName: result.regionName,
          timestamp: result.timestamp,
        });
      }
    }

    const analysisRecord = new AnalysisResult({
      regionName: result.regionName,
      latitude: region.latitude,
      longitude: region.longitude,
      ndvi: result.ndvi.ndvi || result.ndvi.values || [], // Store full NDVI array for change detection
      changeDetection: result.changeDetection?.statistics,
      riskClassification: result.riskClassification,
      satelliteData: result.satelliteData,
      executionTime: result.executionTime,
      status: 'success',
    });

    await analysisRecord.save();

    await MonitoredRegion.findOneAndUpdate(
      { name: region.name },
      {
        lastAnalysisDate: new Date(),
        riskLevel: result.riskClassification?.riskLevel || 'low',
      },
      { upsert: true }
    );

    // Auto-save custom region to Region collection for future reference
    // BUT: Don't save if this is a predefined region to avoid duplicates
    const existingRegion = await Region.findOne({ name: region.name });
    if (!existingRegion && !isPredefinedRegion(region.name)) {
      // Only save as custom region if it's truly user-entered (not predefined)
      const newRegion = new Region({
        name: region.name,
        latitude: region.latitude,
        longitude: region.longitude,
        sizeKm: region.sizeKm || 50,
        active: true,
        isCustom: true,  // Mark as custom region
        latestMetrics: {
          vegetationLoss: result.riskClassification?.vegetationLossPercentage || 0,
          riskLevel: (result.riskClassification?.riskLevel || 'low').toUpperCase(),
          confidence: result.riskClassification?.confidenceScore || 0.85,
          trend: 'stable',
          ndviValue: result.ndvi?.mean || 0,
          changePercentage: result.changeDetection?.statistics?.changePercentage || 0,
        },
        analysisHistory: [{
          date: new Date(),
          ndvi: result.ndvi?.mean || 0,
          riskLevel: (result.riskClassification?.riskLevel || 'low').toUpperCase(),
        }],
        lastScanDate: new Date(),
      });
      await newRegion.save();
      console.log(`\n✅ [REGION] New custom region SAVED: ${region.name}`);
      console.log(`   Location: ${region.latitude.toFixed(4)}, ${region.longitude.toFixed(4)}`);
      console.log(`   Risk Level: ${(result.riskClassification?.riskLevel || 'low').toUpperCase()}`);
      console.log(`   NDVI: ${(result.ndvi?.mean || 0).toFixed(4)}\n`);
      console.log(`   NDVI: ${(result.ndvi?.mean || 0).toFixed(4)}\n`);
    } else {
      // Update existing region with latest metrics and history
      const updatedRegion = await Region.findOneAndUpdate(
        { name: region.name },
        {
          $set: {
            latitude: region.latitude,
            longitude: region.longitude,
            sizeKm: region.sizeKm,
            latestMetrics: {
              vegetationLoss: result.riskClassification?.vegetationLossPercentage || 0,
              riskLevel: (result.riskClassification?.riskLevel || 'low').toUpperCase(),
              confidence: result.riskClassification?.confidenceScore || 0.85,
              trend: 'stable',
              ndviValue: result.ndvi?.mean || 0,
              changePercentage: result.changeDetection?.statistics?.changePercentage || 0,
            },
            lastScanDate: new Date(),
          },
          $push: {
            analysisHistory: {
              date: new Date(),
              ndvi: result.ndvi?.mean || 0,
              riskLevel: (result.riskClassification?.riskLevel || 'low').toUpperCase(),
            }
          }
        },
        { new: true, upsert: true }
      );
      if (updatedRegion) {
        console.log(`\n✅ [REGION] Region metrics updated: ${region.name}`);
        console.log(`   Risk Level: ${(result.riskClassification?.riskLevel || 'low').toUpperCase()}`);
        console.log(`   Total analyses: ${(updatedRegion.analysisHistory?.length || 0)}\n`);
      }
    }

    // Build clean response object with proper NDVI flattening
    const analysisResponse = {
      id: analysisRecord._id,
      regionName: result.regionName,
      timestamp: result.timestamp,
      executionTime: result.executionTime,
      // Properly flatten NDVI statistics - use explicit fallback values
      ndvi: {
        mean: result.ndvi?.statistics?.mean !== undefined ? result.ndvi.statistics.mean : 0,
        min: result.ndvi?.statistics?.min !== undefined ? result.ndvi.statistics.min : -1,
        max: result.ndvi?.statistics?.max !== undefined ? result.ndvi.statistics.max : 1,
        stdDev: result.ndvi?.statistics?.stdDev !== undefined ? result.ndvi.statistics.stdDev : 0,
        validPixels: result.ndvi?.statistics?.validPixels || 0,
        totalPixels: result.ndvi?.statistics?.totalPixels || 0,
      },
      changeDetection: result.changeDetection?.statistics || {},
      riskClassification: result.riskClassification || {
        riskLevel: 'low',
        riskScore: 0,
        vegetationLossPercentage: 0,
        areaAffected: 0,
        confidenceScore: 0.85,
      },
      vegetationLossPercentage: result.vegetationLossPercentage || 0,
      areaAffected: result.areaAffected || 0,
      confidenceScore: result.confidenceScore || 0.85,
      satelliteData: result.satelliteData,
    };

    // Validate analysis to ensure realistic values
    const validatedResponse = validateAnalysisData(analysisResponse);

    res.json({
      success: true,
      analysis: validatedResponse,
      regionSaved: true,
      message: `Region "${region.name}" analyzed and saved to predefined regions list`,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/history/:regionName', async (req, res, next) => {
  try {
    const { regionName } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    // Fetch from database
    const analyses = await AnalysisResult.find({ regionName })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await AnalysisResult.countDocuments({ regionName });

    // Validate all analyses to ensure realistic values
    const validatedAnalyses = validateAnalysisArray(analyses);

    res.json({
      success: true,
      total,
      count: validatedAnalyses.length,
      analyses: validatedAnalyses,
      isDemo: false,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/latest', async (req, res, next) => {
  try {
    const analyses = await AnalysisResult.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$regionName',
          doc: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$doc' } },
    ]);

    // Validate all analyses to ensure realistic values
    const validatedAnalyses = validateAnalysisArray(analyses);

    res.json({
      success: true,
      count: validatedAnalyses.length,
      analyses: validatedAnalyses,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const totalAnalyses = await AnalysisResult.countDocuments();
    const regions = await AnalysisResult.distinct('regionName');
    const failedAnalyses = await AnalysisResult.countDocuments({ status: 'failed' });

    const riskDistribution = await AnalysisResult.aggregate([
      {
        $group: {
          _id: '$riskClassification.riskLevel',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        totalAnalyses,
        totalRegions: regions.length,
        failedAnalyses,
        successRate: ((totalAnalyses - failedAnalyses) / totalAnalyses * 100).toFixed(2),
        riskDistribution: Object.fromEntries(
          riskDistribution.map((r) => [r._id || 'unknown', r.count])
        ),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// REAL-TIME ANALYSIS ENDPOINT
// ============================================
// Enhanced endpoint that uses real-time data with automatic fallback
router.post('/analyze-realtime', async (req, res, next) => {
  try {
    console.log('[API:RealTime] Real-time analysis request received');
    const { latitude, longitude, sizeKm, name } = req.body;

    // Validation
    if (latitude === undefined || latitude === null || longitude === undefined || longitude === null || !name) {
      return res.status(400).json({
        error: 'Missing required fields: latitude, longitude, name',
        received: { latitude, longitude, sizeKm, name },
      });
    }

    // Fetch or create region
    let region = await Region.findOne({ name });
    if (region) {
      // Update region with request parameters (use request values, not old DB values)
      region.latitude = latitude;
      region.longitude = longitude;
      region.sizeKm = sizeKm || region.sizeKm || 2;
    } else {
      // Create new region from request data
      region = { latitude, longitude, sizeKm: sizeKm || 2, name };
    }

    console.log('[API:RealTime] Starting real-time analysis...');
    const result = await performRealTimeAnalysis(region, {
      enableAllDataSources: true,
      retryOnFailure: true,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'Real-time analysis failed',
        details: result.error,
        timestamp: new Date(),
      });
    }

    // Save analysis result
    const analysisRecord = new AnalysisResult({
      regionName: result.regionName,
      latitude: region.latitude,
      longitude: region.longitude,
      ndvi: result.ndvi,
      riskClassification: result.riskClassification,
      satelliteData: result.satelliteData,
      mlInsights: result.mlInsights,
      executionTime: result.executionTime,
      status: 'success',
      dataSource: result.dataSource,
    });

    await analysisRecord.save();

    // Auto-save custom region
    const existingRegion = await Region.findOne({ name: region.name });
    if (!existingRegion) {
      const newRegion = new Region({
        name: region.name,
        latitude: region.latitude,
        longitude: region.longitude,
        sizeKm: region.sizeKm || 2,
        active: true,
        latestMetrics: {
          vegetationLoss: result.riskClassification?.vegetationLossPercentage || 0,
          riskLevel: (result.riskClassification?.riskLevel || 'low').toUpperCase(),
          confidence: result.riskClassification?.confidenceScore || 0.85,
          trend: result.riskClassification?.trend || 'stable',
        },
        lastScanDate: new Date(),
      });
      await newRegion.save();
      console.log(`[API:RealTime] New region saved: ${region.name}`);
    } else {
      await Region.findOneAndUpdate(
        { name: region.name },
        {
          latestMetrics: {
            vegetationLoss: result.riskClassification?.vegetationLossPercentage || 0,
            riskLevel: (result.riskClassification?.riskLevel || 'low').toUpperCase(),
            confidence: result.riskClassification?.confidenceScore || 0.85,
            trend: result.riskClassification?.trend || 'stable',
          },
          lastScanDate: new Date(),
        }
      );
      console.log(`[API:RealTime] Region updated: ${region.name}`);
    }

    // Update monitored region
    await MonitoredRegion.findOneAndUpdate(
      { name: region.name },
      {
        lastAnalysisDate: new Date(),
        riskLevel: result.riskClassification?.riskLevel || 'low',
      },
      { upsert: true }
    );

    // Create alerts if needed
    if (result.riskClassification?.riskLevel === 'HIGH') {
      const alert = new Alert({
        regionName: region.name,
        riskLevel: 'HIGH',
        message: `High risk detected in ${region.name}`,
        created: new Date(),
      });
      await alert.save();
    }

    console.log('[API:RealTime] Analysis complete and saved');

    // Validate result to ensure realistic values
    const validatedResult = validateAnalysisData(result);

    res.json({
      success: true,
      ...validatedResult,
      regionSaved: true,
      message: `Real-time analysis complete for "${region.name}"`,
    });
  } catch (error) {
    console.error('[API:RealTime] Error:', error.message);
    next(error);
  }
});

// Test endpoint to verify OAuth2 and real satellite data are working
router.get('/test-real-api', (req, res) => {
  console.log('[Test API] Status check');
  
  const hasCreds = !!process.env.SENTINEL_HUB_CLIENT_ID && !!process.env.SENTINEL_HUB_CLIENT_SECRET;
  const isRealApiEnabled = process.env.ENABLE_REAL_SATELLITE_API !== 'false';
  
  res.json({
    status: 'ok',
    message: 'Sentinel Hub OAuth2 Configuration Status',
    oauthToken: hasCreds,
    ENABLE_REAL_SATELLITE_API: isRealApiEnabled,
    environment: {
      SENTINEL_HUB_CLIENT_ID: hasCreds ? '✅ Configured' : '❌ Missing',
      SENTINEL_HUB_CLIENT_SECRET: hasCreds ? '✅ Configured' : '❌ Missing',
      SENTINEL_HUB_REGION: process.env.SENTINEL_HUB_REGION || 'eu',
    },
    systemStatus: {
      satelliteAPI: isRealApiEnabled && hasCreds ? 'READY' : 'CHECKING',
      realData: isRealApiEnabled && hasCreds ? 'Real Sentinel-2 Data Available' : 'Fallback/Mock Data'
    }
  });
});

module.exports = router;
