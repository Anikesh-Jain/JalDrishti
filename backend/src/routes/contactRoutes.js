const express = require('express');
const contactController = require('../controllers/contactController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { contactRateLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

// Public contact inquiry submission (rate limited to prevent spam)
router.post('/', contactRateLimiter, contactController.submitInquiry);

// Admin-only inquiry review, search, and status management
router.get('/', authenticate, requireRole(['Admin']), contactController.getInquiries);
router.get('/:id', authenticate, requireRole(['Admin']), contactController.getInquiryById);
router.patch('/:id', authenticate, requireRole(['Admin']), contactController.updateInquiryStatus);
router.post('/:id/reply', authenticate, requireRole(['Admin']), contactController.replyToInquiry);
router.post('/:id/reply/:replyId/retry', authenticate, requireRole(['Admin']), contactController.retryReplyEmail);

module.exports = router;
