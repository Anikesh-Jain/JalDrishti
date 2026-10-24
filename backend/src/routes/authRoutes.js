const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { authRateLimiter, passwordResetRateLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

// Public Authentication Endpoints (protected against brute-force abuse via authRateLimiter)
router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);
router.post('/demo-login', authRateLimiter, authController.demoLogin);
router.post('/google', authRateLimiter, authController.googleAuth);

// Password Reset Endpoints (protected by separate passwordResetRateLimiter)
router.post('/forgot-password', passwordResetRateLimiter, authController.forgotPassword);
router.post('/reset-password', passwordResetRateLimiter, authController.resetPassword);

// Authenticated User Identity Endpoint
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/onboarding', authenticate, authController.updateOnboarding);

// Protected RBAC Verification Endpoints (Phase 5 / TC-10)
router.get('/admin-test', authenticate, requireRole(['Admin']), (req, res) => {
  res.status(200).json({
    message: 'Admin authorization granted',
    user: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role
    }
  });
});

router.get('/citizen-test', authenticate, requireRole(['Citizen', 'Admin']), (req, res) => {
  res.status(200).json({
    message: 'Citizen access granted',
    user: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role
    }
  });
});

// Security Verification Endpoint: Verify error handler suppresses stack traces and internal secrets
router.get('/error-test', (req, res, next) => {
  const simulatedError = new Error('Simulated internal failure at /var/data/secrets/internal_db.key');
  simulatedError.status = 500;
  next(simulatedError);
});

module.exports = router;

