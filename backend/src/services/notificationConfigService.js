const env = require('../config/env');

/**
 * JalDrishti Phase 10: Notification Configuration Service
 *
 * Manages runtime notification and SMS recipient settings without exposing
 * credentials or requiring unnecessary database entities.
 */

// Helper to mask recipient phone numbers for safe display
function maskPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return '';
  const trimmed = phone.trim();
  if (trimmed.length <= 4) return '****';
  const visible = trimmed.slice(-4);
  const prefix = trimmed.startsWith('+') ? trimmed.slice(0, 3) : '';
  const maskedLength = Math.max(2, trimmed.length - visible.length - prefix.length);
  return `${prefix}${'*'.repeat(maskedLength)}${visible}`;
}

// In-memory active configuration initialized from validated environment variables
let activeConfig = {
  enabled: env.SMS_ENABLED,
  provider: env.SMS_PROVIDER || 'mock',
  recipient: env.SMS_RECIPIENT || '+919876543210',
  sender: env.SMS_SENDER || 'JALDRISHTI'
};

/**
 * Get safe public/admin configuration (secrets excluded, recipient masked)
 * @returns {Object}
 */
function getConfig() {
  return {
    smsEnabled: activeConfig.enabled,
    provider: activeConfig.provider,
    hasRecipient: Boolean(activeConfig.recipient && activeConfig.recipient.trim().length > 0),
    recipientMasked: maskPhoneNumber(activeConfig.recipient),
    sender: activeConfig.sender
  };
}

/**
 * Get internal raw configuration for service execution
 * @returns {Object}
 */
function getRawConfig() {
  return { ...activeConfig };
}

/**
 * Update notification and SMS recipient settings
 * @param {Object} updates
 * @param {boolean} [updates.enabled]
 * @param {string} [updates.recipient]
 * @param {string} [updates.provider]
 * @param {string} [updates.sender]
 * @returns {Object} Safe updated configuration
 */
function updateConfig(updates = {}) {
  if (updates.enabled !== undefined) {
    activeConfig.enabled = Boolean(updates.enabled);
  }

  if (updates.recipient !== undefined) {
    if (typeof updates.recipient !== 'string') {
      throw new Error('Recipient must be a string phone number');
    }
    const trimmed = updates.recipient.trim();
    if (trimmed.length > 0 && !/^\+?[0-9]{10,15}$/.test(trimmed)) {
      throw new Error('Recipient must be a valid 10-15 digit phone number (e.g. +919876543210)');
    }
    activeConfig.recipient = trimmed;
  }

  if (updates.provider !== undefined) {
    if (typeof updates.provider !== 'string' || updates.provider.trim().length === 0) {
      throw new Error('Provider must be a non-empty string');
    }
    activeConfig.provider = updates.provider.trim().toLowerCase();
  }

  if (updates.sender !== undefined) {
    if (typeof updates.sender !== 'string') {
      throw new Error('Sender must be a string');
    }
    activeConfig.sender = updates.sender.trim();
  }

  return getConfig();
}

/**
 * Reset configuration to environment defaults (used for test cleanup)
 */
function resetConfig() {
  activeConfig = {
    enabled: env.SMS_ENABLED,
    provider: env.SMS_PROVIDER || 'mock',
    recipient: env.SMS_RECIPIENT || '+919876543210',
    sender: env.SMS_SENDER || 'JALDRISHTI'
  };
  return getConfig();
}

module.exports = {
  getConfig,
  getRawConfig,
  updateConfig,
  resetConfig,
  maskPhoneNumber
};
