import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import AlertStatusBadge from './AlertStatusBadge';

/**
 * JalDrishti Phase 18: AlertDetailModal
 *
 * Dedicated inspection modal for displaying authoritative alert telemetry.
 * Displays only actual backend fields.
 * Strictly READ-ONLY (no mutation controls).
 * Excludes sensitive internals or credentials.
 */
export default function AlertDetailModal({ alert, onClose }) {
  if (!alert) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      return isNaN(d.getTime()) ? '—' : d.toLocaleString();
    } catch {
      return '—';
    }
  };

  const getParamLabel = (param) => {
    switch (param?.toLowerCase()) {
      case 'ph':
        return 'pH Level';
      case 'turbidity':
        return 'Turbidity (NTU)';
      case 'tds':
        return 'Total Dissolved Solids (ppm)';
      case 'temperature':
        return 'Temperature (°C)';
      default:
        return param || 'Parameter';
    }
  };

  const getSafeRangeText = (alert) => {
    if (alert.thresholdMin != null && alert.thresholdMax != null) {
      return `${alert.thresholdMin} – ${alert.thresholdMax}`;
    }
    if (alert.thresholdMax != null) {
      return `≤ ${alert.thresholdMax}`;
    }
    if (alert.thresholdLimit != null) {
      return alert.direction === 'LOW' ? `≥ ${alert.thresholdLimit}` : `≤ ${alert.thresholdLimit}`;
    }
    return 'Configured Safe Range';
  };

  const isActive = alert.status?.toLowerCase() === 'active';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#163344]/50 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-detail-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#BAE6FD] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b ${isActive ? 'bg-rose-50/70 border-rose-100' : 'bg-slate-50 border-slate-100'} flex items-start justify-between`}>
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <AlertStatusBadge status={alert.status} size="sm" />
              <Badge variant={alert.direction === 'HIGH' ? 'unsafe' : 'caution'} size="sm">
                Direction: {alert.direction}
              </Badge>
              {alert.severity && (
                <Badge variant="neutral" size="sm">
                  Severity: {alert.severity}
                </Badge>
              )}
            </div>
            <h2 id="alert-detail-title" className="text-xl font-bold text-slate-900">
              {getParamLabel(alert.parameter)} Threshold Breach
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitoring Station: <strong className="text-slate-700">{alert.nodeId}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-white/80 transition-colors"
            aria-label="Close alert details dialog"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Recorded Value
              </div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {alert.value != null ? alert.value : '—'}
              </div>
              <div className="text-[11px] text-rose-600 font-medium mt-0.5">
                {alert.direction === 'HIGH' ? 'Exceeded upper threshold' : 'Fell below lower threshold'}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Threshold Limit
              </div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {alert.thresholdLimit != null ? alert.thresholdLimit : '—'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Baseline: {getSafeRangeText(alert)}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Breach Count
              </div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {alert.breachCount || 1}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Consecutive telemetry events
              </div>
            </div>
          </div>

          {/* Timeline & Lifecycle Metadata */}
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
            <div className="p-3 bg-slate-50 font-semibold text-slate-700">
              Authoritative Lifecycle Timestamps
            </div>

            <div className="p-3 flex justify-between items-center">
              <span className="text-slate-500">First Occurrence (Detected):</span>
              <span className="font-medium text-slate-800">{formatDate(alert.timestamp)}</span>
            </div>

            <div className="p-3 flex justify-between items-center">
              <span className="text-slate-500">Latest Telemetry Breach:</span>
              <span className="font-medium text-slate-800">{formatDate(alert.lastBreachedAt)}</span>
            </div>

            <div className="p-3 flex justify-between items-center">
              <span className="text-slate-500">Resolution Timestamp:</span>
              <span className="font-medium text-slate-800">
                {alert.resolvedAt ? (
                  <span className="text-emerald-700 font-semibold">{formatDate(alert.resolvedAt)}</span>
                ) : (
                  <span className="text-amber-700 italic">Unresolved (Active)</span>
                )}
              </span>
            </div>

            {alert.readingId && (
              <div className="p-3 flex justify-between items-center">
                <span className="text-slate-500">Triggering Reading ID:</span>
                <span className="font-mono text-[11px] text-slate-600">{String(alert.readingId)}</span>
              </div>
            )}
          </div>

          {/* Plain-Language Citizen Guidance */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 text-xs text-blue-900 leading-relaxed">
            <div className="font-semibold text-blue-950 mb-1 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-blue-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Early Warning System Context
            </div>
            {isActive
              ? 'This parameter is currently outside configured safe ranges. The automated early warning system has logged the anomaly and alerted municipal authorities. Citizens are advised to follow local guidance.'
              : 'This alert record has resolved. The monitored parameter returned to the configured baseline safe range, and the resolution event was automatically recorded.'}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
