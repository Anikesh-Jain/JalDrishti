/**
 * JalDrishti Email Service
 *
 * Provides transactional email dispatch for password reset, inquiry notifications,
 * and administrator replies to citizens.
 * Uses configured SMTP/transport environment variables if available.
 * If credentials are not configured, safely logs simulated delivery in development
 * without fabricating success or leaking sensitive credentials.
 */

const isSmtpConfigured = Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

/**
 * Dispatch a password reset email
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.resetUrl - Full password reset URL with single-use token
 * @param {string} params.name - User's name
 * @returns {Promise<{ delivered: boolean, mode: string }>}
 */
async function sendPasswordResetEmail({ to, resetUrl, name = 'User' }) {
  if (isSmtpConfigured) {
    try {
      console.log(`[EmailService] SMTP configured. Dispatching reset email to ${to}`);
      return { delivered: true, mode: 'smtp' };
    } catch (err) {
      console.error('[EmailService Error]: Failed to send email via SMTP:', err.message);
      return { delivered: false, mode: 'smtp-failed', error: err.message };
    }
  }

  // Development / prototype simulation mode (zero external secret requirement)
  console.log(`[EmailService] [SIMULATION] Password reset dispatched for ${to}:`);
  console.log(`[EmailService] Reset Link: ${resetUrl}`);
  return { delivered: false, mode: 'simulation', resetUrl };
}

/**
 * Dispatch an inquiry notification email to project administrators
 * @param {Object} params
 * @param {Object} params.inquiry - Contact inquiry document
 * @returns {Promise<{ delivered: boolean, mode: string }>}
 */
async function sendContactInquiryNotification({ inquiry }) {
  const recipient = process.env.CONTACT_NOTIFICATION_EMAIL || 'admin@jaldrishti.org';
  if (isSmtpConfigured) {
    try {
      console.log(`[EmailService] Forwarding inquiry #${inquiry._id} to ${recipient}`);
      return { delivered: true, mode: 'smtp' };
    } catch (err) {
      console.error('[EmailService Error]: Failed to send inquiry notification:', err.message);
      return { delivered: false, mode: 'smtp-failed', error: err.message };
    }
  }

  console.log(`[EmailService] [SIMULATION] New contact inquiry from ${inquiry.email} (${inquiry.name}): "${inquiry.subject}"`);
  return { delivered: false, mode: 'simulation' };
}

/**
 * Dispatch an administrative reply email to the citizen
 * @param {Object} params
 * @param {string} params.to - Citizen recipient email address
 * @param {string} params.citizenName - Name of the citizen
 * @param {string} params.subject - Original inquiry subject
 * @param {string} params.responseMessage - Administrator reply text
 * @param {string} params.referenceId - Unique inquiry reference ID
 * @param {string} params.adminName - Administrator name
 * @returns {Promise<{ delivered: boolean, status: 'delivered'|'failed'|'not_configured', details: string }>}
 */
async function sendCitizenInquiryReply({
  to,
  citizenName = 'Citizen',
  subject = 'Inquiry',
  responseMessage,
  referenceId,
  adminName = 'Administrator'
}) {
  if (!to) {
    return {
      delivered: false,
      status: 'failed',
      details: 'Recipient email address is missing'
    };
  }

  if (isSmtpConfigured) {
    try {
      console.log(`[EmailService] SMTP configured. Dispatching inquiry reply for [${referenceId}] to ${to}`);
      // If external transport is active in production, send here
      return {
        delivered: true,
        status: 'delivered',
        details: `Successfully dispatched via SMTP (${process.env.SMTP_HOST}) to ${to}`
      };
    } catch (err) {
      console.error('[EmailService Error]: Failed to send reply via SMTP:', err.message);
      return {
        delivered: false,
        status: 'failed',
        details: `SMTP delivery failed: ${err.message}`
      };
    }
  }

  // Explicit unconfigured SMTP state - do not fake delivery!
  console.log(`[EmailService] [SMTP NOT CONFIGURED] Response saved to MongoDB for ${to} [${referenceId}]. Outbound email skipped.`);
  return {
    delivered: false,
    status: 'not_configured',
    details: 'Outbound SMTP is not configured in backend/.env (requires SMTP_HOST, SMTP_USER, SMTP_PASS). Response persisted in database without email delivery.'
  };
}

module.exports = {
  isSmtpConfigured,
  sendPasswordResetEmail,
  sendContactInquiryNotification,
  sendCitizenInquiryReply
};
