const path = require('path');
const dotenv = require('dotenv');

// Load .env file from backend root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jaldrishti',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'jaldrishti_default_dev_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  RATE_LIMIT_AUTH_WINDOW_MS: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS, 10) || 15 * 60 * 1000,
  RATE_LIMIT_AUTH_MAX: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 20,
  RATE_LIMIT_API_WINDOW_MS: parseInt(process.env.RATE_LIMIT_API_WINDOW_MS, 10) || 15 * 60 * 1000,
  RATE_LIMIT_API_MAX: parseInt(process.env.RATE_LIMIT_API_MAX, 10) || 200,
  BODY_LIMIT: process.env.BODY_LIMIT || '10kb',
  ALERT_DEBOUNCE_WINDOW_MS: parseInt(process.env.ALERT_DEBOUNCE_WINDOW_MS, 10) || 15 * 60 * 1000,
  // Phase 10: SMS Gateway & Notification Configuration
  SMS_ENABLED: process.env.SMS_ENABLED === 'false' ? false : true,
  SMS_PROVIDER: (process.env.SMS_PROVIDER || 'mock').toLowerCase(),
  SMS_API_KEY: process.env.SMS_API_KEY || '',
  SMS_API_SECRET: process.env.SMS_API_SECRET || '',
  SMS_SENDER: process.env.SMS_SENDER || 'JALDRISHTI',
  SMS_RECIPIENT: process.env.SMS_RECIPIENT || '+919876543210',
  // Phase 23: AI Water Image Screening Configuration
  AI_SCREENING_PROVIDER: (process.env.AI_SCREENING_PROVIDER || 'gemini').toLowerCase(),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  AI_SCREENING_MODEL: (() => {
    const configuredModel = process.env.AI_SCREENING_MODEL;
    if (!configuredModel || configuredModel === 'gemini-2.5-flash' || configuredModel === 'models/gemini-2.5-flash') {
      return 'gemini-3.8-flash';
    }
    return configuredModel.replace(/^models\//, '');
  })(),
  IMAGE_MAX_SIZE_BYTES: parseInt(process.env.IMAGE_MAX_SIZE_BYTES, 10) || 5 * 1024 * 1024,
  RATE_LIMIT_IMAGE_WINDOW_MS: parseInt(process.env.RATE_LIMIT_IMAGE_WINDOW_MS, 10) || 15 * 60 * 1000,
  RATE_LIMIT_IMAGE_MAX: parseInt(process.env.RATE_LIMIT_IMAGE_MAX, 10) || 20,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production'
};

// Security validation: verify essential configuration without printing secrets
if (env.isProduction) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'jaldrishti_default_dev_secret_key_2026') {
    console.warn('[SECURITY WARNING] Production environment detected with insecure/default JWT_SECRET!');
  }
}

module.exports = env;

