import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

/**
 * JalDrishti AdminStatCard Component
 * Displays key operational metric with title, value, status badge, and context.
 */
export default function AdminStatCard({
  title,
  value,
  subtitle,
  badgeText,
  badgeVariant = 'info',
  icon
}) {
  return (
    <Card className="p-5 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {badgeText && (
          <Badge variant={badgeVariant} size="sm">
            {badgeText}
          </Badge>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value !== undefined && value !== null ? value : '—'}
        </div>
        {icon && <div className="text-slate-400 text-xl">{icon}</div>}
      </div>

      {subtitle && <p className="mt-2 text-xs text-slate-500">{subtitle}</p>}
    </Card>
  );
}
