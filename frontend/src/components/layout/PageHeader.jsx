import React from 'react';
import Badge from '../common/Badge';

/**
 * JalDrishti Layout Primitive: PageHeader
 * Semantic page header with title, description, status badge, and action slots.
 */
export default function PageHeader({
  title,
  description,
  badge,
  badgeText,
  badgeVariant = 'info',
  actions,
  className = '',
  ...props
}) {
  const renderedBadge = badge || (badgeText ? <Badge variant={badgeVariant} size="sm">{badgeText}</Badge> : null);

  return (
    <div
      className={`pb-5 border-b border-slate-200 sm:flex sm:items-center sm:justify-between ${className}`}
      {...props}
    >
      <div>
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">
            {title}
          </h1>
          {renderedBadge && <div>{renderedBadge}</div>}
        </div>
        {description && (
          <p className="mt-1 text-sm text-slate-500 max-w-4xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="mt-3 flex sm:mt-0 sm:ml-4 space-x-2">
          {actions}
        </div>
      )}
    </div>
  );
}
