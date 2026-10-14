const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema(
  {
    nodeId: {
      type: String,
      required: [true, 'Node ID is required'],
      trim: true,
      uppercase: true
    },
    pH: {
      type: Number,
      required: [true, 'pH value is required'],
      min: [0.0, 'pH cannot be less than 0.0'],
      max: [14.0, 'pH cannot exceed 14.0']
    },
    turbidity: {
      type: Number,
      required: [true, 'Turbidity value is required'],
      min: [0.0, 'Turbidity cannot be negative']
    },
    tds: {
      type: Number,
      required: [true, 'TDS value is required'],
      min: [0.0, 'TDS cannot be negative']
    },
    temperature: {
      type: Number,
      required: [true, 'Temperature value is required'],
      min: [-10.0, 'Temperature cannot be below -10.0°C'],
      max: [80.0, 'Temperature cannot exceed 80.0°C']
    },
    overallStatus: {
      type: String,
      enum: {
        values: ['Safe', 'Caution', 'Unsafe'],
        message: '{VALUE} is not a valid overall water status'
      },
      default: 'Safe'
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

// Compound index for high-speed time-series retrieval by node
readingSchema.index({ nodeId: 1, timestamp: -1 });
// Single-field index for global time-series queries
readingSchema.index({ timestamp: -1 });

const Reading = mongoose.model('Reading', readingSchema);

module.exports = Reading;
