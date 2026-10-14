import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

/**
 * JalDrishti Phase 16: LiveParameterCard Component
 *
 * Displays a live IoT water quality sensor metric with:
 * - Current telemetry value from real sensor reading
 * - Engineering unit (NTU, ppm, °C, etc.)
 * - Authoritative status: Safe, Low (below range), High (above range), or Unknown
 * - Configured permissible threshold range
 * - Stale data notification when telemetry freshness window has elapsed
 */
export default function LiveParameterCard({
  parameter,
  name,
  value,
  unit = '',
  status = 'Safe',
  safeRange,
  minimum,
  maximum,
  description,
  isStale = false
}) {
  // Map authoritative backend statuses to badge semantics
  const getStatusBadge = (s) => {
    switch (s?.toLowerCase()) {
      case 'low':
        return {
          variant: 'caution',
          label: 'Low',
          ariaText: 'Below configured safe range'
        };
      case 'high':
        return {
          variant: 'unsafe',
          label: 'High',
          ariaText: 'Above configured safe range'
        };
      case 'unsafe':
      case 'critical':
        return {
          variant: 'unsafe',
          label: 'Unsafe',
          ariaText: 'Breach detected'
        };
      case 'caution':
      case 'warning':
        return {
          variant: 'caution',
          label: 'Caution',
          ariaText: 'Advisory caution'
        };
      case 'safe':
        return {
          variant: 'safe',
          label: 'Safe',
          ariaText: 'Within normal permissible range'
        };
      case 'unknown':
      default:
        return {
          variant: 'neutral',
          label: 'Unknown',
          ariaText: 'Measurement unavailable or pending verification'
        };
    }
  };

  const badgeConfig = getStatusBadge(status);

  // Compute displayed safe range text from configured backend thresholds or provided string
  const resolvedRangeText =
    safeRange ||
    (typeof minimum === 'number' && typeof maximum === 'number'
      ? `${minimum} – ${maximum} ${unit}`.trim()
      : typeof maximum === 'number'
      ? `< ${maximum} ${unit}`.trim()
      : null);

  const isNumeric = typeof value === 'number' && Number.isFinite(value);
  const displayValue = isNumeric ? value : value !== null && value !== undefined && value !== '' ? value : '—';

  return (
    <Card className="p-5 shadow-card hover:shadow-card-hover transition-all relative overflow-hidden flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">
            {name}
          </h3>
          <Badge
            variant={badgeConfig.variant}
            size="sm"
            dot={badgeConfig.label !== 'Unknown'}
            title={badgeConfig.ariaText}
          >
            {badgeConfig.label}
          </Badge>
        </div>

        {/* Telemetry Value Display */}
        <div className="flex items-baseline gap-1.5 my-3">
          <span
            className={`text-3xl font-extrabold tracking-tight font-mono ${
              !isNumeric ? 'text-slate-400' : 'text-slate-900'
            }`}
          >
            {displayValue}
          </span>
          {unit && (
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Footer / Threshold Context */}
      <div className="mt-2 pt-2.5 border-t border-slate-100 space-y-1.5">
        {resolvedRangeText && (
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span className="text-slate-400">Normal Range:</span>
            <span className="font-semibold text-slate-700">{resolvedRangeText}</span>
          </div>
        )}

        {isStale && (
          <div className="text-[10px] text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200/60 font-medium flex items-center justify-between">
            <span>Freshness status:</span>
            <span>Data may be stale</span>
          </div>
        )}

        {description && (
          <p className="text-[11px] text-slate-500 leading-tight">
            {description}
          </p>
        )}
      </div>
    </Card>
  );
}
