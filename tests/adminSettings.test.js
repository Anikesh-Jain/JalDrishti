/**
 * JalDrishti: Suite 11 - Admin Settings Tests
 */

const { TestContext, models, bcrypt, generateToken } = require('./testContext');

async function runAdminSettingsSuite() {
  const ctx = new TestContext('Admin Settings');
  await ctx.setup();

  const suffix = `admset_${Date.now()}`;
  let adminUser, adminToken, citizenUser, citizenToken;
  let originalPh;

  try {
    console.log('\n[SUITE 11: ADMIN SETTINGS]');

    const passHash = await bcrypt.hash('Password123!', 10);
    adminUser = await models.User.create({
      name: 'Settings Admin',
      email: `admin_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Admin'
    });
    adminToken = generateToken({ userId: adminUser._id.toString(), role: adminUser.role });

    citizenUser = await models.User.create({
      name: 'Settings Citizen',
      email: `citizen_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Citizen'
    });
    citizenToken = generateToken({ userId: citizenUser._id.toString(), role: citizenUser.role });

    originalPh = await models.Threshold.findOne({ parameter: 'pH' });

    // 11.1 GET all thresholds (Admin or Citizen)
    const allThreshRes = await ctx.makeRequest({
      path: '/api/thresholds',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const threshList = allThreshRes.body?.thresholds || allThreshRes.body?.data || allThreshRes.body;
    ctx.assert(
      allThreshRes.statusCode === 200 && Array.isArray(threshList),
      '11.1 GET /api/thresholds returns array of parameter threshold limits'
    );

    // 11.2 GET specific threshold
    const singleThreshRes = await ctx.makeRequest({
      path: '/api/thresholds/pH',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const singleThresh = singleThreshRes.body?.threshold || singleThreshRes.body?.data || singleThreshRes.body;
    ctx.assert(
      singleThreshRes.statusCode === 200 && singleThresh?.parameter === 'pH',
      '11.2 GET /api/thresholds/:parameter returns configuration for requested parameter'
    );

    // 11.3 Minimum > Maximum validation rejection
    const badMinMaxRes = await ctx.makeRequest({
      path: '/api/thresholds/pH',
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` }
    }, { minimum: 9.0, maximum: 6.0 });
    ctx.assert(
      badMinMaxRes.statusCode === 400,
      '11.3 Threshold update with minimum > maximum rejected with HTTP 400'
    );

    // 11.4 Non-numeric threshold limit rejection
    const badTypeRes = await ctx.makeRequest({
      path: '/api/thresholds/pH',
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` }
    }, { minimum: 'six', maximum: 8.5 });
    ctx.assert(
      badTypeRes.statusCode === 400,
      '11.4 Threshold update with non-numeric limit rejected with HTTP 400'
    );

    // 11.5 Valid threshold update & persistence
    const validUpdateRes = await ctx.makeRequest({
      path: '/api/thresholds/pH',
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` }
    }, { minimum: 6.6, maximum: 8.4, enabled: true });
    ctx.assert(
      validUpdateRes.statusCode === 200,
      '11.5 Valid threshold update accepted with HTTP 200'
    );

    const updatedDb = await models.Threshold.findOne({ parameter: 'pH' });
    ctx.assert(
      updatedDb && updatedDb.minimum === 6.6 && updatedDb.maximum === 8.4,
      '11.6 Updated threshold values strictly persisted in MongoDB'
    );

    // 11.7 Unauthorized notification config update
    const unauthNotifPut = await ctx.makeRequest({
      path: '/api/notifications/config',
      method: 'PUT',
      headers: { Authorization: `Bearer ${citizenToken}` }
    }, { enabled: false });
    ctx.assert(unauthNotifPut.statusCode === 403, '11.7 Citizen denied notification configuration modification with HTTP 403');

    // 11.8 Authorized notification config update
    const authNotifPut = await ctx.makeRequest({
      path: '/api/notifications/config',
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` }
    }, { enabled: true, recipient: '+919876543210' });
    ctx.assert(authNotifPut.statusCode === 200, '11.8 Admin authorized to update notification configuration (HTTP 200)');

    // 11.9 Notification config response masks phone numbers
    ctx.assert(
      (authNotifPut.body?.config?.recipientMasked?.includes('**') || authNotifPut.body?.config?.recipient?.includes('**')) &&
      authNotifPut.body?.config?.twilioAuthToken === undefined,
      '11.9 Recipient phone number masked in response and API credentials omitted'
    );

  } finally {
    if (originalPh) {
      await models.Threshold.updateOne(
        { parameter: 'pH' },
        { $set: { minimum: originalPh.minimum, maximum: originalPh.maximum, enabled: originalPh.enabled } }
      );
    }
    if (adminUser) await models.User.deleteOne({ _id: adminUser._id });
    if (citizenUser) await models.User.deleteOne({ _id: citizenUser._id });
    await ctx.teardown();
  }

  return { suite: ctx.suiteName, passed: ctx.passed, failed: ctx.failed };
}

if (require.main === module) {
  runAdminSettingsSuite().then((res) => {
    TestContext.disconnectDb().then(() => {
      process.exit(res.failed > 0 ? 1 : 0);
    });
  });
}

module.exports = { runAdminSettingsSuite };
