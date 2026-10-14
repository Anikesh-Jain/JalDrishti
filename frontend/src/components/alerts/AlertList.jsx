import React from 'react';
import AlertCard from './AlertCard';
import EmptyState from '../feedback/EmptyState';

/**
 * JalDrishti Phase 18: AlertList Component
 *
 * Renders a list/stack of AlertCard components with built-in EmptyState handling.
 */
export default function AlertList({
  alerts = [],
  onInspect,
  emptyTitle = 'No Alerts Recorded',
  emptyMessage = 'No alert records match the selected criteria.',
  emptyAction = null
}) {
  if (!alerts || alerts.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="space-y-3" role="feed" aria-label="Alerts list">
      {alerts.map((alert) => (
        <AlertCard
          key={alert._id || `${alert.nodeId}-${alert.parameter}-${alert.timestamp}`}
          alert={alert}
          onInspect={onInspect}
        />
      ))}
    </div>
  );
}
