const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const hardwareController = require('../controllers/hardwareController');

const router = express.Router();

/**
 * Citizen Hardware & Device Management Endpoints
 * Accessible by authenticated Citizens and Admins.
 */

// Citizen's linked device & live status
router.get(
  '/my-device',
  authenticate,
  requireRole(['Citizen', 'Admin']),
  hardwareController.getMyDevice
);

// Claim and pair a ready-made device to citizen account
router.post(
  '/claim',
  authenticate,
  requireRole(['Citizen', 'Admin']),
  hardwareController.claimDevice
);

// Unpair device from citizen account
router.post(
  '/unpair',
  authenticate,
  requireRole(['Citizen', 'Admin']),
  hardwareController.unpairDevice
);

// Record/verify Wi-Fi provisioning status
router.post(
  '/wifi-provision',
  authenticate,
  requireRole(['Citizen', 'Admin']),
  hardwareController.provisionWifi
);

// Check Blynk integration status
router.get(
  '/blynk-status',
  authenticate,
  requireRole(['Citizen', 'Admin']),
  hardwareController.getBlynkStatus
);

// Inbound webhook for Blynk telemetry integration
router.post('/blynk-webhook', hardwareController.blynkWebhook);

// Comprehensive connection diagnostics & troubleshooting
router.get(
  '/diagnostics',
  authenticate,
  requireRole(['Citizen', 'Admin']),
  hardwareController.getConnectionDiagnostics
);

module.exports = router;
