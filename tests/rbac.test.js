/**
 * JalDrishti: Suite 2 - Authorization & RBAC Tests
 */

const { TestContext, models, bcrypt, generateToken } = require('./testContext');

async function runRbacSuite() {
  const ctx = new TestContext('Authorization & RBAC');
  await ctx.setup();

  const suffix = `rbac_${Date.now()}`;
  const plainPassword = 'Password123!';
  let citizenA, citizenB, adminUser;
  let tokenA, tokenB, adminToken;
  let imageCheckA;

  try {
    console.log('\n[SUITE 2: AUTHORIZATION & RBAC]');

    const passHash = await bcrypt.hash(plainPassword, 10);

    citizenA = await models.User.create({
      name: 'RBAC Citizen A',
      email: `citizenA_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Citizen'
    });
    tokenA = generateToken({ userId: citizenA._id.toString(), role: citizenA.role });

    citizenB = await models.User.create({
      name: 'RBAC Citizen B',
      email: `citizenB_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Citizen'
    });
    tokenB = generateToken({ userId: citizenB._id.toString(), role: citizenB.role });

    adminUser = await models.User.create({
      name: 'RBAC Admin',
      email: `admin_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Admin'
    });
    adminToken = generateToken({ userId: adminUser._id.toString(), role: adminUser.role });

    imageCheckA = await models.ImageCheck.create({
      userId: citizenA._id,
      originalFilename: 'test_a.jpg',
      result: 'Safe',
      confidence: 90.0,
      isWaterImage: true,
      advisory: 'Advisory A',
      provider: 'mock'
    });

    // 2.1 Unauthenticated requests to protected endpoints return HTTP 401
    const unauthThresholds = await ctx.makeRequest({ path: '/api/thresholds' });
    ctx.assert(unauthThresholds.statusCode === 401, '2.1 Unauthenticated access to /api/thresholds rejected with HTTP 401');

    const unauthNotifs = await ctx.makeRequest({ path: '/api/notifications/config' });
    ctx.assert(unauthNotifs.statusCode === 401, '2.2 Unauthenticated access to /api/notifications/config rejected with HTTP 401');

    const unauthNodes = await ctx.makeRequest({ path: '/api/sensor/nodes' });
    ctx.assert(unauthNodes.statusCode === 401, '2.3 Unauthenticated access to /api/sensor/nodes rejected with HTTP 401');

    const unauthImages = await ctx.makeRequest({ path: '/api/image-checks' });
    ctx.assert(unauthImages.statusCode === 401, '2.4 Unauthenticated access to /api/image-checks rejected with HTTP 401');

    // 2.5 Citizen modifying threshold returns HTTP 403
    const citizenModThreshold = await ctx.makeRequest({
      path: '/api/thresholds/pH',
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenA}` }
    }, { minimum: 6.5, maximum: 8.5 });
    ctx.assert(citizenModThreshold.statusCode === 403, '2.5 Citizen role denied threshold update with HTTP 403');

    // 2.6 Citizen viewing notification config returns HTTP 403
    const citizenGetNotifConfig = await ctx.makeRequest({
      path: '/api/notifications/config',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    ctx.assert(citizenGetNotifConfig.statusCode === 403, '2.6 Citizen role denied notification configuration view with HTTP 403');

    // 2.7 Citizen modifying notification config returns HTTP 403
    const citizenPutNotifConfig = await ctx.makeRequest({
      path: '/api/notifications/config',
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenA}` }
    }, { notificationsEnabled: true });
    ctx.assert(citizenPutNotifConfig.statusCode === 403, '2.7 Citizen role denied notification configuration update with HTTP 403');

    // 2.8 Admin accessing notification config succeeds with HTTP 200
    const adminGetNotifConfig = await ctx.makeRequest({
      path: '/api/notifications/config',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    ctx.assert(adminGetNotifConfig.statusCode === 200, '2.8 Admin role granted access to notification configuration with HTTP 200');

    // 2.9 Admin viewing thresholds succeeds with HTTP 200
    const adminGetThresholds = await ctx.makeRequest({
      path: '/api/thresholds',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    ctx.assert(adminGetThresholds.statusCode === 200, '2.9 Admin role granted access to thresholds with HTTP 200');

    // 2.10 Citizen accessing allowed citizen endpoints succeeds
    const citizenLatestReading = await ctx.makeRequest({
      path: '/api/sensor/readings/latest',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    ctx.assert(
      citizenLatestReading.statusCode === 200 || citizenLatestReading.statusCode === 404,
      '2.10 Citizen granted access to /api/sensor/readings/latest (HTTP 200/404)'
    );

    const citizenAlerts = await ctx.makeRequest({
      path: '/api/alerts',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    ctx.assert(citizenAlerts.statusCode === 200, '2.11 Citizen granted access to /api/alerts (HTTP 200)');

    // 2.12 IDOR check: Citizen B cannot access Citizen A's image check
    const citizenBHistory = await ctx.makeRequest({
      path: '/api/image-checks',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const leakFound = (citizenBHistory.body?.data?.records || []).some(
      (r) => r.id === imageCheckA._id.toString()
    );
    ctx.assert(
      citizenBHistory.statusCode === 200 && !leakFound,
      '2.12 IDOR Protection: Citizen B cannot view Citizen A private ImageCheck records'
    );

    // 2.13 Admin can view aggregated image check records
    const adminImageChecks = await ctx.makeRequest({
      path: '/api/image-checks?all=true',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    ctx.assert(adminImageChecks.statusCode === 200, '2.13 Admin authorized to access aggregated ImageCheck records (all=true)');

  } finally {
    await models.User.deleteMany({ email: { $regex: suffix } });
    if (imageCheckA) {
      await models.ImageCheck.deleteOne({ _id: imageCheckA._id });
    }
    await ctx.teardown();
  }

  return { suite: ctx.suiteName, passed: ctx.passed, failed: ctx.failed };
}

if (require.main === module) {
  runRbacSuite().then((res) => {
    TestContext.disconnectDb().then(() => {
      process.exit(res.failed > 0 ? 1 : 0);
    });
  });
}

module.exports = { runRbacSuite };
