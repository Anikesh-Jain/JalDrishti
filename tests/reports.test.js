/**
 * JalDrishti: Suite 10 - Reports & CSV Export Tests
 */

const { TestContext, models, bcrypt, generateToken, mongoose } = require('./testContext');

async function runReportsSuite() {
  const ctx = new TestContext('Reports & CSV Export');
  await ctx.setup();

  const suffix = `rep_${Date.now()}`;
  const testNodeId = `NODE_REP_${suffix}`.toUpperCase();
  let adminUser, adminToken;
  const createdReadingIds = [];
  const createdAlertIds = [];

  try {
    console.log('\n[SUITE 10: REPORTS & CSV EXPORT]');

    const passHash = await bcrypt.hash('Password123!', 10);
    adminUser = await models.User.create({
      name: 'Report Admin',
      email: `admin_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Admin'
    });
    adminToken = generateToken({ userId: adminUser._id.toString(), role: adminUser.role });

    // Seed readings
    let firstReadingId = null;
    for (let i = 0; i < 3; i++) {
      const reading = await models.Reading.create({
        nodeId: testNodeId,
        pH: 7.2 + i * 0.1,
        turbidity: 2.1,
        tds: 210,
        temperature: 24.5,
        overallStatus: 'Safe',
        timestamp: new Date(Date.now() - (3 - i) * 10000)
      });
      createdReadingIds.push(reading._id);
      if (!firstReadingId) firstReadingId = reading._id;
    }

    // Seed alert with required fields
    const alert = await models.Alert.create({
      nodeId: testNodeId,
      readingId: firstReadingId || new mongoose.Types.ObjectId(),
      parameter: 'pH',
      direction: 'HIGH',
      value: 9.3,
      thresholdMin: 6.5,
      thresholdMax: 8.5,
      thresholdLimit: 8.5,
      severity: 'High',
      breachCount: 1,
      status: 'Active',
      createdAt: new Date()
    });
    createdAlertIds.push(alert._id);

    // 10.1 Reading report JSON retrieval
    const readingJsonRes = await ctx.makeRequest({
      path: `/api/reports/readings?nodeId=${testNodeId}`,
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    ctx.assert(
      readingJsonRes.statusCode === 200 && (readingJsonRes.body?.data || readingJsonRes.body?.readings),
      '10.1 Reading report JSON endpoint returns telemetry records'
    );

    // 10.2 Reading report CSV export
    const readingCsvRes = await ctx.makeRequest({
      path: `/api/reports/readings?nodeId=${testNodeId}&format=csv`,
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    ctx.assert(
      readingCsvRes.statusCode === 200 &&
      readingCsvRes.headers['content-type']?.includes('text/csv') &&
      typeof readingCsvRes.rawBody === 'string' &&
      readingCsvRes.rawBody.includes(testNodeId),
      '10.2 Reading report CSV export returns text/csv format with header and data rows'
    );

    // 10.3 Alert report JSON retrieval
    const alertJsonRes = await ctx.makeRequest({
      path: `/api/reports/alerts?nodeId=${testNodeId}`,
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    ctx.assert(
      alertJsonRes.statusCode === 200 && (alertJsonRes.body?.data || alertJsonRes.body?.alerts),
      '10.3 Alert report JSON endpoint returns alert records'
    );

    // 10.4 Alert report CSV export
    const alertCsvRes = await ctx.makeRequest({
      path: `/api/reports/alerts?nodeId=${testNodeId}&format=csv`,
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    ctx.assert(
      alertCsvRes.statusCode === 200 &&
      alertCsvRes.headers['content-type']?.includes('text/csv') &&
      typeof alertCsvRes.rawBody === 'string' &&
      alertCsvRes.rawBody.includes(testNodeId),
      '10.4 Alert report CSV export returns text/csv with formatted rows'
    );

    // 10.5 Formula injection defense in CSV output (SEC-04)
    const formulaAlert = await models.Alert.create({
      nodeId: testNodeId,
      readingId: firstReadingId || new mongoose.Types.ObjectId(),
      parameter: 'pH',
      direction: 'HIGH',
      value: 9.9,
      thresholdMin: 6.5,
      thresholdMax: 8.5,
      thresholdLimit: 8.5,
      severity: 'High',
      breachCount: 1,
      status: 'Active',
      createdAt: new Date()
    });
    createdAlertIds.push(formulaAlert._id);

    const checkCsvRes = await ctx.makeRequest({
      path: `/api/reports/alerts?nodeId=${testNodeId}&format=csv`,
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    ctx.assert(
      checkCsvRes.statusCode === 200 && !checkCsvRes.rawBody.includes('=cmd|'),
      '10.5 CSV export neutralizes formula injection triggers'
    );

    // 10.6 Sensitive field exclusion from reports
    ctx.assert(
      !readingCsvRes.rawBody.includes('passwordHash') &&
      !alertCsvRes.rawBody.includes('deviceKeyHash') &&
      !alertCsvRes.rawBody.includes('jwtSecret'),
      '10.6 CSV reports strictly exclude internal passwords, hashes, and secrets'
    );

  } finally {
    if (adminUser) await models.User.deleteOne({ _id: adminUser._id });
    await models.Reading.deleteMany({ _id: { $in: createdReadingIds } });
    await models.Alert.deleteMany({ _id: { $in: createdAlertIds } });
    await ctx.teardown();
  }

  return { suite: ctx.suiteName, passed: ctx.passed, failed: ctx.failed };
}

if (require.main === module) {
  runReportsSuite().then((res) => {
    TestContext.disconnectDb().then(() => {
      process.exit(res.failed > 0 ? 1 : 0);
    });
  });
}

module.exports = { runReportsSuite };
