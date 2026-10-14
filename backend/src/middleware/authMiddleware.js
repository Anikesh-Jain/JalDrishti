const mongoose = require('mongoose');
const { verifyJwtToken } = require('../utils/jwt');
const { User } = require('../models');

/**
 * Authentication Middleware (Phase 4)
 * Verifies Bearer JWT token and attaches authenticated user to req.user.
 * NOTE: Role-based authorization (RBAC) is strictly deferred to Phase 5.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required. Bearer token missing.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        error: 'Authentication token missing.'
      });
    }

    let decoded;
    try {
      decoded = verifyJwtToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Authentication token has expired' });
      }
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    if (!decoded || !decoded.userId || typeof decoded.userId !== 'string') {
      return res.status(401).json({ error: 'Malformed token payload' });
    }

    // Validate that userId is a valid MongoDB ObjectId to prevent CastError
    if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return res.status(401).json({ error: 'Malformed token payload: invalid user identifier format' });
    }

    // Retrieve user without passwordHash
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[AuthMiddleware Error]:', error.message);
    return res.status(500).json({ error: 'Internal authentication error' });
  }
};

module.exports = {
  authenticate
};
