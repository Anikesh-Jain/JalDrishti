import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import EmptyState from '../feedback/EmptyState';

/**
 * JalDrishti RecentAlertsCard Component
 * Read-only overview of latest water quality alert breaches.
 * Strict Phase 14 boundary: Alert acknowledgment and management are preserved for Phase 18.
 */
export default function RecentAlertsCard({ alerts = [] }) {
  const getSeverityBadgeVariant = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'unsafe';
      case 'warning':
        return 'caution';
      default:
        return 'info';
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'unsafe';
      case 'acknowledged':
        return 'caution';
      case 'resolved':
        return 'safe';
      default:
        return 'neutral';
    }
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recent Alerts Overview</h3>
          <p className="text-xs text-slate-500">Read-only audit of threshold violations</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={alerts.length > 0 ? 'caution' : 'safe'} size="sm">
            {alerts.length} Recorded
          </Badge>
          <Link
            to="/citizen/alerts"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 ml-1"
          >
            All Alerts →
          </Link>
        </div>
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          title="No Alerts Active"
          message="All monitored water quality parameters are currently within normal baseline thresholds."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Triggered</th>
                <th className="py-2.5 px-3">Node</th>
                <th className="py-2.5 px-3">Parameter</th>
                <th className="py-2.5 px-3">Value</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {alerts.map((alert) => (
                <tr key={alert._id || alert.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                    {(alert.timestamp || alert.triggeredAt) ? new Date(alert.timestamp || alert.triggeredAt).toLocaleString() : 'Recent'}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                    {alert.nodeId || 'NODE-01'}
                  </td>
                  <td className="py-2.5 px-3 capitalize font-semibold">
                    {alert.parameter}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium">
                    {alert.value !== undefined ? alert.value : '—'}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant={getSeverityBadgeVariant(alert.severity)} size="sm">
                      {alert.severity || 'Warning'}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant={getStatusBadgeVariant(alert.status)} size="sm">
                      {alert.status || 'Active'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
