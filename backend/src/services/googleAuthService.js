const { OAuth2Client } = require('google-auth-library');
const env = require('../config/env');

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

/**
 * Verify a Google ID token received from the client
 * @param {string} idToken - Google credential ID token
 * @returns {Promise<Object>} Verified profile payload { googleId, email, name, picture }
 */
const verifyGoogleIdToken = async (idToken) => {
  if (!idToken) {
    throw new Error('Google credential token is required');
  }

  if (!env.GOOGLE_CLIENT_ID) {
    throw new Error(
      'Google OAuth is not configured on this server (GOOGLE_CLIENT_ID environment variable is missing).'
    );
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Invalid Google token payload');
  }

  return {
    googleId: payload.sub,
    email: payload.email ? payload.email.toLowerCase().trim() : null,
    name: payload.name || 'Google User',
    picture: payload.picture || null,
    emailVerified: payload.email_verified
  };
};

module.exports = {
  verifyGoogleIdToken
};
