const { Notification } = require('../models');
const smsGateway = require('./sms/smsGateway');
const notificationConfigService = require('./notificationConfigService');

/**
 * JalDrishti Phase 10: Notification Service
 *
 * Responsibilities:
 * - Format plain-language SMS alert messages
 * - Create and persist Notification audit records
 * - Dispatch notifications via pluggable SMS Gateway adapter
 * - Update delivery status (Sent / Failed / Pending)
 * - Prevent duplicate notifications per Alert
 * - Provide safe query methods for Admin audit logs
 */

/**
 * Construct concise, plain-language SMS message content
 * Example: "JalDrishti Alert: Node NODE-01 detected HIGH pH = 9.1. Safe range: 6.5–8.5."
 *
 * @param {Object} alert - Alert document or object
 * @returns {string}
 */
function formatAlertMessage(alert) {
  const node = alert.nodeId || 'SensorNode';
  const param = alert.parameter || 'Water parameter';
  const dir = alert.direction || (alert.value > alert.thresholdLimit ? 'HIGH' : 'LOW');
  const val = alert.value !== undefined ? alert.value : '';

  let rangeStr = '';
  if (alert.thresholdMin !== undefined && alert.thresholdMax !== undefined &&
      alert.thresholdMin !== null && alert.thresholdMax !== null) {
    rangeStr = `${alert.thresholdMin}–${alert.thresholdMax}`;
  } else if (alert.thresholdLimit !== undefined && alert.thresholdLimit !== null) {
    rangeStr = `${alert.thresholdLimit}`;
  } else {
    rangeStr = 'configured bounds';
  }

  return `JalDrishti Alert: Node ${node} detected ${dir} ${param} = ${val}. Safe range: ${rangeStr}.`;
}

/**
 * Process a single newly-created Active Alert and dispatch notification
 *
 * @param {Object} alert - Newly created Alert document
 * @param {Object} [reading] - Associated reading
 * @returns {Promise<Object|null>} Created notification record or null
 */
async function handleNewAlert(alert, reading) {
  if (!alert || !alert._id) {
    return null;
  }

  // 1. Duplicate check: Ensure this Alert has not already been notified
  const existingNotification = await Notification.findOne({ alertId: alert._id });
  if (existingNotification) {
    return existingNotification;
  }

  // 2. Format alert message content
  const message = formatAlertMessage(alert);

  // 3. Obtain current notification & SMS recipient configuration
  const config = notificationConfigService.getRawConfig();
  const recipient = (config.recipient || '').trim();

  // If no recipient configured
  if (!recipient) {
    const failedNotification = await Notification.create({
      alertId: alert._id,
      recipient: 'UNCONFIGURED',
      channel: 'SMS',
      message,
      deliveryStatus: 'Failed',
      failureReason: 'No SMS recipient phone number configured',
      provider: config.provider || 'mock',
      timestamp: new Date()
    });
    return failedNotification;
  }

  // 4. Create pending Notification record in MongoDB
  let notificationRecord;
  try {
    notificationRecord = await Notification.create({
      alertId: alert._id,
      recipient,
      channel: 'SMS',
      message,
      deliveryStatus: 'Pending',
      provider: config.provider || 'mock',
      timestamp: new Date()
    });
  } catch (dbErr) {
    console.error('[NotificationService] Failed to create Notification record:', dbErr.message);
    return null;
  }

  // 5. If SMS is disabled in configuration, do not invoke gateway
  if (!config.enabled) {
    notificationRecord.deliveryStatus = 'Pending';
    notificationRecord.failureReason = 'SMS delivery disabled in configuration';
    await notificationRecord.save();
    return notificationRecord;
  }

  // 6. Attempt delivery through SMS Gateway adapter
  try {
    const deliveryResult = await smsGateway.sendSms({
      to: recipient,
      message,
      provider: config.provider
    });

    if (deliveryResult.success) {
      notificationRecord.deliveryStatus = 'Sent';
      notificationRecord.gatewayResponseId = deliveryResult.messageId || null;
      notificationRecord.provider = deliveryResult.provider || config.provider;
      notificationRecord.sentAt = deliveryResult.timestamp || new Date();
      notificationRecord.failureReason = null;
    } else {
      notificationRecord.deliveryStatus = 'Failed';
      notificationRecord.failureReason = deliveryResult.error || 'SMS delivery failed';
      notificationRecord.provider = deliveryResult.provider || config.provider;
    }

    await notificationRecord.save();
  } catch (deliveryErr) {
    console.error('[NotificationService] SMS delivery error:', deliveryErr.message);
    notificationRecord.deliveryStatus = 'Failed';
    notificationRecord.failureReason = deliveryErr.message || 'Unexpected SMS delivery error';
    await notificationRecord.save();
  }

  return notificationRecord;
}

/**
 * Process a batch of newly-created Active Alerts from a reading
 *
 * @param {Array<Object>} createdAlerts - Array of newly created Alert documents
 * @param {Object} [reading] - Associated Reading document
 * @returns {Promise<Array<Object>>} List of processed Notification documents
 */
async function handleNewAlerts(createdAlerts = [], reading) {
  if (!Array.isArray(createdAlerts) || createdAlerts.length === 0) {
    return [];
  }

  const notifications = [];
  for (const alert of createdAlerts) {
    try {
      const record = await handleNewAlert(alert, reading);
      if (record) {
        notifications.push(record);
      }
    } catch (err) {
      console.error(`[NotificationService] Error notifying alert ${alert._id}:`, err.message);
    }
  }

  return notifications;
}

/**
 * Fetch paginated notification audit log (Admin only)
 *
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<Object>}
 */
async function getNotifications(filter = {}, options = {}) {
  const query = {};
  if (filter.alertId) query.alertId = filter.alertId;
  if (filter.deliveryStatus) query.deliveryStatus = filter.deliveryStatus;
  if (filter.channel) query.channel = filter.channel;

  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 50));
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('alertId', 'nodeId parameter value direction thresholdLimit severity status timestamp')
      .lean(),
    Notification.countDocuments(query)
  ]);

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
}

/**
 * Fetch a single notification by ID
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
async function getNotificationById(id) {
  return await Notification.findById(id)
    .populate('alertId', 'nodeId parameter value direction thresholdLimit severity status timestamp')
    .lean();
}

module.exports = {
  formatAlertMessage,
  handleNewAlert,
  handleNewAlerts,
  getNotifications,
  getNotificationById
};
