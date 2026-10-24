import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlertContext } from '../../context/AlertContext';
import CitizenLayout from '../../layouts/CitizenLayout';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/feedback/LoadingState';
import api from '../../services/api';
import { AlertTriangleIcon, CheckCircleIcon } from '../../components/common/Icons';

/**
 * JalDrishti Alerts & Early Warning Feed (REM-07 / Reference Image Row 2 Right)
 *
 * Implements:
 * - Filter tabs: All (count), Unread (count), Critical (count), Warning (count), Info (count)
 * - "Mark All Read" button
 * - Severity cards: Critical (red), Warning (amber), Info (green/blue)
 * - 1-Click Acknowledge action for Administrator accounts
 */
export default function CitizenAlertsPage() {
  const { user } = useAuth();
  const {
    alerts,
    loading,
    readAlertIds,
    markAllAlertsAsRead,
    acknowledgeAlert
  } = useAlertContext();
  const isAdmin = user?.role === 'Admin';

  const [activeTab, setActiveTab] = useState('All');
  const [ackingId, setAckingId] = useState(null);

  // Format real alerts from database
  const allFormattedAlerts = (alerts || []).map((a) => {
    let severity = a.severity || (a.status === 'Active' ? (a.value > (a.thresholdLimit * 1.3) ? 'Critical' : 'Warning') : 'Info');
    if (a.parameter === 'turbidity' && a.value > 6.0) severity = 'Critical';
    if (a.status === 'Resolved') severity = 'Info';

    return {
      id: a._id || a.id,
      title: a.title || `${(a.parameter || 'Water').toUpperCase()} Threshold Alert`,
      station: a.station || `Station ${a.nodeId || 'Indore'}`,
      nodeId: a.nodeId,
      message: a.message || `Parameter ${a.parameter} measured ${a.value} (Limit: ${a.thresholdLimit})`,
      time: a.time || formatRelativeTime(a.timestamp),
      severity,
      status: a.status || 'Active',
      isRead: (a._id && readAlertIds.has(a._id)) || (a.id && readAlertIds.has(a.id)) || a.status === 'Acknowledged'
    };
  });

  function formatRelativeTime(date) {
    if (!date) return 'Just now';
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  const handleMarkAllRead = () => {
    markAllAlertsAsRead();
  };

  const handleAcknowledge = async (alertId) => {
    try {
      setAckingId(alertId);
      await acknowledgeAlert(alertId);
    } catch {
      // Ignored
    } finally {
      setAckingId(null);
    }
  };

  // Filter alerts by active tab
  const filteredAlerts = allFormattedAlerts.filter((a) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return !a.isRead;
    if (activeTab === 'Critical') return a.severity === 'Critical';
    if (activeTab === 'Warning') return a.severity === 'Warning';
    if (activeTab === 'Info') return a.severity === 'Info';
    return true;
  });

  // Tab counts
  const counts = {
    All: allFormattedAlerts.length,
    Unread: allFormattedAlerts.filter((a) => !a.isRead).length,
    Critical: allFormattedAlerts.filter((a) => a.severity === 'Critical').length,
    Warning: allFormattedAlerts.filter((a) => a.severity === 'Warning').length,
    Info: allFormattedAlerts.filter((a) => a.severity === 'Info').length
  };

  return (
    <CitizenLayout>
      <div className="space-y-6">
        {/* Header matching reference UI */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Alerts</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Real-time alerts and notifications
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs font-bold border-slate-200 self-start sm:self-auto inline-flex items-center gap-1.5"
          >
            <CheckCircleIcon className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </Button>
        </div>

        {/* Filter Tabs matching reference UI exactly */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { label: 'All', color: 'text-slate-700' },
            { label: 'Unread', color: 'text-blue-600' },
            { label: 'Critical', color: 'text-rose-600' },
            { label: 'Warning', color: 'text-amber-600' },
            { label: 'Info', color: 'text-cyan-600' }
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === tab.label
                  ? 'bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] text-white shadow-sm'
                  : 'bg-white text-[#547181] hover:bg-[#F0FAFF] border border-[#BAE6FD]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[11px] ${activeTab === tab.label ? 'text-white font-black' : tab.color}`}>
                ({counts[tab.label] || 0})
              </span>
            </button>
          ))}
        </div>

        {/* Alert Cards Feed */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingState message="Fetching active alerts and incident history..." />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((item) => {
                const isCritical = item.severity === 'Critical';
                const isWarning = item.severity === 'Warning';
                const isInfo = item.severity === 'Info';

                const iconBg = isCritical
                  ? 'bg-rose-100 text-rose-600'
                  : isWarning
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-emerald-100 text-emerald-600';

                const badgeBg = isCritical
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : isWarning
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-cyan-50 text-cyan-700 border-cyan-200';

                return (
                  <div
                    key={item.id}
                    className={`p-4 sm:p-5 rounded-2xl bg-white border shadow-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      !item.isRead ? 'border-cyan-300/80 ring-1 ring-cyan-100' : 'border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Severity Icon */}
                      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center font-bold text-base shrink-0 mt-0.5`}>
                        {isCritical ? (
                          <AlertTriangleIcon className="w-5 h-5 text-rose-600" />
                        ) : isWarning ? (
                          <AlertTriangleIcon className="w-5 h-5 text-amber-600" />
                        ) : (
                          <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-semibold text-slate-600">{item.station}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                        <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                          <span>{item.time}</span>
                          {!item.isRead && (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 font-semibold text-[10px]">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions and Badge matching reference UI */}
                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      {isAdmin && item.status === 'Active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledge(item.id)}
                          loading={ackingId === item.id}
                          className="text-xs border-amber-300 text-amber-800 hover:bg-amber-50"
                        >
                          Acknowledge
                        </Button>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeBg}`}>
                        {item.severity}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
                No alerts found in the "{activeTab}" category.
              </div>
            )}
          </div>
        )}
      </div>
    </CitizenLayout>
  );
}
