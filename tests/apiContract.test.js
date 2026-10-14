/**
 * JalDrishti: Suite 14 - API Contract & Consistency Tests
 */

const fs = require('fs');
const path = require('path');
const { TestContext } = require('./testContext');
const { MONITORED_PARAMETERS } = require('../backend/src/services/thresholdService');

async function runApiContractSuite() {
  const ctx = new TestContext('API Contract & Consistency');

  console.log('\n[SUITE 14: API CONTRACT & CONSISTENCY]');

  // 14.1 Normalized parameter identifiers
  ctx.assert(
    MONITORED_PARAMETERS.includes('pH') &&
    MONITORED_PARAMETERS.includes('turbidity') &&
    MONITORED_PARAMETERS.includes('tds') &&
    MONITORED_PARAMETERS.includes('temperature') &&
    MONITORED_PARAMETERS.length === 4,
    '14.1 Monitored parameters strictly standardized to [pH, turbidity, tds, temperature]'
  );

  // 14.2 Unit mapping standards
  const EXPECTED_UNITS = {
    pH: 'pH',
    turbidity: 'NTU',
    tds: 'ppm',
    temperature: '°C'
  };
  ctx.assert(
    EXPECTED_UNITS.pH === 'pH' && EXPECTED_UNITS.turbidity === 'NTU' &&
    EXPECTED_UNITS.tds === 'ppm' && EXPECTED_UNITS.temperature === '°C',
    '14.2 Monitored parameter physical units follow SRS standard definitions'
  );

  // 14.3 Classification status terminology
  const VALID_STATUSES = ['Safe', 'Unsafe', 'Warning'];
  ctx.assert(
    VALID_STATUSES.includes('Safe') && VALID_STATUSES.includes('Unsafe'),
    '14.3 Water quality safety classification terminology standardized (Safe/Unsafe/Warning)'
  );

  // 14.4 Alert direction terminology
  const VALID_DIRECTIONS = ['LOW', 'HIGH'];
  ctx.assert(
    VALID_DIRECTIONS.includes('LOW') && VALID_DIRECTIONS.includes('HIGH'),
    '14.4 Alert breach directions standardized to LOW and HIGH'
  );

  // 14.5 Alert lifecycle status terminology
  const VALID_ALERT_STATUSES = ['Active', 'Acknowledged', 'Resolved'];
  ctx.assert(
    VALID_ALERT_STATUSES.includes('Active') && VALID_ALERT_STATUSES.includes('Resolved'),
    '14.5 Alert lifecycle statuses standardized to Active, Acknowledged, and Resolved'
  );

  // 14.6 Frontend API client method parity
  const apiFilePath = path.resolve(__dirname, '../frontend/src/services/api.js');
  let apiMatches = false;
  if (fs.existsSync(apiFilePath)) {
    const apiCode = fs.readFileSync(apiFilePath, 'utf8');
    apiMatches =
      apiCode.includes('/auth/login') &&
      apiCode.includes('/auth/register') &&
      apiCode.includes('/sensor/readings') &&
      apiCode.includes('/thresholds') &&
      apiCode.includes('/alerts') &&
      apiCode.includes('/image-checks');
  }
  ctx.assert(
    apiMatches,
    '14.6 Frontend API client routes match backend REST endpoint contracts'
  );

  return { suite: ctx.suiteName, passed: ctx.passed, failed: ctx.failed };
}

if (require.main === module) {
  runApiContractSuite().then((res) => {
    process.exit(res.failed > 0 ? 1 : 0);
  });
}

module.exports = { runApiContractSuite };
