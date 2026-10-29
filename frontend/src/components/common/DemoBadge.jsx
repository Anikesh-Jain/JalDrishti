import React from 'react';

/**
 * JalDrishti Demo Data Indicator Component
 *
 * Distinctly and clearly labels simulated preview readings and telemetry
 * so users and evaluators never mistake them for active physical IoT measurements.
 * Designed with a restrained, professional engineering aesthetic.
 */
export default function DemoBadge({
  text = 'Simulated Data',
  label, // alias for text
  variant = 'badge', // 'badge' | 'banner' | 'pill'
  size = 'sm', // 'xs' | 'sm' | 'md'
  className = ''
}) {
  const displayText = label || text;

  if (variant === 'banner') {
    return (
      <div
        role="status"
        aria-label="Simulated Telemetry Active"
        className={`p-3 rounded-xl bg-amber-50/95 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-semibold text-amber-950">Simulated Dataset Active:</span>
            <span className="text-amber-800 text-[11px] sm:text-xs">
              Displaying calibrated sample readings (BIS IS 10500:2012 benchmarked) across 4 Indore monitoring stations while physical IoT hardware is offline.
            </span>
          </div>
        </div>
        <span className="self-start sm:self-auto px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 border border-amber-300 shrink-0">
          Simulated
        </span>
      </div>
    );
  }

  if (variant === 'pill') {
    return (
      <span
        title="Simulated telemetry benchmarked to BIS IS 10500:2012"
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 border border-amber-200 text-amber-800 shadow-2xs ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
        <span>{displayText}</span>
      </span>
    );
  }

  const sizeClasses = size === 'xs'
    ? 'px-1.5 py-0.5 text-[9px]'
    : size === 'md'
    ? 'px-2.5 py-1 text-xs'
    : 'px-2 py-0.5 text-[10px]';

  return (
    <span
      title="This metric represents simulated demo data benchmarked to BIS IS 10500 reference standards"
      className={`inline-flex items-center gap-1.5 rounded font-mono font-semibold uppercase tracking-wider bg-amber-100/90 text-amber-900 border border-amber-300/80 ${sizeClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
      <span>{displayText}</span>
    </span>
  );
}
