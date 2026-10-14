const mongoose = require('mongoose');
const notificationConfigService = require('../services/notificationConfigService');
const notificationService = require('../services/notificationService');
const { validateNotificationConfig } = require('../validators/notificationValidator');

const VALID_DELIVERY_STATUSES = ['Sent', 'Failed', 'Pending'];
const VALID_CHANNELS = ['SMS', 'Email', 'Webhook'];

/**
 * JalDrishti Phase 10: Notification Controller
 *
 * Provides endpoints for Admin SMS/Notification configuration and audit querying.
 */

/**
 * GET /api/notifications/config
 * Retrieve safe notification and SMS recipient settings (Admin only).
 * Guaranteed to NOT expose API keys, secrets, or raw credentials.
 */
async function getConfig(req, res, next) {
  try {
    const config = notificationConfigService.getConfig();
    return res.status(200).json({
      success: true,
      config
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/notifications/config
 * Update SMS recipient and notification settings (Admin only).
 */
async function updateConfig(req, res, next) {
  try {
    const validation = validateNotificationConfig(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const updatedConfig = notificationConfigService.updateConfig(validation.sanitized);
    return res.status(200).json({
      success: true,
      message: 'Notification configuration updated successfully',
      config: updatedConfig
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/notifications
 * Retrieve paginated notification audit log (Admin only).
 */
async function getNotifications(req, res, next) {
  try {
    const { alertId, deliveryStatus, channel, page, limit } = req.query;
    const filter = {};

    // Validate alertId if provided
    if (alertId && typeof alertId === 'string' && mongoose.Types.ObjectId.isValid(alertId.trim())) {
      filter.alertId = alertId.trim();
    }
    // Whitelist deliveryStatus
    if (deliveryStatus && typeof deliveryStatus === 'string' && VALID_DELIVERY_STATUSES.includes(deliveryStatus.trim())) {
      filter.deliveryStatus = deliveryStatus.trim();
    }
    // Whitelist channel
    if (channel && typeof channel === 'string' && VALID_CHANNELS.includes(channel.trim())) {
      filter.channel = channel.trim();
    }

    const result = await notificationService.getNotifications(filter, { page, limit });

    // Format safe response with masked recipients
    const sanitizedNotifications = result.notifications.map((n) => ({
      id: n._id.toString(),
      alertId: n.alertId,
      recipient: notificationConfigService.maskPhoneNumber(n.recipient),
      channel: n.channel,
      message: n.message,
      deliveryStatus: n.deliveryStatus,
      gatewayResponseId: n.gatewayResponseId,
      provider: n.provider,
      sentAt: n.sentAt,
      failureReason: n.failureReason,
      timestamp: n.timestamp
    }));

    return res.status(200).json({
      success: true,
      notifications: sanitizedNotifications,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/notifications/:id
 * Retrieve single notification details by ID (Admin only).
 */
async function getNotificationById(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification ID format'
      });
    }

    const notification = await notificationService.getNotificationById(id.trim());

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification record not found'
      });
    }

    return res.status(200).json({
      success: true,
      notification: {
        id: notification._id.toString(),
        alertId: notification.alertId,
        recipient: notificationConfigService.maskPhoneNumber(notification.recipient),
        channel: notification.channel,
        message: notification.message,
        deliveryStatus: notification.deliveryStatus,
        gatewayResponseId: notification.gatewayResponseId,
        provider: notification.provider,
        sentAt: notification.sentAt,
        failureReason: notification.failureReason,
        timestamp: notification.timestamp
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getConfig,
  updateConfig,
  getNotifications,
  getNotificationById
};
