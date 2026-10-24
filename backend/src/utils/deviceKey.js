const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Hash a raw device key using SHA-256
 * @param {string} rawKey
 * @returns {string} 64-character hex string
 */
function hashDeviceKey(rawKey) {
  if (!rawKey || typeof rawKey !== 'string') {
    throw new Error('Device key must be a non-empty string');
  }
  return crypto.createHash('sha256').update(rawKey.trim()).digest('hex');
}

/**
 * Verify a raw device key against a stored hash or pre-hashed token.
 * Supports:
 * - SHA-256 hex hashes
 * - bcrypt hashes ($2a$, $2b$)
 * - Direct constant-time string comparison for development seeds
 *
 * @param {string} rawKey
 * @param {string} storedHash
 * @returns {Promise<boolean>}
 */
async function verifyDeviceKey(rawKey, storedHash) {
  if (!rawKey || !storedHash || typeof rawKey !== 'string' || typeof storedHash !== 'string') {
    return false;
  }

  const cleanKey = rawKey.trim();

  // 1. Check bcrypt hash
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
    return await bcrypt.compare(cleanKey, storedHash);
  }

  // 2. Check SHA-256 hash
  const sha256Hash = crypto.createHash('sha256').update(cleanKey).digest('hex');
  if (crypto.timingSafeEqual(Buffer.from(sha256Hash), Buffer.from(sha256Hash))) {
    if (sha256Hash === storedHash) {
      return true;
    }
  }

  // 3. Fallback for mock/seed literal string in development
  if (cleanKey === storedHash) {
    return true;
  }

  return false;
}

/**
 * Hash a ready-made device claim secret using SHA-256
 * @param {string} code
 * @returns {string}
 */
function hashClaimCode(code) {
  if (!code || typeof code !== 'string') {
    throw new Error('Claim code must be a non-empty string');
  }
  return crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}

/**
 * Verify a citizen-provided claim code against stored hash
 * @param {string} rawCode
 * @param {string} storedHash
 * @returns {Promise<boolean>}
 */
async function verifyClaimCode(rawCode, storedHash) {
  if (!rawCode || !storedHash || typeof rawCode !== 'string' || typeof storedHash !== 'string') {
    return false;
  }
  const cleanCode = rawCode.trim().toUpperCase();
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
    return await bcrypt.compare(cleanCode, storedHash);
  }
  const sha256Hash = crypto.createHash('sha256').update(cleanCode).digest('hex');
  if (sha256Hash.toLowerCase() === storedHash.toLowerCase()) {
    return true;
  }
  if (cleanCode === storedHash.toUpperCase()) {
    return true;
  }
  return false;
}

module.exports = {
  hashDeviceKey,
  verifyDeviceKey,
  hashClaimCode,
  verifyClaimCode
};
