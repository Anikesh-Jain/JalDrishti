const { Reading, Alert } = require('../models');

/**
 * JalDrishti Phase 21: Report Controller
 *
 * Provides authenticated, bounded, and sanitized reporting datasets
 * for historical sensor telemetry and alert logs in both JSON and CSV formats.
 *
 * Security & Sanitization Guarantees:
 * - Strictly bounded queries (clamped between 1 and 1000 records).
 * - Explicit field mapping: excludes _id, __v, deviceKeyHash, user credentials, JWTs, and internal secrets.
 * - RFC 4180 compliant CSV formatting with quote and comma escaping.
 */

/**
 * Escape a value according to RFC 4180 CSV standards.
 * Fields containing commas, quotation marks, or newlines must be enclosed in quotes.
 * Quotation marks within a field must be escaped with another quotation mark ("").
 *
 * @param {any} val
 * @returns {string}
 */
function escapeCsvValue(val) {
  if (val === null || val === undefined) {
    return '';
  }
  let str = String(val);

  // Mitigate CSV Formula Injection (CWE-1236) for text cells
  if (typeof val === 'string' && /^[=+\-@\t\r]/.test(str) && isNaN(Number(str))) {
    str = `'${str}`;
  }

  if (/[",\r\n]/.test(str) || str.startsWith(' ') || str.endsWith(' ')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate an RFC 4180 compliant CSV string from an array of headers and row arrays.
 *
 * @param {string[]} headers
 * @param {Array<Array<any>>} rows
 * @returns {string}
 */
function generateCsv(headers, rows) {
  const headerLine = headers.map(escapeCsvValue).join(',');
  const rowLines = rows.map((row) => row.map(escapeCsvValue).join(','));
  return [headerLine, ...rowLines].join('\r\n');
}

/**
 * Generate historical sensor readings report.
 * GET /api/reports/readings
 *
 * Query Parameters:
 * - from: ISO date string / epoch (start boundary)
 * - to: ISO date string / epoch (end boundary)
 * - nodeId: optional sensor node identifier
 * - limit: number of records (default: 100, clamped max: 1000)
 * - format: 'json' (default) or 'csv'
 */
const getReadingsReport = async (req, res, next) => {
  try {
    const { from, to, nodeId, limit, format } = req.query;

    const filter = {};

    // 1. Time range filtering
    const timestampFilter = {};
    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate.getTime())) {
        timestampFilter.$gte = fromDate;
      }
    } else {
      // Default boundary: last 24 hours if not explicitly provided
      timestampFilter.$gte = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    if (to) {
      const toDate = new Date(to);
      if (!isNaN(toDate.getTime())) {
        timestampFilter.$lte = toDate;
      }
    }

    if (Object.keys(timestampFilter).length > 0) {
      filter.timestamp = timestampFilter;
    }

    // 2. Optional nodeId filter
    if (nodeId && typeof nodeId === 'string' && nodeId.trim()) {
      filter.nodeId = nodeId.trim().toUpperCase();
    }

    // 3. Strictly bounded limit enforcement (min: 1, max: 1000, default: 100)
    const parsedLimit = parseInt(limit, 10);
    const safeLimit = !isNaN(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 1000)
      : 100;

    // 4. Query MongoDB (newest first, then sorted chronologically for tabular analysis)
    const readings = await Reading.find(filter)
      .sort({ timestamp: -1 })
      .limit(safeLimit)
      .lean();

    readings.reverse();

    // 5. Explicitly map database records to sanitized report schema
    const sanitizedReadings = readings.map((r) => ({
      timestamp: r.timestamp ? new Date(r.timestamp).toISOString() : '',
      nodeId: r.nodeId,
      pH: typeof r.pH === 'number' ? r.pH : '',
      turbidity: typeof r.turbidity === 'number' ? r.turbidity : '',
      tds: typeof r.tds === 'number' ? r.tds : '',
      temperature: typeof r.temperature === 'number' ? r.temperature : '',
      overallStatus: r.overallStatus || 'Safe'
    }));

    // 6. CSV Export Mode
    const wantsCsv = format === 'csv' || req.headers.accept === 'text/csv';
    if (wantsCsv) {
      const headers = [
        'Timestamp',
        'Node ID',
        'pH',
        'Turbidity',
        'TDS',
        'Temperature',
        'Overall Status'
      ];

      const rows = sanitizedReadings.map((r) => [
        r.timestamp,
        r.nodeId,
        r.pH,
        r.turbidity,
        r.tds,
        r.temperature,
        r.overallStatus
      ]);

      const csvContent = generateCsv(headers, rows);
      const safeDate = new Date().toISOString().split('T')[0];
      const filename = `jaldrishti-readings-${safeDate}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csvContent);
    }

    // 7. Standard JSON Report Response
    return res.status(200).json({
      success: true,
      reportType: 'Historical Sensor Readings',
      count: sanitizedReadings.length,
      limit: safeLimit,
      isClamped: parsedLimit > 1000,
      timeRange: {
        from: timestampFilter.$gte || null,
        to: timestampFilter.$lte || null
      },
      filters: {
        nodeId: filter.nodeId || null
      },
      data: sanitizedReadings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate alert history report.
 * GET /api/reports/alerts
 *
 * Query Parameters:
 * - from: ISO date string / epoch (start boundary)
 * - to: ISO date string / epoch (end boundary)
 * - nodeId: optional sensor node identifier
 * - parameter: optional parameter filter ('pH', 'turbidity', 'tds', 'temperature')
 * - status: optional status filter ('Active', 'Acknowledged', 'Resolved')
 * - direction: optional breach direction ('LOW', 'HIGH')
 * - limit: number of records (default: 100, clamped max: 1000)
 * - format: 'json' (default) or 'csv'
 */
const getAlertsReport = async (req, res, next) => {
  try {
    const { from, to, nodeId, parameter, status, direction, limit, format } = req.query;

    const filter = {};

    // 1. Time range filtering
    const timestampFilter = {};
    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate.getTime())) {
        timestampFilter.$gte = fromDate;
      }
    }

    if (to) {
      const toDate = new Date(to);
      if (!isNaN(toDate.getTime())) {
        timestampFilter.$lte = toDate;
      }
    }

    if (Object.keys(timestampFilter).length > 0) {
      filter.timestamp = timestampFilter;
    }

    // 2. Specific filter criteria
    if (nodeId && typeof nodeId === 'string' && nodeId.trim()) {
      filter.nodeId = nodeId.trim().toUpperCase();
    }
    if (parameter && typeof parameter === 'string' && parameter.trim()) {
      filter.parameter = parameter.trim();
    }
    if (status && typeof status === 'string' && status.trim()) {
      filter.status = status.trim();
    }
    if (direction && typeof direction === 'string' && direction.trim()) {
      filter.direction = direction.trim().toUpperCase();
    }

    // 3. Strictly bounded limit enforcement (min: 1, max: 1000, default: 100)
    const parsedLimit = parseInt(limit, 10);
    const safeLimit = !isNaN(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 1000)
      : 100;

    // 4. Query MongoDB
    const alerts = await Alert.find(filter)
      .sort({ timestamp: -1 })
      .limit(safeLimit)
      .lean();

    // 5. Explicitly map database records to sanitized report schema
    const sanitizedAlerts = alerts.map((a) => ({
      timestamp: a.timestamp ? new Date(a.timestamp).toISOString() : '',
      nodeId: a.nodeId,
      parameter: a.parameter,
      measuredValue: typeof a.value === 'number' ? a.value : '',
      direction: a.direction || 'HIGH',
      thresholdMinimum: typeof a.thresholdMin === 'number' ? a.thresholdMin : '',
      thresholdMaximum: typeof a.thresholdMax === 'number' ? a.thresholdMax : '',
      status: a.status,
      lastBreachedAt: a.lastBreachedAt ? new Date(a.lastBreachedAt).toISOString() : '',
      resolvedAt: a.resolvedAt ? new Date(a.resolvedAt).toISOString() : '',
      breachCount: a.breachCount || 1
    }));

    // 6. CSV Export Mode
    const wantsCsv = format === 'csv' || req.headers.accept === 'text/csv';
    if (wantsCsv) {
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

      const rows = sanitizedAlerts.map((a) => [
        a.timestamp,
        a.nodeId,
        a.parameter,
        a.measuredValue,
        a.direction,
        a.thresholdMinimum,
        a.thresholdMaximum,
        a.status,
        a.lastBreachedAt,
        a.resolvedAt,
        a.breachCount
      ]);

      const csvContent = generateCsv(headers, rows);
      const safeDate = new Date().toISOString().split('T')[0];
      const filename = `jaldrishti-alerts-${safeDate}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csvContent);
    }

    // 7. Standard JSON Report Response
    return res.status(200).json({
      success: true,
      reportType: 'Alert History',
      count: sanitizedAlerts.length,
      limit: safeLimit,
      isClamped: parsedLimit > 1000,
      timeRange: {
        from: timestampFilter.$gte || null,
        to: timestampFilter.$lte || null
      },
      filters: {
        nodeId: filter.nodeId || null,
        parameter: filter.parameter || null,
        status: filter.status || null,
        direction: filter.direction || null
      },
      data: sanitizedAlerts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReadingsReport,
  getAlertsReport,
  escapeCsvValue,
  generateCsv
};
