import React from 'react';

/**
 * JalDrishti Layout Primitive: SectionHeader
 * Section title and description with optional action slot.
 */
export default function SectionHeader({
  title,
  description,
  action,
  className = '',
  ...props
}) {
  return (
    <div
      className={`flex items-start justify-between pb-3 ${className}`}
      {...props}
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900 leading-6">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
}
