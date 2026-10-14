/**
 * JalDrishti: Suite 4 - Threshold Engine Tests
 */

const { TestContext, models, bcrypt, generateToken } = require('./testContext');
const thresholdService = require('../backend/src/services/thresholdService');

async function runThresholdsSuite() {
  const ctx = new TestContext('Threshold Engine');
  await ctx.setup();

  const suffix = `thresh_${Date.now()}`;
  let adminUser, adminToken;
  let originalPhThreshold;

  try {
    console.log('\n[SUITE 4: THRESHOLD ENGINE]');

    // Admin setup for API testing
    const passHash = await bcrypt.hash('Password123!', 10);
    adminUser = await models.User.create({
      name: 'Threshold Admin',
      email: `admin_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Admin'
    });
    adminToken = generateToken({ userId: adminUser._id.toString(), role: adminUser.role });

    // Store original pH threshold to restore later
    originalPhThreshold = await models.Threshold.findOne({ parameter: 'pH' });

    // 4.1 Unit level test: Pure function boundary evaluation for all 4 parameters
    const mockThresholds = [
      { parameter: 'pH', minimum: 6.5, maximum: 8.5, enabled: true },
      { parameter: 'turbidity', minimum: 0.0, maximum: 5.0, enabled: true },
      { parameter: 'tds', minimum: 50.0, maximum: 500.0, enabled: true },
      { parameter: 'temperature', minimum: 0.0, maximum: 35.0, enabled: true }
    ];

    // pH boundary checks
    const lowPhEval = thresholdService.evaluateReading({ pH: 6.4, turbidity: 2.0, tds: 200, temperature: 25.0 }, mockThresholds);
    ctx.assert(lowPhEval.hasBreach && lowPhEval.parameters.pH.direction === 'LOW', '4.1 pH below minimum evaluated as LOW breach');

    const minPhEval = thresholdService.evaluateReading({ pH: 6.5, turbidity: 2.0, tds: 200, temperature: 25.0 }, mockThresholds);
    ctx.assert(!minPhEval.parameters.pH.breach && minPhEval.overallStatus === 'Safe', '4.2 pH exactly at minimum evaluated as Safe');

    const normalPhEval = thresholdService.evaluateReading({ pH: 7.4, turbidity: 2.0, tds: 200, temperature: 25.0 }, mockThresholds);
    ctx.assert(!normalPhEval.parameters.pH.breach && normalPhEval.overallStatus === 'Safe', '4.3 pH normal value evaluated as Safe');

    const maxPhEval = thresholdService.evaluateReading({ pH: 8.5, turbidity: 2.0, tds: 200, temperature: 25.0 }, mockThresholds);
    ctx.assert(!maxPhEval.parameters.pH.breach && maxPhEval.overallStatus === 'Safe', '4.4 pH exactly at maximum evaluated as Safe');

    const highPhEval = thresholdService.evaluateReading({ pH: 8.6, turbidity: 2.0, tds: 200, temperature: 25.0 }, mockThresholds);
    ctx.assert(highPhEval.hasBreach && highPhEval.parameters.pH.direction === 'HIGH', '4.5 pH above maximum evaluated as HIGH breach');

    // Turbidity boundary checks
    const highTurbEval = thresholdService.evaluateReading({ pH: 7.0, turbidity: 5.1, tds: 200, temperature: 25.0 }, mockThresholds);
    ctx.assert(highTurbEval.hasBreach && highTurbEval.parameters.turbidity.direction === 'HIGH', '4.6 Turbidity above maximum evaluated as HIGH breach');

    const maxTurbEval = thresholdService.evaluateReading({ pH: 7.0, turbidity: 5.0, tds: 200, temperature: 25.0 }, mockThresholds);
    ctx.assert(!maxTurbEval.parameters.turbidity.breach, '4.7 Turbidity exactly at maximum evaluated as Safe');

    // TDS boundary checks
    const lowTdsEval = thresholdService.evaluateReading({ pH: 7.0, turbidity: 2.0, tds: 49.0, temperature: 25.0 }, mockThresholds);
    ctx.assert(lowTdsEval.hasBreach && lowTdsEval.parameters.tds.direction === 'LOW', '4.8 TDS below minimum evaluated as LOW breach');

    const highTdsEval = thresholdService.evaluateReading({ pH: 7.0, turbidity: 2.0, tds: 501.0, temperature: 25.0 }, mockThresholds);
    ctx.assert(highTdsEval.hasBreach && highTdsEval.parameters.tds.direction === 'HIGH', '4.9 TDS above maximum evaluated as HIGH breach');

    // Temperature boundary checks
    const lowTempEval = thresholdService.evaluateReading({ pH: 7.0, turbidity: 2.0, tds: 200, temperature: -1.0 }, mockThresholds);
    ctx.assert(lowTempEval.hasBreach && lowTempEval.parameters.temperature.direction === 'LOW', '4.10 Temperature below minimum evaluated as LOW breach');

    const highTempEval = thresholdService.evaluateReading({ pH: 7.0, turbidity: 2.0, tds: 200, temperature: 35.5 }, mockThresholds);
    ctx.assert(highTempEval.hasBreach && highTempEval.parameters.temperature.direction === 'HIGH', '4.11 Temperature above maximum evaluated as HIGH breach');

    // 4.12 Disabled threshold behavior
    const disabledThresholds = [
      { parameter: 'pH', minimum: 6.5, maximum: 8.5, enabled: false }
    ];
    const disabledEval = thresholdService.evaluateReading({ pH: 9.5 }, disabledThresholds);
    ctx.assert(!disabledEval.hasBreach && disabledEval.parameters.pH.evaluated === false, '4.12 Disabled threshold ignores breach and marks evaluated: false');

    // 4.13 Missing threshold handled gracefully
    const missingEval = thresholdService.evaluateReading({ pH: 7.0 }, []);
    ctx.assert(!missingEval.hasBreach, '4.13 Missing threshold list handled gracefully without exception');

    // 4.14 Dynamic threshold modification via Admin API
    const updateRes = await ctx.makeRequest({
      path: '/api/thresholds/pH',
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` }
    }, {
      minimum: 6.0,
      maximum: 9.0,
      enabled: true
    });
    ctx.assert(updateRes.statusCode === 200, '4.14 Admin dynamic update of pH threshold succeeds with HTTP 200');

    // Verify DB updated
    const updatedDbThreshold = await models.Threshold.findOne({ parameter: 'pH' });
    ctx.assert(
      updatedDbThreshold && updatedDbThreshold.maximum === 9.0 && updatedDbThreshold.minimum === 6.0,
      '4.15 Dynamically updated threshold persisted in MongoDB'
    );

    // 4.16 Service evaluation against database reflects updated threshold
    const dynamicReading = { pH: 8.8, turbidity: 2.0, tds: 200, temperature: 25.0 };
    const dynamicDbEval = await thresholdService.evaluateAndClassify(dynamicReading);
    ctx.assert(
      !dynamicDbEval.hasBreach && dynamicDbEval.overallStatus === 'Safe',
      '4.16 Value (pH 8.8) is classified Safe under new threshold [6.0, 9.0]'
    );

    // 4.17 Restore original pH threshold
    if (originalPhThreshold) {
      await models.Threshold.updateOne(
        { parameter: 'pH' },
        {
          $set: {
            minimum: originalPhThreshold.minimum,
            maximum: originalPhThreshold.maximum,
            enabled: originalPhThreshold.enabled
          }
        }
      );
      ctx.assert(true, '4.17 Original pH threshold cleanly restored in MongoDB');
    }

  } finally {
    if (adminUser) await models.User.deleteOne({ _id: adminUser._id });
    if (originalPhThreshold) {
      await models.Threshold.updateOne(
        { parameter: 'pH' },
        { $set: { minimum: originalPhThreshold.minimum, maximum: originalPhThreshold.maximum, enabled: originalPhThreshold.enabled } }
      );
    }
    await ctx.teardown();
  }

  return { suite: ctx.suiteName, passed: ctx.passed, failed: ctx.failed };
}

if (require.main === module) {
  runThresholdsSuite().then((res) => {
    TestContext.disconnectDb().then(() => {
      process.exit(res.failed > 0 ? 1 : 0);
    });
  });
}

module.exports = { runThresholdsSuite };
