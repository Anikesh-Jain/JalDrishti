/**
 * JalDrishti Phase 10: Notification Configuration Request Validator
 */

function validateNotificationConfig(body) {
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      isValid: false,
      errors: ['Request body must be a JSON object']
    };
  }

  const allowedKeys = ['enabled', 'recipient', 'provider', 'sender'];
  const providedKeys = Object.keys(body).filter((k) => allowedKeys.includes(k));

  if (providedKeys.length === 0) {
    return {
      isValid: false,
      errors: ['At least one configuration field (enabled, recipient, provider, sender) must be provided']
    };
  }

  const sanitized = {};

  if (body.enabled !== undefined) {
    if (typeof body.enabled !== 'boolean') {
      errors.push('Field "enabled" must be a boolean');
    } else {
      sanitized.enabled = body.enabled;
    }
  }

  if (body.recipient !== undefined) {
    if (typeof body.recipient !== 'string') {
      errors.push('Field "recipient" must be a string phone number');
    } else {
      const trimmed = body.recipient.trim();
      if (trimmed.length > 0 && !/^\+?[0-9]{10,15}$/.test(trimmed)) {
        errors.push('Field "recipient" must be a valid 10-15 digit phone number (e.g. +919876543210)');
      } else {
        sanitized.recipient = trimmed;
      }
    }
  }

  if (body.provider !== undefined) {
    if (typeof body.provider !== 'string' || body.provider.trim().length === 0) {
      errors.push('Field "provider" must be a non-empty string');
    } else {
      sanitized.provider = body.provider.trim().toLowerCase();
    }
  }

  if (body.sender !== undefined) {
    if (typeof body.sender !== 'string') {
      errors.push('Field "sender" must be a string');
    } else {
      sanitized.sender = body.sender.trim();
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}

module.exports = {
  validateNotificationConfig
};
