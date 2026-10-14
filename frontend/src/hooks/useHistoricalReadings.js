import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';

/**
 * Standard supported historical time-range filters.
 * Default: 24 hours.
 */
export const TIME_RANGES = [
  { id: '1h', label: 'Last 1 Hour', durationMs: 60 * 60 * 1000, limit: 120 },
  { id: '6h', label: 'Last 6 Hours', durationMs: 6 * 60 * 60 * 1000, limit: 200 },
  { id: '24h', label: 'Last 24 Hours', durationMs: 24 * 60 * 60 * 1000, limit: 300 },
  { id: '7d', label: 'Last 7 Days', durationMs: 7 * 24 * 60 * 60 * 1000, limit: 500 }
];

export const DEFAULT_TIME_RANGE = '24h';

/**
 * JalDrishti Phase 17: useHistoricalReadings Custom Hook
 *
 * Fetches, manages, and transforms bounded historical water-quality readings
 * for Recharts visualization. Strictly avoids continuous polling.
 *
 * @param {Object} [options]
 * @param {string} [options.initialRange] - Default time range key ('24h')
 * @param {string} [options.nodeId] - Optional sensor node identifier
 */
export default function useHistoricalReadings(options = {}) {
  const [selectedRange, setSelectedRange] = useState(options.initialRange || DEFAULT_TIME_RANGE);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);

  const fetchHistory = useCallback(
    async (rangeKey = selectedRange) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      setLoading(true);
      setError(null);

      const rangeConfig = TIME_RANGES.find((r) => r.id === rangeKey) || TIME_RANGES[2];
      const fromTime = new Date(Date.now() - rangeConfig.durationMs).toISOString();

      try {
        const response = await api.citizen.getHistoricalReadings({
          from: fromTime,
          limit: rangeConfig.limit,
          nodeId: options.nodeId
        });

        if (!isMountedRef.current) return;

        if (response && response.success && Array.isArray(response.data)) {
          // Transform readings into formatted points for Recharts
          const formattedPoints = response.data.map((r) => {
            const dateObj = new Date(r.timestamp);
            let timeLabel = '';

            if (rangeConfig.id === '1h' || rangeConfig.id === '6h') {
              timeLabel = dateObj.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });
            } else if (rangeConfig.id === '24h') {
              timeLabel = dateObj.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit'
              });
            } else {
              // 7 days
              timeLabel = `${dateObj.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
              })} ${dateObj.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit'
              })}`;
            }

            return {
              id: r.id,
              nodeId: r.nodeId,
              timestamp: r.timestamp,
              timeLabel,
              pH: typeof r.pH === 'number' && Number.isFinite(r.pH) ? Number(r.pH.toFixed(2)) : null,
              turbidity: typeof r.turbidity === 'number' && Number.isFinite(r.turbidity) ? Number(r.turbidity.toFixed(2)) : null,
              tds: typeof r.tds === 'number' && Number.isFinite(r.tds) ? Math.round(r.tds) : null,
              temperature: typeof r.temperature === 'number' && Number.isFinite(r.temperature) ? Number(r.temperature.toFixed(1)) : null,
              overallStatus: r.overallStatus || 'Safe'
            };
          });

          setData(formattedPoints);
          setLastFetched(new Date());
        } else {
          setError(response?.message || 'Failed to retrieve historical telemetry records');
          setData([]);
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(err.message || 'Network error fetching historical water quality trends');
        setData([]);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
        isFetchingRef.current = false;
      }
    },
    [selectedRange, options.nodeId]
  );

  // Fetch when selectedRange changes
  useEffect(() => {
    isMountedRef.current = true;
    fetchHistory(selectedRange);

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchHistory, selectedRange]);

  const setRange = useCallback((rangeId) => {
    setSelectedRange(rangeId);
  }, []);

  return {
    selectedRange,
    setSelectedRange: setRange,
    timeRanges: TIME_RANGES,
    data,
    loading,
    error,
    lastFetched,
    refetch: () => fetchHistory(selectedRange)
  };
}
