const mongoose = require('mongoose');

const imageCheckSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    imagePath: {
      type: String,
      trim: true,
      default: ''
    },
    result: {
      type: String,
      required: [true, 'Screening result classification is required'],
      enum: {
        values: ['Safe', 'Unsafe', 'Rejected'],
        message: '{VALUE} is not a valid screening result'
      }
    },
    confidence: {
      type: Number,
      required: [true, 'Confidence score is required'],
      min: [0.0, 'Confidence cannot be less than 0.0'],
      max: [100.0, 'Confidence cannot exceed 100.0']
    },
    advisory: {
      type: String,
      required: [true, 'Advisory guidance note is required'],
      trim: true
    },
    isWaterImage: {
      type: Boolean,
      required: true,
      default: true
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
imageCheckSchema.index({ userId: 1, timestamp: -1 });

const ImageCheck = mongoose.model('ImageCheck', imageCheckSchema);

module.exports = ImageCheck;
