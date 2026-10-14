const { MONITORED_PARAMETERS } = require('../services/thresholdService');

// Parameter casing normalization map
const PARAMETER_ALIAS_MAP = {
  ph: 'pH',
  PH: 'pH',
  pH: 'pH',
  turbidity: 'turbidity',
  TURBIDITY: 'turbidity',
  tds: 'tds',
  TDS: 'tds',
  temperature: 'temperature',
  TEMPERATURE: 'temperature'
};

/**
 * Validate Admin threshold configuration update payload.
 * Validates parameter route param and body values.
 */
const validateThresholdUpdate = (req, res, next) => {
  const rawParam = req.params.parameter;

  if (!rawParam || typeof rawParam !== 'string') {
    return res.status(400).json({
      error: 'Parameter name is required in request URL'
    });
  }

  const normalizedParam = PARAMETER_ALIAS_MAP[rawParam.trim()];
  if (!normalizedParam || !MONITORED_PARAMETERS.includes(normalizedParam)) {
    return res.status(400).json({
      error: `Invalid parameter '${rawParam}'. Supported parameters: ${MONITORED_PARAMETERS.join(', ')}`
    });
  }

  const { minimum, maximum, unit, enabled } = req.body || {};

  // 1. Minimum validation
  if (minimum === undefined || minimum === null) {
    return res.status(400).json({
      error: 'Minimum threshold limit is required'
    });
  }
  if (typeof minimum !== 'number' || !Number.isFinite(minimum)) {
    return res.status(400).json({
      error: 'Minimum threshold limit must be a valid finite number'
    });
  }

  // 2. Maximum validation
  if (maximum === undefined || maximum === null) {
    return res.status(400).json({
      error: 'Maximum threshold limit is required'
    });
  }
  if (typeof maximum !== 'number' || !Number.isFinite(maximum)) {
    return res.status(400).json({
      error: 'Maximum threshold limit must be a valid finite number'
    });
  }

  // 3. Minimum <= Maximum check
  if (minimum > maximum) {
    return res.status(400).json({
      error: `Minimum limit (${minimum}) cannot exceed maximum limit (${maximum})`
    });
  }

  // 4. Optional enabled validation
  if (enabled !== undefined && typeof enabled !== 'boolean') {
    return res.status(400).json({
      error: 'Field "enabled" must be a boolean (true or false)'
    });
  }

  // 5. Optional unit validation
  if (unit !== undefined && (typeof unit !== 'string' || !unit.trim())) {
    return res.status(400).json({
      error: 'Field "unit" must be a non-empty string'
    });
  }

  // Attach normalized parameter and validated payload
  req.normalizedParameter = normalizedParam;
  req.validatedThresholdData = {
    minimum,
    maximum,
    unit: typeof unit === 'string' ? unit.trim() : undefined,
    enabled: typeof enabled === 'boolean' ? enabled : undefined
  };

  next();
};

module.exports = {
  validateThresholdUpdate
};
