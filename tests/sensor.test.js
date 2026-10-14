/**
 * JalDrishti: Suite 3 - Sensor Ingestion Tests
 */

const { TestContext, models, bcrypt } = require('./testContext');

async function runSensorSuite() {
  const ctx = new TestContext('Sensor Ingestion');
  await ctx.setup();

  const suffix = `sens_${Date.now()}`;
  const rawKey = `key_${suffix}`;
  let activeNode, inactiveNode;
  const createdReadingIds = [];

  try {
    console.log('\n[SUITE 3: SENSOR INGESTION]');

    const keyHash = await bcrypt.hash(rawKey, 10);
    activeNode = await models.SensorNode.create({
      nodeId: `NODE_ACT_${suffix}`,
      name: 'Active Test Node',
      location: { latitude: 22.7196, longitude: 75.8577, address: 'Indore Lab' },
      deviceKeyHash: keyHash,
      status: 'Online'
    });

    inactiveNode = await models.SensorNode.create({
      nodeId: `NODE_INA_${suffix}`,
      name: 'Inactive Test Node',
      location: { latitude: 22.7196, longitude: 75.8577, address: 'Offline Lab' },
      deviceKeyHash: keyHash,
      status: 'Offline'
    });

    // 3.1 Valid reading ingested with HTTP 201
    const validRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': rawKey }
    }, {
      nodeId: activeNode.nodeId,
      pH: 7.25,
      turbidity: 1.8,
      tds: 210,
      temperature: 24.5
    });
    ctx.assert(
      validRes.statusCode === 201 && validRes.body?.success === true,
      '3.1 Valid sensor telemetry payload accepted with HTTP 201'
    );
    if (validRes.body?.data?.reading?._id) {
      createdReadingIds.push(validRes.body.data.reading._id);
    }

    // 3.2 Reading persisted in MongoDB
    const persisted = await models.Reading.findOne({ nodeId: activeNode.nodeId });
    ctx.assert(
      persisted && persisted.pH === 7.25 && persisted.turbidity === 1.8,
      '3.2 Telemetry reading strictly persisted in MongoDB Reading collection'
    );

    // 3.3 SensorNode lastSeen timestamp updated
    const updatedNode = await models.SensorNode.findById(activeNode._id);
    ctx.assert(
      updatedNode && updatedNode.lastSeen !== null,
      '3.3 SensorNode lastSeen timestamp updated upon ingestion'
    );

    // 3.4 Missing nodeId rejected with HTTP 400
    const missingNodeRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': rawKey }
    }, { pH: 7.2, turbidity: 2.0, tds: 200, temperature: 25.0 });
    ctx.assert(missingNodeRes.statusCode === 400, '3.4 Missing nodeId rejected with HTTP 400');

    // 3.5 Missing pH rejected with HTTP 400
    const missingPhRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': rawKey }
    }, { nodeId: activeNode.nodeId, turbidity: 2.0, tds: 200, temperature: 25.0 });
    ctx.assert(missingPhRes.statusCode === 400, '3.5 Missing pH rejected with HTTP 400');

    // 3.6 Missing turbidity rejected with HTTP 400
    const missingTurbRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': rawKey }
    }, { nodeId: activeNode.nodeId, pH: 7.2, tds: 200, temperature: 25.0 });
    ctx.assert(missingTurbRes.statusCode === 400, '3.6 Missing turbidity rejected with HTTP 400');

    // 3.7 Missing TDS rejected with HTTP 400
    const missingTdsRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': rawKey }
    }, { nodeId: activeNode.nodeId, pH: 7.2, turbidity: 2.0, temperature: 25.0 });
    ctx.assert(missingTdsRes.statusCode === 400, '3.7 Missing TDS rejected with HTTP 400');

    // 3.8 Missing temperature rejected with HTTP 400
    const missingTempRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': rawKey }
    }, { nodeId: activeNode.nodeId, pH: 7.2, turbidity: 2.0, tds: 200 });
    ctx.assert(missingTempRes.statusCode === 400, '3.8 Missing temperature rejected with HTTP 400');

    // 3.9 Non-numeric types rejected with HTTP 400
    const badTypeRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': rawKey }
    }, { nodeId: activeNode.nodeId, pH: 'seven-point-two', turbidity: 2.0, tds: 200, temperature: 25.0 });
    ctx.assert(badTypeRes.statusCode === 400, '3.9 Non-numeric string pH rejected with HTTP 400');

    // 3.10 Impossible pH (> 14) rejected with HTTP 400
    const highPhRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': rawKey }
    }, { nodeId: activeNode.nodeId, pH: 14.5, turbidity: 2.0, tds: 200, temperature: 25.0 });
    ctx.assert(highPhRes.statusCode === 400, '3.10 Physically impossible pH (14.5 > 14) rejected with HTTP 400');

    // 3.11 Negative turbidity rejected with HTTP 400
    const negTurbRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': rawKey }
    }, { nodeId: activeNode.nodeId, pH: 7.0, turbidity: -1.0, tds: 200, temperature: 25.0 });
    ctx.assert(negTurbRes.statusCode === 400, '3.11 Negative turbidity rejected with HTTP 400');

    // 3.12 Negative TDS rejected with HTTP 400
    const negTdsRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': rawKey }
    }, { nodeId: activeNode.nodeId, pH: 7.0, turbidity: 2.0, tds: -50, temperature: 25.0 });
    ctx.assert(negTdsRes.statusCode === 400, '3.12 Negative TDS rejected with HTTP 400');

    // 3.13 Invalid temperature (> 80°C) rejected with HTTP 400
    const highTempRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': rawKey }
    }, { nodeId: activeNode.nodeId, pH: 7.0, turbidity: 2.0, tds: 200, temperature: 95.0 });
    ctx.assert(highTempRes.statusCode === 400, '3.13 Out-of-bounds temperature (95°C > 80°C) rejected with HTTP 400');

    // 3.14 Invalid timestamp string rejected with HTTP 400
    const badTimeRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': rawKey }
    }, { nodeId: activeNode.nodeId, pH: 7.0, turbidity: 2.0, tds: 200, temperature: 25.0, timestamp: 'invalid-date-string' });
    ctx.assert(badTimeRes.statusCode === 400, '3.14 Malformed timestamp string rejected with HTTP 400');

    // 3.15 Missing device key header rejected with HTTP 401
    const noKeyRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST'
    }, { nodeId: activeNode.nodeId, pH: 7.0, turbidity: 2.0, tds: 200, temperature: 25.0 });
    ctx.assert(noKeyRes.statusCode === 401, '3.15 Missing x-device-key header rejected with HTTP 401');

    // 3.16 Invalid device key header rejected with HTTP 401
    const badKeyRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': 'incorrect_wrong_device_key' }
    }, { nodeId: activeNode.nodeId, pH: 7.0, turbidity: 2.0, tds: 200, temperature: 25.0 });
    ctx.assert(badKeyRes.statusCode === 401, '3.16 Invalid x-device-key header rejected with HTTP 401');

    // 3.17 Unknown node ID rejected with HTTP 404
    const unknownNodeRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': rawKey }
    }, { nodeId: 'NODE_DOES_NOT_EXIST', pH: 7.0, turbidity: 2.0, tds: 200, temperature: 25.0 });
    ctx.assert(unknownNodeRes.statusCode === 404, '3.17 Unknown nodeId rejected with HTTP 404');

    // 3.18 Inactive node rejected with HTTP 403
    const inactiveNodeRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': rawKey }
    }, { nodeId: inactiveNode.nodeId, pH: 7.0, turbidity: 2.0, tds: 200, temperature: 25.0 });
    ctx.assert(inactiveNodeRes.statusCode === 403, '3.18 Inactive sensor node rejected with HTTP 403');

    // 3.19 NoSQL operator in payload rejected
    const noSqlPayloadRes = await ctx.makeRequest({
      path: '/api/sensor/readings',
      method: 'POST',
      headers: { 'x-device-key': rawKey }
    }, { nodeId: activeNode.nodeId, pH: { $gt: 5 }, turbidity: 2.0, tds: 200, temperature: 25.0 });
    ctx.assert(noSqlPayloadRes.statusCode === 400, '3.19 MongoDB operator object in pH field rejected with HTTP 400');

  } finally {
    if (activeNode) await models.SensorNode.deleteOne({ _id: activeNode._id });
    if (inactiveNode) await models.SensorNode.deleteOne({ _id: inactiveNode._id });
    await models.Reading.deleteMany({ nodeId: { $regex: suffix } });
    await ctx.teardown();
  }

  return { suite: ctx.suiteName, passed: ctx.passed, failed: ctx.failed };
}

if (require.main === module) {
  runSensorSuite().then((res) => {
    TestContext.disconnectDb().then(() => {
      process.exit(res.failed > 0 ? 1 : 0);
    });
  });
}

module.exports = { runSensorSuite };
