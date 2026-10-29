import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { getDemoHistoricalReadings } from '../utils/demoData';

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
 * for Recharts visualization. Falls back to calibrated demo data when no telemetry exists.
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
  const [isDemo, setIsDemo] = useState(true);

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

        if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
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
              overallStatus: r.overallStatus || 'Safe',
              isDemo: false
            };
          });

          setData(formattedPoints);
          setIsDemo(false);
          setLastFetched(new Date());
        } else {
          // Fall back to calibrated demo data
          const demoPoints = getDemoHistoricalReadings({
            nodeId: options.nodeId || 'NODE-01-INDORE-WARD12',
            timeRange: rangeConfig.id,
            limit: rangeConfig.limit
          });
          setData(demoPoints);
          setIsDemo(true);
          setLastFetched(new Date());
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        // Fall back to calibrated demo data on error
        const demoPoints = getDemoHistoricalReadings({
          nodeId: options.nodeId || 'NODE-01-INDORE-WARD12',
          timeRange: rangeConfig.id,
          limit: rangeConfig.limit
        });
        setData(demoPoints);
        setIsDemo(true);
        setLastFetched(new Date());
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
    isDemo,
    lastFetched,
    refetch: () => fetchHistory(selectedRange)
  };
}
