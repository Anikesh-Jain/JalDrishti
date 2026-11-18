/**
 * JalDrishti Server-Side Primary Administrator Email Utility
 *
 * Evaluates whether a cryptographically verified email address matches
 * the backend-configured ADMIN_EMAIL environment variable.
 *
 * Security invariants:
 * - Strictly server-side; never relies on frontend-supplied roles.
 * - Returns false when ADMIN_EMAIL is unset or empty.
 * - Normalizes whitespace and casing before comparison.
 */

const env = require('../config/env');

/**
 * Retrieve the list of configured primary admin emails from environment.
 * Reads process.env.ADMIN_EMAIL dynamically so runtime/test overrides take effect.
 *
 * @returns {string[]}
 */
function getConfiguredAdminEmails() {
  const raw = process.env.ADMIN_EMAIL !== undefined ? process.env.ADMIN_EMAIL : env.ADMIN_EMAIL;
  if (!raw || typeof raw !== 'string') {
    return [];
  }

  return raw
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Check if a verified email matches the configured ADMIN_EMAIL environment variable.
 *
 * @param {string} email - Verified email address
 * @returns {boolean}
 */
function isDesignatedAdminEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  const configuredAdmins = getConfiguredAdminEmails();
  return configuredAdmins.includes(normalized);
}

module.exports = {
  getConfiguredAdminEmails,
  isDesignatedAdminEmail
};

