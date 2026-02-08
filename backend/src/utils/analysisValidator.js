/**
 * Analysis Data Validator
 * Ensures all analysis results contain realistic vegetation loss and area values
 * Prevents display of unrealistic demo/hardcoded values
 */

const REALISTIC_LOSS_MAX = 85;   // Max realistic vegetation loss (desert floor, bare ground)
const REALISTIC_LOSS_MIN = 0;    // Min possible loss
const REALISTIC_AREA_MAX = 2000; // Max realistic area affected (km²)
const REALISTIC_AREA_MIN = 0;    // Min area

/**
 * Validate and normalize analysis data to realistic ranges
 * @param {Object} analysis - Analysis object to validate
 * @returns {Object} Validated analysis with realistic values
 */
function validateAnalysisData(analysis) {
  if (!analysis || typeof analysis !== 'object') {
    return analysis;
  }

  // Create a copy to avoid mutating original
  const validated = { ...analysis };

  // Validate vegetation loss percentage
  if (analysis.vegetationLossPercentage !== undefined) {
    let loss = Number(analysis.vegetationLossPercentage);
    
    // Clip to realistic range
    if (loss > REALISTIC_LOSS_MAX) {
      console.warn(
        `[Validator] ⚠️  Vegetation loss ${loss}% exceeded max ${REALISTIC_LOSS_MAX}%. Clipped to realistic range.`
      );
      loss = REALISTIC_LOSS_MAX;
    }
    if (loss < REALISTIC_LOSS_MIN) {
      loss = REALISTIC_LOSS_MIN;
    }
    
    validated.vegetationLossPercentage = parseFloat(loss.toFixed(1));
  }

  // Validate area affected
  if (analysis.areaAffected !== undefined) {
    let area = Number(analysis.areaAffected);
    
    // Clip to realistic range
    if (area > REALISTIC_AREA_MAX) {
      console.warn(
        `[Validator] ⚠️  Area affected ${area} km² exceeded max ${REALISTIC_AREA_MAX}. Clipped to realistic range.`
      );
      area = REALISTIC_AREA_MAX;
    }
    if (area < REALISTIC_AREA_MIN) {
      area = REALISTIC_AREA_MIN;
    }
    
    validated.areaAffected = parseFloat(area.toFixed(1));
  }

  // Validate nested riskClassification
  if (analysis.riskClassification) {
    const rc = { ...analysis.riskClassification };
    
    if (rc.vegetationLossPercentage !== undefined) {
      let loss = Number(rc.vegetationLossPercentage);
      if (loss > REALISTIC_LOSS_MAX) {
        console.warn(`[Validator] ⚠️  Nested vegetation loss ${loss}% clipped to ${REALISTIC_LOSS_MAX}%`);
        loss = REALISTIC_LOSS_MAX;
      }
      rc.vegetationLossPercentage = parseFloat(loss.toFixed(1));
    }
    
    if (rc.areaAffected !== undefined) {
      let area = Number(rc.areaAffected);
      if (area > REALISTIC_AREA_MAX) {
        console.warn(`[Validator] ⚠️  Nested area affected ${area} clipped to ${REALISTIC_AREA_MAX}`);
        area = REALISTIC_AREA_MAX;
      }
      rc.areaAffected = parseFloat(area.toFixed(1));
    }
    
    validated.riskClassification = rc;
  }

  // Validate riskScore is between 0-1 (max risk is 0.85)
  if (analysis.riskClassification?.riskScore !== undefined) {
    let score = Number(analysis.riskClassification.riskScore);
    if (score > 1) {
      score = Math.min(score / 100, 1); // Handle percentage (100 -> 1.0)
    }
    validated.riskClassification.riskScore = parseFloat(score.toFixed(2));
  }

  return validated;
}

/**
 * Validate array of analyses
 * @param {Array} analyses - Array of analysis objects
 * @returns {Array} Array of validated analyses
 */
function validateAnalysisArray(analyses) {
  if (!Array.isArray(analyses)) {
    return analyses;
  }
  return analyses.map(validateAnalysisData);
}

/**
 * Check if analysis has unrealistic values
 * @param {Object} analysis - Analysis to check
 * @returns {boolean} true if unrealistic
 */
function isUnrealistic(analysis) {
  if (!analysis) return false;
  
  const loss = analysis.vegetationLossPercentage || analysis.riskClassification?.vegetationLossPercentage;
  const area = analysis.areaAffected || analysis.riskClassification?.areaAffected;
  
  return (loss && loss > REALISTIC_LOSS_MAX) || (area && area > REALISTIC_AREA_MAX);
}

module.exports = {
  validateAnalysisData,
  validateAnalysisArray,
  isUnrealistic,
  REALISTIC_LOSS_MAX,
  REALISTIC_AREA_MAX,
};
