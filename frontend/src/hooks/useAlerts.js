import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

/**
 * JalDrishti Phase 18: useAlerts Hook
 *
 * Dedicated hook for retrieving active alerts and historical alert records.
 * Follows a strictly READ-ONLY lifecycle:
 * - Authoritative backend alert data only.
 * - No manual alert modification or lifecycle mutation functions.
 * - Manual refresh only — no competing interval polling loops.
 */
export default function useAlerts() {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [historyAlerts, setHistoryAlerts] = useState([]);
  const [allAlerts, setAllAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // Client-side / query filters
  const [filters, setFilters] = useState({
    status: 'all', // 'all' | 'Active' | 'Resolved'
    parameter: 'all', // 'all' | 'pH' | 'turbidity' | 'tds' | 'temperature'
    direction: 'all' // 'all' | 'HIGH' | 'LOW'
  });

  const fetchAlertsData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Parallel fetch for active alerts, history alerts, and all alerts
      const [activeRes, historyRes, allRes] = await Promise.all([
        api.alerts.getActive(),
        api.alerts.getHistory({ limit: 100 }),
        api.alerts.getAll({ limit: 100 })
      ]);

      const activeList = Array.isArray(activeRes?.data) ? activeRes.data : [];
      const historyList = Array.isArray(historyRes?.data) ? historyRes.data : [];
      const allList = Array.isArray(allRes?.data) ? allRes.data : [];

      setActiveAlerts(activeList);
      setHistoryAlerts(historyList);
      setAllAlerts(allList);
    } catch (err) {
      setError(err?.message || 'Failed to retrieve water quality alerts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAlertsData(false);
  }, [fetchAlertsData]);

  // Fetch full details for a specific alert by ID
  const fetchAlertDetail = useCallback(async (alertId) => {
    if (!alertId) {
      setSelectedAlert(null);
      return;
    }
    setDetailLoading(true);
    setDetailError(null);
    try {
      const res = await api.alerts.getById(alertId);
      if (res?.data) {
        setSelectedAlert(res.data);
      }
    } catch (err) {
      setDetailError(err?.message || 'Failed to fetch alert details.');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Filtered historical / all alerts
  const filteredAlerts = useMemo(() => {
    return allAlerts.filter((alert) => {
      // Status filter
      if (filters.status !== 'all' && alert.status !== filters.status) {
        return false;
      }
      // Parameter filter (case-insensitive comparison)
      if (
        filters.parameter !== 'all' &&
        alert.parameter?.toLowerCase() !== filters.parameter.toLowerCase()
      ) {
        return false;
      }
      // Direction filter
      if (filters.direction !== 'all' && alert.direction !== filters.direction) {
        return false;
      }
      return true;
    });
  }, [allAlerts, filters]);

  // Filtered active alerts specifically
  const filteredActiveAlerts = useMemo(() => {
    return activeAlerts.filter((alert) => {
      if (
        filters.parameter !== 'all' &&
        alert.parameter?.toLowerCase() !== filters.parameter.toLowerCase()
      ) {
        return false;
      }
      if (filters.direction !== 'all' && alert.direction !== filters.direction) {
        return false;
      }
      return true;
    });
  }, [activeAlerts, filters]);

  // Reset filters helper
  const resetFilters = useCallback(() => {
    setFilters({
      status: 'all',
      parameter: 'all',
      direction: 'all'
    });
  }, []);

  return {
    activeAlerts,
    historyAlerts,
    allAlerts,
    filteredAlerts,
    filteredActiveAlerts,
    loading,
    refreshing,
    error,
    filters,
    setFilters,
    resetFilters,
    selectedAlert,
    setSelectedAlert,
    detailLoading,
    detailError,
    fetchAlertDetail,
    refetch: () => fetchAlertsData(true)
  };
}
