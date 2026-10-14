const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { imageScreeningRateLimiter } = require('../middleware/rateLimitMiddleware');
const {
  handleImageUpload,
  validateUploadedImage
} = require('../middleware/imageUploadMiddleware');
const {
  screenImage,
  getHistory,
  getStatus
} = require('../controllers/imageCheckController');

const router = express.Router();

/**
 * JalDrishti Phase 23: Image Check Routes
 *
 * All endpoints require authentication and role authorization (Citizen or Admin).
 */

// Check service availability and active provider readiness
router.get('/status', authenticate, requireRole(['Citizen', 'Admin']), getStatus);

// Upload and screen water image
router.post(
  '/screen',
  authenticate,
  requireRole(['Citizen', 'Admin']),
  imageScreeningRateLimiter,
  handleImageUpload,
  validateUploadedImage,
  screenImage
);

// Retrieve screening history (Citizen gets own, Admin can query all)
router.get('/', authenticate, requireRole(['Citizen', 'Admin']), getHistory);

module.exports = router;
