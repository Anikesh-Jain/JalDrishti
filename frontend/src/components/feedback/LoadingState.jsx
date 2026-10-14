import React from 'react';

/**
 * JalDrishti Feedback Component: LoadingState
 * Accessible loading indicator with animated spinner and screen-reader polite announcement.
 */
export default function LoadingState({
  message = 'Loading data...',
  size = 'md',
  className = ''
}) {
  const sizeStyles = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const selectedSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <svg
        className={`animate-spin ${selectedSize} text-brand-600 mb-3`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p className="text-sm font-medium text-slate-600">{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  );
}
