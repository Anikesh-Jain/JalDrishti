import React from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';

/**
 * JalDrishti Phase 16: LiveMonitoringBar Component
 *
 * Displays live monitoring status, telemetry freshness,
 * last updated timestamp, and manual refresh controls.
 */
export default function LiveMonitoringBar({
  lastUpdated,
  readingTimestamp,
  isStale = false,
  refreshing = false,
  onRefresh,
  error = null
}) {
  const formatTime = (ts) => {
    if (!ts) return 'Not yet recorded';
    try {
      return new Date(ts).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return String(ts);
    }
  };

  const displayTime = readingTimestamp ? formatTime(readingTimestamp) : formatTime(lastUpdated);

  const getStatusBadge = () => {
    if (refreshing) {
      return {
        variant: 'info',
        label: 'Updating...',
        dot: true
      };
    }
    if (isStale) {
      return {
        variant: 'caution',
        label: 'Telemetry is Stale',
        dot: true
      };
    }
    if (readingTimestamp) {
      return {
        variant: 'safe',
        label: 'Live / Fresh',
        dot: true
      };
    }
    return {
      variant: 'neutral',
      label: 'Offline / Unavailable',
      dot: false
    };
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="space-y-3">
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Freshness status & Last Updated */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant={statusBadge.variant}
            dot={statusBadge.dot}
            size="md"
            className="font-semibold text-xs"
          >
            {statusBadge.label}
          </Badge>

          <span className="text-xs text-slate-500 font-medium">
            <span className="text-slate-400">Last updated:</span> {displayTime}
          </span>
        </div>

        {/* Right: Manual Refresh Action */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            loading={refreshing}
            aria-label="Refresh readings"
            className="text-xs"
          >
            {refreshing ? 'Updating...' : 'Refresh readings'}
          </Button>
        </div>
      </div>

      {/* Stale Telemetry Warning Banner */}
      {isStale && (
        <div
          role="status"
          aria-live="polite"
          className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2.5"
        >
          <span className="font-bold text-amber-600 uppercase tracking-wider text-[10px] mt-0.5 px-1.5 py-0.5 bg-amber-100 rounded">
            Notice
          </span>
          <div>
            <span className="font-semibold">Telemetry is stale:</span> The IoT sensor node has not reported a reading within the expected 5-minute freshness window. Displaying last recorded values from {displayTime}.
          </div>
        </div>
      )}

      {/* Non-blocking background error banner */}
      {error && (
        <div
          role="alert"
          className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 flex items-start gap-2.5"
        >
          <span className="font-bold text-rose-600 uppercase tracking-wider text-[10px] mt-0.5 px-1.5 py-0.5 bg-rose-100 rounded">
            Sync Warning
          </span>
          <div className="flex-1">
            <span>Unable to refresh telemetry ({error}). Retaining last known sensor readings.</span>
          </div>
        </div>
      )}
    </div>
  );
}
