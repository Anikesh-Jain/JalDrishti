import React, { useState } from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import AlertStatusBadge from './AlertStatusBadge';

/**
 * JalDrishti Phase 18: AlertCard Component
 *
 * Renders an authoritative alert card with:
 * - Parameter name & units
 * - Node identifier
 * - Breach direction (LOW / HIGH)
 * - Semantic status badge (Active / Acknowledged / Resolved)
 * - Measured value vs. threshold limit
 * - Timestamps (first detected, last breached, resolved)
 * - Breach count
 * - Expandable details / inspect trigger
 *
 * Strictly READ-ONLY. No mutation or acknowledge controls.
 */
export default function AlertCard({ alert, onInspect, defaultExpanded = false }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!alert) return null;

  const isActive = alert.status?.toLowerCase() === 'active';
  const isResolved = alert.status?.toLowerCase() === 'resolved';

  const formatTimestamp = (ts) => {
    if (!ts) return '—';
    try {
      const d = new Date(ts);
      return isNaN(d.getTime()) ? '—' : d.toLocaleString();
    } catch {
      return '—';
    }
  };

  const getParamInfo = (param) => {
    switch (param?.toLowerCase()) {
      case 'ph':
        return { name: 'pH Level', unit: '', safe: '6.5 – 8.5' };
      case 'turbidity':
        return { name: 'Turbidity', unit: 'NTU', safe: '< 5.0 NTU' };
      case 'tds':
        return { name: 'Total Dissolved Solids', unit: 'ppm', safe: '< 500 ppm' };
      case 'temperature':
        return { name: 'Temperature', unit: '°C', safe: '10 – 35 °C' };
      default:
        return { name: param || 'Parameter', unit: '', safe: 'Safe Range' };
    }
  };

  const paramInfo = getParamInfo(alert.parameter);

  return (
    <Card
      className={`transition-all duration-200 border-l-4 ${
        isActive
          ? 'border-l-rose-500 bg-rose-50/15 shadow-sm ring-1 ring-rose-100'
          : isResolved
          ? 'border-l-emerald-500 bg-white'
          : 'border-l-amber-500 bg-white'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        {/* Left: Parameter & Station */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-bold text-slate-900">
              {paramInfo.name}
            </h4>
            <Badge variant="neutral" size="sm" className="font-mono text-[11px]">
              {alert.nodeId}
            </Badge>
            <Badge
              variant={alert.direction === 'HIGH' ? 'unsafe' : 'caution'}
              size="sm"
              className="font-medium"
            >
              {alert.direction === 'HIGH' ? '↑ HIGH Breach' : '↓ LOW Breach'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Detected: {formatTimestamp(alert.timestamp)}
          </p>
        </div>

        {/* Right: Status Badge & Inspect Action */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <AlertStatusBadge status={alert.status} size="md" />
          {onInspect ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onInspect(alert)}
              className="text-xs py-1 px-2.5"
              aria-label={`Inspect details for ${alert.parameter} alert`}
            >
              Details
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs py-1 px-2 text-slate-600 hover:text-slate-900"
              aria-label="Toggle alert card details"
            >
              {isExpanded ? 'Less ▲' : 'More ▼'}
            </Button>
          )}
        </div>
      </div>

      {/* Primary Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-t border-slate-100 text-xs">
        <div>
          <span className="text-slate-500 block">Measured Value</span>
          <span className="font-bold text-slate-900 text-sm">
            {alert.value != null ? `${alert.value} ${paramInfo.unit}`.trim() : '—'}
          </span>
        </div>

        <div>
          <span className="text-slate-500 block">Threshold Limit</span>
          <span className="font-medium text-slate-700">
            {alert.thresholdLimit != null ? `${alert.thresholdLimit} ${paramInfo.unit}`.trim() : '—'}
          </span>
        </div>

        <div>
          <span className="text-slate-500 block">Breach Count</span>
          <span className="font-medium text-slate-700">
            {alert.breachCount || 1} event{(alert.breachCount || 1) > 1 ? 's' : ''}
          </span>
        </div>

        <div>
          <span className="text-slate-500 block">
            {isActive ? 'Latest Breach' : 'Resolved At'}
          </span>
          <span className="font-medium text-slate-700">
            {isActive
              ? formatTimestamp(alert.lastBreachedAt)
              : formatTimestamp(alert.resolvedAt)}
          </span>
        </div>
      </div>

      {/* Expanded Details Drawer */}
      {isExpanded && !onInspect && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-2 bg-slate-50/60 p-3 rounded-lg">
          <div className="flex justify-between">
            <span className="text-slate-500">Configured Safe Range:</span>
            <span className="font-medium text-slate-700">{paramInfo.safe}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">First Occurrence Time:</span>
            <span className="font-medium text-slate-700">{formatTimestamp(alert.timestamp)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Latest Telemetry Breach:</span>
            <span className="font-medium text-slate-700">{formatTimestamp(alert.lastBreachedAt)}</span>
          </div>
          {alert.resolvedAt && (
            <div className="flex justify-between">
              <span className="text-slate-500">Return to Safe Range:</span>
              <span className="font-medium text-emerald-700 font-semibold">{formatTimestamp(alert.resolvedAt)}</span>
            </div>
          )}
          {alert.severity && (
            <div className="flex justify-between">
              <span className="text-slate-500">Calculated Severity:</span>
              <span className="font-medium text-slate-700">{alert.severity}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
