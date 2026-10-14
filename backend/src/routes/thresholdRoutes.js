const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validateThresholdUpdate } = require('../validators/thresholdValidator');
const thresholdController = require('../controllers/thresholdController');

const router = express.Router();

// All threshold configuration endpoints are restricted to authenticated Administrators
router.use(authenticate, requireRole(['Admin']));

// Retrieve all thresholds
router.get('/', thresholdController.getThresholds);

// Retrieve single threshold by parameter
router.get('/:parameter', thresholdController.getThresholdByParam);

// Update single threshold limits
router.put('/:parameter', validateThresholdUpdate, thresholdController.updateThreshold);

module.exports = router;
