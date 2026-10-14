const { Alert } = require('../models');
const env = require('../config/env');

/**
 * JalDrishti Phase 9 Alert Lifecycle & Debounce Service
 *
 * Responsibilities:
 * - Convert Phase 8 threshold evaluation breaches into managed Alert documents
 * - Deduplicate/debounce repeated breaches of the same condition (Node + Parameter + Direction + Active)
 * - Maintain/update existing active alert on continuing breaches without creating duplicates
 * - Automatically resolve active alerts when reading returns to configured safe range
 * - Support independent multi-parameter alert lifecycles
 * - Provide protected query methods for active alerts, historical alerts, and all alerts
 *
 * Note: Configurable suppression window (ALERT_DEBOUNCE_WINDOW_MS) is an implementation choice,
 * NOT an authoritative SRS requirement.
 */

/**
 * Process a sensor reading and its Phase 8 evaluation to manage alert lifecycles.
 *
 * @param {Object} reading - Persisted Reading document or object
 * @param {Object} evaluation - Evaluation results from thresholdService
 * @returns {Promise<Object>} Summary of created, maintained, and resolved alerts
 */
async function processReadingAlerts(reading, evaluation) {
  if (!reading || !reading.nodeId) {
    throw new Error('Reading with valid nodeId is required for alert processing');
  }

  if (!evaluation || !evaluation.parameters) {
    return { created: [], maintained: [], resolved: [] };
  }

  const result = {
    created: [],
    maintained: [],
    resolved: []
  };

  const nodeId = reading.nodeId;
  const readingTime = reading.timestamp || new Date();
  const readingId = reading._id;

  for (const [parameter, paramEval] of Object.entries(evaluation.parameters)) {
    // If threshold evaluation was not performed (missing/disabled config), skip
    if (!paramEval || !paramEval.evaluated) {
      continue;
    }

    if (paramEval.breach) {
      // ----------------------------------------------------
      // Parameter breached threshold (LOW or HIGH)
      // ----------------------------------------------------
      const direction = paramEval.direction; // 'LOW' or 'HIGH'
      const measuredValue = paramEval.value;
      const thresholdLimit = direction === 'LOW' ? paramEval.minimum : paramEval.maximum;
      const thresholdMin = paramEval.minimum;
      const thresholdMax = paramEval.maximum;

      // 1. Check for existing active alert for this node, parameter, and direction
      const existingActiveAlert = await Alert.findOne({
        nodeId,
        parameter,
        direction,
        status: 'Active'
      });

      if (existingActiveAlert) {
        // Debounce / deduplication: Maintain and update existing active alert
        existingActiveAlert.value = measuredValue;
        existingActiveAlert.readingId = readingId;
        existingActiveAlert.lastBreachedAt = readingTime;
        existingActiveAlert.breachCount = (existingActiveAlert.breachCount || 1) + 1;
        existingActiveAlert.thresholdLimit = thresholdLimit;
        existingActiveAlert.thresholdMin = thresholdMin;
        existingActiveAlert.thresholdMax = thresholdMax;

        await existingActiveAlert.save();
        result.maintained.push(existingActiveAlert);
      } else {
        // Create new active alert
        try {
          const newAlert = await Alert.create({
            nodeId,
            readingId,
            parameter,
            value: measuredValue,
            direction,
            thresholdLimit,
            thresholdMin,
            thresholdMax,
            severity: 'High',
            status: 'Active',
            timestamp: readingTime,
            lastBreachedAt: readingTime,
            breachCount: 1
          });
          result.created.push(newAlert);
        } catch (createErr) {
          // Concurrency safety: if duplicate key or race condition, find and update
          if (createErr.code === 11000) {
            const raceAlert = await Alert.findOne({
              nodeId,
              parameter,
              direction,
              status: 'Active'
            });
            if (raceAlert) {
              raceAlert.value = measuredValue;
              raceAlert.readingId = readingId;
              raceAlert.lastBreachedAt = readingTime;
              raceAlert.breachCount = (raceAlert.breachCount || 1) + 1;
              await raceAlert.save();
              result.maintained.push(raceAlert);
            }
          } else {
            throw createErr;
          }
        }
      }

      // If there was an active alert with the opposite direction (e.g. was LOW, now HIGH), resolve it
      const oppositeDirection = direction === 'LOW' ? 'HIGH' : 'LOW';
      const oppositeActiveAlerts = await Alert.find({
        nodeId,
        parameter,
        direction: oppositeDirection,
        status: 'Active'
      });

      for (const oppAlert of oppositeActiveAlerts) {
        oppAlert.status = 'Resolved';
        oppAlert.resolvedAt = readingTime;
        await oppAlert.save();
        result.resolved.push(oppAlert);
      }

    } else {
      // ----------------------------------------------------
      // Parameter returned to safe range (Safe)
      // ----------------------------------------------------
      const activeAlerts = await Alert.find({
        nodeId,
        parameter,
        status: 'Active'
      });

      for (const activeAlert of activeAlerts) {
        activeAlert.status = 'Resolved';
        activeAlert.resolvedAt = readingTime;
        await activeAlert.save();
        result.resolved.push(activeAlert);
      }
    }
  }

  return result;
}

/**
 * Fetch currently active alerts.
 * @param {Object} filter - Optional query filter (e.g. nodeId, parameter)
 * @returns {Promise<Array>}
 */
async function getActiveAlerts(filter = {}) {
  const query = { status: 'Active' };
  if (filter.nodeId) query.nodeId = filter.nodeId.toUpperCase();
  if (filter.parameter) query.parameter = filter.parameter;

  return await Alert.find(query)
    .sort({ timestamp: -1 })
    .populate('readingId', 'pH turbidity tds temperature timestamp')
    .lean();
}

/**
 * Fetch resolved alert history.
 * @param {Object} filter - Optional query filter
 * @param {Object} options - Pagination options { page, limit }
 * @returns {Promise<Object>}
 */
async function getAlertHistory(filter = {}, options = {}) {
  const query = { status: 'Resolved' };
  if (filter.nodeId) query.nodeId = filter.nodeId.toUpperCase();
  if (filter.parameter) query.parameter = filter.parameter;

  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 50));
  const skip = (page - 1) * limit;

  const [alerts, total] = await Promise.all([
    Alert.find(query)
      .sort({ resolvedAt: -1, timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('readingId', 'pH turbidity tds temperature timestamp')
      .lean(),
    Alert.countDocuments(query)
  ]);

  return {
    alerts,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
}

/**
 * Fetch all alerts with optional filtering and pagination.
 * @param {Object} filter - Optional query filter (nodeId, parameter, status)
 * @param {Object} options - Pagination options { page, limit }
 * @returns {Promise<Object>}
 */
async function getAllAlerts(filter = {}, options = {}) {
  const query = {};
  if (filter.nodeId) query.nodeId = filter.nodeId.toUpperCase();
  if (filter.parameter) query.parameter = filter.parameter;
  if (filter.status) query.status = filter.status;

  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 50));
  const skip = (page - 1) * limit;

  const [alerts, total] = await Promise.all([
    Alert.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('readingId', 'pH turbidity tds temperature timestamp')
      .lean(),
    Alert.countDocuments(query)
  ]);

  return {
    alerts,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
}

/**
 * Fetch a single alert by ID.
 * @param {string} id - MongoDB ObjectId
 * @returns {Promise<Object|null>}
 */
async function getAlertById(id) {
  return await Alert.findById(id)
    .populate('readingId', 'pH turbidity tds temperature timestamp')
    .populate('acknowledgedBy', 'name email role')
    .lean();
}

module.exports = {
  processReadingAlerts,
  getActiveAlerts,
  getAlertHistory,
  getAllAlerts,
  getAlertById
};
