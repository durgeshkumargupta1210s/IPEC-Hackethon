/**
 * Custom Reason Routes
 * API endpoints for storing and retrieving permanent analysis reasons
 */

const express = require('express');
const CustomReasonService = require('../../services/customReasonService');

const router = express.Router();

/**
 * POST /api/custom-reasons
 * Save a custom reason for an analysis
 * 
 * Body: {
 *   regionName: "Region Name",
 *   latitude: 25.65,
 *   longitude: 84.12,
 *   reason: "Custom analysis reason",
 *   tags: ["tag1", "tag2"]
 * }
 */
router.post('/', async (req, res) => {
  try {
    const { regionName, latitude, longitude, reason, tags } = req.body;

    if (!regionName || !reason) {
      return res.status(400).json({
        success: false,
        error: 'regionName and reason are required',
      });
    }

    const result = await CustomReasonService.saveReason(
      regionName,
      latitude,
      longitude,
      reason,
      tags || []
    );

    res.json(result);
  } catch (error) {
    console.error('[API] Error saving reason:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/custom-reasons
 * Get all custom reasons (with optional limit)
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const result = await CustomReasonService.getAllReasons(limit);

    res.json(result);
  } catch (error) {
    console.error('[API] Error fetching reasons:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/custom-reasons/region/:regionName
 * Get all reasons for a specific region
 */
router.get('/region/:regionName', async (req, res) => {
  try {
    const { regionName } = req.params;
    const result = await CustomReasonService.getReasonsByRegion(regionName);

    res.json(result);
  } catch (error) {
    console.error('[API] Error fetching region reasons:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/custom-reasons/tag/:tag
 * Get all reasons with a specific tag
 */
router.get('/tag/:tag', async (req, res) => {
  try {
    const { tag } = req.params;
    const result = await CustomReasonService.getReasonsByTag(tag);

    res.json(result);
  } catch (error) {
    console.error('[API] Error fetching by tag:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/custom-reasons/:reasonId
 * Update a custom reason
 */
router.put('/:reasonId', async (req, res) => {
  try {
    const { reasonId } = req.params;
    const { reason, tags } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'reason is required',
      });
    }

    const result = await CustomReasonService.updateReason(
      reasonId,
      reason,
      tags || []
    );

    res.json(result);
  } catch (error) {
    console.error('[API] Error updating reason:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/custom-reasons/:reasonId
 * Delete a custom reason
 */
router.delete('/:reasonId', async (req, res) => {
  try {
    const { reasonId } = req.params;
    const result = await CustomReasonService.deleteReason(reasonId);

    res.json(result);
  } catch (error) {
    console.error('[API] Error deleting reason:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
