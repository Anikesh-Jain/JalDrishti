import React from 'react';

/**
 * JalDrishti Phase 17: ChartEmptyState
 *
 * Rendered when no telemetry records exist in the selected time range.
 */
export default function ChartEmptyState({ parameterName = 'water quality' }) {
  return (
    <div className="h-56 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <h4 className="text-xs font-semibold text-slate-700 mb-1">
        No Historical Data in Range
      </h4>
      <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
        No {parameterName} measurements recorded for this time window. Try selecting a broader duration or verify sensor transmission.
      </p>
    </div>
  );
}
