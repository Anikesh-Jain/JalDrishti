import React from 'react';
import Button from '../common/Button';

/**
 * JalDrishti Feedback Component: ErrorState
 * Accessible error presentation with role="alert" and optional retry action.
 */
export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while processing your request.',
  onRetry,
  className = ''
}) {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-900 ${className}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-rose-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-semibold text-rose-800">{title}</h3>
          <div className="mt-1 text-sm text-rose-700">{message}</div>
          {onRetry && (
            <div className="mt-4">
              <Button
                variant="danger"
                size="sm"
                onClick={onRetry}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
