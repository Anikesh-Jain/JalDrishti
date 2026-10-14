import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

/**
 * JalDrishti ParameterCard Component
 * Displays individual water quality parameter reading with human-readable units,
 * reference safe range, and clear semantic status.
 */
export default function ParameterCard({
  name,
  value,
  unit,
  safeRange,
  status = 'Safe',
  description
}) {
  const getBadgeVariant = (s) => {
    switch (s?.toLowerCase()) {
      case 'unsafe':
      case 'critical':
      case 'high':
      case 'low':
        return 'unsafe';
      case 'caution':
      case 'warning':
        return 'caution';
      case 'safe':
      default:
        return 'safe';
    }
  };

  return (
    <Card className="p-5 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-800">{name}</h3>
        <Badge variant={getBadgeVariant(status)} size="sm">
          {status}
        </Badge>
      </div>

      <div className="flex items-baseline gap-1.5 my-2">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
          {value !== undefined && value !== null ? value : '—'}
        </span>
        {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
      </div>

      {safeRange && (
        <div className="text-[11px] text-slate-500 font-medium mb-2">
          <span className="text-slate-400">Normal Range:</span> {safeRange}
        </div>
      )}

      {description && (
        <p className="text-xs text-slate-600 border-t border-slate-100 pt-2 mt-2">
          {description}
        </p>
      )}
    </Card>
  );
}
