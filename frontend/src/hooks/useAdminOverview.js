import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

/**
 * JalDrishti Phase 14: useAdminOverview Custom Hook
 *
 * Fetches real, read-only operational telemetry and metadata from existing backend endpoints:
 * - GET /health (Database connection & server uptime)
 * - GET /api/alerts/active (Active water threshold breaches)
 * - GET /api/alerts?limit=5 (Recent alert history overview)
 * - GET /api/thresholds (Configured parameter limits)
 * - GET /api/notifications/config (SMS gateway status)
 *
 * Uses Promise.allSettled for resilient partial data rendering without fake metrics.
 */
export default function useAdminOverview() {
  const [data, setData] = useState({
    health: null,
    activeAlerts: { count: 0, items: [] },
    recentAlerts: [],
    thresholdsCount: 0,
    notificationConfig: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [healthRes, activeAlertsRes, recentAlertsRes, thresholdsRes, notifyRes] =
        await Promise.allSettled([
          api.admin.getHealth(),
          api.admin.getActiveAlerts(),
          api.admin.getRecentAlerts(5),
          api.admin.getThresholds(),
          api.admin.getNotificationConfig()
        ]);

      const health = healthRes.status === 'fulfilled' ? healthRes.value : null;

      const activeAlerts =
        activeAlertsRes.status === 'fulfilled' && activeAlertsRes.value?.success
          ? {
              count: activeAlertsRes.value.count || (activeAlertsRes.value.data || []).length,
              items: activeAlertsRes.value.data || []
            }
          : { count: 0, items: [] };

      const recentAlerts =
        recentAlertsRes.status === 'fulfilled' && recentAlertsRes.value?.success
          ? recentAlertsRes.value.data || []
          : [];

      const thresholds =
        thresholdsRes.status === 'fulfilled' && thresholdsRes.value?.success
          ? thresholdsRes.value.data || []
          : [];

      const notificationConfig =
        notifyRes.status === 'fulfilled' && notifyRes.value?.success
          ? notifyRes.value.data || null
          : null;

      setData({
        health,
        activeAlerts,
        recentAlerts,
        thresholdsCount: thresholds.length,
        notificationConfig
      });
    } catch (err) {
      setError(err.message || 'Failed to retrieve administrative overview metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return {
    data,
    loading,
    error,
    refetch: fetchOverview
  };
}
