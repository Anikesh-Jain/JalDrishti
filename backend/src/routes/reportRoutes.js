const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const reportController = require('../controllers/reportController');

const router = express.Router();

/**
 * JalDrishti Phase 21: Reporting & Tabular Export Routes
 *
 * All report endpoints require valid Bearer token authentication.
 * Authorized for both Citizen and Admin roles (authoritative RBAC).
 * Unauthenticated requests receive HTTP 401.
 */
router.use(authenticate);
router.use(requireRole(['Citizen', 'Admin']));

// Historical sensor telemetry report endpoint (supports ?format=csv or default JSON)
router.get('/readings', reportController.getReadingsReport);

// Alert history report endpoint (supports ?format=csv or default JSON)
router.get('/alerts', reportController.getAlertsReport);

module.exports = router;
