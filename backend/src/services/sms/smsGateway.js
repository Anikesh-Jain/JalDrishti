const env = require('../../config/env');
const MockSmsGateway = require('./mockSmsGateway');

/**
 * JalDrishti Phase 10: SMS Gateway Abstraction
 *
 * Provides a provider-agnostic interface for SMS dispatch.
 * Alerts and notification services depend on this gateway rather than any concrete provider.
 *
 * Supported providers:
 * - 'mock': Local development/testing simulation (default)
 * - 'fast2sms' / 'twilio' / 'generic': Pluggable real providers (requires environment credentials)
 */

class SmsGateway {
  constructor(config = {}) {
    this.config = {
      provider: config.provider || env.SMS_PROVIDER || 'mock',
      apiKey: config.apiKey !== undefined ? config.apiKey : env.SMS_API_KEY,
      apiSecret: config.apiSecret !== undefined ? config.apiSecret : env.SMS_API_SECRET,
      sender: config.sender || env.SMS_SENDER || 'JALDRISHTI',
      ...config
    };
    this.mockGateway = new MockSmsGateway();
    this.customAdapter = null;
  }

  /**
   * Inject a custom adapter (used for testing or dynamic provider registration)
   * @param {Object} adapter - Adapter implementing sendSms({ to, message })
   */
  setAdapter(adapter) {
    this.customAdapter = adapter;
  }

  /**
   * Reset adapter to default
   */
  resetAdapter() {
    this.customAdapter = null;
    this.mockGateway = new MockSmsGateway();
  }

  /**
   * Resolve active adapter based on provider name
   * @param {string} [requestedProvider]
   * @returns {Object} Adapter with sendSms({ to, message })
   */
  getAdapter(requestedProvider) {
    if (this.customAdapter) {
      return this.customAdapter;
    }

    const provider = (requestedProvider || this.config.provider || 'mock').toLowerCase();

    if (provider === 'mock' || provider === 'dev' || provider === 'test') {
      return this.mockGateway;
    }

    // Real provider fallback / safe validation:
    // If provider is specified but credentials are missing
    return {
      name: provider,
      sendSms: async ({ to, message }) => {
        if (!this.config.apiKey || this.config.apiKey.trim().length === 0) {
          return {
            success: false,
            error: `SMS provider '${provider}' credentials are not configured`,
            provider,
            status: 'Failed'
          };
        }

        // Safe stub for live provider when credentials exist but live HTTP integration is not live-tested
        return {
          success: false,
          error: `Live SMS provider '${provider}' adapter is not live-tested in current environment`,
          provider,
          status: 'Failed'
        };
      }
    };
  }

  /**
   * Primary unified SMS dispatch operation
   *
   * @param {Object} params
   * @param {string} params.to - Recipient phone number
   * @param {string} params.message - SMS content
   * @param {string} [params.provider] - Optional provider override
   * @returns {Promise<Object>} Safe delivery outcome
   */
  async sendSms({ to, message, provider }) {
    const adapter = this.getAdapter(provider);
    try {
      return await adapter.sendSms({ to, message });
    } catch (err) {
      return {
        success: false,
        error: err.message || 'SMS adapter unexpected error',
        provider: adapter.name || 'unknown',
        status: 'Failed'
      };
    }
  }
}

// Export singleton instance initialized from environment, along with class
const defaultGateway = new SmsGateway();

module.exports = defaultGateway;
module.exports.SmsGateway = SmsGateway;
module.exports.MockSmsGateway = MockSmsGateway;
