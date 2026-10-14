import React from 'react';

/**
 * JalDrishti Phase 17: TimeRangeSelector
 *
 * Accessible button group for selecting historical query durations.
 */
export default function TimeRangeSelector({
  selectedRange,
  onSelectRange,
  options = [],
  disabled = false
}) {
  return (
    <div
      role="group"
      aria-label="Historical time range filter"
      className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 gap-1"
    >
      {options.map((opt) => {
        const isSelected = selectedRange === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectRange(opt.id)}
            aria-pressed={isSelected}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              isSelected
                ? 'bg-white text-primary-700 shadow-sm border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
