/**
 * JalDrishti: Suite 9 - Sensor Node & Map API Tests
 * Includes node querying, coordinates validation, secret omission,
 * and Admin node management CRUD (POST, PATCH, DELETE) with RBAC enforcement.
 */

const { TestContext, models, bcrypt, generateToken } = require('./testContext');

async function runMapNodesSuite() {
  const ctx = new TestContext('Sensor Nodes & Map');
  await ctx.setup();

  const suffix = `map_${Date.now()}`;
  let citizenUser, citizenToken;
  let adminUser, adminToken;
  let testNode;
  const createdNodeIds = [];

  try {
    console.log('\n[SUITE 9: SENSOR NODES & MAP]');

    const passHash = await bcrypt.hash('Password123!', 10);
    citizenUser = await models.User.create({
      name: 'Map Citizen',
      email: `citizen_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Citizen'
    });
    citizenToken = generateToken({ userId: citizenUser._id.toString(), role: citizenUser.role });

    adminUser = await models.User.create({
      name: 'Map Admin',
      email: `admin_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Admin'
    });
    adminToken = generateToken({ userId: adminUser._id.toString(), role: adminUser.role });

    const keyHash = await bcrypt.hash(`key_${suffix}`, 10);
    testNode = await models.SensorNode.create({
      nodeId: `NODE_MAP_${suffix}`,
      name: 'Map Station 1',
      location: {
        latitude: 22.7196,
        longitude: 75.8577,
        address: 'Rajwada, Indore'
      },
      deviceKeyHash: keyHash,
      status: 'Online',
      lastSeen: new Date()
    });
    createdNodeIds.push(testNode.nodeId);

    // 9.1 Unauthenticated access to /api/sensor/nodes returns HTTP 401
    const unauthRes = await ctx.makeRequest({ path: '/api/sensor/nodes' });
    ctx.assert(unauthRes.statusCode === 401, '9.1 Unauthenticated access to /api/sensor/nodes rejected with HTTP 401');

    // 9.2 Authenticated access returns registered nodes
    const authRes = await ctx.makeRequest({
      path: '/api/sensor/nodes',
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    const nodes = Array.isArray(authRes.body?.data) ? authRes.body.data : (authRes.body?.data?.nodes || []);
    const foundNode = nodes.find((n) => n.nodeId === testNode.nodeId);
    ctx.assert(
      authRes.statusCode === 200 && foundNode !== undefined,
      '9.2 Authenticated access succeeds and returns registered sensor node'
    );

    // 9.3 Location attributes verification
    ctx.assert(
      foundNode &&
      typeof foundNode.location?.latitude === 'number' &&
      typeof foundNode.location?.longitude === 'number' &&
      typeof foundNode.location?.address === 'string',
      '9.3 Location object contains valid latitude, longitude, and address'
    );

    // 9.4 Latitude & Longitude domain validation
    ctx.assert(
      foundNode.location.latitude >= -90 && foundNode.location.latitude <= 90 &&
      foundNode.location.longitude >= -180 && foundNode.location.longitude <= 180,
      '9.4 Node coordinates reside within plausible geographic boundaries'
    );

    // 9.5 Node operational status
    ctx.assert(
      ['Online', 'Offline', 'Maintenance'].includes(foundNode.status),
      '9.5 Node status matches valid operational enum (Online/Offline/Maintenance)'
    );

    // 9.6 deviceKeyHash strictly omitted from API response
    ctx.assert(
      foundNode.deviceKeyHash === undefined &&
      !JSON.stringify(authRes.body).includes('deviceKeyHash'),
      '9.6 Sensitive deviceKeyHash strictly omitted from node API response'
    );

    // 9.7 Citizen denied station creation with HTTP 403
    const crudNodeId = `NODE_CRUD_${suffix}`.toUpperCase();
    createdNodeIds.push(crudNodeId);
    const citizenCreateRes = await ctx.makeRequest({
      path: '/api/sensor/nodes',
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` }
    }, {
      nodeId: crudNodeId,
      name: 'Unauthorized Station',
      location: { latitude: 22.75, longitude: 75.85 }
    });
    ctx.assert(citizenCreateRes.statusCode === 403, '9.7 Citizen denied station creation with HTTP 403');

    // 9.8 Admin creates station with HTTP 201
    const adminCreateRes = await ctx.makeRequest({
      path: '/api/sensor/nodes',
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    }, {
      nodeId: crudNodeId,
      name: 'Yashwant Sagar Test Station',
      location: { latitude: 22.8020, longitude: 75.6980, address: 'Dam Intake Point' },
      status: 'Online'
    });
    ctx.assert(
      adminCreateRes.statusCode === 201 && adminCreateRes.body?.data?.nodeId === crudNodeId,
      '9.8 Admin successfully creates new station with HTTP 201'
    );

    // 9.9 Admin updates station status & metadata with HTTP 200
    const adminPatchRes = await ctx.makeRequest({
      path: `/api/sensor/nodes/${crudNodeId}`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` }
    }, {
      name: 'Yashwant Sagar Station (Calibrated)',
      status: 'Maintenance'
    });
    ctx.assert(
      adminPatchRes.statusCode === 200 && adminPatchRes.body?.data?.status === 'Maintenance',
      '9.9 Admin updates station status to Maintenance with HTTP 200'
    );

    // 9.10 Citizen denied station deletion with HTTP 403
    const citizenDeleteRes = await ctx.makeRequest({
      path: `/api/sensor/nodes/${crudNodeId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    ctx.assert(citizenDeleteRes.statusCode === 403, '9.10 Citizen denied station deletion with HTTP 403');

    // 9.11 Admin deletes station with HTTP 200
    const adminDeleteRes = await ctx.makeRequest({
      path: `/api/sensor/nodes/${crudNodeId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const checkDeleted = await models.SensorNode.findOne({ nodeId: crudNodeId });
    ctx.assert(
      adminDeleteRes.statusCode === 200 && !checkDeleted,
      '9.11 Admin decommissions and removes station with HTTP 200'
    );

  } finally {
    if (citizenUser) await models.User.deleteOne({ _id: citizenUser._id });
    if (adminUser) await models.User.deleteOne({ _id: adminUser._id });
    await models.SensorNode.deleteMany({ nodeId: { $in: createdNodeIds } });
    await ctx.teardown();
  }

  return { suite: ctx.suiteName, passed: ctx.passed, failed: ctx.failed };
}

if (require.main === module) {
  runMapNodesSuite().then((res) => {
    TestContext.disconnectDb().then(() => {
      process.exit(res.failed > 0 ? 1 : 0);
    });
  });
}

module.exports = { runMapNodesSuite };
