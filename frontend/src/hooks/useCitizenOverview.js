import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

/**
 * JalDrishti Phase 15: useCitizenOverview Custom Hook
 *
 * Fetches latest sanitized sensor readings and active warning telemetry for the Citizen Portal:
 * - GET /api/sensor/readings/latest (Latest pH, turbidity, TDS, temperature, overallStatus)
 * - GET /api/alerts/active (Active alert warnings)
 *
 * Provides loading, error, data, and refetch states without live polling or websockets.
 */
export default function useCitizenOverview() {
  const [data, setData] = useState({
    reading: null,
    activeAlerts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [readingRes, alertsRes] = await Promise.allSettled([
        api.citizen.getLatestReading(),
        api.citizen.getActiveAlerts()
      ]);

      const reading =
        readingRes.status === 'fulfilled' && readingRes.value?.success
          ? readingRes.value.data
          : null;

      const activeAlerts =
        alertsRes.status === 'fulfilled' && alertsRes.value?.success
          ? alertsRes.value.data || []
          : [];

      setData({
        reading,
        activeAlerts
      });
    } catch (err) {
      setError(err.message || 'Failed to retrieve current water quality information');
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
