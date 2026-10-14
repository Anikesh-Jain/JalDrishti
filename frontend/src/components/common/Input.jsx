import React from 'react';

/**
 * JalDrishti Reusable Form Input Component
 *
 * Accessible, styled form input with label, validation errors, and keyboard focus rings.
 */
export default function Input({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  disabled = false,
  required = false,
  autoComplete,
  className = '',
  ...props
}) {
  const inputId = id || name;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={errorId || helperId}
        className={`w-full px-3.5 py-2.5 bg-white text-slate-900 border rounded-lg text-sm transition-colors duration-150 focus-ring ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-400'
            : 'border-slate-300 focus:border-brand-500 hover:border-slate-400'
        } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
        {...props}
      />

      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-red-600 font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="mt-1.5 text-xs text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
