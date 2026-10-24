/**
 * JalDrishti: Suite 8 - Alert History & Query Tests
 */

const { TestContext, models, bcrypt, generateToken, mongoose } = require('./testContext');

async function runAlertHistorySuite() {
  const ctx = new TestContext('Alert History & Query');
  await ctx.setup();

  const suffix = `althist_${Date.now()}`;
  const testNodeId = `NODE_AH_${suffix}`.toUpperCase();
  let citizenUser, citizenToken;
  let activeAlert, resolvedAlert;

  try {
    console.log('\n[SUITE 8: ALERT HISTORY & QUERY]');

    const passHash = await bcrypt.hash('Password123!', 10);
    citizenUser = await models.User.create({
      name: 'Alert Citizen',
      email: `citizen_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Citizen'
    });
    citizenToken = generateToken({ userId: citizenUser._id.toString(), role: citizenUser.role });

    activeAlert = await models.Alert.create({
      nodeId: testNodeId,
      readingId: new mongoose.Types.ObjectId(),
      parameter: 'pH',
      direction: 'HIGH',
      value: 9.3,
      thresholdMin: 6.5,
      thresholdMax: 8.5,
      thresholdLimit: 8.5,
      severity: 'High',
      breachCount: 1,
      status: 'Active'
    });

    resolvedAlert = await models.Alert.create({
      nodeId: testNodeId,
      readingId: new mongoose.Types.ObjectId(),
      parameter: 'turbidity',
      direction: 'HIGH',
      value: 8.2,
      thresholdMin: 0.0,
      thresholdMax: 5.0,
      thresholdLimit: 5.0,
      severity: 'High',
      breachCount: 2,
      status: 'Resolved',
      resolvedAt: new Date()
    });

    // 8.1 GET /api/alerts/active returns current active breaches
    const activeRes = await ctx.makeRequest({
      path: `/api/alerts/active?nodeId=${testNodeId}`,
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    const activeAlerts = Array.isArray(activeRes.body?.data) ? activeRes.body.data : (activeRes.body?.alerts || []);
    const foundActive = activeAlerts.some((a) => (a.id || a._id) === activeAlert._id.toString());
    ctx.assert(
      activeRes.statusCode === 200 && foundActive,
      '8.1 GET /api/alerts/active returns currently active alert'
    );

    // 8.2 GET /api/alerts/history returns resolved alerts
    const histRes = await ctx.makeRequest({
      path: `/api/alerts/history?nodeId=${testNodeId}`,
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    const histAlerts = Array.isArray(histRes.body?.data) ? histRes.body.data : (histRes.body?.alerts || []);
    const foundResolved = histAlerts.some((a) => (a.id || a._id) === resolvedAlert._id.toString());
    ctx.assert(
      histRes.statusCode === 200 && foundResolved,
      '8.2 GET /api/alerts/history returns historical resolved alert'
    );

    // 8.3 Parameter filtering on /api/alerts
    const paramRes = await ctx.makeRequest({
      path: `/api/alerts?parameter=turbidity&nodeId=${testNodeId}`,
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    const paramAlerts = Array.isArray(paramRes.body?.data) ? paramRes.body.data : [];
    const onlyTurb = paramAlerts.every((a) => a.parameter === 'turbidity');
    ctx.assert(
      paramRes.statusCode === 200 && onlyTurb && paramAlerts.length >= 1,
      '8.3 Filtering by parameter (?parameter=turbidity) returns only matching alerts'
    );

    // 8.4 Status filtering on /api/alerts
    const statusRes = await ctx.makeRequest({
      path: `/api/alerts?status=Active&nodeId=${testNodeId}`,
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    const statusAlerts = Array.isArray(statusRes.body?.data) ? statusRes.body.data : [];
    const onlyActive = statusAlerts.every((a) => a.status === 'Active');
    ctx.assert(
      statusRes.statusCode === 200 && onlyActive && statusAlerts.length >= 1,
      '8.4 Filtering by status (?status=Active) returns only active alerts'
    );

    // 8.5 Detail retrieval GET /api/alerts/:id
    const detailRes = await ctx.makeRequest({
      path: `/api/alerts/${activeAlert._id}`,
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    ctx.assert(
      detailRes.statusCode === 200 && (detailRes.body?.data?.nodeId === testNodeId || detailRes.body?.nodeId === testNodeId),
      '8.5 GET /api/alerts/:id retrieves single alert details'
    );

    // 8.6 Detail retrieval with invalid ObjectId returns HTTP 400
    const badIdRes = await ctx.makeRequest({
      path: '/api/alerts/invalid-object-id',
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    ctx.assert(badIdRes.statusCode === 400, '8.6 Invalid ObjectId in alert detail route handled safely with HTTP 400');

    // 8.7 Sensitive fields omitted from alert representation
    const sampleAlert = activeAlerts[0] || {};
    ctx.assert(
      sampleAlert.password === undefined && sampleAlert.deviceKeyHash === undefined,
      '8.7 Alert query payload strictly excludes sensitive system fields'
    );

    // 8.8 Zero alerts baseline: query for non-existent or clean station returns empty array
    const emptyRes = await ctx.makeRequest({
      path: `/api/alerts?nodeId=NODE_CLEAN_${suffix}`,
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    ctx.assert(
      emptyRes.statusCode === 200 && Array.isArray(emptyRes.body?.data) && emptyRes.body.data.length === 0,
      '8.8 Zero alerts baseline: returns empty array with count 0 when no alerts exist'
    );

    // 8.9 Citizen attempting acknowledgment is rejected with HTTP 403 Forbidden
    const citizenAckRes = await ctx.makeRequest({
      method: 'PATCH',
      path: `/api/alerts/${activeAlert._id}/ack`,
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    ctx.assert(
      citizenAckRes.statusCode === 403,
      '8.9 Citizen attempting alert acknowledgment rejected with HTTP 403'
    );

    // 8.10 Admin acknowledges active alert -> transitions to Acknowledged
    const adminUser = await models.User.create({
      name: 'Alert Admin',
      email: `admin_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Admin'
    });
    const adminToken = generateToken({ userId: adminUser._id.toString(), role: adminUser.role });

    const adminAckRes = await ctx.makeRequest({
      method: 'PATCH',
      path: `/api/alerts/${activeAlert._id}/ack`,
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const ackedAlert = await models.Alert.findById(activeAlert._id);
    ctx.assert(
      adminAckRes.statusCode === 200 && ackedAlert.status === 'Acknowledged' && ackedAlert.acknowledgedBy.toString() === adminUser._id.toString(),
      '8.10 Admin alert acknowledgment successfully transitions status to Acknowledged'
    );

    // 8.11 Unauthenticated access to /api/alerts rejected with HTTP 401
    const unauthRes = await ctx.makeRequest({
      path: '/api/alerts'
    });
    ctx.assert(
      unauthRes.statusCode === 401,
      '8.11 Unauthenticated access to alert endpoints blocked with HTTP 401'
    );

    await models.User.deleteOne({ _id: adminUser._id });

  } finally {
    if (citizenUser) await models.User.deleteOne({ _id: citizenUser._id });
    if (activeAlert) await models.Alert.deleteOne({ _id: activeAlert._id });
    if (resolvedAlert) await models.Alert.deleteOne({ _id: resolvedAlert._id });
    await ctx.teardown();
  }

  return { suite: ctx.suiteName, passed: ctx.passed, failed: ctx.failed };
}

if (require.main === module) {
  runAlertHistorySuite().then((res) => {
    TestContext.disconnectDb().then(() => {
      process.exit(res.failed > 0 ? 1 : 0);
    });
  });
}

module.exports = { runAlertHistorySuite };
