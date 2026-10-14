import React from 'react';

/**
 * JalDrishti Foundation Component: Badge
 * Reusable semantic status badge aligned with the water safety color hierarchy.
 */
export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) {
  const variantStyles = {
    safe: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    caution: 'bg-amber-50 text-amber-800 border-amber-200',
    unsafe: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
    neutral: 'bg-slate-100 text-slate-800 border-slate-200',
    dark: 'bg-slate-800 text-slate-300 border-slate-700',
    'neutral-dark': 'bg-slate-800 text-slate-300 border-slate-700'
  };

  const dotColorStyles = {
    safe: 'bg-emerald-500',
    caution: 'bg-amber-500',
    unsafe: 'bg-rose-500',
    info: 'bg-sky-500',
    neutral: 'bg-slate-400',
    dark: 'bg-slate-400',
    'neutral-dark': 'bg-slate-400'
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1'
  };

  const selectedVariant = variantStyles[variant] || variantStyles.neutral;
  const selectedDotColor = dotColorStyles[variant] || dotColorStyles.neutral;
  const selectedSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full ${selectedVariant} ${selectedSize} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full mr-1.5 ${selectedDotColor}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
