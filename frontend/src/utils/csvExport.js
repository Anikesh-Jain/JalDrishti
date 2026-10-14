/**
 * JalDrishti Phase 21: CSV Export Utilities
 *
 * Lightweight, RFC 4180 compliant CSV serialization and client-side download utility.
 * Guarantees zero external dependencies, correct quoting and escaping of special characters,
 * Unicode text preservation, and predictable, safe file naming.
 */

/**
 * Escapes a single value according to RFC 4180 CSV specifications.
 * Encloses strings containing commas, quotes, or newlines in double quotes,
 * and escapes double quotes by doubling them ("").
 *
 * @param {any} val
 * @returns {string}
 */
export function escapeCsvValue(val) {
  if (val === null || val === undefined) {
    return '';
  }
  const str = String(val);
  if (/[",\r\n]/.test(str) || str.startsWith(' ') || str.endsWith(' ')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates an RFC 4180 formatted CSV string from header labels and row data arrays.
 *
 * @param {string[]} headers
 * @param {Array<Array<any>>} rows
 * @returns {string}
 */
export function generateCsv(headers, rows) {
  const headerLine = headers.map(escapeCsvValue).join(',');
  const rowLines = rows.map((row) => row.map(escapeCsvValue).join(','));
  return [headerLine, ...rowLines].join('\r\n');
}

/**
 * Maps sanitized sensor readings into structured CSV tabular format.
 *
 * @param {Array<Object>} readings
 * @returns {{ headers: string[], rows: Array<Array<any>>, csv: string }}
 */
export function formatReadingsForCsv(readings = []) {
  const headers = [
    'Timestamp',
    'Node ID',
    'pH',
    'Turbidity',
    'TDS',
    'Temperature',
    'Overall Status'
  ];

  const rows = readings.map((r) => [
    r.timestamp ? new Date(r.timestamp).toISOString() : '',
    r.nodeId || '',
    typeof r.pH === 'number' ? r.pH : '',
    typeof r.turbidity === 'number' ? r.turbidity : '',
    typeof r.tds === 'number' ? r.tds : '',
    typeof r.temperature === 'number' ? r.temperature : '',
    r.overallStatus || 'Safe'
  ]);

  return {
    headers,
    rows,
    csv: generateCsv(headers, rows)
  };
}

/**
 * Maps sanitized alert log records into structured CSV tabular format.
 *
 * @param {Array<Object>} alerts
 * @returns {{ headers: string[], rows: Array<Array<any>>, csv: string }}
 */
export function formatAlertsForCsv(alerts = []) {
  const headers = [
    'Timestamp',
    'Node ID',
    'Parameter',
    'Measured Value',
    'Direction',
    'Threshold Minimum',
    'Threshold Maximum',
    'Status',
    'Last Breached At',
    'Resolved At',
    'Breach Count'
  ];

  const rows = alerts.map((a) => [
    a.timestamp ? new Date(a.timestamp).toISOString() : '',
    a.nodeId || '',
    a.parameter || '',
    typeof a.measuredValue === 'number' ? a.measuredValue : (typeof a.value === 'number' ? a.value : ''),
    a.direction || 'HIGH',
    typeof a.thresholdMinimum === 'number' ? a.thresholdMinimum : (typeof a.thresholdMin === 'number' ? a.thresholdMin : ''),
    typeof a.thresholdMaximum === 'number' ? a.thresholdMaximum : (typeof a.thresholdMax === 'number' ? a.thresholdMax : ''),
    a.status || 'Active',
    a.lastBreachedAt ? new Date(a.lastBreachedAt).toISOString() : '',
    a.resolvedAt ? new Date(a.resolvedAt).toISOString() : '',
    a.breachCount || 1
  ]);

  return {
    headers,
    rows,
    csv: generateCsv(headers, rows)
  };
}

/**
 * Triggers a browser file download of CSV content as a Blob.
 *
 * @param {string} csvContent
 * @param {string} filename
 */
export function downloadCsvFile(csvContent, filename) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates standard predictable filename following format: jaldrishti-<type>-YYYY-MM-DD.csv
 *
 * @param {'readings' | 'alerts'} type
 * @returns {string}
 */
export function getReportFilename(type = 'readings') {
  const safeDate = new Date().toISOString().split('T')[0];
  return `jaldrishti-${type}-${safeDate}.csv`;
}
