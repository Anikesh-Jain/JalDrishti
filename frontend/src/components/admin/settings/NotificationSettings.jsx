import React, { useState, useEffect } from 'react';
import Card from '../../common/Card';
import Button from '../../common/Button';
import Badge from '../../common/Badge';
import SettingField from './SettingField';

/**
 * JalDrishti Phase 20: NotificationSettings Component
 *
 * Section B: SMS & Notification Settings
 * Manages SMS enablement, provider selection, masked recipient phone configuration,
 * and sender metadata without ever exposing sensitive API credentials or secret tokens.
 */
export default function NotificationSettings({
  config,
  onSaveConfig,
  isSaving = false,
  feedback = null
}) {
  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState('mock');
  const [sender, setSender] = useState('JALDRISHTI');
  const [recipientInput, setRecipientInput] = useState('');
  const [localError, setLocalError] = useState(null);
  const [savedLocally, setSavedLocally] = useState(false);

  // Sync state whenever persisted config loads from backend
  useEffect(() => {
    if (config) {
      setEnabled(Boolean(config.smsEnabled));
      setProvider(config.provider || 'mock');
      setSender(config.sender || 'JALDRISHTI');
      setRecipientInput('');
      setLocalError(null);
    }
  }, [config]);

  // Derive dirty state
  const isDirty =
    config &&
    (enabled !== Boolean(config.smsEnabled) ||
      provider !== (config.provider || 'mock') ||
      sender !== (config.sender || 'JALDRISHTI') ||
      recipientInput.trim().length > 0);

  const handleReset = () => {
    if (!config) return;
    setEnabled(Boolean(config.smsEnabled));
    setProvider(config.provider || 'mock');
    setSender(config.sender || 'JALDRISHTI');
    setRecipientInput('');
    setLocalError(null);
    setSavedLocally(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSavedLocally(false);

    // Validate phone number format if provided
    const trimmedRecipient = recipientInput.trim();
    if (trimmedRecipient.length > 0) {
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(trimmedRecipient)) {
        setLocalError(
          'Recipient phone number must be 10-15 digits in E.164 format (e.g. +919876543210)'
        );
        return;
      }
    }

    if (!provider || !provider.trim()) {
      setLocalError('SMS provider name cannot be empty');
      return;
    }

    const payload = {
      enabled,
      provider: provider.trim().toLowerCase(),
      sender: sender.trim()
    };

    // Only send recipient if user provided a new phone number
    if (trimmedRecipient.length > 0) {
      payload.recipient = trimmedRecipient;
    }

    const result = await onSaveConfig(payload);
    if (result && result.success) {
      setSavedLocally(true);
      setRecipientInput(''); // Clear the write-only input
      setTimeout(() => setSavedLocally(false), 3500);
    } else if (result && result.error) {
      setLocalError(result.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Form Card */}
      <Card
        title="SMS & Early Warning Notification Settings"
        subtitle="Configure alert dispatch triggers, gateway providers, and alert recipients."
        headerAction={
          <Badge
            variant={enabled ? 'safe' : 'neutral'}
            size="sm"
            dot
          >
            {enabled ? 'SMS Active' : 'SMS Inactive'}
          </Badge>
        }
      >
        <form onSubmit={handleSave} className="space-y-6">
          {/* SMS Enabled Switch */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-slate-900 block">
                Automated SMS Notifications
              </span>
              <p className="text-xs text-slate-500 max-w-lg">
                When enabled, the backend notification service dispatches SMS warnings
                to the designated recipient upon critical threshold breaches.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-slate-600">
                {enabled ? 'Enabled' : 'Disabled'}
              </span>
              <button
                type="button"
                id="toggle-sms"
                role="switch"
                aria-checked={enabled}
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                  enabled ? 'bg-brand-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {!enabled && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center space-x-2">
              <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                <strong>SMS Dispatch Disabled:</strong> Threshold violations will generate database alerts, but external SMS notifications will NOT be transmitted.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* SMS Provider Selection */}
            <SettingField
              id="sms-provider"
              label="SMS Gateway Provider"
              description="Backend SMS adapter driver. 'mock' logs alerts safely; 'twilio' uses environment credentials."
            >
              <select
                id="sms-provider"
                name="sms-provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-colors"
              >
                <option value="mock">mock (Simulated Gateway Adapter)</option>
                <option value="twilio">twilio (Twilio SMS Service)</option>
              </select>
            </SettingField>

            {/* Sender ID */}
            <SettingField
              id="sms-sender"
              label="Sender Identifier"
              description="Sender header tag included in outbound message dispatches."
            >
              <input
                id="sms-sender"
                name="sms-sender"
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="E.g. JALDRISHTI"
                className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-colors"
                required
              />
            </SettingField>
          </div>

          {/* Recipient Configuration */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Configured Emergency Recipient
                </h5>
                <p className="text-xs text-slate-500">
                  Target mobile phone number receiving threshold alert broadcasts.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">Current Persisted:</span>
                <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded border border-slate-200 text-slate-800">
                  {config?.recipientMasked || 'No recipient configured'}
                </span>
              </div>
            </div>

            <SettingField
              id="sms-recipient"
              label="Update Recipient Phone Number"
              description="Write-only update. Leave blank to preserve existing recipient. Must follow E.164 format (+[country code][number])."
            >
              <input
                id="sms-recipient"
                name="sms-recipient"
                type="tel"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                placeholder="E.g. +919876543210 (leave blank to keep current)"
                className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-colors"
              />
            </SettingField>
          </div>

          {/* Security & Credentials Policy */}
          <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-2">
            <div className="flex items-center space-x-2 font-semibold text-slate-800">
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Zero-Secret Exposure Architecture</span>
            </div>
            <p className="leading-relaxed">
              Provider API credentials, auth tokens, and account SIDs are managed strictly
              via server-side environment variables (e.g. <code>TWILIO_ACCOUNT_SID</code>, <code>TWILIO_AUTH_TOKEN</code>).
              They are never transmitted in API responses or rendered on the client.
            </p>
            <p className="text-slate-500 italic">
              Prototype Note: As an academic project, mock adapter delivery is active for testing.
              Real SMS carrier transmission requires valid telecommunications credentials in backend configuration.
            </p>
          </div>

          {/* Error and Success Feedback */}
          {(localError || (feedback && feedback.target === 'notification' && feedback.status === 'error')) && (
            <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium flex items-center space-x-2">
              <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{localError || feedback?.message}</span>
            </div>
          )}

          {(savedLocally || (feedback && feedback.target === 'notification' && feedback.status === 'success')) && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center space-x-2">
              <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>
                Notification settings saved successfully. Recipient updated and masked.
              </span>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div>
              {isDirty && (
                <span className="text-xs font-semibold text-amber-600">
                  You have unsaved notification changes
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {isDirty && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={isSaving}
                >
                  Revert Changes
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!isDirty || isSaving}
                isLoading={isSaving}
              >
                Save Notification Settings
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
