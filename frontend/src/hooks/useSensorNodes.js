import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { DEMO_STATIONS, DEMO_LATEST_READING, DEMO_ALERTS } from '../utils/demoData';

/**
 * JalDrishti Phase 19: useSensorNodes Hook
 *
 * Dedicated hook for retrieving configured sensor node telemetry and location.
 * - Enriches node with real-time latest readings and active alerts where available.
 * - Validates latitude (-90 to 90) and longitude (-180 to 180).
 * - Falls back to calibrated simulated demo stations if no physical stations exist.
 * - Strictly manual refresh only (no competing background polling loops).
 */
export default function useSensorNodes() {
  const [nodes, setNodes] = useState(DEMO_STATIONS);
  const [latestReading, setLatestReading] = useState(DEMO_LATEST_READING);
  const [activeAlerts, setActiveAlerts] = useState(() => DEMO_ALERTS.filter((a) => a.status === 'Active'));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(true);

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
        api.nodes.getAll().catch(() => null),
        api.citizen.getLatestReading().catch(() => null),
        api.alerts.getActive().catch(() => null)
      ]);

      const rawNodes = Array.isArray(nodesRes?.data) && nodesRes.data.length > 0
        ? nodesRes.data
        : DEMO_STATIONS;

      const usingDemo = !Array.isArray(nodesRes?.data) || nodesRes.data.length === 0;
      setIsDemo(usingDemo);

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
      setLatestReading(latestRes?.data || DEMO_LATEST_READING);
      setActiveAlerts(
        Array.isArray(alertsRes?.data) && alertsRes.data.length > 0
          ? alertsRes.data
          : DEMO_ALERTS.filter((a) => a.status === 'Active')
      );
    } catch (err) {
      // Fall back safely to demo stations
      setNodes(DEMO_STATIONS);
      setLatestReading(DEMO_LATEST_READING);
      setActiveAlerts(DEMO_ALERTS.filter((a) => a.status === 'Active'));
      setIsDemo(true);
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
    isDemo,
    refetch: () => fetchMapData(true)
  };
}
