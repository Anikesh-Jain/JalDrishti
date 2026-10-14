/**
 * JalDrishti: Suite 6 - Notification & SMS Tests
 */

const { TestContext, models, bcrypt, generateToken, mongoose } = require('./testContext');
const notificationService = require('../backend/src/services/notificationService');
const notificationConfigService = require('../backend/src/services/notificationConfigService');

async function runNotificationsSuite() {
  const ctx = new TestContext('Notification & SMS');
  await ctx.setup();

  const suffix = `notif_${Date.now()}`;
  const testNodeId = `NODE_NT_${suffix}`.toUpperCase();
  let adminUser, adminToken, citizenUser, citizenToken;
  let originalConfig;
  const createdAlertIds = [];
  const createdNotifIds = [];

  try {
    console.log('\n[SUITE 6: NOTIFICATION & SMS]');

    originalConfig = notificationConfigService.getConfig();

    const passHash = await bcrypt.hash('Password123!', 10);
    adminUser = await models.User.create({
      name: 'Notif Admin',
      email: `admin_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Admin'
    });
    adminToken = generateToken({ userId: adminUser._id.toString(), role: adminUser.role });

    citizenUser = await models.User.create({
      name: 'Notif Citizen',
      email: `citizen_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Citizen'
    });
    citizenToken = generateToken({ userId: citizenUser._id.toString(), role: citizenUser.role });

    // Ensure SMS is enabled with a test recipient
    notificationConfigService.updateConfig({
      enabled: true,
      recipient: '+919876543210'
    });

    // 6.1 New Active alert -> creates Notification document in MongoDB
    const testAlert = await models.Alert.create({
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
    createdAlertIds.push(testAlert._id);

    const notifResult = await notificationService.handleNewAlert(testAlert);
    ctx.assert(
      notifResult && notifResult.deliveryStatus === 'Sent' && notifResult.alertId.toString() === testAlert._id.toString(),
      '6.1 New active alert creates and dispatches Notification record'
    );
    if (notifResult) createdNotifIds.push(notifResult._id);

    // 6.2 Format plain language message verification
    const formatted = notificationService.formatAlertMessage(testAlert);
    ctx.assert(
      formatted.includes('JalDrishti Alert') && formatted.includes(testNodeId) && formatted.includes('HIGH pH'),
      '6.2 Plain-language SMS message properly formatted with node and breach details'
    );

    // 6.3 Repeated breach -> deduplicated, no duplicate notification created
    const dupNotifResult = await notificationService.handleNewAlert(testAlert);
    const totalNotifsForAlert = await models.Notification.countDocuments({ alertId: testAlert._id });
    ctx.assert(
      totalNotifsForAlert === 1,
      '6.3 Repeated breach deduplicated: zero duplicate notification documents created'
    );

    // 6.4 Subsequent re-breach after resolution -> creates new distinct notification
    testAlert.status = 'Resolved';
    testAlert.resolvedAt = new Date();
    await testAlert.save();

    const rebreachAlert = await models.Alert.create({
      nodeId: testNodeId,
      readingId: new mongoose.Types.ObjectId(),
      parameter: 'pH',
      direction: 'HIGH',
      value: 9.5,
      thresholdMin: 6.5,
      thresholdMax: 8.5,
      thresholdLimit: 8.5,
      severity: 'High',
      breachCount: 1,
      status: 'Active'
    });
    createdAlertIds.push(rebreachAlert._id);

    const rebreachNotif = await notificationService.handleNewAlert(rebreachAlert);
    ctx.assert(
      rebreachNotif && rebreachNotif.alertId.toString() === rebreachAlert._id.toString(),
      '6.4 Re-breach after resolution creates new distinct Notification record'
    );
    if (rebreachNotif) createdNotifIds.push(rebreachNotif._id);

    // 6.5 SMS Disabled Toggle
    notificationConfigService.updateConfig({ enabled: false });
    const disabledAlert = await models.Alert.create({
      nodeId: testNodeId,
      readingId: new mongoose.Types.ObjectId(),
      parameter: 'turbidity',
      direction: 'HIGH',
      value: 9.0,
      thresholdMin: 0.0,
      thresholdMax: 5.0,
      thresholdLimit: 5.0,
      severity: 'High',
      breachCount: 1,
      status: 'Active'
    });
    createdAlertIds.push(disabledAlert._id);

    const disabledNotif = await notificationService.handleNewAlert(disabledAlert);
    ctx.assert(
      disabledNotif && disabledNotif.failureReason?.includes('disabled'),
      '6.5 SMS disabled toggle respected: gateway not invoked when enabled: false'
    );
    if (disabledNotif) createdNotifIds.push(disabledNotif._id);

    // 6.6 Notification configuration authorization
    const unauthConfigRes = await ctx.makeRequest({
      path: '/api/notifications/config',
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    ctx.assert(unauthConfigRes.statusCode === 403, '6.6 Citizen denied notification config access with HTTP 403');

    // 6.7 Admin can retrieve config with masked phone number
    const adminConfigRes = await ctx.makeRequest({
      path: '/api/notifications/config',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const cfg = adminConfigRes.body?.config;
    ctx.assert(
      adminConfigRes.statusCode === 200 &&
      (cfg?.recipientMasked?.includes('*') || cfg?.recipient?.includes('*')) &&
      cfg?.twilioAuthToken === undefined,
      '6.7 Admin config retrieval succeeds with masked recipient and no exposed secrets'
    );

  } finally {
    if (originalConfig) {
      notificationConfigService.updateConfig(originalConfig);
    }
    if (adminUser) await models.User.deleteOne({ _id: adminUser._id });
    if (citizenUser) await models.User.deleteOne({ _id: citizenUser._id });
    await models.Alert.deleteMany({ _id: { $in: createdAlertIds } });
    await models.Notification.deleteMany({ _id: { $in: createdNotifIds } });
    await ctx.teardown();
  }

  return { suite: ctx.suiteName, passed: ctx.passed, failed: ctx.failed };
}

if (require.main === module) {
  runNotificationsSuite().then((res) => {
    TestContext.disconnectDb().then(() => {
      process.exit(res.failed > 0 ? 1 : 0);
    });
  });
}

module.exports = { runNotificationsSuite };
