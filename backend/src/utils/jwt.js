const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generate a signed JWT containing minimal user identity (userId, role)
 * @param {Object} payload - { userId, role }
 * @returns {string} Signed JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      role: payload.role
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN
    }
  );
};

/**
 * Verify a signed JWT token
 * @param {string} token - Bearer JWT token string
 * @returns {Object} Decoded payload
 */
const verifyJwtToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyJwtToken
};
