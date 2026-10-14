import React from 'react';
import Button from '../common/Button';

/**
 * JalDrishti Phase 18: AlertFilters Component
 *
 * Provides straightforward, citizen-friendly filtering:
 * - Status: All, Active, Resolved
 * - Parameter: All, pH, Turbidity, TDS, Temperature
 * - Direction: All, HIGH, LOW
 */
export default function AlertFilters({ filters, onFilterChange, onReset, totalCount, filteredCount }) {
  const handleStatusChange = (e) => {
    onFilterChange({ ...filters, status: e.target.value });
  };

  const handleParameterChange = (e) => {
    onFilterChange({ ...filters, parameter: e.target.value });
  };

  const handleDirectionChange = (e) => {
    onFilterChange({ ...filters, direction: e.target.value });
  };

  const isFiltered =
    filters.status !== 'all' ||
    filters.parameter !== 'all' ||
    filters.direction !== 'all';

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Controls Group */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          {/* Status Filter */}
          <div>
            <label htmlFor="filter-status" className="block text-xs font-semibold text-slate-700 mb-1">
              Status
            </label>
            <select
              id="filter-status"
              value={filters.status}
              onChange={handleStatusChange}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Resolved">Resolved Only</option>
            </select>
          </div>

          {/* Parameter Filter */}
          <div>
            <label htmlFor="filter-parameter" className="block text-xs font-semibold text-slate-700 mb-1">
              Parameter
            </label>
            <select
              id="filter-parameter"
              value={filters.parameter}
              onChange={handleParameterChange}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
            >
              <option value="all">All Parameters</option>
              <option value="pH">pH Level</option>
              <option value="turbidity">Turbidity (NTU)</option>
              <option value="tds">Total Dissolved Solids (TDS)</option>
              <option value="temperature">Temperature (°C)</option>
            </select>
          </div>

          {/* Direction Filter */}
          <div>
            <label htmlFor="filter-direction" className="block text-xs font-semibold text-slate-700 mb-1">
              Breach Direction
            </label>
            <select
              id="filter-direction"
              value={filters.direction}
              onChange={handleDirectionChange}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
            >
              <option value="all">All Directions</option>
              <option value="HIGH">HIGH (Upper Limit Breach)</option>
              <option value="LOW">LOW (Lower Limit Breach)</option>
            </select>
          </div>
        </div>

        {/* Count Summary & Reset */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-800">{filteredCount}</strong> of{' '}
            <strong className="text-slate-800">{totalCount}</strong> records
          </div>

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
