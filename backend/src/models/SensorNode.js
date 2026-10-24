const mongoose = require('mongoose');

const sensorNodeSchema = new mongoose.Schema(
  {
    nodeId: {
      type: String,
      required: [true, 'Node ID is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: [true, 'Node name is required'],
      trim: true
    },
    location: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: -180,
        max: 180
      },
      address: {
        type: String,
        trim: true,
        default: ''
      }
    },
    deviceKeyHash: {
      type: String,
      required: [true, 'Device key hash is required']
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['Online', 'Offline', 'Maintenance'],
        message: '{VALUE} is not a valid node status'
      },
      default: 'Online'
    },
    lastSeen: {
      type: Date,
      default: null
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    claimCodeHash: {
      type: String,
      default: null
    },
    blynkIntegration: {
      configured: {
        type: Boolean,
        default: false
      },
      templateId: {
        type: String,
        default: null
      },
      deviceName: {
        type: String,
        default: null
      },
      lastSyncAt: {
        type: Date,
        default: null
      },
      syncStatus: {
        type: String,
        enum: ['connected', 'offline', 'disabled'],
        default: 'disabled'
      }
    },
    wifiProvisioning: {
      ssid: {
        type: String,
        default: null
      },
      configuredAt: {
        type: Date,
        default: null
      },
      status: {
        type: String,
        enum: ['unprovisioned', 'provisioned', 'failed'],
        default: 'unprovisioned'
      }
    }
  },
  {
    timestamps: true
  }
);

const SensorNode = mongoose.model('SensorNode', sensorNodeSchema);

module.exports = SensorNode;
