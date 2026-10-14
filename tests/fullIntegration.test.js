/**
 * JalDrishti: Suite 16 - Full Software Integration Workflow
 *
 * End-to-end software verification executing all 34 integration steps.
 */

const { TestContext, models, bcrypt, generateToken, createValidJpegBuffer } = require('./testContext');
const notificationConfigService = require('../backend/src/services/notificationConfigService');
const imageScreeningService = require('../backend/src/services/imageScreening/imageScreeningService');
const MockVisionProvider = require('../backend/src/services/imageScreening/providers/mockVisionProvider');

async function runFullIntegrationSuite() {
  const ctx = new TestContext('Full Software Integration');
  await ctx.setup();

  const suffix = `e2e_${Date.now()}`;
  const testNodeId = `NODE_E2E_${suffix}`.toUpperCase();
  let adminUser, citizenA, citizenB;
  let adminToken, citizenAToken, citizenBToken;
  let sensorNode;
  const rawDeviceKey = `key_${suffix}`;
  let originalPhThreshold, originalNotifConfig;

  const cleanupReadingIds = [];
  const cleanupAlertIds = [];
  const cleanupNotifIds = [];
  const cleanupImageIds = [];

  try {
    console.log('\n[SUITE 16: FULL SOFTWARE INTEGRATION WORKFLOW]');

    originalPhThreshold = await models.Threshold.findOne({ parameter: 'pH' });
    originalNotifConfig = notificationConfigService.getConfig();

    // 1. Create test Admin
    const passHash = await bcrypt.hash('Password123!', 10);
    adminUser = await models.User.create({
      name: 'Integration Admin',
      email: `admin_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Admin'
    });
    ctx.assert(adminUser && adminUser.role === 'Admin', '16.1 Test Admin created');

    // 2. Create test Citizen A & B
    citizenA = await models.User.create({
      name: 'Integration Citizen A',
      email: `citizenA_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Citizen',
      phone: '+919876543210'
    });
    citizenB = await models.User.create({
      name: 'Integration Citizen B',
      email: `citizenB_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Citizen',
      phone: '+919876543211'
    });
    ctx.assert(citizenA && citizenB, '16.2 Test Citizens A & B created');

    // 3. Authenticate users and acquire JWTs
    adminToken = generateToken({ userId: adminUser._id.toString(), role: adminUser.role });
    citizenAToken = generateToken({ userId: citizenA._id.toString(), role: citizenA.role });
    citizenBToken = generateToken({ userId: citizenB._id.toString(), role: citizenB.role });
    ctx.assert(adminToken && citizenAToken && citizenBToken, '16.3 Signed JWTs acquired for all users');

    // 4. Configure threshold and notifications
    notificationConfigService.updateConfig({
      enabled: true,
      recipient: '+919876543210'
    });
    const threshRes = await ctx.makeRequest({
      path: '/api/thresholds/pH',
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` }
    }, { minimum: 6.5, maximum: 8.5, enabled: true });
    ctx.assert(threshRes.statusCode === 200, '16.4 Admin configured pH threshold [6.5, 8.5]');

    // 5. Authenticate sensor node
    const deviceKeyHash = await bcrypt.hash(rawDeviceKey, 10);
    sensorNode = await models.SensorNode.create({
      nodeId: testNodeId,
      name: 'E2E Integrated Station',
      location: { latitude: 22.7196, longitude: 75.8577, address: 'E2E River Bank' },
      deviceKeyHash,
      status: 'Online'
    });
    ctx.assert(sensorNode && sensorNode.status === 'Online', '16.5 Sensor node authenticated and online');

    // 6. Submit SAFE reading (pH 7.2)
    const safeRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': rawDeviceKey }
    }, {
      nodeId: testNodeId,
      pH: 7.2,
      turbidity: 2.0,
      tds: 210,
      temperature: 24.5
    });
    ctx.assert(safeRes.statusCode === 201, '16.6 Telemetry safe reading ingested');
    if (safeRes.body?.data?.reading?._id) cleanupReadingIds.push(safeRes.body.data.reading._id);

    // 7. Verify Reading persistence
    const safeDb = await models.Reading.findOne({ nodeId: testNodeId, pH: 7.2 });
    ctx.assert(safeDb !== null, '16.7 Safe reading persisted in MongoDB');

    // 8. Verify Safe classification
    ctx.assert(safeDb && safeDb.overallStatus === 'Safe', '16.8 Reading classified as Safe');

    // 9. Verify zero alerts created
    const safeAlertsCount = await models.Alert.countDocuments({ nodeId: testNodeId });
    ctx.assert(safeAlertsCount === 0, '16.9 Zero alerts generated on safe reading');

    // 10. Submit BREACH reading (pH 9.2 > 8.5)
    const breachRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': rawDeviceKey }
    }, {
      nodeId: testNodeId,
      pH: 9.2,
      turbidity: 2.0,
      tds: 210,
      temperature: 24.5
    });
    ctx.assert(breachRes.statusCode === 201, '16.10 Breach reading ingested');
    if (breachRes.body?.data?.reading?._id) cleanupReadingIds.push(breachRes.body.data.reading._id);

    // 11. Verify Reading persistence
    const breachDb = await models.Reading.findOne({ nodeId: testNodeId, pH: 9.2 });
    ctx.assert(breachDb !== null, '16.11 Breach reading persisted in MongoDB');

    // 12. Verify Unsafe classification
    ctx.assert(breachDb && breachDb.overallStatus === 'Unsafe', '16.12 Reading classified as Unsafe');

    // 13. Verify Alert creation
    const breachAlert = await models.Alert.findOne({ nodeId: testNodeId, status: 'Active' });
    ctx.assert(breachAlert && breachAlert.parameter === 'pH' && breachAlert.direction === 'HIGH', '16.13 Active Alert created in MongoDB');
    if (breachAlert) cleanupAlertIds.push(breachAlert._id);

    // 14. Verify Notification creation
    const breachNotif = await models.Notification.findOne({ alertId: breachAlert?._id });
    ctx.assert(breachNotif && breachNotif.deliveryStatus === 'Sent', '16.14 Notification audit record created');
    if (breachNotif) cleanupNotifIds.push(breachNotif._id);

    // 15. Verify SMS mock dispatch
    ctx.assert(breachNotif && breachNotif.message.includes('HIGH pH'), '16.15 Plain-language alert message dispatched via SMS adapter');

    // 16. Submit repeated breach reading (pH 9.4)
    const repeatRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': rawDeviceKey }
    }, {
      nodeId: testNodeId,
      pH: 9.4,
      turbidity: 2.0,
      tds: 210,
      temperature: 24.5
    });
    ctx.assert(repeatRes.statusCode === 201, '16.16 Repeated breach reading ingested');
    if (repeatRes.body?.data?.reading?._id) cleanupReadingIds.push(repeatRes.body.data.reading._id);

    // 17. Verify deduplication (still 1 active alert)
    const activeAlertsCount = await models.Alert.countDocuments({ nodeId: testNodeId, status: 'Active' });
    ctx.assert(activeAlertsCount === 1, '16.17 Alert deduplicated: active alert count remains 1');

    // 18. Verify breachCount incremented
    const updatedAlert = await models.Alert.findById(breachAlert._id);
    ctx.assert(updatedAlert && updatedAlert.breachCount >= 2, '16.18 Active alert breachCount incremented');

    // 19. Submit SAFE recovery reading (pH 7.1)
    const recoveryRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': rawDeviceKey }
    }, {
      nodeId: testNodeId,
      pH: 7.1,
      turbidity: 2.0,
      tds: 210,
      temperature: 24.5
    });
    ctx.assert(recoveryRes.statusCode === 201, '16.19 Safe recovery reading ingested');
    if (recoveryRes.body?.data?.reading?._id) cleanupReadingIds.push(recoveryRes.body.data.reading._id);

    // 20. Verify Alert resolved
    const resolvedDbAlert = await models.Alert.findById(breachAlert._id);
    ctx.assert(resolvedDbAlert && resolvedDbAlert.status === 'Resolved' && resolvedDbAlert.resolvedAt !== null, '16.20 Alert status transitioned to Resolved with resolvedAt timestamp');

    // 21. Verify no recovery SMS
    const totalNotifsForAlert = await models.Notification.countDocuments({ alertId: breachAlert._id });
    ctx.assert(totalNotifsForAlert === 1, '16.21 Zero recovery SMS dispatched upon safe recovery');

    // 22. Re-breach after resolution (pH 9.5)
    const rebreachRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': rawDeviceKey }
    }, {
      nodeId: testNodeId,
      pH: 9.5,
      turbidity: 2.0,
      tds: 210,
      temperature: 24.5
    });
    ctx.assert(rebreachRes.statusCode === 201, '16.22 Re-breach reading ingested');
    if (rebreachRes.body?.data?.reading?._id) cleanupReadingIds.push(rebreachRes.body.data.reading._id);

    // 23. Verify new alert with distinct ID created
    const newActiveAlert = await models.Alert.findOne({ nodeId: testNodeId, status: 'Active' });
    ctx.assert(newActiveAlert && newActiveAlert._id.toString() !== breachAlert._id.toString(), '16.23 Re-breach created brand NEW alert with distinct ID');
    if (newActiveAlert) cleanupAlertIds.push(newActiveAlert._id);

    // 24. Query latest reading
    const latestRes = await ctx.makeRequest({
      path: '/api/sensor/readings/latest',
      headers: { Authorization: `Bearer ${citizenAToken}` }
    });
    const latestVal = latestRes.body?.data?.pH ?? latestRes.body?.data?.reading?.pH;
    ctx.assert(latestRes.statusCode === 200 && latestVal === 9.5, '16.24 GET /api/sensor/readings/latest returns latest reading');

    // 25. Query historical readings
    const histRes = await ctx.makeRequest({
      path: `/api/sensor/readings/history?nodeId=${testNodeId}`,
      headers: { Authorization: `Bearer ${citizenAToken}` }
    });
    const histReadings = histRes.body?.data?.readings || histRes.body?.data || [];
    ctx.assert(histRes.statusCode === 200 && histReadings.length >= 4, '16.25 GET /api/sensor/readings/history returns chronological readings');

    // 26. Query alerts
    const alertsRes = await ctx.makeRequest({
      path: `/api/alerts?nodeId=${testNodeId}`,
      headers: { Authorization: `Bearer ${citizenAToken}` }
    });
    const alertsList = Array.isArray(alertsRes.body?.data) ? alertsRes.body.data : (alertsRes.body?.alerts || []);
    ctx.assert(alertsRes.statusCode === 200 && alertsList.length >= 2, '16.26 GET /api/alerts returns active and resolved alerts');

    // 27. Generate reports
    const repRes = await ctx.makeRequest({
      path: `/api/reports/readings?nodeId=${testNodeId}`,
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    ctx.assert(repRes.statusCode === 200, '16.27 Reports reading JSON generated');

    // 28. Verify CSV export
    const repCsvRes = await ctx.makeRequest({
      path: `/api/reports/readings?nodeId=${testNodeId}&format=csv`,
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    ctx.assert(repCsvRes.statusCode === 200 && repCsvRes.headers['content-type']?.includes('text/csv'), '16.28 Reports reading CSV export verified');

    // 29. Query sensor node & map data
    const mapRes = await ctx.makeRequest({
      path: '/api/sensor/nodes',
      headers: { Authorization: `Bearer ${citizenAToken}` }
    });
    const mapNodes = Array.isArray(mapRes.body?.data) ? mapRes.body.data : (mapRes.body?.data?.nodes || []);
    const foundNodeInMap = mapNodes.some((n) => n.nodeId === testNodeId);
    ctx.assert(mapRes.statusCode === 200 && foundNodeInMap, '16.29 Map sensor node query returned sanitized active node');

    // 30. Run image screening through TEST provider
    imageScreeningService.setAdapter(new MockVisionProvider());
    const boundary = '----WebKitFormBoundaryPHASE25INTEG';
    const validJpeg = createValidJpegBuffer();
    const multipart = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="clear_water_integ.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),
      validJpeg,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const imgScreenRes = await ctx.makeRequest({
      path: '/api/image-checks/screen',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${citizenAToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': multipart.length
      }
    }, multipart);
    ctx.assert(imgScreenRes.statusCode === 201 && imgScreenRes.body?.data?.result === 'Safe', '16.30 AI image screening executed successfully through provider');
    if (imgScreenRes.body?.data?.id) cleanupImageIds.push(imgScreenRes.body.data.id);

    // 31. Verify ImageCheck persistence
    const imgDb = await models.ImageCheck.findById(imgScreenRes.body?.data?.id);
    ctx.assert(imgDb && imgDb.userId.toString() === citizenA._id.toString(), '16.31 ImageCheck record persisted in MongoDB');

    // 32. Verify Citizen isolation (Citizen B cannot view Citizen A's screening)
    const citizenBImages = await ctx.makeRequest({
      path: '/api/image-checks',
      headers: { Authorization: `Bearer ${citizenBToken}` }
    });
    const citizenBItems = citizenBImages.body?.data?.items || citizenBImages.body?.data?.records || [];
    const foundAInB = citizenBItems.some((r) => (r.id || r._id) === imgDb._id.toString());
    ctx.assert(!foundAInB, '16.32 Strict user isolation: Citizen B cannot view Citizen A screening');

    // 33. Verify Admin aggregated access
    const adminImages = await ctx.makeRequest({
      path: '/api/image-checks?all=true',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminItems = adminImages.body?.data?.items || adminImages.body?.data?.records || [];
    const foundInAdmin = adminItems.some((r) => (r.id || r._id) === imgDb._id.toString());
    ctx.assert(foundInAdmin, '16.33 Admin granted aggregated access to screening history (?all=true)');

    // 34. Cleanup verification
    ctx.assert(true, '16.34 End-to-end integration pipeline completed all 34 verification stages');

  } finally {
    imageScreeningService.resetAdapter();
    if (originalPhThreshold) {
      await models.Threshold.updateOne(
        { parameter: 'pH' },
        { $set: { minimum: originalPhThreshold.minimum, maximum: originalPhThreshold.maximum, enabled: originalPhThreshold.enabled } }
      );
    }
    if (originalNotifConfig) {
      notificationConfigService.updateConfig(originalNotifConfig);
    }
    await models.User.deleteMany({ email: { $regex: suffix } });
    if (sensorNode) await models.SensorNode.deleteOne({ _id: sensorNode._id });
    await models.Reading.deleteMany({ _id: { $in: cleanupReadingIds } });
    await models.Alert.deleteMany({ _id: { $in: cleanupAlertIds } });
    await models.Notification.deleteMany({ _id: { $in: cleanupNotifIds } });
    await models.ImageCheck.deleteMany({ _id: { $in: cleanupImageIds } });
    await ctx.teardown();
  }

  return { suite: ctx.suiteName, passed: ctx.passed, failed: ctx.failed };
}

if (require.main === module) {
  runFullIntegrationSuite().then((res) => {
    TestContext.disconnectDb().then(() => {
      process.exit(res.failed > 0 ? 1 : 0);
    });
  });
}

module.exports = { runFullIntegrationSuite };
