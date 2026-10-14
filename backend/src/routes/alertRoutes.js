const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const alertController = require('../controllers/alertController');

const router = express.Router();

// All alert endpoints require authentication (Phase 4)
router.use(authenticate);

// Read endpoints: accessible to authenticated Admin and Citizen roles (Phase 5 / DEC-06)
router.get('/', requireRole(['Admin', 'Citizen']), alertController.getAlerts);
router.get('/active', requireRole(['Admin', 'Citizen']), alertController.getActiveAlerts);
router.get('/history', requireRole(['Admin', 'Citizen']), alertController.getAlertHistory);
router.get('/:id', requireRole(['Admin', 'Citizen']), alertController.getAlertById);

// Alert acknowledgment endpoint (Admin-only)
router.patch('/:id/ack', requireRole(['Admin']), alertController.acknowledgeAlert);

// Other modification endpoints: strictly restricted to Admin role; Citizens rejected with HTTP 403 (TC-10 / Phase 9 Test 18)
router.patch('/:id', requireRole(['Admin']), alertController.adminOnlyModificationNotice);
router.put('/:id', requireRole(['Admin']), alertController.adminOnlyModificationNotice);
router.post('/', requireRole(['Admin']), alertController.adminOnlyModificationNotice);
router.delete('/:id', requireRole(['Admin']), alertController.adminOnlyModificationNotice);

module.exports = router;
