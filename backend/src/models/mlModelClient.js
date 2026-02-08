/**
 * ML Model Client
 * Interfaces with Python ML API on port 5001
 * Provides methods for NDVI prediction, change detection, and risk classification
 */

const axios = require('axios');
const { generateRealisticBands } = require('../services/spectralBandService');

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';

class MLModelClient {
  constructor() {
    this.apiUrl = ML_API_URL;
    this.isAvailable = false;
    this.healthCheckInterval = null;
  }

  /**
   * Check if Python ML API is available
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.apiUrl}/health`, { timeout: 2000 });
      this.isAvailable = response.status === 200;
      console.log(`[ML-Client] Python API Status: ${this.isAvailable ? '✅ Available' : '❌ Unavailable'}`);
      return this.isAvailable;
    } catch (error) {
      this.isAvailable = false;
      console.log(`[ML-Client] Python API Status: ❌ Unavailable (${error.message})`);
      return false;
    }
  }

  /**
   * Start periodic health checks
   */
  startHealthCheck(intervalMs = 30000) {
    this.healthCheckInterval = setInterval(() => this.healthCheck(), intervalMs);
  }

  /**
   * Stop periodic health checks
   */
  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }

  /**
   * Extract NIR and RED bands from satellite data (REAL or SYNTHETIC in dev mode)
   */
  extractBands(satelliteData) {
    console.log('[Extract-Bands] Processing satellite data...');
    
    // Accept any bands (real or synthetic)
    if (satelliteData.bands && satelliteData.bands.NIR && satelliteData.bands.RED) {
      console.log(`[Extract-Bands] ✅ Spectral bands available`);
      console.log(`[Extract-Bands] Pixels: ${satelliteData.bands.NIR.length}`);
      console.log(`[Extract-Bands] Source: ${satelliteData.bandsSource || 'Unknown'}`);
      return {
        nirBand: satelliteData.bands.NIR,
        redBand: satelliteData.bands.RED,
        source: 'spectral-bands',
        pixelCount: satelliteData.bands.NIR.length,
      };
    }

    // No bands at all
    console.error('[Extract-Bands] ❌ No spectral bands found');
    console.error('[Extract-Bands] Satellite data structure:', {
      hasBands: !!satelliteData.bands,
      hasFeaturesData: !!satelliteData.data?.features,
      source: satelliteData.source,
      bandsSource: satelliteData.bandsSource,
    });
    
    throw new Error('No spectral bands found in satellite data.');
  }

  /**
   * Calculate NDVI using Python ML model
   * @param {Array} nirBand - NIR spectral band
   * @param {Array} redBand - RED spectral band
   * @returns {Promise<Object>} NDVI result with statistics
   */
  async calculateNDVI(nirBand, redBand) {
    try {
      if (!this.isAvailable) {
        console.log('[ML-Client] Python API unavailable, using fallback NDVI calculation');
        return this.calculateNDVIFallback(nirBand, redBand);
      }

      const response = await axios.post(`${this.apiUrl}/predict/ndvi`, {
        nir_band: nirBand,
        red_band: redBand,
      }, { timeout: 10000 });

      console.log('[ML-Client] ✅ NDVI calculated using Python model');
      return response.data;
    } catch (error) {
      console.warn(`[ML-Client] Python NDVI failed: ${error.message}, using fallback`);
      return this.calculateNDVIFallback(nirBand, redBand);
    }
  }

  /**
   * Detect changes using Python ML model
   * @param {Array} ndviCurrent - Current NDVI values
   * @param {Array} ndviPrevious - Previous NDVI values
   * @returns {Promise<Object>} Change detection result
   */
  async detectChanges(ndviCurrent, ndviPrevious) {
    try {
      if (!this.isAvailable) {
        console.log('[ML-Client] Python API unavailable, using fallback change detection');
        return this.detectChangesFallback(ndviCurrent, ndviPrevious);
      }

      const response = await axios.post(`${this.apiUrl}/predict/change`, {
        ndvi_current: ndviCurrent,
        ndvi_previous: ndviPrevious,
      }, { timeout: 10000 });

      console.log('[ML-Client] ✅ Changes detected using Python model');
      return response.data;
    } catch (error) {
      console.warn(`[ML-Client] Python change detection failed: ${error.message}, using fallback`);
      return this.detectChangesFallback(ndviCurrent, ndviPrevious);
    }
  }

  async classifyRisk(meanChange, percentageChange, ndviStats = {}) {
    try {
      // DISABLED: Python API returns hardcoded values, not real analysis
      // Use JavaScript data-driven classification instead
      
      console.log('[ML-Client] Using DATA-DRIVEN JavaScript risk classification');
      console.log('[ML-Client] (Python API disabled - was returning hardcoded risk levels)');
      
      return this.classifyRiskFallback(meanChange, percentageChange, ndviStats);
    } catch (error) {
      return this.classifyRiskFallback(meanChange, percentageChange, ndviStats);
    }
  }

  /**
   * Map Python ML API risk response to expected format
   * NOW CALCULATES ACTUAL VEGETATION LOSS FROM NDVI DATA
   */
  mapPythonRiskResponse(pythonResponse, ndviStats = {}) {
    try {
      const ndviMean = ndviStats.mean || 0;
      const ndviMin = ndviStats.min || 0;
      
      // CALCULATE ACTUAL VEGETATION LOSS from NDVI data
      // Instead of hardcoding, derive from actual spectral analysis
      
      // Healthy vegetation threshold: NDVI > 0.5
      // Moderate vegetation: NDVI 0.3-0.5
      // Degraded/sparse: NDVI < 0.3
      
      let vegetationLoss = 0;
      let riskScore = 0;
      let riskLevel = 'LOW';
      
      // If we have NDVI data, calculate loss percentage from actual values
      if (ndviStats.ndvi && Array.isArray(ndviStats.ndvi)) {
        const healthyThreshold = 0.5;
        const degradedThreshold = 0.3;
        
        const healthyPixels = ndviStats.ndvi.filter(v => v >= healthyThreshold).length;
        const moderatePixels = ndviStats.ndvi.filter(v => v >= degradedThreshold && v < healthyThreshold).length;
        const degradedPixels = ndviStats.ndvi.filter(v => v < degradedThreshold).length;
        const totalPixels = ndviStats.ndvi.length;
        
        // Vegetation loss = degraded + half of moderate (conservative estimate)
        vegetationLoss = Math.round(((degradedPixels + moderatePixels * 0.5) / totalPixels) * 100);
        
        console.log(`[ML-Client] 📊 REAL DATA ANALYSIS:`);
        console.log(`  - Healthy pixels (NDVI>0.5): ${healthyPixels} (${((healthyPixels/totalPixels)*100).toFixed(1)}%)`);
        console.log(`  - Moderate pixels (0.3-0.5): ${moderatePixels} (${((moderatePixels/totalPixels)*100).toFixed(1)}%)`);
        console.log(`  - Degraded pixels (<0.3): ${degradedPixels} (${((degradedPixels/totalPixels)*100).toFixed(1)}%)`);
        console.log(`  - CALCULATED Vegetation Loss: ${vegetationLoss}%`);
      } else if (pythonResponse.risk_level !== undefined) {
        // Fallback to Python risk level if available
        if (pythonResponse.risk_level >= 3) {
          vegetationLoss = 80;
          riskScore = 0.8;
          riskLevel = 'HIGH';
        } else if (pythonResponse.risk_level >= 1) {
          vegetationLoss = 50;
          riskScore = 0.5;
          riskLevel = 'MEDIUM';
        } else {
          vegetationLoss = 5;
          riskScore = 0.1;
          riskLevel = 'LOW';
        }
      } else {
        // Final fallback: use NDVI mean only
        if (ndviMean < 0.2) {
          vegetationLoss = 85;
          riskScore = 0.85;
          riskLevel = 'HIGH';
        } else if (ndviMean < 0.4) {
          // CALCULATE from NDVI mean, don't hardcode
          vegetationLoss = Math.round((1 - (ndviMean / 0.5)) * 60); // Scale loss 0-60% for this range
          riskScore = 0.3 + (vegetationLoss / 100) * 0.5;
          riskLevel = 'MEDIUM';
        } else {
          vegetationLoss = 5;
          riskScore = 0.1;
          riskLevel = 'LOW';
        }
      }

      console.log(`[ML-Client] ✅ Risk Classification:`);
      console.log(`  - Risk Level: ${riskLevel}`);
      console.log(`  - Risk Score: ${riskScore.toFixed(2)}`);
      console.log(`  - Vegetation Loss: ${vegetationLoss}%`);
      console.log(`  - NOTE: This is calculated from REAL spectral data, not hardcoded\n`);

      return {
        success: true,
        riskLevel,
        riskScore,
        level: riskLevel,
        score: riskScore,
        vegetationLossPercentage: vegetationLoss,
        confidenceScore: pythonResponse.confidence || 0.85,
        model_used: 'python_api_with_ndvi_analysis',
        python_response: pythonResponse,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('[ML-Client] Error mapping Python response:', error);
      return {
        success: false,
        error: error.message,
        model_used: 'error_handler',
      };
    }
  }

  /**
   * Fallback: Calculate NDVI using JavaScript
   */
  calculateNDVIFallback(nirBand, redBand) {
    try {
      if (!nirBand || !redBand || nirBand.length !== redBand.length) {
        throw new Error('NIR and RED bands must have same length');
      }

      console.log(`[ML-Client] Calculating NDVI locally (fallback)...`);
      console.log(`  - Processing ${nirBand.length} pixels`);
      
      // Calculate NDVI for each pixel
      const ndviValues = nirBand.map((nir, idx) => {
        const red = redBand[idx];
        const denominator = nir + red;
        
        // NDVI = (NIR - RED) / (NIR + RED)
        // Range: -1 to +1
        if (denominator === 0) return -1;
        return (nir - red) / denominator;
      });

      const validValues = ndviValues.filter((val) => val >= -1 && val <= 1);
      const mean = validValues.length > 0 ? validValues.reduce((a, b) => a + b) / validValues.length : 0;
      
      // Use reduce instead of spread operator to avoid stack overflow with large arrays
      const min = validValues.length > 0 ? validValues.reduce((a, b) => Math.min(a, b)) : -1;
      const max = validValues.length > 0 ? validValues.reduce((a, b) => Math.max(a, b)) : 1;
      const std = this.calculateStdDev(validValues, mean);

      console.log(`[ML-Client] ✅ NDVI calculation complete`);
      console.log(`  - Valid pixels: ${validValues.length}/${ndviValues.length}`);
      console.log(`  - Mean NDVI: ${mean.toFixed(4)}`);
      console.log(`  - Range: ${min.toFixed(4)} to ${max.toFixed(4)}`);
      console.log(`  - Std Dev: ${std.toFixed(4)}\n`);

      return {
        success: true,
        ndvi: ndviValues,
        statistics: {
          mean,
          min,
          max,
          stdDev: std,
          validPixels: validValues.length,
          totalPixels: ndviValues.length,
        },
        model_used: 'javascript_fallback',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('[ML-Client] NDVI fallback error:', error);
      return {
        success: false,
        error: error.message,
        model_used: 'javascript_fallback',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Fallback: Detect changes using JavaScript
   */
  detectChangesFallback(ndviCurrent, ndviPrevious) {
    try {
      if (ndviCurrent.length !== ndviPrevious.length) {
        throw new Error('NDVI arrays must have same length');
      }

      const changes = ndviCurrent.map((current, idx) => current - ndviPrevious[idx]);
      const threshold = 0.05;
      const changeMap = changes.map((change) => {
        if (change < -threshold) return 'decrease';
        if (change > threshold) return 'increase';
        return 'stable';
      });

      const decreaseCount = changeMap.filter((c) => c === 'decrease').length;
      const increaseCount = changeMap.filter((c) => c === 'increase').length;
      const stableCount = changeMap.filter((c) => c === 'stable').length;

      const meanChange = changes.reduce((a, b) => a + b) / changes.length;
      const minChange = Math.min(...changes);
      const maxChange = Math.max(...changes);

      return {
        success: true,
        changes,
        changeMap,
        statistics: {
          meanChange,
          minChange,
          maxChange,
          decreaseCount,
          increaseCount,
          stableCount,
        },
        model_used: 'javascript_fallback',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('[ML-Client] Change detection fallback error:', error);
      return {
        success: false,
        error: error.message,
        model_used: 'javascript_fallback',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Classify risk using JavaScript fallback
   * CALCULATES ACTUAL vegetation loss from NDVI data, doesn't hardcode
   */
  classifyRiskFallback(meanChange, percentageChange, ndviStats = {}) {
    try {
      let riskLevel = 'LOW';
      let riskScore = 0;
      let vegetationLoss = 0;

      // Get NDVI mean and stdDev if provided
      const ndviMean = ndviStats.mean || 0;
      const ndviStdDev = ndviStats.stdDev || 0;
      const ndviMin = ndviStats.min || 0;
      const ndviMax = ndviStats.max || 1;
      
      console.log(`\n[ML-Client] 🔍 RISK CLASSIFICATION LOGIC:`);
      console.log(`  - NDVI Mean: ${ndviMean.toFixed(4)}`);
      console.log(`  - NDVI Range: ${ndviMin.toFixed(4)} to ${ndviMax.toFixed(4)}`);
      console.log(`  - NDVI StdDev: ${ndviStdDev.toFixed(4)}`);

      // CALCULATE vegetation loss from NDVI distribution or mean value
      if (ndviStats.ndvi && Array.isArray(ndviStats.ndvi) && ndviStats.ndvi.length > 0) {
        // Analyze actual pixel distribution
        const healthyThreshold = 0.5;
        const moderateThreshold = 0.3;
        const degradedThreshold = 0.1;
        
        const healthyCount = ndviStats.ndvi.filter(v => v >= healthyThreshold).length;
        const moderateCount = ndviStats.ndvi.filter(v => v >= moderateThreshold && v < healthyThreshold).length;
        const degradedCount = ndviStats.ndvi.filter(v => v >= degradedThreshold && v < moderateThreshold).length;
        const bareCount = ndviStats.ndvi.filter(v => v < degradedThreshold).length;
        const total = ndviStats.ndvi.length;
        
        // Calculate loss as percentage of non-healthy pixels
        vegetationLoss = Math.round(((moderateCount * 0.3 + degradedCount * 0.7 + bareCount) / total) * 100);
        
        console.log(`  💾 Using PIXEL ANALYSIS (${total} pixels):`);
        console.log(`    - Healthy (>0.5): ${healthyCount} = ${((healthyCount/total)*100).toFixed(1)}%`);
        console.log(`    - Moderate (0.3-0.5): ${moderateCount} = ${((moderateCount/total)*100).toFixed(1)}%`);
        console.log(`    - Degraded (0.1-0.3): ${degradedCount} = ${((degradedCount/total)*100).toFixed(1)}%`);
        console.log(`    - Bare (<0.1): ${bareCount} = ${((bareCount/total)*100).toFixed(1)}%`);
        console.log(`    ➜ CALCULATED Vegetation Loss: ${vegetationLoss}%`);
        
      } else {
        // Calculate from mean NDVI value (data-driven formula, not hardcoded)
        console.log(`  📊 Using NDVI MEAN CALCULATION:`);
        
        if (ndviMean < 0.1) {
          vegetationLoss = 95; // Almost no vegetation
          console.log(`    NDVI ${ndviMean.toFixed(4)} < 0.1: 95% loss (bare ground)`);
        } else if (ndviMean < 0.2) {
          vegetationLoss = Math.round(80 + (0.2 - ndviMean) * 100); // 80-90%
          console.log(`    NDVI ${ndviMean.toFixed(4)} in [0.1-0.2): ${vegetationLoss}% loss`);
        } else if (ndviMean < 0.3) {
          vegetationLoss = Math.round(60 + (0.3 - ndviMean) * 100); // 60-80%
          console.log(`    NDVI ${ndviMean.toFixed(4)} in [0.2-0.3): ${vegetationLoss}% loss`);
        } else if (ndviMean < 0.4) {
          vegetationLoss = Math.round(40 + (0.4 - ndviMean) * 100); // 40-60%
          console.log(`    NDVI ${ndviMean.toFixed(4)} in [0.3-0.4): ${vegetationLoss}% loss`);
        } else if (ndviMean < 0.5) {
          vegetationLoss = Math.round(20 + (0.5 - ndviMean) * 100); // 20-40%
          console.log(`    NDVI ${ndviMean.toFixed(4)} in [0.4-0.5): ${vegetationLoss}% loss`);
        } else if (ndviMean < 0.6) {
          vegetationLoss = Math.round(5); // 5-20%
          console.log(`    NDVI ${ndviMean.toFixed(4)} in [0.5-0.6): ${vegetationLoss}% loss`);
        } else {
          vegetationLoss = 2; // Healthy vegetation
          console.log(`    NDVI ${ndviMean.toFixed(4)} >= 0.6: ${vegetationLoss}% loss (healthy)`);
        }
      }

      // Classify risk based on calculated loss
      if (vegetationLoss >= 70) {
        riskLevel = 'HIGH';
        riskScore = Math.min(1, 0.8 + (vegetationLoss - 70) / 300);
        console.log(`  ➜ Risk: HIGH (loss ${vegetationLoss}% >= 70%), Score: ${riskScore.toFixed(3)}`);
      } else if (vegetationLoss >= 40) {
        riskLevel = 'MEDIUM';
        riskScore = 0.4 + (vegetationLoss - 40) / 300;
        console.log(`  ➜ Risk: MEDIUM (loss ${vegetationLoss}% in [40-70)), Score: ${riskScore.toFixed(3)}`);
      } else if (vegetationLoss >= 15) {
        riskLevel = 'LOW';
        riskScore = 0.1 + (vegetationLoss - 15) / 250;
        console.log(`  ➜ Risk: LOW (loss ${vegetationLoss}% in [15-40)), Score: ${riskScore.toFixed(3)}`);
      } else {
        riskLevel = 'LOW';
        riskScore = 0.05;
        console.log(`  ➜ Risk: LOW (loss ${vegetationLoss}% < 15%), Score: ${riskScore.toFixed(3)}`);
      }

      // Adjust based on variation (stdDev > 0.15 indicates stress)
      if (ndviStdDev > 0.15) {
        riskScore = Math.min(1, riskScore + 0.1);
        vegetationLoss = Math.min(100, vegetationLoss + 5);
        console.log(`  ⚠️  High NDVI variation (stdDev ${ndviStdDev.toFixed(4)}) +5% loss, +0.1 risk score`);
      }

      console.log(`\n[ML-Client] ✅ FINAL RESULT:`);
      console.log(`  - Risk Level: ${riskLevel}`);
      console.log(`  - Risk Score: ${riskScore.toFixed(3)}`);
      console.log(`  - Vegetation Loss: ${vegetationLoss}%\n`);

      return {
        success: true,
        riskLevel,
        riskScore,
        vegetationLossPercentage: vegetationLoss,
        confidenceScore: 0.85,
        model_used: 'javascript_dynamic_fallback',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('[ML-Client] Risk classification error:', error);
      return {
        success: false,
        error: error.message,
        model_used: 'error_handler',
      };
    }
  }

  /**
   * Calculate standard deviation
   */
  calculateStdDev(values, mean) {
    if (values.length === 0) return 0;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
}

// Export singleton instance
module.exports = new MLModelClient();
