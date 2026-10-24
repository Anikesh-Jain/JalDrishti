/**
 * JalDrishti: Suite 19 - Hardware & Device Onboarding Tests
 *
 * Verifies:
 * - Citizen onboarding: whether they own a device ('yes', 'no', 'not_sure')
 * - Default onboarding status ('pending') and backward compatibility
 * - Ready-made device claiming with physical claim code verification
 * - Rejection of unauthorized claiming and device ownership conflict (HTTP 409)
 * - Device unpairing from citizen account
 * - Wi-Fi provisioning status recording (SSID only, no password exposure)
 * - Realistic connection diagnostics matrix:
 *   1. 'not configured'
 *   2. 'awaiting Wi-Fi setup'
 *   3. 'offline'
 *   4. 'connected but not sending readings'
 *   5. 'receiving data'
 * - Blynk status reporting and inbound webhook ingestion
 */

const { TestContext, models, bcrypt, generateToken } = require('./testContext');
const { hashClaimCode } = require('../backend/src/utils/deviceKey');

async function runHardwareSuite() {
  const ctx = new TestContext('Hardware & Device Onboarding');
  await ctx.setup();

  const suffix = `hw_${Date.now()}`;
  const plainPassword = 'Password123!';
  let citizenUserA, citizenTokenA;
  let citizenUserB, citizenTokenB;
  let testNode;
  const testNodeId = `NODE_HW_${suffix}`.toUpperCase();
  const testClaimCode = 'CLAIM_SECRET_2026';

  try {
    console.log('\n[SUITE 19: HARDWARE & DEVICE ONBOARDING]');

    const passHash = await bcrypt.hash(plainPassword, 10);
    const claimCodeHash = hashClaimCode(testClaimCode);

    // 19.1 User registration defaults hardware onboarding status to 'pending'
    const regRes = await ctx.makeRequest({
      path: '/api/auth/register',
      method: 'POST',
      body: {
        name: 'Onboarding Citizen',
        email: `onboard_${suffix}@example.com`,
        password: plainPassword
      }
    });
    ctx.assert(
      regRes.statusCode === 201 && regRes.data?.user?.hardwareOnboarding?.status === 'pending',
      "19.1 User registration defaults hardware onboarding status to 'pending'"
    );

    // Create test citizen A
    citizenUserA = await models.User.create({
      name: 'Citizen A Hardware',
      email: `citizen_a_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Citizen',
      hardwareOnboarding: { status: 'pending', completedAt: null }
    });
    citizenTokenA = generateToken({ userId: citizenUserA._id.toString(), role: citizenUserA.role });

    // Create test citizen B
    citizenUserB = await models.User.create({
      name: 'Citizen B Hardware',
      email: `citizen_b_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Citizen',
      hardwareOnboarding: { status: 'pending', completedAt: null }
    });
    citizenTokenB = generateToken({ userId: citizenUserB._id.toString(), role: citizenUserB.role });

    // Create test ready-made sensor node with claim code hash
    testNode = await models.SensorNode.create({
      nodeId: testNodeId,
      name: 'Pipeline Unit Ward 12',
      location: { latitude: 22.7196, longitude: 75.8577, address: 'Ward 12 Main Pipe' },
      deviceKeyHash: 'dev_key_hash_test',
      claimCodeHash,
      status: 'Online',
      lastSeen: new Date(),
      wifiProvisioning: { status: 'unprovisioned' }
    });

    // 19.2 Citizen updates hardware onboarding preference to 'yes' via PUT /api/auth/onboarding
    const onboardYesRes = await ctx.makeRequest({
      path: '/api/auth/onboarding',
      method: 'PUT',
      headers: { Authorization: `Bearer ${citizenTokenA}` },
      body: { status: 'yes' }
    });
    ctx.assert(
      onboardYesRes.statusCode === 200 && onboardYesRes.data?.user?.hardwareOnboarding?.status === 'yes',
      "19.2 Citizen updates hardware onboarding preference to 'yes' via PUT /api/auth/onboarding"
    );

    // 19.3 Invalid onboarding choice rejected with HTTP 400
    const invalidOnboardRes = await ctx.makeRequest({
      path: '/api/auth/onboarding',
      method: 'PUT',
      headers: { Authorization: `Bearer ${citizenTokenA}` },
      body: { status: 'invalid_choice' }
    });
    ctx.assert(
      invalidOnboardRes.statusCode === 400,
      '19.3 Invalid onboarding choice rejected with HTTP 400'
    );

    // 19.4 Citizen without device: GET /api/hardware/my-device returns state 'not configured'
    const unconfigRes = await ctx.makeRequest({
      path: '/api/hardware/my-device',
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenTokenB}` }
    });
    ctx.assert(
      unconfigRes.statusCode === 200 &&
        unconfigRes.data?.device === null &&
        unconfigRes.data?.diagnostics?.state === 'not configured',
      "19.4 Citizen without device: GET /api/hardware/my-device returns state 'not configured'"
    );

    // 19.5 Device claiming without authentication rejected with HTTP 401
    const unauthClaimRes = await ctx.makeRequest({
      path: '/api/hardware/claim',
      method: 'POST',
      body: { nodeId: testNodeId, claimCode: testClaimCode }
    });
    ctx.assert(
      unauthClaimRes.statusCode === 401,
      '19.5 Device claiming without authentication rejected with HTTP 401'
    );

    // 19.6 Device claiming with non-existent nodeId returns HTTP 404
    const notFoundClaimRes = await ctx.makeRequest({
      path: '/api/hardware/claim',
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenTokenA}` },
      body: { nodeId: 'NODE_NON_EXISTENT_9999', claimCode: testClaimCode }
    });
    ctx.assert(
      notFoundClaimRes.statusCode === 404,
      '19.6 Device claiming with non-existent nodeId returns HTTP 404'
    );

    // 19.7 Device claiming with invalid claim secret rejected with HTTP 401
    const invalidSecretClaimRes = await ctx.makeRequest({
      path: '/api/hardware/claim',
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenTokenA}` },
      body: { nodeId: testNodeId, claimCode: 'WRONG_CLAIM_CODE' }
    });
    ctx.assert(
      invalidSecretClaimRes.statusCode === 401,
      '19.7 Device claiming with invalid claim secret rejected with HTTP 401'
    );

    // 19.8 Citizen successfully claims ready-made device with valid claim secret
    const validClaimRes = await ctx.makeRequest({
      path: '/api/hardware/claim',
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenTokenA}` },
      body: {
        nodeId: testNodeId,
        claimCode: testClaimCode,
        name: 'Kitchen Pipeline Station'
      }
    });
    const updatedUserA = await models.User.findById(citizenUserA._id);
    const updatedNode = await models.SensorNode.findOne({ nodeId: testNodeId });
    ctx.assert(
      validClaimRes.statusCode === 200 &&
        updatedUserA.assignedNodeId === testNodeId &&
        String(updatedNode.ownerId) === String(citizenUserA._id),
      '19.8 Citizen successfully claims ready-made device with valid claim secret'
    );

    // 19.9 Another citizen attempting to claim already claimed device rejected with HTTP 409 Conflict
    const conflictClaimRes = await ctx.makeRequest({
      path: '/api/hardware/claim',
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenTokenB}` },
      body: { nodeId: testNodeId, claimCode: testClaimCode }
    });
    ctx.assert(
      conflictClaimRes.statusCode === 409,
      '19.9 Another citizen attempting to claim already claimed device rejected with HTTP 409 Conflict'
    );

    // 19.10 Wi-Fi provisioning rejected without SSID with HTTP 400
    const emptySsidRes = await ctx.makeRequest({
      path: '/api/hardware/wifi-provision',
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenTokenA}` },
      body: { nodeId: testNodeId, ssid: '' }
    });
    ctx.assert(
      emptySsidRes.statusCode === 400,
      '19.10 Wi-Fi provisioning rejected without SSID with HTTP 400'
    );

    // 19.11 Wi-Fi provisioning records SSID and updates provisioning status
    const wifiRes = await ctx.makeRequest({
      path: '/api/hardware/wifi-provision',
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenTokenA}` },
      body: { nodeId: testNodeId, ssid: 'Home_WiFi_2.4G', method: 'softap' }
    });
    const nodeAfterWifi = await models.SensorNode.findOne({ nodeId: testNodeId });
    ctx.assert(
      wifiRes.statusCode === 200 &&
        nodeAfterWifi.wifiProvisioning?.ssid === 'Home_WiFi_2.4G' &&
        nodeAfterWifi.wifiProvisioning?.status === 'provisioned',
      '19.11 Wi-Fi provisioning records SSID and updates provisioning status'
    );

    // 19.12 Connection diagnostics: distinguishes 'awaiting Wi-Fi setup' when unprovisioned
    await models.SensorNode.updateOne(
      { nodeId: testNodeId },
      { $set: { 'wifiProvisioning.status': 'unprovisioned', lastSeen: null } }
    );
    const diagAwaitingRes = await ctx.makeRequest({
      path: '/api/hardware/my-device',
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenTokenA}` }
    });
    ctx.assert(
      diagAwaitingRes.data?.diagnostics?.state === 'awaiting Wi-Fi setup',
      "19.12 Connection diagnostics: distinguishes 'awaiting Wi-Fi setup' when unprovisioned"
    );

    // 19.13 Connection diagnostics: distinguishes 'offline' when ping is stale (>15m)
    await models.SensorNode.updateOne(
      { nodeId: testNodeId },
      {
        $set: {
          'wifiProvisioning.status': 'provisioned',
          status: 'Online',
          lastSeen: new Date(Date.now() - 25 * 60 * 1000) // 25 minutes ago
        }
      }
    );
    const diagOfflineRes = await ctx.makeRequest({
      path: '/api/hardware/my-device',
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenTokenA}` }
    });
    ctx.assert(
      diagOfflineRes.data?.diagnostics?.state === 'offline',
      "19.13 Connection diagnostics: distinguishes 'offline' when ping is stale (>15m)"
    );

    // 19.14 Connection diagnostics: distinguishes 'connected but not sending readings'
    await models.SensorNode.updateOne(
      { nodeId: testNodeId },
      {
        $set: {
          status: 'Online',
          lastSeen: new Date() // Just now
        }
      }
    );
    const diagNoReadingsRes = await ctx.makeRequest({
      path: '/api/hardware/my-device',
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenTokenA}` }
    });
    ctx.assert(
      diagNoReadingsRes.data?.diagnostics?.state === 'connected but not sending readings',
      "19.14 Connection diagnostics: distinguishes 'connected but not sending readings'"
    );

    // 19.15 Connection diagnostics: distinguishes 'receiving data' when fresh reading is present
    await models.Reading.create({
      nodeId: testNodeId,
      pH: 7.35,
      turbidity: 1.8,
      tds: 140,
      temperature: 22.5,
      timestamp: new Date()
    });
    const diagReceivingRes = await ctx.makeRequest({
      path: '/api/hardware/my-device',
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenTokenA}` }
    });
    ctx.assert(
      diagReceivingRes.data?.diagnostics?.state === 'receiving data' &&
        diagReceivingRes.data?.latestReading?.pH === 7.35,
      "19.15 Connection diagnostics: distinguishes 'receiving data' when fresh reading is present"
    );

    // 19.16 Blynk integration status returns configured parameters and architecture data path
    const blynkStatusRes = await ctx.makeRequest({
      path: '/api/hardware/blynk-status',
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenTokenA}` }
    });
    ctx.assert(
      blynkStatusRes.statusCode === 200 &&
        blynkStatusRes.data?.blynk?.templateId === 'TMPL_JAL_DRISHTI' &&
        typeof blynkStatusRes.data?.blynk?.dataPath === 'string',
      '19.16 Blynk integration status returns configured parameters and architecture data path'
    );

    // 19.17 Blynk webhook successfully ingests telemetry reading into MongoDB
    const blynkWebhookRes = await ctx.makeRequest({
      path: '/api/hardware/blynk-webhook',
      method: 'POST',
      body: {
        nodeId: testNodeId,
        pH: 7.45,
        turbidity: 2.1,
        tds: 155,
        temperature: 23.0
      }
    });
    const latestBlynkReading = await models.Reading.findOne({ nodeId: testNodeId }).sort({ timestamp: -1 });
    ctx.assert(
      blynkWebhookRes.statusCode === 201 && latestBlynkReading.pH === 7.45,
      '19.17 Blynk webhook successfully ingests telemetry reading into MongoDB'
    );

    // 19.18 Unpairing device successfully removes owner and assignedNodeId
    const unpairRes = await ctx.makeRequest({
      path: '/api/hardware/unpair',
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenTokenA}` }
    });
    const userAfterUnpair = await models.User.findById(citizenUserA._id);
    const nodeAfterUnpair = await models.SensorNode.findOne({ nodeId: testNodeId });
    ctx.assert(
      unpairRes.statusCode === 200 &&
        userAfterUnpair.assignedNodeId === null &&
        nodeAfterUnpair.ownerId === null,
      '19.18 Unpairing device successfully removes owner and assignedNodeId'
    );
  } finally {
    // Cleanup test records
    await models.SensorNode.deleteMany({ nodeId: testNodeId });
    await models.Reading.deleteMany({ nodeId: testNodeId });
    if (citizenUserA) await models.User.deleteOne({ _id: citizenUserA._id });
    if (citizenUserB) await models.User.deleteOne({ _id: citizenUserB._id });
    await ctx.teardown();
  }

  return { suite: ctx.suiteName, passed: ctx.passed, failed: ctx.failed };
}

if (require.main === module) {
  runHardwareSuite().then((res) => {
    process.exit(res.failed > 0 ? 1 : 0);
  });
}

module.exports = { runHardwareSuite };
