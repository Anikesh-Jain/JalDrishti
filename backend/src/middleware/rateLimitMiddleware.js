const { rateLimit } = require('express-rate-limit');
const env = require('../config/env');

/**
 * Rate limiter for sensitive authentication endpoints (register, login, google).
 * Protects against brute-force attacks and credential stuffing.
 */
const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_AUTH_WINDOW_MS,
  limit: env.RATE_LIMIT_AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please try again later.'
  },
  statusCode: 429
});

/**
 * General API rate limiter for standard endpoints.
 * Protects API surface against abusive traffic while allowing normal operations.
 */
const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_API_WINDOW_MS,
  limit: env.RATE_LIMIT_API_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please try again later.'
  },
  statusCode: 429
});

/**
 * Rate limiter for AI image screening endpoints (Phase 23).
 * Protects against upload abuse and resource exhaustion.
 */
const imageScreeningRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_IMAGE_WINDOW_MS,
  limit: env.RATE_LIMIT_IMAGE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many image screening requests. Please try again later.'
  },
  statusCode: 429
});

/**
 * Rate limiter for password reset requests (forgot-password, reset-password).
 * Dedicated limiter so login attempts are unaffected.
 */
const passwordResetRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: process.env.NODE_ENV === 'test' ? 1000 : 30, // 30 attempts per IP in production/dev
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many password reset requests. Please try again later.'
  },
  statusCode: 429
});

/**
 * Rate limiter for public Contact Us inquiry submissions.
 * Protects against spam and email flooding.
 */
const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: process.env.NODE_ENV === 'test' ? 1000 : 30, // 30 submissions per IP in production/dev
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many contact inquiry submissions. Please try again later.'
  },
  statusCode: 429
});

module.exports = {
  authRateLimiter,
  apiRateLimiter,
  imageScreeningRateLimiter,
  passwordResetRateLimiter,
  contactRateLimiter
};
