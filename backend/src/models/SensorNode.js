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
    }
  },
  {
    timestamps: true
  }
);

const SensorNode = mongoose.model('SensorNode', sensorNodeSchema);

module.exports = SensorNode;
