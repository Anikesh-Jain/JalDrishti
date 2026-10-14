import React from 'react';

/**
 * JalDrishti Phase 20: SettingField Component
 * Reusable field wrapper for administrative forms with labels, helper descriptions, and error states.
 */
export default function SettingField({
  id,
  label,
  description,
  error,
  required = false,
  badge,
  children,
  className = ''
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
          >
            {label} {required && <span className="text-red-500 font-bold">*</span>}
          </label>
        )}
        {badge && <div>{badge}</div>}
      </div>

      {children}

      {description && !error && (
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      )}

      {error && (
        <p role="alert" className="text-xs text-rose-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
