/**
 * JalDrishti: Suite 7 - Historical Data Tests
 */

const { TestContext, models, bcrypt, generateToken } = require('./testContext');

async function runHistorySuite() {
  const ctx = new TestContext('Historical Data');
  await ctx.setup();

  const suffix = `hist_${Date.now()}`;
  const testNodeId = `NODE_H_${suffix}`.toUpperCase();
  let citizenUser, citizenToken;
  const createdReadingIds = [];

  try {
    console.log('\n[SUITE 7: HISTORICAL DATA]');

    const passHash = await bcrypt.hash('Password123!', 10);
    citizenUser = await models.User.create({
      name: 'History Citizen',
      email: `citizen_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Citizen'
    });
    citizenToken = generateToken({ userId: citizenUser._id.toString(), role: citizenUser.role });

    // Seed 5 historical readings with staggered timestamps
    const now = Date.now();
    for (let i = 0; i < 5; i++) {
      const reading = await models.Reading.create({
        nodeId: testNodeId,
        pH: 7.0 + i * 0.1,
        turbidity: 2.0 + i * 0.2,
        tds: 200 + i * 10,
        temperature: 24.0 + i * 0.5,
        overallStatus: 'Safe',
        timestamp: new Date(now - (5 - i) * 60000) // 5 mins ago to 1 min ago
      });
      createdReadingIds.push(reading._id);
    }

    // 7.1 Historical readings retrieval requires authentication
    const unauthRes = await ctx.makeRequest({ path: '/api/sensor/readings/history' });
    ctx.assert(unauthRes.statusCode === 401, '7.1 Historical readings access without token rejected with HTTP 401');

    // 7.2 Authenticated retrieval succeeds
    const authRes = await ctx.makeRequest({
      path: `/api/sensor/readings/history?nodeId=${testNodeId}`,
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    const extractReadings = (res) => Array.isArray(res.body?.data) ? res.body.data : (res.body?.data?.readings || []);
    const readings = extractReadings(authRes);
    ctx.assert(
      authRes.statusCode === 200 && readings.length === 5,
      '7.2 Authenticated retrieval succeeds and returns node readings array'
    );

    // 7.3 Chronological ordering verification
    let isChronological = true;
    for (let i = 1; i < readings.length; i++) {
      if (new Date(readings[i].timestamp) < new Date(readings[i - 1].timestamp)) {
        isChronological = false;
        break;
      }
    }
    ctx.assert(isChronological, '7.3 Historical readings strictly ordered chronologically by timestamp');

    // 7.4 Limit parameter enforcement
    const limitRes = await ctx.makeRequest({
      path: `/api/sensor/readings/history?nodeId=${testNodeId}&limit=2`,
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    const limitedReadings = extractReadings(limitRes);
    ctx.assert(
      limitedReadings.length === 2,
      '7.4 Limit parameter strictly enforced (limit=2 returns 2 items)'
    );

    // 7.5 Date range filtering (from / to)
    const fromTime = new Date(now - 3.5 * 60000).toISOString();
    const toTime = new Date(now).toISOString();
    const rangeRes = await ctx.makeRequest({
      path: `/api/sensor/readings/history?nodeId=${testNodeId}&from=${fromTime}&to=${toTime}`,
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    const rangeReadings = extractReadings(rangeRes);
    ctx.assert(
      rangeReadings.length >= 1 && rangeReadings.length < 5,
      '7.5 Date range filtering (from/to) strictly filters returned dataset'
    );

    // 7.6 Data integrity: Returned items match real MongoDB records
    const sampleItem = readings[0];
    const dbRecord = await models.Reading.findById(sampleItem.id || sampleItem._id);
    ctx.assert(
      dbRecord && Math.abs(dbRecord.pH - sampleItem.pH) < 0.001,
      '7.6 Data integrity verified: returned readings correspond to actual database records'
    );

  } finally {
    if (citizenUser) await models.User.deleteOne({ _id: citizenUser._id });
    await models.Reading.deleteMany({ _id: { $in: createdReadingIds } });
    await ctx.teardown();
  }

  return { suite: ctx.suiteName, passed: ctx.passed, failed: ctx.failed };
}

if (require.main === module) {
  runHistorySuite().then((res) => {
    TestContext.disconnectDb().then(() => {
      process.exit(res.failed > 0 ? 1 : 0);
    });
  });
}

module.exports = { runHistorySuite };
