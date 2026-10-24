import React, { useState, useEffect } from 'react';
import api from '../../services/api';

/**
 * JalDrishti Phase 21: ReportFilters Component
 *
 * Provides accessible, responsive filter controls tailored to:
 * - Historical Reading Reports (time range, limit, node)
 * - Alert History Reports (status, parameter, direction, time range, limit)
 */
export default function ReportFilters({
  type = 'readings',
  filters,
  onFilterChange,
  disabled = false
}) {
  const isReadings = type === 'readings';
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    let mounted = true;
    api.sensor.getNodes()
      .then((res) => {
        if (mounted && res?.data) {
          setNodes(res.data);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Domain Specific Filter Inputs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Selector */}
          <div>
            <label
              htmlFor={`${type}-range-select`}
              className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
            >
              Time Period
            </label>
            <select
              id={`${type}-range-select`}
              value={filters.range || '24h'}
              onChange={(e) => onFilterChange('range', e.target.value)}
              disabled={disabled}
              className="text-xs font-medium bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
            >
              <option value="1h">Last 1 Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              {!isReadings && <option value="30d">Last 30 Days</option>}
              {!isReadings && <option value="all">All Available</option>}
            </select>
          </div>

          {/* Alert Specific: Status Filter */}
          {!isReadings && (
            <div>
              <label
                htmlFor="alert-status-select"
                className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
              >
                Alert Status
              </label>
              <select
                id="alert-status-select"
                value={filters.status || 'all'}
                onChange={(e) => onFilterChange('status', e.target.value)}
                disabled={disabled}
                className="text-xs font-medium bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Resolved">Resolved Only</option>
              </select>
            </div>
          )}

          {/* Alert Specific: Parameter Filter */}
          {!isReadings && (
            <div>
              <label
                htmlFor="alert-param-select"
                className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
              >
                Parameter
              </label>
              <select
                id="alert-param-select"
                value={filters.parameter || 'all'}
                onChange={(e) => onFilterChange('parameter', e.target.value)}
                disabled={disabled}
                className="text-xs font-medium bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
              >
                <option value="all">All Parameters</option>
                <option value="pH">pH</option>
                <option value="turbidity">Turbidity</option>
                <option value="tds">TDS</option>
                <option value="temperature">Temperature</option>
              </select>
            </div>
          )}

          {/* Alert Specific: Direction Filter */}
          {!isReadings && (
            <div>
              <label
                htmlFor="alert-dir-select"
                className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
              >
                Direction
              </label>
              <select
                id="alert-dir-select"
                value={filters.direction || 'all'}
                onChange={(e) => onFilterChange('direction', e.target.value)}
                disabled={disabled}
                className="text-xs font-medium bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
              >
                <option value="all">Any Direction</option>
                <option value="HIGH">High Breach</option>
                <option value="LOW">Low Breach</option>
              </select>
            </div>
          )}

          {/* Optional Node Identifier Filter */}
          <div>
            <label
              htmlFor={`${type}-node-select`}
              className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
            >
              Sensor Node
            </label>
            <select
              id={`${type}-node-select`}
              value={filters.nodeId || 'all'}
              onChange={(e) => onFilterChange('nodeId', e.target.value)}
              disabled={disabled}
              className="text-xs font-medium bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
            >
              <option value="all">All Nodes</option>
              {nodes.map((node) => (
                <option key={node.nodeId || node._id} value={node.nodeId}>
                  {node.name ? `${node.nodeId} (${node.name})` : node.nodeId}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Side: Safe Limit Bounding */}
        <div>
          <label
            htmlFor={`${type}-limit-select`}
            className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
          >
            Export Limit (Max 1000)
          </label>
          <select
            id={`${type}-limit-select`}
            value={filters.limit || 100}
            onChange={(e) => onFilterChange('limit', parseInt(e.target.value, 10))}
            disabled={disabled}
            className="text-xs font-medium bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
          >
            <option value={50}>50 Records</option>
            <option value={100}>100 Records</option>
            <option value={250}>250 Records</option>
            <option value={500}>500 Records</option>
            <option value={1000}>1,000 Records (Max)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
