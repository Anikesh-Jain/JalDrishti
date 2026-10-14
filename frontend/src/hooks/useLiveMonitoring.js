import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';

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
 * @param {Object} [options]
 * @param {number} [options.pollInterval] - Polling interval in ms (default: 30000)
 * @param {number} [options.staleThreshold] - Stale telemetry threshold in ms (default: 300000)
 * @param {boolean} [options.enabled] - Whether automated polling is active (default: true)
 */
export default function useLiveMonitoring(options = {}) {
  const pollInterval = getNumericConfig(options.pollInterval, POLL_INTERVAL_MS);
  const staleThreshold = getNumericConfig(options.staleThreshold, STALE_AFTER_MS);
  const enabled = options.enabled !== undefined ? Boolean(options.enabled) : true;

  const [reading, setReading] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isStale, setIsStale] = useState(false);
  const [dataAgeMs, setDataAgeMs] = useState(null);

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
   * and graceful error fallback preserving previously loaded data.
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

        if (readingRes.status === 'fulfilled' && readingRes.value?.success) {
          const freshData = readingRes.value.data;
          setReading(freshData);
          setLastUpdated(new Date());
          setError(null);
          evaluateFreshness(freshData);
        } else {
          // If fetch fails or returned error
          const reasonMsg =
            readingRes.status === 'rejected'
              ? readingRes.reason?.message || 'Failed to communicate with sensor monitoring service'
              : readingRes.value?.message || 'Error retrieving sensor readings';

          // Preserve previous reading data if available; report error state
          setError(reasonMsg);
        }

        if (alertsRes.status === 'fulfilled' && alertsRes.value?.success) {
          setActiveAlerts(alertsRes.value.data || []);
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(err.message || 'Network error retrieving live telemetry');
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
    refresh,
    pollingEnabled: enabled,
    pollInterval,
    staleThreshold
  };
}
