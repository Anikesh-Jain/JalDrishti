const mongoose = require('mongoose');

const thresholdSchema = new mongoose.Schema(
  {
    parameter: {
      type: String,
      required: [true, 'Parameter name is required'],
      unique: true,
      enum: {
        values: ['pH', 'turbidity', 'tds', 'temperature'],
        message: '{VALUE} is not a valid water quality parameter'
      }
    },
    minimum: {
      type: Number,
      required: [true, 'Minimum threshold limit is required']
    },
    maximum: {
      type: Number,
      required: [true, 'Maximum threshold limit is required'],
      validate: {
        validator: function (value) {
          // Check that maximum is greater than or equal to minimum
          return typeof this.minimum !== 'number' || value >= this.minimum;
        },
        message: 'Maximum limit must be greater than or equal to minimum limit'
      }
    },
    unit: {
      type: String,
      required: [true, 'Unit of measurement is required'],
      trim: true
    },
    enabled: {
      type: Boolean,
      default: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Threshold = mongoose.model('Threshold', thresholdSchema);

module.exports = Threshold;
