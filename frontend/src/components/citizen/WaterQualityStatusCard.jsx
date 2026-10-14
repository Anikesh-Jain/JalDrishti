import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

/**
 * JalDrishti WaterQualityStatusCard Component
 *
 * Prominently displays plain-language overall water quality status:
 * - Safe: Green / safe badge with reassuring plain-language summary
 * - Caution / Warning: Amber / caution badge with attention note
 * - Unsafe: Red / unsafe badge with cautionary advisory
 *
 * Strictly adheres to monitoring facts without unverified potable claims.
 */
export default function WaterQualityStatusCard({
  overallStatus = 'Safe',
  location,
  nodeName,
  nodeId,
  timestamp,
  isStale = false
}) {
  const normalizedStatus = overallStatus?.toLowerCase();

  const getStatusConfig = () => {
    switch (normalizedStatus) {
      case 'unsafe':
      case 'critical':
        return {
          title: 'Unsafe Condition Detected',
          badgeText: 'Unsafe',
          badgeVariant: 'unsafe',
          message:
            'One or more monitored water parameters are currently outside the configured safe limits.',
          bgClass: 'bg-red-50/60 border-red-200'
        };
      case 'caution':
      case 'warning':
        return {
          title: 'Needs Attention',
          badgeText: 'Needs Attention',
          badgeVariant: 'caution',
          message:
            'Water quality parameters are nearing advisory thresholds. Please review individual readings.',
          bgClass: 'bg-amber-50/60 border-amber-200'
        };
      case 'unknown':
        return {
          title: 'Water Status Unknown',
          badgeText: 'Unknown',
          badgeVariant: 'neutral',
          message:
            'Telemetry data is incomplete or unavailable to determine overall water condition.',
          bgClass: 'bg-slate-50/80 border-slate-200'
        };
      case 'safe':
      default:
        return {
          title: 'Water Quality is Safe',
          badgeText: 'Safe',
          badgeVariant: 'safe',
          message:
            'All monitored water quality parameters are currently within normal permissible ranges.',
          bgClass: 'bg-emerald-50/60 border-emerald-200'
        };
    }
  };

  const config = getStatusConfig();

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : null;

  const stationTitle = nodeName && !nodeName.startsWith('NODE_') && !nodeName.startsWith('NODE-')
    ? nodeName
    : 'Bhagirathpura Supply Point 1';

  const stationAddress = typeof location === 'object' && location?.address
    ? location.address
    : typeof location === 'string' && location
    ? location
    : 'Ward 12, Indore, MP';

  return (
    <Card className={`p-6 sm:p-8 shadow-card border ${config.bgClass}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Current Water Condition
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {config.title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isStale && (
            <Badge variant="caution" size="sm">
              Stale Telemetry
            </Badge>
          )}
          <Badge variant={config.badgeVariant} dot size="md" className="text-sm px-3.5 py-1">
            {config.badgeText}
          </Badge>
        </div>
      </div>

      <p className="text-sm sm:text-base text-slate-700 font-medium mb-6">
        {config.message}
      </p>

      <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          <span className="font-semibold text-slate-700">Monitoring Station:</span>{' '}
          <span className="text-slate-900 font-medium">{stationTitle}</span>
          <span className="text-slate-500"> — {stationAddress}</span>
        </div>
        {formattedTime && (
          <div>
            <span className="font-semibold text-slate-700">Last Updated:</span> {formattedTime}
          </div>
        )}
      </div>
    </Card>
  );
}
