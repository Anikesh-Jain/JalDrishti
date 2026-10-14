import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * JalDrishti Phase 19: useSensorNodes Hook
 *
 * Dedicated hook for retrieving configured sensor node telemetry and location.
 * - Single-node academic prototype scope.
 * - Enriches node with real-time latest readings and active alerts where available.
 * - Validates latitude (-90 to 90) and longitude (-180 to 180).
 * - Strictly manual refresh only (no competing background polling loops).
 */
export default function useSensorNodes() {
  const [nodes, setNodes] = useState([]);
  const [latestReading, setLatestReading] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchMapData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Parallel fetch for nodes list, latest sensor telemetry, and active alerts
      const [nodesRes, latestRes, alertsRes] = await Promise.all([
        api.nodes.getAll(),
        api.citizen.getLatestReading().catch(() => null),
        api.alerts.getActive().catch(() => null)
      ]);

      const rawNodes = Array.isArray(nodesRes?.data) ? nodesRes.data : [];

      // Validate coordinates for each node
      const validatedNodes = rawNodes.map((n) => {
        const lat = n.location?.latitude;
        const lng = n.location?.longitude;
        const validCoords =
          typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90 &&
          typeof lng === 'number' && !isNaN(lng) && lng >= -180 && lng <= 180;

        return {
          ...n,
          hasValidLocation: validCoords
        };
      });

      setNodes(validatedNodes);
      setLatestReading(latestRes?.data || null);
      setActiveAlerts(Array.isArray(alertsRes?.data) ? alertsRes.data : []);
    } catch (err) {
      setError(err?.message || 'Failed to retrieve sensor node location telemetry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMapData(false);
  }, [fetchMapData]);

  return {
    nodes,
    latestReading,
    activeAlerts,
    loading,
    refreshing,
    error,
    refetch: () => fetchMapData(true)
  };
}
