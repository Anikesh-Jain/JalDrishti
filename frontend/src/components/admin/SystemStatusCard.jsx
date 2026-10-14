import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

/**
 * JalDrishti SystemStatusCard Component
 * Displays verified infrastructure health, database connectivity, and subsystem statuses.
 */
export default function SystemStatusCard({ health, notificationConfig, thresholdsCount }) {
  const isDbConnected = health?.database === 'connected';
  const smsProvider = notificationConfig?.smsProvider || 'simulated';
  const alertsEnabled = notificationConfig?.alertsEnabled ?? true;

  const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return 'Available';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">System Infrastructure</h3>
          <p className="text-xs text-slate-500">Live operational status of backend services</p>
        </div>
        <Badge variant={isDbConnected ? 'safe' : 'unsafe'} dot size="md">
          {isDbConnected ? 'Operational' : 'Degraded'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            MongoDB Database
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                isDbConnected ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm font-semibold text-slate-800">
              {isDbConnected ? 'Connected (127.0.0.1)' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            API Server Uptime
          </span>
          <span className="text-sm font-semibold text-slate-800">
            {formatUptime(health?.uptime)}
          </span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Threshold Rules Active
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">
              {thresholdsCount > 0 ? `${thresholdsCount} Parameters Monitored` : 'Default 4 Limits'}
            </span>
            <Badge variant="safe" size="sm">Active</Badge>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            SMS Gateway Adapter
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800 capitalize">
              {smsProvider} mode
            </span>
            <Badge variant={alertsEnabled ? 'info' : 'caution'} size="sm">
              {alertsEnabled ? 'Dispatches Active' : 'Muted'}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
