import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { DEMO_LATEST_READING, DEMO_ALERTS } from '../utils/demoData';

const DEFAULT_POLL_INTERVAL_MS = 30000; // 30 seconds
const DEFAULT_STALE_AFTER_MS = 300000;   // 5 minutes (300,000 ms)

/**
 * Resolve configurable numeric values with safe fallbacks.
 */
function getNumericConfig(val, fallback) {
  const parsed = Number(val);
  return !isNaN(parsed) && parsed > 0 ? parsed : fallback;
}

const POLL_INTERVAL_MS = getNumericConfig(
  import.meta.env.VITE_MONITORING_POLL_INTERVAL_MS,
  DEFAULT_POLL_INTERVAL_MS
);

const STALE_AFTER_MS = getNumericConfig(
  import.meta.env.VITE_MONITORING_STALE_AFTER_MS,
  DEFAULT_STALE_AFTER_MS
);

/**
 * JalDrishti Phase 16: useLiveMonitoring Custom Hook
 *
 * Provides controlled polling, telemetry freshness calculation,
 * overlapping-fetch prevention, and graceful error handling for
 * real-time water quality monitoring.
 *
 * Falls back transparently to calibrated simulated demo data when
 * no hardware sensors are active or the database contains no telemetry.
 *
 * @param {Object} [options]
 * @param {number} [options.pollInterval] - Polling interval in ms (default: 30000)
 * @param {number} [options.staleThreshold] - Stale telemetry threshold in ms (default: 300000)
 * @param {boolean} [options.enabled] - Whether automated polling is active (default: true)
 */
export default function useLiveMonitoring(options = {}) {
  const pollInterval = getNumericConfig(options.pollInterval, POLL_INTERVAL_MS);
  const staleThreshold = getNumericConfig(options.staleThreshold, STALE_AFTER_MS);
  const enabled = options.enabled !== undefined ? Boolean(options.enabled) : true;

  const [reading, setReading] = useState(DEMO_LATEST_READING);
  const [activeAlerts, setActiveAlerts] = useState(() => DEMO_ALERTS.filter((a) => a.status === 'Active'));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isStale, setIsStale] = useState(false);
  const [dataAgeMs, setDataAgeMs] = useState(null);
  const [isDemo, setIsDemo] = useState(true);

  // References to guarantee no memory leaks, no overlapping calls, and safe unmount
  const isFetchingRef = useRef(false);
  const isMountedRef = useRef(true);
  const readingRef = useRef(reading);

  useEffect(() => {
    readingRef.current = reading;
  }, [reading]);

  // Evaluate freshness of current reading timestamp against threshold
  const evaluateFreshness = useCallback(
    (currentReading) => {
      const targetReading = currentReading || readingRef.current;
      if (!targetReading || !targetReading.timestamp) {
        setIsStale(false);
        setDataAgeMs(null);
        return false;
      }

      const readingTime = new Date(targetReading.timestamp).getTime();
      if (isNaN(readingTime)) {
        setIsStale(false);
        setDataAgeMs(null);
        return false;
      }

      const age = Math.max(0, Date.now() - readingTime);
      setDataAgeMs(age);
      const stale = age > staleThreshold;
      setIsStale(stale);
      return stale;
    },
    [staleThreshold]
  );

  /**
   * Internal fetch function with overlapping request prevention
   * and graceful fallback to calibrated demo data.
   */
  const executeFetch = useCallback(
    async (isManualRefresh = false) => {
      // Prevent overlapping simultaneous requests
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      if (isManualRefresh) {
        setRefreshing(true);
      }

      try {
        const [readingRes, alertsRes] = await Promise.allSettled([
          api.citizen.getLatestReading(),
          api.citizen.getActiveAlerts()
        ]);

        if (!isMountedRef.current) return;

        if (readingRes.status === 'fulfilled' && readingRes.value?.success && readingRes.value.data) {
          const freshData = readingRes.value.data;
          setReading(freshData);
          setIsDemo(false);
          setLastUpdated(new Date());
          setError(null);
          evaluateFreshness(freshData);
        } else {
          // If no real sensor data in database or API error, fall back to calibrated DEMO_LATEST_READING
          setReading(DEMO_LATEST_READING);
          setIsDemo(true);
          setLastUpdated(new Date());
          setError(null);
        }

        if (alertsRes.status === 'fulfilled' && alertsRes.value?.success && Array.isArray(alertsRes.value.data) && alertsRes.value.data.length > 0) {
          setActiveAlerts(alertsRes.value.data);
        } else {
          setActiveAlerts(DEMO_ALERTS.filter((a) => a.status === 'Active'));
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        // Network error: keep demo fallback active and notify user
        setReading(DEMO_LATEST_READING);
        setIsDemo(true);
        setActiveAlerts(DEMO_ALERTS.filter((a) => a.status === 'Active'));
        setError(null); // Don't crash UI with error when demo data is available
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
        isFetchingRef.current = false;
      }
    },
    [evaluateFreshness]
  );

  // Manual refresh trigger
  const refresh = useCallback(() => {
    return executeFetch(true);
  }, [executeFetch]);

  // Lifecycle effect: Immediate initial fetch + controlled polling timer
  useEffect(() => {
    isMountedRef.current = true;

    // Fetch immediately when monitoring starts
    executeFetch(false);

    if (!enabled) {
      return () => {
        isMountedRef.current = false;
      };
    }

    // Controlled automatic polling interval
    const pollTimerId = setInterval(() => {
      // Pause polling if document tab is hidden to save resources
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }
      executeFetch(false);
    }, pollInterval);

    // Periodic freshness recalculation ticker (every 10s)
    const freshnessTimerId = setInterval(() => {
      if (isMountedRef.current) {
        evaluateFreshness();
      }
    }, 10000);

    // Clean up on component unmount
    return () => {
      isMountedRef.current = false;
      clearInterval(pollTimerId);
      clearInterval(freshnessTimerId);
    };
  }, [executeFetch, evaluateFreshness, enabled, pollInterval]);

  return {
    reading,
    activeAlerts,
    loading,
    refreshing,
    error,
    lastUpdated,
    isStale,
    dataAgeMs,
    isDemo,
    refresh,
    pollingEnabled: enabled,
    pollInterval,
    staleThreshold
  };
}
