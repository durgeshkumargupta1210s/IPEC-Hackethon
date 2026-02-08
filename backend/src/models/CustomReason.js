/**
 * Custom Reason Model
 * Stores permanent custom reasons/notes for analyses
 */

const mongoose = require('mongoose');

const customReasonSchema = new mongoose.Schema({
  regionName: {
    type: String,
    required: true,
    index: true,
  },
  latitude: Number,
  longitude: Number,
  reason: {
    type: String,
    required: true,
  },
  analysisDate: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  tags: [String], // For categorizing reasons
});

// Index for faster queries
customReasonSchema.index({ regionName: 1, createdAt: -1 });

const CustomReason = mongoose.model('CustomReason', customReasonSchema);

module.exports = CustomReason;
