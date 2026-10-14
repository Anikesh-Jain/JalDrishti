const { Threshold } = require('../models');

/**
 * Parameters evaluated by the JalDrishti water-quality system
 */
const MONITORED_PARAMETERS = ['pH', 'turbidity', 'tds', 'temperature'];

/**
 * Pure evaluation function comparing reading measurements against a list of thresholds.
 *
 * Boundary rules:
 * - value < minimum  → breach = true, direction = "LOW"
 * - value > maximum  → breach = true, direction = "HIGH"
 * - minimum <= value <= maximum → breach = false (SAFE)
 *
 * Missing/disabled threshold rules:
 * - If threshold is missing, disabled (enabled: false), or incomplete:
 *   parameter is marked as evaluated = false, no breach, no crash.
 *
 * @param {Object} reading - Sensor reading data containing measurement fields
 * @param {Array} thresholdsList - Array of Threshold model documents or plain objects
 * @returns {Object} Structured evaluation result
 */
function evaluateReading(reading, thresholdsList = []) {
  if (!reading || typeof reading !== 'object') {
    throw new Error('Reading must be a valid object');
  }

  // Build a lookup map of thresholds by parameter name
  const thresholdMap = new Map();
  if (Array.isArray(thresholdsList)) {
    for (const t of thresholdsList) {
      if (t && t.parameter) {
        thresholdMap.set(t.parameter, t);
      }
    }
  }

  const evaluationResults = {
    hasBreach: false,
    breachedParameters: [],
    overallStatus: 'Safe',
    parameters: {},
    timestamp: reading.timestamp || new Date()
  };

  for (const param of MONITORED_PARAMETERS) {
    const rawVal = reading[param];
    const threshold = thresholdMap.get(param);

    // If threshold is missing, disabled, or incomplete
    if (
      !threshold ||
      threshold.enabled === false ||
      typeof threshold.minimum !== 'number' ||
      typeof threshold.maximum !== 'number'
    ) {
      evaluationResults.parameters[param] = {
        evaluated: false,
        value: typeof rawVal === 'number' ? rawVal : null,
        breach: false,
        direction: null,
        reason: !threshold ? 'Threshold configuration missing' : 'Threshold disabled or incomplete'
      };
      continue;
    }

    // If reading does not have this parameter
    if (typeof rawVal !== 'number' || !Number.isFinite(rawVal)) {
      evaluationResults.parameters[param] = {
        evaluated: false,
        value: null,
        breach: false,
        direction: null,
        reason: 'Parameter measurement missing or non-finite in reading'
      };
      continue;
    }

    const { minimum, maximum, unit } = threshold;
    let breach = false;
    let direction = null;

    if (rawVal < minimum) {
      breach = true;
      direction = 'LOW';
    } else if (rawVal > maximum) {
      breach = true;
      direction = 'HIGH';
    } else {
      // Exactly within [minimum, maximum] boundary inclusive
      breach = false;
      direction = null;
    }

    if (breach) {
      evaluationResults.hasBreach = true;
      evaluationResults.breachedParameters.push(param);
    }

    evaluationResults.parameters[param] = {
      evaluated: true,
      value: rawVal,
      minimum,
      maximum,
      unit: unit || '',
      breach,
      direction
    };
  }

  evaluationResults.overallStatus = evaluationResults.hasBreach ? 'Unsafe' : 'Safe';
  return evaluationResults;
}

/**
 * Fetch active thresholds from MongoDB and evaluate reading.
 * @param {Object} reading - Reading document or data object
 * @returns {Promise<Object>}
 */
async function evaluateAndClassify(reading) {
  const activeThresholds = await Threshold.find({ enabled: true });
  return evaluateReading(reading, activeThresholds);
}

/**
 * Retrieve all thresholds from MongoDB.
 * @returns {Promise<Array>}
 */
async function getAllThresholds() {
  return await Threshold.find().sort({ parameter: 1 });
}

/**
 * Retrieve a specific threshold by parameter name.
 * @param {string} parameter
 * @returns {Promise<Object|null>}
 */
async function getThresholdByParameter(parameter) {
  return await Threshold.findOne({ parameter });
}

/**
 * Update an existing threshold configuration.
 * @param {string} parameter
 * @param {Object} updateData - { minimum, maximum, unit, enabled, userId }
 * @returns {Promise<Object|null>}
 */
async function updateThreshold(parameter, updateData) {
  const { minimum, maximum, unit, enabled, userId } = updateData;

  const threshold = await Threshold.findOne({ parameter });
  if (!threshold) {
    return null;
  }

  if (typeof minimum === 'number') threshold.minimum = minimum;
  if (typeof maximum === 'number') threshold.maximum = maximum;
  if (typeof unit === 'string' && unit.trim()) threshold.unit = unit.trim();
  if (typeof enabled === 'boolean') threshold.enabled = enabled;
  if (userId) threshold.updatedBy = userId;

  await threshold.save();
  return threshold;
}

module.exports = {
  MONITORED_PARAMETERS,
  evaluateReading,
  evaluateAndClassify,
  getAllThresholds,
  getThresholdByParameter,
  updateThreshold
};
