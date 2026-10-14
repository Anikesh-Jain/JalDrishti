import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

/**
 * JalDrishti Phase 17: ChartContainer
 *
 * Consistent wrapper card for individual parameter trend visualizations.
 */
export default function ChartContainer({
  title,
  unit,
  safeRange,
  latestValue,
  description,
  children
}) {
  return (
    <Card className="p-5 shadow-card hover:shadow-card-hover transition-all">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800 tracking-tight">
              {title}
            </h3>
            {unit && (
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1.5 py-0.5 bg-slate-100 rounded">
                {unit}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {safeRange && (
            <span className="text-[11px] text-slate-500 font-medium bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-full">
              <span className="text-slate-400">Standard:</span> {safeRange}
            </span>
          )}
          {latestValue !== undefined && latestValue !== null && (
            <Badge variant="info" size="sm">
              Latest: {latestValue} {unit}
            </Badge>
          )}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full">
        {children}
      </div>
    </Card>
  );
}
