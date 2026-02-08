/**
 * Custom Reason Service
 * Manages permanent storage of custom analysis reasons
 */

const CustomReason = require('../models/CustomReason');

class CustomReasonService {
  /**
   * Save a custom reason for an analysis
   */
  static async saveReason(regionName, latitude, longitude, reason, tags = []) {
    try {
      console.log(`[CustomReason] Saving reason for ${regionName}...`);

      const customReason = new CustomReason({
        regionName,
        latitude,
        longitude,
        reason,
        tags,
        analysisDate: new Date(),
      });

      await customReason.save();
      console.log(`[CustomReason] ✅ Reason saved permanently`);

      return {
        success: true,
        id: customReason._id,
        message: 'Reason saved permanently',
        data: customReason,
      };
    } catch (error) {
      console.error(`[CustomReason] Error saving reason:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all reasons for a specific region
   */
  static async getReasonsByRegion(regionName) {
    try {
      console.log(`[CustomReason] Fetching reasons for ${regionName}...`);

      const reasons = await CustomReason.find({ regionName })
        .sort({ createdAt: -1 })
        .limit(50);

      console.log(`[CustomReason] Found ${reasons.length} reasons`);

      return {
        success: true,
        count: reasons.length,
        data: reasons,
      };
    } catch (error) {
      console.error(`[CustomReason] Error fetching reasons:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all reasons globally
   */
  static async getAllReasons(limit = 100) {
    try {
      console.log(`[CustomReason] Fetching all reasons...`);

      const reasons = await CustomReason.find()
        .sort({ createdAt: -1 })
        .limit(limit);

      return {
        success: true,
        count: reasons.length,
        data: reasons,
      };
    } catch (error) {
      console.error(`[CustomReason] Error fetching all reasons:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update a reason
   */
  static async updateReason(reasonId, newReason, tags = []) {
    try {
      console.log(`[CustomReason] Updating reason ${reasonId}...`);

      const updated = await CustomReason.findByIdAndUpdate(
        reasonId,
        {
          reason: newReason,
          tags,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!updated) {
        return { success: false, error: 'Reason not found' };
      }

      console.log(`[CustomReason] ✅ Reason updated`);
      return {
        success: true,
        message: 'Reason updated',
        data: updated,
      };
    } catch (error) {
      console.error(`[CustomReason] Error updating reason:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete a reason
   */
  static async deleteReason(reasonId) {
    try {
      console.log(`[CustomReason] Deleting reason ${reasonId}...`);

      const deleted = await CustomReason.findByIdAndDelete(reasonId);

      if (!deleted) {
        return { success: false, error: 'Reason not found' };
      }

      console.log(`[CustomReason] ✅ Reason deleted`);
      return {
        success: true,
        message: 'Reason deleted',
      };
    } catch (error) {
      console.error(`[CustomReason] Error deleting reason:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get reasons by tag
   */
  static async getReasonsByTag(tag) {
    try {
      console.log(`[CustomReason] Fetching reasons with tag: ${tag}...`);

      const reasons = await CustomReason.find({ tags: tag })
        .sort({ createdAt: -1 });

      return {
        success: true,
        count: reasons.length,
        data: reasons,
      };
    } catch (error) {
      console.error(`[CustomReason] Error fetching by tag:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = CustomReasonService;
