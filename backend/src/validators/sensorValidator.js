/**
 * Strict server-side validation for water-quality sensor telemetry payloads.
 *
 * Enforces:
 * - Field presence (pH, turbidity, tds, temperature)
 * - Strict type checking (must be finite JavaScript numbers, no null, no NaN, no Infinity)
 * - Physical domain boundary checking (pH 0–14, turbidity >= 0, tds >= 0, temp -10 to 80°C)
 * - Timestamp parsing and validity
 *
 * NOTE: Phase 7 validates structural and physical plausibility ONLY.
 * It deliberately does NOT evaluate water-quality safety thresholds (e.g., pH 9.1 is valid
 * and stored, and will be evaluated by Phase 8 Threshold Engine).
 */
const validateSensorReading = (req, res, next) => {
  const { pH, turbidity, tds, TDS, temperature, timestamp } = req.body || {};

  // 1. pH validation
  if (pH === undefined || pH === null) {
    return res.status(400).json({
      error: 'Missing required field: pH'
    });
  }
  if (typeof pH !== 'number' || !Number.isFinite(pH)) {
    return res.status(400).json({
      error: 'Invalid pH value: must be a valid finite number'
    });
  }
  if (pH < 0.0 || pH > 14.0) {
    return res.status(400).json({
      error: `pH value (${pH}) is outside the physically plausible domain [0.0, 14.0]`
    });
  }

  // 2. Turbidity validation
  if (turbidity === undefined || turbidity === null) {
    return res.status(400).json({
      error: 'Missing required field: turbidity'
    });
  }
  if (typeof turbidity !== 'number' || !Number.isFinite(turbidity)) {
    return res.status(400).json({
      error: 'Invalid turbidity value: must be a valid finite number'
    });
  }
  if (turbidity < 0.0) {
    return res.status(400).json({
      error: `Turbidity value (${turbidity}) cannot be negative`
    });
  }

  // 3. TDS validation (accepts 'tds' or 'TDS')
  const rawTds = tds !== undefined ? tds : TDS;
  if (rawTds === undefined || rawTds === null) {
    return res.status(400).json({
      error: 'Missing required field: tds'
    });
  }
  if (typeof rawTds !== 'number' || !Number.isFinite(rawTds)) {
    return res.status(400).json({
      error: 'Invalid TDS value: must be a valid finite number'
    });
  }
  if (rawTds < 0.0) {
    return res.status(400).json({
      error: `TDS value (${rawTds}) cannot be negative`
    });
  }

  // 4. Temperature validation
  if (temperature === undefined || temperature === null) {
    return res.status(400).json({
      error: 'Missing required field: temperature'
    });
  }
  if (typeof temperature !== 'number' || !Number.isFinite(temperature)) {
    return res.status(400).json({
      error: 'Invalid temperature value: must be a valid finite number'
    });
  }
  if (temperature < -10.0 || temperature > 80.0) {
    return res.status(400).json({
      error: `Temperature value (${temperature}°C) is outside the physically plausible domain [-10.0, 80.0]`
    });
  }

  // 5. Timestamp validation
  let parsedTimestamp = new Date();
  if (timestamp !== undefined && timestamp !== null) {
    const parsedTime = Date.parse(timestamp);
    if (isNaN(parsedTime)) {
      return res.status(400).json({
        error: 'Invalid timestamp: must be a valid ISO 8601 or parseable date format'
      });
    }
    parsedTimestamp = new Date(parsedTime);
  }

  // Attach sanitized, typed reading data for controller persistence
  req.validatedReading = {
    nodeId: req.sensorNode.nodeId,
    pH: Number(pH),
    turbidity: Number(turbidity),
    tds: Number(rawTds),
    temperature: Number(temperature),
    timestamp: parsedTimestamp
  };

  next();
};

module.exports = {
  validateSensorReading
};
