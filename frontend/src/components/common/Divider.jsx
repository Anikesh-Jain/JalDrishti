import React from 'react';

/**
 * JalDrishti Foundation Component: Divider
 * Subtle visual separator with optional centered text label.
 */
export default function Divider({
  label,
  className = '',
  ...props
}) {
  if (!label) {
    return (
      <hr
        className={`border-t border-slate-200 my-4 ${className}`}
        {...props}
      />
    );
  }

  return (
    <div className={`relative flex py-3 items-center ${className}`} {...props}>
      <div className="flex-grow border-t border-slate-200" />
      <span className="flex-shrink mx-4 text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <div className="flex-grow border-t border-slate-200" />
    </div>
  );
}
