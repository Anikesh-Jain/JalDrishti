import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import LoadingState from '../feedback/LoadingState';
import ErrorState from '../feedback/ErrorState';
import EmptyState from '../feedback/EmptyState';
import ReportFilters from './ReportFilters';
import ExportButton from './ExportButton';

/**
 * JalDrishti Phase 21: ReportCard Component
 *
 * Encapsulated reporting card presenting:
 * - Dynamic filter controls
 * - Export trigger with active progress feedback
 * - Tabular data preview of actual stored telemetry
 * - Empty, Loading, and Error state management
 */
export default function ReportCard({
  type = 'readings',
  title,
  subtitle,
  badgeText,
  badgeVariant = 'safe',
  data = [],
  totalCount = 0,
  loading = false,
  error = null,
  filters,
  onFilterChange,
  onExport,
  isExporting = false,
  exportSuccess = null,
  exportError = null,
  onRetry
}) {
  const isReadings = type === 'readings';

  // Format timestamp safely for UI display
  const formatTime = (ts) => {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return String(ts);
    }
  };

  return (
    <Card
      className="mb-8 overflow-hidden shadow-sm border-slate-200"
      title={
        <div className="flex items-center space-x-2">
          <span>{title}</span>
          {badgeText && (
            <Badge variant={badgeVariant} size="sm">
              {badgeText}
            </Badge>
          )}
        </div>
      }
      subtitle={subtitle}
      headerAction={
        <ExportButton
          onClick={onExport}
          disabled={loading || !!error}
          isExporting={isExporting}
          recordCount={data.length}
          label={`Export ${isReadings ? 'Readings' : 'Alerts'} CSV`}
        />
      }
    >
      {/* 1. Filter Controls */}
      <ReportFilters
        type={type}
        filters={filters}
        onFilterChange={onFilterChange}
        disabled={loading || isExporting}
      />

      {/* 2. Export Success Banner */}
      {exportSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900"
        >
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-emerald-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>
              <strong>CSV Export Complete:</strong> Successfully downloaded{' '}
              <strong>{exportSuccess.count}</strong> records to{' '}
              <code className="bg-emerald-100/70 px-1 py-0.5 rounded font-mono text-[11px]">
                {exportSuccess.filename}
              </code>
            </span>
          </div>
          <span className="text-[10px] text-emerald-700">Just now</span>
        </div>
      )}

      {/* 3. Export Failure Banner */}
      {exportError && (
        <div
          role="alert"
          className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs text-rose-900"
        >
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-rose-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              <strong>Export Failed:</strong> {exportError}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={onExport} className="text-[11px] py-1 px-2.5">
            Retry Export
          </Button>
        </div>
      )}

      {/* 4. Main Body: Loading, Error, Empty, or Data Preview Table */}
      {loading ? (
        <div className="py-12">
          <LoadingState message={`Fetching ${isReadings ? 'sensor readings' : 'alert logs'}...`} />
        </div>
      ) : error ? (
        <div className="py-6">
          <ErrorState message={error} onRetry={onRetry} />
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          title={isReadings ? 'No readings available' : 'No alerts available'}
          message={
            isReadings
              ? 'No readings available for this period.'
              : 'No alerts available for this period.'
          }
        />
      ) : (
        <div>
          {/* Summary Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 bg-slate-100/70 border border-slate-200 rounded-lg mb-3 text-xs text-slate-600">
            <div className="flex items-center space-x-4">
              <span>
                Available Records: <strong className="text-slate-900">{data.length}</strong>
              </span>
              <span>
                Period: <strong className="text-slate-900">{filters.range?.toUpperCase() || '24H'}</strong>
              </span>
              <span>
                Format: <strong className="text-slate-900">RFC 4180 CSV</strong>
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Showing preview of top {Math.min(data.length, 10)} records
            </span>
          </div>

          {/* Tabular Preview */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                {isReadings ? (
                  <tr>
                    <th scope="col" className="px-3 py-2.5">Timestamp</th>
                    <th scope="col" className="px-3 py-2.5">Node ID</th>
                    <th scope="col" className="px-3 py-2.5">pH</th>
                    <th scope="col" className="px-3 py-2.5">Turbidity</th>
                    <th scope="col" className="px-3 py-2.5">TDS</th>
                    <th scope="col" className="px-3 py-2.5">Temperature</th>
                    <th scope="col" className="px-3 py-2.5">Overall Status</th>
                  </tr>
                ) : (
                  <tr>
                    <th scope="col" className="px-3 py-2.5">Timestamp</th>
                    <th scope="col" className="px-3 py-2.5">Node ID</th>
                    <th scope="col" className="px-3 py-2.5">Parameter</th>
                    <th scope="col" className="px-3 py-2.5">Measured Value</th>
                    <th scope="col" className="px-3 py-2.5">Direction</th>
                    <th scope="col" className="px-3 py-2.5">Status</th>
                    <th scope="col" className="px-3 py-2.5">Breach Count</th>
                    <th scope="col" className="px-3 py-2.5">Resolved At</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {data.slice(0, 10).map((row, idx) => {
                  if (isReadings) {
                    const statusVariant =
                      row.overallStatus === 'Safe'
                        ? 'safe'
                        : row.overallStatus === 'Caution'
                        ? 'caution'
                        : 'unsafe';

                    return (
                      <tr key={row.timestamp + idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-3 py-2 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {formatTime(row.timestamp)}
                        </td>
                        <td className="px-3 py-2 font-semibold text-slate-900 whitespace-nowrap">
                          {row.nodeId}
                        </td>
                        <td className="px-3 py-2 font-mono">
                          {typeof row.pH === 'number' ? row.pH.toFixed(2) : '—'}
                        </td>
                        <td className="px-3 py-2 font-mono">
                          {typeof row.turbidity === 'number' ? `${row.turbidity.toFixed(1)} NTU` : '—'}
                        </td>
                        <td className="px-3 py-2 font-mono">
                          {typeof row.tds === 'number' ? `${row.tds} ppm` : '—'}
                        </td>
                        <td className="px-3 py-2 font-mono">
                          {typeof row.temperature === 'number' ? `${row.temperature.toFixed(1)} °C` : '—'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <Badge variant={statusVariant} size="sm">
                            {row.overallStatus || 'Safe'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  }

                  // Alert Row
                  const alertStatusVariant =
                    row.status === 'Active'
                      ? 'unsafe'
                      : row.status === 'Resolved'
                      ? 'safe'
                      : 'caution';

                  return (
                    <tr key={row.timestamp + idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {formatTime(row.timestamp)}
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-900 whitespace-nowrap">
                        {row.nodeId}
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {row.parameter}
                      </td>
                      <td className="px-3 py-2 font-mono font-semibold text-rose-600">
                        {row.measuredValue !== undefined && row.measuredValue !== '' ? row.measuredValue : row.value}
                      </td>
                      <td className="px-3 py-2 font-mono text-[11px]">
                        {row.direction}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Badge variant={alertStatusVariant} size="sm">
                          {row.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 font-mono text-center">
                        {row.breachCount || 1}
                      </td>
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {formatTime(row.resolvedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bounded export note */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              * Tabular queries are strictly bounded to a maximum of 1,000 records to maintain backend stability.
            </span>
            <span>
              Database source: MongoDB authoritative collections
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
