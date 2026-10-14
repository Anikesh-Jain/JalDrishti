import React from 'react';

/**
 * JalDrishti Foundation Component: Card
 * Surface container with title, subtitle, headerAction, footer, and body slots.
 */
export default function Card({
  title,
  subtitle,
  children,
  footer,
  className = '',
  headerAction,
  variant = 'default',
  ...props
}) {
  const variantStyles = {
    default: 'bg-white border-slate-200 shadow-sm',
    elevated: 'bg-white border-slate-200 shadow-md',
    muted: 'bg-slate-50 border-slate-200 shadow-xs'
  };

  const selectedVariant = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`rounded-xl border ${selectedVariant} overflow-hidden ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-sm text-slate-600">
          {footer}
        </div>
      )}
    </div>
  );
}
