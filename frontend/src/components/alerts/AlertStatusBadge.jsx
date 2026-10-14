import React from 'react';
import Badge from '../common/Badge';

/**
 * JalDrishti Phase 18: AlertStatusBadge
 *
 * Renders semantic badges for alert lifecycle statuses:
 * - Active: Prominent rose/red badge with pulsating indicator dot.
 * - Acknowledged: Amber badge indicating notification received.
 * - Resolved: Emerald badge indicating return to baseline safe range.
 *
 * Complies with accessibility standards: relies on distinct text labels and icons, not color alone.
 */
export default function AlertStatusBadge({ status, size = 'md', className = '' }) {
  const normalized = (status || 'Active').toLowerCase();

  switch (normalized) {
    case 'active':
      return (
        <Badge
          variant="unsafe"
          size={size}
          dot={true}
          className={`font-semibold tracking-wide uppercase ${className}`}
          aria-label="Alert Status: Active Threshold Breach"
        >
          <span className="inline-flex items-center gap-1">
            <span className="relative flex h-2 w-2 mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
            </span>
            Active Breach
          </span>
        </Badge>
      );

    case 'acknowledged':
      return (
        <Badge
          variant="caution"
          size={size}
          dot={true}
          className={`font-medium ${className}`}
          aria-label="Alert Status: Acknowledged"
        >
          Acknowledged
        </Badge>
      );

    case 'resolved':
      return (
        <Badge
          variant="safe"
          size={size}
          dot={true}
          className={`font-medium ${className}`}
          aria-label="Alert Status: Resolved"
        >
          <span className="inline-flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5 text-emerald-600 mr-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Resolved
          </span>
        </Badge>
      );

    default:
      return (
        <Badge variant="neutral" size={size} className={className}>
          {status || 'Unknown'}
        </Badge>
      );
  }
}
