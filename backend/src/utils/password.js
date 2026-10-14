const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt with salt factor 10
 * @param {string} plainPassword
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

/**
 * Compare a plain text password against a bcrypt hash
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>} True if match, false otherwise
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  if (!plainPassword || !hashedPassword) {
    return false;
  }
  return bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword
};
