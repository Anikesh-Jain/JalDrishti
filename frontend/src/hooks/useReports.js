import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import {
  formatReadingsForCsv,
  formatAlertsForCsv,
  downloadCsvFile,
  getReportFilename
} from '../utils/csvExport';

/**
 * JalDrishti Phase 21: useReports Custom Hook
 *
 * Coordinates data retrieval, filter state, tabular preview generation,
 * and client-side synchronous CSV export for historical sensor readings and alert logs.
 */
export default function useReports() {
  // ---------------------------------------------------------------------------
  // Readings State
  // ---------------------------------------------------------------------------
  const [readingFilters, setReadingFilters] = useState({
    range: '24h',
    limit: 100,
    nodeId: 'all'
  });
  const [readingsData, setReadingsData] = useState([]);
  const [readingsLoading, setReadingsLoading] = useState(true);
  const [readingsError, setReadingsError] = useState(null);
  const [isExportingReadings, setIsExportingReadings] = useState(false);
  const [exportReadingsSuccess, setExportReadingsSuccess] = useState(null);
  const [exportReadingsError, setExportReadingsError] = useState(null);

  // ---------------------------------------------------------------------------
  // Alerts State
  // ---------------------------------------------------------------------------
  const [alertFilters, setAlertFilters] = useState({
    range: 'all',
    status: 'all',
    parameter: 'all',
    direction: 'all',
    limit: 100,
    nodeId: 'all'
  });
  const [alertsData, setAlertsData] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState(null);
  const [isExportingAlerts, setIsExportingAlerts] = useState(false);
  const [exportAlertsSuccess, setExportAlertsSuccess] = useState(null);
  const [exportAlertsError, setExportAlertsError] = useState(null);

  const isMountedRef = useRef(true);

  // Calculate ISO start time from range key
  const computeFromTime = (rangeKey) => {
    const now = Date.now();
    switch (rangeKey) {
      case '1h':
        return new Date(now - 60 * 60 * 1000).toISOString();
      case '6h':
        return new Date(now - 6 * 60 * 60 * 1000).toISOString();
      case '24h':
        return new Date(now - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
      case 'all':
      default:
        return null;
    }
  };

  // ---------------------------------------------------------------------------
  // Fetch Readings Report Data
  // ---------------------------------------------------------------------------
  const fetchReadings = useCallback(async (filters = readingFilters) => {
    setReadingsLoading(true);
    setReadingsError(null);
    setExportReadingsSuccess(null);
    setExportReadingsError(null);

    const queryParams = {
      limit: filters.limit || 100
    };

    const fromDate = computeFromTime(filters.range);
    if (fromDate) {
      queryParams.from = fromDate;
    }
    if (filters.nodeId && filters.nodeId !== 'all') {
      queryParams.nodeId = filters.nodeId;
    }

    try {
      const response = await api.reports.getReadings(queryParams);
      if (!isMountedRef.current) return;

      if (response && response.success && Array.isArray(response.data)) {
        setReadingsData(response.data);
      } else {
        setReadingsData([]);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setReadingsError(err.message || 'Failed to fetch historical readings report');
      setReadingsData([]);
    } finally {
      if (isMountedRef.current) {
        setReadingsLoading(false);
      }
    }
  }, [readingFilters]);

  // ---------------------------------------------------------------------------
  // Fetch Alerts Report Data
  // ---------------------------------------------------------------------------
  const fetchAlerts = useCallback(async (filters = alertFilters) => {
    setAlertsLoading(true);
    setAlertsError(null);
    setExportAlertsSuccess(null);
    setExportAlertsError(null);

    const queryParams = {
      limit: filters.limit || 100
    };

    const fromDate = computeFromTime(filters.range);
    if (fromDate) {
      queryParams.from = fromDate;
    }
    if (filters.nodeId && filters.nodeId !== 'all') {
      queryParams.nodeId = filters.nodeId;
    }
    if (filters.parameter && filters.parameter !== 'all') {
      queryParams.parameter = filters.parameter;
    }
    if (filters.status && filters.status !== 'all') {
      queryParams.status = filters.status;
    }
    if (filters.direction && filters.direction !== 'all') {
      queryParams.direction = filters.direction;
    }

    try {
      const response = await api.reports.getAlerts(queryParams);
      if (!isMountedRef.current) return;

      if (response && response.success && Array.isArray(response.data)) {
        setAlertsData(response.data);
      } else {
        setAlertsData([]);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setAlertsError(err.message || 'Failed to fetch alert history report');
      setAlertsData([]);
    } finally {
      if (isMountedRef.current) {
        setAlertsLoading(false);
      }
    }
  }, [alertFilters]);

  // Initial Fetch & Filter Reactivity
  useEffect(() => {
    isMountedRef.current = true;
    fetchReadings(readingFilters);
    return () => {
      isMountedRef.current = false;
    };
  }, [readingFilters, fetchReadings]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchAlerts(alertFilters);
    return () => {
      isMountedRef.current = false;
    };
  }, [alertFilters, fetchAlerts]);

  // ---------------------------------------------------------------------------
  // Export Handlers
  // ---------------------------------------------------------------------------
  const exportReadingsCsv = useCallback(async () => {
    if (readingsData.length === 0) {
      setExportReadingsError('No readings available to export for the selected period.');
      return;
    }

    setIsExportingReadings(true);
    setExportReadingsError(null);
    setExportReadingsSuccess(null);

    try {
      const { csv } = formatReadingsForCsv(readingsData);
      const filename = getReportFilename('readings');

      downloadCsvFile(csv, filename);

      setExportReadingsSuccess({
        count: readingsData.length,
        filename,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setExportReadingsError(err.message || 'An error occurred generating the readings CSV.');
    } finally {
      setIsExportingReadings(false);
    }
  }, [readingsData]);

  const exportAlertsCsv = useCallback(async () => {
    if (alertsData.length === 0) {
      setExportAlertsError('No alerts available to export for the selected criteria.');
      return;
    }

    setIsExportingAlerts(true);
    setExportAlertsError(null);
    setExportAlertsSuccess(null);

    try {
      const { csv } = formatAlertsForCsv(alertsData);
      const filename = getReportFilename('alerts');

      downloadCsvFile(csv, filename);

      setExportAlertsSuccess({
        count: alertsData.length,
        filename,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setExportAlertsError(err.message || 'An error occurred generating the alerts CSV.');
    } finally {
      setIsExportingAlerts(false);
    }
  }, [alertsData]);

  // Filter Updater Helpers
  const updateReadingFilter = (key, value) => {
    setReadingFilters((prev) => ({ ...prev, [key]: value }));
  };

  const updateAlertFilter = (key, value) => {
    setAlertFilters((prev) => ({ ...prev, [key]: value }));
  };

  const refetchAll = () => {
    fetchReadings(readingFilters);
    fetchAlerts(alertFilters);
  };

  return {
    // Readings
    readingFilters,
    updateReadingFilter,
    readingsData,
    readingsLoading,
    readingsError,
    isExportingReadings,
    exportReadingsSuccess,
    exportReadingsError,
    exportReadingsCsv,
    refetchReadings: () => fetchReadings(readingFilters),

    // Alerts
    alertFilters,
    updateAlertFilter,
    alertsData,
    alertsLoading,
    alertsError,
    isExportingAlerts,
    exportAlertsSuccess,
    exportAlertsError,
    exportAlertsCsv,
    refetchAlerts: () => fetchAlerts(alertFilters),

    // Shared
    refetchAll
  };
}
