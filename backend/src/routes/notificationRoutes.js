const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

/**
 * JalDrishti Phase 10: Notification & SMS Gateway Routes
 *
 * All endpoints require Admin role authorization.
 */

// Configuration endpoints (Admin only)
router.get('/config', authenticate, requireRole(['Admin']), notificationController.getConfig);
router.put('/config', authenticate, requireRole(['Admin']), notificationController.updateConfig);

// Notification audit log endpoints (Admin only)
router.get('/', authenticate, requireRole(['Admin']), notificationController.getNotifications);
router.get('/:id', authenticate, requireRole(['Admin']), notificationController.getNotificationById);

module.exports = router;
