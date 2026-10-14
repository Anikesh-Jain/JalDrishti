import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

/**
 * JalDrishti Phase 20: useAdminSettings Custom Hook
 *
 * Dedicated state management hook for Administrator Configuration:
 * - Water Quality Thresholds (pH, Turbidity, TDS, Temperature)
 * - SMS / Notification Configuration (Provider, Masked Recipient, Enabled Status)
 *
 * Enforces authoritative backend synchronization, granular save feedback,
 * and zero hardcoding of provisional monitoring limits.
 */
export default function useAdminSettings(options = {}) {
  const { enabled = true } = options;
  const [thresholds, setThresholds] = useState([]);
  const [notificationConfig, setNotificationConfig] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  // Granular saving and error states
  const [savingThreshold, setSavingThreshold] = useState({});
  const [savingNotification, setSavingNotification] = useState(false);
  const [actionFeedback, setActionFeedback] = useState({
    type: null, // 'threshold' | 'notification'
    status: null, // 'success' | 'error'
    message: null,
    target: null // parameter name if threshold
  });

  const fetchSettings = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [thresholdsRes, notifyRes] = await Promise.all([
        api.thresholds.getAll(),
        api.notifications.getConfig()
      ]);

      const loadedThresholds =
        (thresholdsRes && (thresholdsRes.thresholds || thresholdsRes.data)) || [];
      const loadedNotification =
        (notifyRes && (notifyRes.config || notifyRes.data)) || null;

      setThresholds(loadedThresholds);
      setNotificationConfig(loadedNotification);
    } catch (err) {
      console.error('[useAdminSettings fetchSettings Error]:', err);
      setError(
        err.message || 'Failed to load administrative settings from server'
      );
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [enabled, fetchSettings]);

  /**
   * Save / update a single water quality threshold
   * @param {string} parameter - E.g. 'pH', 'turbidity', 'tds', 'temperature'
   * @param {Object} updatePayload - { minimum, maximum, unit, enabled }
   */
  const saveThreshold = useCallback(async (parameter, updatePayload) => {
    setSavingThreshold((prev) => ({ ...prev, [parameter]: true }));
    setActionFeedback({ type: null, status: null, message: null, target: null });

    try {
      const res = await api.thresholds.update(parameter, updatePayload);
      const updatedItem = res?.threshold || res?.data;

      if (updatedItem) {
        setThresholds((prev) =>
          prev.map((t) => (t.parameter.toLowerCase() === parameter.toLowerCase() ? updatedItem : t))
        );
      } else {
        // Fallback refetch if item structure wasn't returned
        await fetchSettings();
      }

      setActionFeedback({
        type: 'threshold',
        status: 'success',
        message: res?.message || `Threshold for ${parameter} updated successfully.`,
        target: parameter
      });

      return { success: true, message: res?.message };
    } catch (err) {
      console.error(`[saveThreshold ${parameter} Error]:`, err);
      const errMsg = err.message || `Failed to update threshold for ${parameter}`;
      setActionFeedback({
        type: 'threshold',
        status: 'error',
        message: errMsg,
        target: parameter
      });
      return { success: false, error: errMsg };
    } finally {
      setSavingThreshold((prev) => ({ ...prev, [parameter]: false }));
    }
  }, [fetchSettings]);

  /**
   * Save / update notification & SMS settings
   * @param {Object} updatePayload - { enabled, recipient, provider, sender }
   */
  const saveNotificationConfig = useCallback(async (updatePayload) => {
    setSavingNotification(true);
    setActionFeedback({ type: null, status: null, message: null, target: null });

    try {
      const res = await api.notifications.updateConfig(updatePayload);
      const updatedConfig = res?.config || res?.data;

      if (updatedConfig) {
        setNotificationConfig(updatedConfig);
      } else {
        await fetchSettings();
      }

      setActionFeedback({
        type: 'notification',
        status: 'success',
        message: res?.message || 'Notification configuration updated successfully.',
        target: 'notification'
      });

      return { success: true, message: res?.message };
    } catch (err) {
      console.error('[saveNotificationConfig Error]:', err);
      const errMsg = err.message || 'Failed to update notification configuration';
      setActionFeedback({
        type: 'notification',
        status: 'error',
        message: errMsg,
        target: 'notification'
      });
      return { success: false, error: errMsg };
    } finally {
      setSavingNotification(false);
    }
  }, [fetchSettings]);

  const clearFeedback = useCallback(() => {
    setActionFeedback({ type: null, status: null, message: null, target: null });
  }, []);

  return {
    thresholds,
    notificationConfig,
    loading,
    error,
    savingThreshold,
    savingNotification,
    actionFeedback,
    clearFeedback,
    saveThreshold,
    saveNotificationConfig,
    refetch: fetchSettings
  };
}
