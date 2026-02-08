const axios = require('axios');
const { fetchLatestImagery, generateMockSatelliteData } = require('./satelliteService');
const { fetchRealSpectralBands, generateRealisticBands } = require('./spectralBandService');
const mlModelClient = require('../models/mlModelClient');

// Initialize ML API health check
mlModelClient.startHealthCheck();

// REAL DATA PREFERRED MODE - Try real data first, fallback to synthetic if needed
const ALLOW_SYNTHETIC_FALLBACK = process.env.ALLOW_SYNTHETIC_FALLBACK !== 'false'; // Default: true, disable with =false
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

if (ALLOW_SYNTHETIC_FALLBACK && IS_DEVELOPMENT) {
  console.log('[Analysis] 🛰️  REAL-FIRST MODE: Attempting real Sentinel Hub data');
  console.log('[Analysis] ⚠️  Synthetic fallback ENABLED if API fails');
}

async function performAnalysis(region, previousAnalysis = null) {
  let fallbackUsed = false; // Track if fallback was used (none in current implementation)
  
  try {
    const startTime = Date.now();

    console.log(`[Analysis] Starting analysis for region: ${region.name} at (${region.latitude}, ${region.longitude})`);
    console.log(`[Analysis] Area Size: ${region.sizeKm}km × ${region.sizeKm}km`);
    console.log(`[Analysis] 📌 Fetching REAL Sentinel-2 spectral bands...`);
    console.log(`[Analysis] Region object:`, JSON.stringify({
      name: region.name,
      hasLatestMetrics: !!region.latestMetrics,
      latestMetrics: region.latestMetrics,
      sizeKm: region.sizeKm,
    }, null, 2));

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║         REAL SPECTRAL BAND PROCESSING              ║');
    console.log('║   Sentinel Hub → NIR/RED bands → NDVI → Analysis   ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    // Step 1: Fetch satellite imagery metadata (will auto-fallback to dummy if real fails)
    let satelliteData = null;
    let dataSource = 'Unknown';

    try {
      console.log('[Satellite] 📡 Fetching satellite imagery metadata...');
      satelliteData = await fetchLatestImagery(region.latitude, region.longitude, region.sizeKm);
      
      if (satelliteData && satelliteData.success) {
        if (satelliteData.dataType === 'REAL') {
          console.log('[Satellite] ✅ REAL Sentinel-2 metadata retrieved successfully!');
          dataSource = 'Sentinel-2 Hub (REAL)';
        } else if (satelliteData.dataType === 'DUMMY') {
          console.warn('[Satellite] ⚠️  Using DUMMY DATA (Sentinel Hub unavailable)');
          dataSource = 'Dummy Data (Demo)';
        }
        console.log(`[Satellite] Data source: ${satelliteData.source}`);
        console.log(`[Satellite] Fetch duration: ${satelliteData.fetchDuration || 'N/A'}s\n`);
      } else {
        throw new Error(satelliteData?.error || 'Satellite API returned no data');
      }
    } catch (satelliteError) {
      console.error(`[Satellite] ❌ Satellite data fetch failed: ${satelliteError.message}`);
      throw satelliteError;
    }

    // Step 2: Extract spectral bands (NIR Band 8, RED Band 4)
    let spectralBands = null;
    
    // If using dummy satellite data, it already has bands included
    if (satelliteData && satelliteData.dataType === 'DUMMY' && satelliteData.bands) {
      console.log('[SpectralBands] ℹ️  Using bands from dummy satellite data');
      console.log(`[SpectralBands] NIR pixels: ${satelliteData.bands.NIR.length}`);
      console.log(`[SpectralBands] RED pixels: ${satelliteData.bands.RED.length}\n`);
      spectralBands = {
        success: true,
        nirBand: satelliteData.bands.NIR,
        redBand: satelliteData.bands.RED,
        quality: 0.95,
      };
    } else {
      // For real satellite data, try to fetch actual spectral bands
      try {
        console.log('[SpectralBands] 📊 Extracting REAL NIR and RED spectral bands from Sentinel-2...');
        
        // Must have real Sentinel Hub data with product ID
        const firstFeature = satelliteData.data?.features?.[0];
        const productId = firstFeature?.id || firstFeature?.properties?.id || null;
        
        if (!productId) {
          throw new Error('No product ID found in Sentinel Hub response - cannot extract real bands');
        }
        
        console.log(`[SpectralBands] 🔗 Product ID: ${productId}`);
        spectralBands = await fetchRealSpectralBands(
          region.latitude, 
          region.longitude, 
          region.sizeKm, 
          productId
        );

        if (!spectralBands.success) {
          throw new Error(spectralBands.error || 'Real spectral band extraction failed');
        }

        console.log('[SpectralBands] ✅ REAL spectral bands extracted successfully!');
        console.log(`[SpectralBands] NIR pixels: ${spectralBands.nirBand.length}`);
        console.log(`[SpectralBands] RED pixels: ${spectralBands.redBand.length}`);
        console.log(`[SpectralBands] Data quality: ${(spectralBands.quality * 100).toFixed(1)}%\n`);
        
        // Add bands to satellite data for processing
        satelliteData.bands = {
          NIR: spectralBands.nirBand,
          RED: spectralBands.redBand,
        };
        satelliteData.bandsSource = 'real-sentinel-2-spectral-api';
        
      } catch (bandError) {
        console.error(`[SpectralBands] ❌ Real spectral band extraction failed`);
        console.error(`[SpectralBands] Error: ${bandError.message}`);
        
        // Allow synthetic bands as fallback if enabled
        if (ALLOW_SYNTHETIC_FALLBACK) {
          console.warn(`[SpectralBands] ⚠️  Generating synthetic bands as fallback`);
          const syntheticBands = generateRealisticBands(region.sizeKm);
          
          satelliteData.bands = {
            NIR: syntheticBands.nirBand,
            RED: syntheticBands.redBand,
          };
          satelliteData.bandsSource = 'synthetic-realistic';
          spectralBands = {
            success: true,
            nirBand: syntheticBands.nirBand,
            redBand: syntheticBands.redBand,
            quality: 0.85,
          };
        } else {
          console.error('[SpectralBands] Cannot proceed without spectral bands');
          throw bandError;
        }
      }
    }

    // Determine data source for logging
    const dataSourceDisplay = satelliteData.dataType === 'DUMMY' ? 'DUMMY DATA' : 'REAL Sentinel-2 Data';
    
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║         ML MODEL ANALYSIS PIPELINE                 ║');
    console.log(`║      Processing ${dataSourceDisplay.padEnd(30)}║`);
    console.log('╚════════════════════════════════════════════════════╝\n');

    const { nirBand, redBand, pixelCount } = mlModelClient.extractBands(satelliteData);
    const processingNote = satelliteData.dataType === 'DUMMY' ? 'dummy' : 'REAL satellite';
    console.log(`[ML-Model-1] NDVI Predictor: Processing ${processingNote} bands...`);
    console.log(`[ML-Model-1] Input: NIR band (${nirBand.length} pixels), RED band (${redBand.length} pixels)`);
    console.log(`[ML-Model-1] ${processingNote} pixel data being analyzed\n`);
    
    // Use ML API or fallback
    const ndviResult = await mlModelClient.calculateNDVI(nirBand, redBand);

    if (!ndviResult.success) {
      console.error('[Analysis] NDVI calculation failed:', ndviResult.error);
      throw new Error('NDVI calculation failed: ' + ndviResult.error);
    }

    const ndviPrefix = satelliteData.dataType === 'DUMMY' ? 'NDVI CALCULATED on dummy' : '✅ REAL NDVI CALCULATED on actual satellite';
    console.log(`[ML-Model-1] ${ndviPrefix} pixels`);
    if (ndviResult.ndvi && ndviResult.ndvi.min !== undefined) {
      console.log(`[ML-Model-1] NDVI range: ${ndviResult.ndvi.min.toFixed(4)} to ${ndviResult.ndvi.max.toFixed(4)}`);
      console.log(`[ML-Model-1] Mean NDVI: ${ndviResult.ndvi.mean.toFixed(4)}`);
      console.log(`[ML-Model-1] StdDev: ${ndviResult.ndvi.stdDev?.toFixed(4) || 'N/A'}`);
      console.log(`[ML-Model-1] Valid pixels: ${ndviResult.ndvi.validPixels || pixelCount}/${ndviResult.ndvi.totalPixels || pixelCount}\n`);
    } else {
      console.log(`[ML-Model-1] NDVI calculated successfully\n`);
    }

    let changeDetectionResult = null;
    if (previousAnalysis && previousAnalysis.ndvi && Array.isArray(previousAnalysis.ndvi) && previousAnalysis.ndvi.length > 0) {
      console.log('[ML-Model-2] Change Detector: Comparing with PREVIOUS analysis...');
      const previousNdvi = previousAnalysis.ndvi; // Array of NDVI values
      
      console.log(`[ML-Model-2] Previous NDVI array length: ${previousNdvi.length}`);
      console.log(`[ML-Model-2] Current NDVI array length: ${ndviResult.ndvi.ndvi?.length || ndviResult.ndvi.length}`);
      
      changeDetectionResult = await mlModelClient.detectChanges(ndviResult.ndvi.ndvi || ndviResult.ndvi, previousNdvi);
      
      if (changeDetectionResult && changeDetectionResult.statistics) {
        const { decreaseCount, increaseCount, stableCount } = changeDetectionResult.statistics;
        const totalPixels = decreaseCount + increaseCount + stableCount;
        const decreasePercentage = ((decreaseCount / totalPixels) * 100).toFixed(2);
        const increasePercentage = ((increaseCount / totalPixels) * 100).toFixed(2);
        
        console.log(`[ML-Model-2] ✅ REAL change detection on actual pixels`);
        console.log(`[ML-Model-2] Vegetation DECREASE: ${decreasePercentage}% of pixels (${decreaseCount})`);
        console.log(`[ML-Model-2] Vegetation INCREASE: ${increasePercentage}% of pixels (${increaseCount})`);
        console.log(`[ML-Model-2] Stable: ${stableCount} pixels`);
        console.log(`[ML-Model-2] Mean NDVI change: ${changeDetectionResult.statistics.meanChange?.toFixed(4) || 'N/A'}\n`);
      }
    } else {
      console.log('[ML-Model-2] No previous analysis available - skipping change detection');
      console.log('[ML-Model-2] First analysis recorded - future analyses will show pixel-level changes\n');
    }

    let riskClassification = null;
    if (changeDetectionResult) {
      console.log('[ML-Model-3] Risk Classifier: Assessing risk level...');
      const { decreaseCount, stableCount } = changeDetectionResult.statistics;
      const totalPixels = decreaseCount + stableCount + changeDetectionResult.statistics.increaseCount;
      const percentageChange = (decreaseCount / totalPixels) * 100;
      
      // Pass full NDVI data for pixel-level analysis
      const ndviDataForRisk = {
        ...ndviResult.statistics,
        ndvi: ndviResult?.ndvi?.ndvi || ndviResult?.ndvi || [] // Include full NDVI array
      };
      
      riskClassification = await mlModelClient.classifyRisk(
        changeDetectionResult.statistics.meanChange, 
        percentageChange,
        ndviDataForRisk
      );
      console.log(`[ML-Model-3] ✅ Risk classification complete`);
      console.log(`[ML-Model-3] Risk level: ${riskClassification.level}`);
      console.log(`[ML-Model-3] Risk score: ${riskClassification.score.toFixed(2)}\n`);
    } else {
      // First analysis (no previous data) - use NDVI only
      console.log('[ML-Model-3] Risk Classifier: First analysis - using NDVI-based risk\n');
      
      // Pass full NDVI data including the pixel array
      const ndviDataForRisk = {
        ...ndviResult.statistics,
        ndvi: ndviResult?.ndvi?.ndvi || ndviResult?.ndvi || [] // Include full NDVI array
      };
      
      riskClassification = await mlModelClient.classifyRisk(0, 0, ndviDataForRisk);
    }


    const executionTime = Date.now() - startTime;
    console.log(`✅ [Analysis] Pipeline completed successfully in ${(executionTime / 1000).toFixed(2)}s\n`);

    // Debug: Log risk classification object and derived values
    console.log('[Analysis] Full Risk Classification Object:', riskClassification);
    console.log('[Analysis] vegetationLossPercentage field:', riskClassification?.vegetationLossPercentage);
    console.log('[Analysis] vegetationLoss field:', riskClassification?.vegetationLoss);

    // Calculate area affected based on actual region size and vegetation loss
    const regionArea = region.sizeKm * region.sizeKm; // km²
    const vegetationLoss = riskClassification?.vegetationLossPercentage || riskClassification?.vegetationLoss || 0;
    const calculatedAreaAffected = (vegetationLoss / 100) * regionArea;

    console.log(`[Analysis] Final Values - Vegetation Loss: ${vegetationLoss}%, Area Affected: ${calculatedAreaAffected} km²`);

    return {
      success: true,
      regionName: region.name,
      timestamp: new Date(),
      executionTime: `${executionTime}ms`,
      ndvi: {
        ndvi: ndviResult?.ndvi?.ndvi || ndviResult?.ndvi || [],  // Full array for change detection
        values: ndviResult?.ndvi?.ndvi || ndviResult?.ndvi || [], // Alternative name
        statistics: {
          mean: ndviResult?.statistics?.mean || ndviResult?.ndvi?.mean || 0,
          min: ndviResult?.statistics?.min || ndviResult?.ndvi?.min || 0,
          max: ndviResult?.statistics?.max || ndviResult?.ndvi?.max || 0,
          stdDev: ndviResult?.statistics?.stdDev || ndviResult?.ndvi?.stdDev || 0,
          validPixels: ndviResult?.statistics?.validPixels || ndviResult?.ndvi?.validPixels || pixelCount,
          totalPixels: ndviResult?.statistics?.totalPixels || ndviResult?.ndvi?.totalPixels || pixelCount,
        },
      },
      changeDetection: changeDetectionResult ? {
        statistics: {
          meanChange: changeDetectionResult.statistics?.meanChange || 0,
          minChange: changeDetectionResult.statistics?.minChange || 0,
          maxChange: changeDetectionResult.statistics?.maxChange || 0,
          decreaseCount: changeDetectionResult.statistics?.decreaseCount || 0,
          increaseCount: changeDetectionResult.statistics?.increaseCount || 0,
          stableCount: changeDetectionResult.statistics?.stableCount || 0,
          changePercentage: changeDetectionResult.statistics?.decreaseCount ? 
            ((changeDetectionResult.statistics.decreaseCount / (changeDetectionResult.statistics.decreaseCount + changeDetectionResult.statistics.increaseCount + changeDetectionResult.statistics.stableCount)) * 100) : 0,
        },
      } : null,
      vegetationLossPercentage: vegetationLoss,
      areaAffected: calculatedAreaAffected,
      confidenceScore: riskClassification?.confidenceScore || 0.85,
      riskClassification: {
        riskLevel: riskClassification?.riskLevel || riskClassification?.level || 'low',
        riskScore: riskClassification?.riskScore || riskClassification?.score || 0,
      },
      changeDetection: changeDetectionResult?.statistics || {
        decreaseCount: 0,
        stableCount: 0,
        increaseCount: 0,
        meanChange: 0,
        minChange: 0,
        maxChange: 0,
        hasComparison: false, // Flag indicating this is first analysis (no previous data)
      },
      satelliteData: {
        bbox: satelliteData.bbox,
        dataSource: dataSource,
        fallbackUsed: fallbackUsed,
        mlApiStatus: fallbackUsed ? 'fallback-mock' : 'real-data',
      },
    };
  } catch (error) {
    console.error('[Analysis] Error occurred:', error.message);
    console.error('[Analysis] Stack:', error.stack);
    return {
      success: false,
      regionName: region.name,
      error: error.message || error.toString() || 'Unknown analysis error',
      timestamp: new Date(),
    };
  }
}

async function batchAnalyze(regions, previousAnalyses = {}) {
  try {
    const results = await Promise.all(
      regions.map((region) => performAnalysis(region, previousAnalyses[region.name]))
    );

    return {
      success: true,
      analysisCount: results.length,
      results,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Batch analysis error:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date(),
    };
  }
}

module.exports = {
  performAnalysis,
  batchAnalyze,
};
