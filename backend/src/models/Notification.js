const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    alertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert',
      required: [true, 'Associated alert ID is required']
    },
    recipient: {
      type: String,
      required: [true, 'Notification recipient is required'],
      trim: true
    },
    channel: {
      type: String,
      required: true,
      enum: {
        values: ['SMS', 'Dashboard'],
        message: '{VALUE} is not a valid notification channel'
      },
      default: 'SMS'
    },
    message: {
      type: String,
      required: [true, 'Notification message content is required'],
      trim: true
    },
    deliveryStatus: {
      type: String,
      required: true,
      enum: {
        values: ['Delivered', 'Sent', 'Failed', 'Pending', 'Simulated'],
        message: '{VALUE} is not a valid delivery status'
      },
      default: 'Pending'
    },
    gatewayResponseId: {
      type: String,
      trim: true,
      default: null
    },
    failureReason: {
      type: String,
      trim: true,
      default: null
    },
    provider: {
      type: String,
      trim: true,
      default: null
    },
    sentAt: {
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
notificationSchema.index({ alertId: 1 });
notificationSchema.index({ timestamp: -1 });
notificationSchema.index({ deliveryStatus: 1, timestamp: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
