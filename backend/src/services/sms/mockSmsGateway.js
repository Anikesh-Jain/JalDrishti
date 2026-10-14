/**
 * JalDrishti Phase 10: Mock SMS Gateway Adapter
 *
 * Simulates SMS gateway delivery for development, testing, and offline environments.
 * - Does NOT send real SMS
 * - Does NOT require real credentials
 * - Clearly distinguishes mock/development delivery from real provider delivery
 * - Does NOT log sensitive data or secrets
 * - Supports simulated controlled failure for test verification
 */

class MockSmsGateway {
  constructor(options = {}) {
    this.name = 'mock';
    this.sentMessages = [];
    this.simulateFailure = options.simulateFailure || false;
    this.failureReason = options.failureReason || 'Simulated mock gateway delivery failure';
  }

  /**
   * Configure simulated delivery failure for testing
   * @param {boolean} shouldFail
   * @param {string} [reason]
   */
  setSimulateFailure(shouldFail, reason) {
    this.simulateFailure = Boolean(shouldFail);
    if (reason) {
      this.failureReason = reason;
    }
  }

  /**
   * Send SMS via mock simulation
   * @param {Object} params
   * @param {string} params.to - Recipient phone number
   * @param {string} params.message - SMS text content
   * @returns {Promise<Object>} Safe provider-like delivery result
   */
  async sendSms({ to, message }) {
    if (!to || typeof to !== 'string' || to.trim().length === 0) {
      return {
        success: false,
        error: 'Recipient phone number is required and cannot be empty',
        provider: this.name,
        status: 'Failed'
      };
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return {
        success: false,
        error: 'Message content is required and cannot be empty',
        provider: this.name,
        status: 'Failed'
      };
    }

    const trimmedTo = to.trim();
    const trimmedMessage = message.trim();

    // Check if controlled simulated failure is requested
    if (this.simulateFailure) {
      return {
        success: false,
        error: this.failureReason,
        provider: this.name,
        recipient: trimmedTo,
        status: 'Failed'
      };
    }

    const messageId = `mock_sms_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const record = {
      messageId,
      to: trimmedTo,
      message: trimmedMessage,
      timestamp: new Date()
    };
    this.sentMessages.push(record);

    // Development log clearly showing mock simulation without leaking secrets
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[MockSmsGateway] [SIMULATION] SMS sent to ${trimmedTo} (MessageId: ${messageId})`);
    }

    return {
      success: true,
      messageId,
      provider: this.name,
      recipient: trimmedTo,
      status: 'Sent',
      timestamp: record.timestamp
    };
  }

  /**
   * Get in-memory history of sent mock SMS (for test verification)
   * @returns {Array}
   */
  getHistory() {
    return [...this.sentMessages];
  }

  /**
   * Clear in-memory history
   */
  clearHistory() {
    this.sentMessages = [];
  }
}

module.exports = MockSmsGateway;
