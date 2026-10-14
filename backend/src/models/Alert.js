const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    nodeId: {
      type: String,
      required: [true, 'Node ID is required'],
      trim: true,
      uppercase: true
    },
    readingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reading',
      required: [true, 'Associated reading ID is required']
    },
    parameter: {
      type: String,
      required: [true, 'Breached parameter name is required'],
      enum: {
        values: ['pH', 'turbidity', 'tds', 'temperature'],
        message: '{VALUE} is not a valid parameter'
      }
    },
    value: {
      type: Number,
      required: [true, 'Measured value is required']
    },
    thresholdLimit: {
      type: Number,
      required: [true, 'Breached threshold limit is required']
    },
    thresholdMin: {
      type: Number,
      default: null
    },
    thresholdMax: {
      type: Number,
      default: null
    },
    direction: {
      type: String,
      required: [true, 'Breach direction is required'],
      enum: {
        values: ['LOW', 'HIGH'],
        message: '{VALUE} is not a valid breach direction'
      },
      default: 'HIGH'
    },
    severity: {
      type: String,
      required: [true, 'Severity level is required'],
      enum: {
        values: ['High', 'Medium', 'Info'],
        message: '{VALUE} is not a valid severity level'
      }
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['Active', 'Acknowledged', 'Resolved'],
        message: '{VALUE} is not a valid alert status'
      },
      default: 'Active'
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    lastBreachedAt: {
      type: Date,
      default: Date.now
    },
    breachCount: {
      type: Number,
      default: 1
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    acknowledgedAt: {
      type: Date,
      default: null
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

// Indexes
alertSchema.index({ status: 1, timestamp: -1 });
alertSchema.index({ nodeId: 1, status: 1 });
alertSchema.index({ nodeId: 1, parameter: 1, direction: 1, status: 1 });

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
