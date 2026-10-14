import React from 'react';

/**
 * JalDrishti Feedback Component: EmptyState
 * Reusable placeholder view for empty collections, searches, or initial states.
 */
export default function EmptyState({
  title = 'No records found',
  message = 'There is currently no data available to display.',
  action,
  className = '',
  icon
}) {
  return (
    <div
      className={`text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 ${className}`}
    >
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 text-slate-400 mb-3">
        {icon || (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
