const mongoose = require('mongoose');
const alertService = require('../services/alertService');

/**
 * Controller for Alert querying and administration endpoints (Phase 9)
 */

const VALID_PARAMETERS = ['pH', 'turbidity', 'tds', 'temperature'];
const VALID_STATUSES = ['Active', 'Acknowledged', 'Resolved'];

/**
 * Retrieve all alerts with optional filtering and pagination.
 * GET /api/alerts
 */
const getAlerts = async (req, res, next) => {
  try {
    const { nodeId, parameter, status, page, limit } = req.query;
    const filter = {};

    // Strict type check and whitelist validation against NoSQL operator injection
    if (nodeId && typeof nodeId === 'string' && nodeId.trim()) {
      filter.nodeId = nodeId.trim().toUpperCase();
    }
    if (parameter && typeof parameter === 'string' && VALID_PARAMETERS.includes(parameter.trim())) {
      filter.parameter = parameter.trim();
    }
    if (status && typeof status === 'string' && VALID_STATUSES.includes(status.trim())) {
      filter.status = status.trim();
    }

    const result = await alertService.getAllAlerts(filter, { page, limit });
    return res.status(200).json({
      success: true,
      data: result.alerts,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve currently active alerts.
 * GET /api/alerts/active
 */
const getActiveAlerts = async (req, res, next) => {
  try {
    const { nodeId, parameter } = req.query;
    const filter = {};

    if (nodeId && typeof nodeId === 'string' && nodeId.trim()) {
      filter.nodeId = nodeId.trim().toUpperCase();
    }
    if (parameter && typeof parameter === 'string' && VALID_PARAMETERS.includes(parameter.trim())) {
      filter.parameter = parameter.trim();
    }

    const alerts = await alertService.getActiveAlerts(filter);
    return res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve resolved alert history.
 * GET /api/alerts/history
 */
const getAlertHistory = async (req, res, next) => {
  try {
    const { nodeId, parameter, page, limit } = req.query;
    const filter = {};

    if (nodeId && typeof nodeId === 'string' && nodeId.trim()) {
      filter.nodeId = nodeId.trim().toUpperCase();
    }
    if (parameter && typeof parameter === 'string' && VALID_PARAMETERS.includes(parameter.trim())) {
      filter.parameter = parameter.trim();
    }

    const result = await alertService.getAlertHistory(filter, { page, limit });
    return res.status(200).json({
      success: true,
      data: result.alerts,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve a single alert by ID.
 * GET /api/alerts/:id
 */
const getAlertById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alert ID format'
      });
    }

    const alert = await alertService.getAlertById(id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Acknowledge an alert (Admin-only)
 * PATCH /api/alerts/:id/ack
 */
const acknowledgeAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alert ID format'
      });
    }

    const Alert = require('../models/Alert');
    const alert = await Alert.findById(id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.status = 'Acknowledged';
    alert.acknowledgedBy = req.user._id;
    alert.acknowledgedAt = new Date();
    await alert.save();

    return res.status(200).json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Protected modification endpoint (Admin-only).
 * Citizen requests are blocked with HTTP 403 by roleMiddleware.
 * Manual modifications are rejected with HTTP 405 Method Not Allowed.
 */
const adminOnlyModificationNotice = (req, res) => {
  return res.status(405).json({
    success: false,
    message: 'Manual alert modification is disabled. Alert lifecycle is managed automatically via sensor telemetry.'
  });
};

module.exports = {
  getAlerts,
  getActiveAlerts,
  getAlertHistory,
  getAlertById,
  acknowledgeAlert,
  adminOnlyModificationNotice
};
