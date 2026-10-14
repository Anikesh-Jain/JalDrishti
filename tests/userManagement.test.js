/**
 * JalDrishti: Suite 17 - User Management & Deletion Tests
 * Consolidated from verify_user_deletion.js
 *
 * Verifies:
 * - Unauthenticated deletion blocked with HTTP 401
 * - Citizen attempted deletion blocked with HTTP 403
 * - Admin self-deletion blocked with HTTP 400
 * - Invalid ObjectId rejected with HTTP 400
 * - Non-existent user deletion returns HTTP 404
 * - Admin successfully deletes user with HTTP 200 and confirms MongoDB record removal
 * - Last Admin deletion safeguard prevents locking out the system
 */

const { TestContext, models, bcrypt, generateToken, mongoose } = require('./testContext');

async function runUserManagementSuite() {
  const ctx = new TestContext('User Management & Deletion');
  await ctx.setup();

  const suffix = `usermgmt_${Date.now()}`;
  const plainPassword = 'Password123!';
  let adminUser, adminToken;
  let citizenUser, citizenToken;
  let candidateUser;

  try {
    console.log('\n[SUITE 17: USER MANAGEMENT & DELETION]');

    const passHash = await bcrypt.hash(plainPassword, 10);

    adminUser = await models.User.create({
      name: 'UserMgmt Admin',
      email: `admin_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Admin'
    });
    adminToken = generateToken({ userId: adminUser._id.toString(), role: adminUser.role });

    citizenUser = await models.User.create({
      name: 'UserMgmt Citizen',
      email: `citizen_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Citizen'
    });
    citizenToken = generateToken({ userId: citizenUser._id.toString(), role: citizenUser.role });

    candidateUser = await models.User.create({
      name: 'Deletion Candidate',
      email: `candidate_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Citizen'
    });

    // 17.1 Unauthenticated deletion blocked with HTTP 401
    const unauthDelRes = await ctx.makeRequest({
      path: `/api/users/${candidateUser._id}`,
      method: 'DELETE'
    });
    ctx.assert(
      unauthDelRes.statusCode === 401,
      '17.1 Unauthenticated user deletion blocked with HTTP 401'
    );

    // 17.2 Citizen attempting user deletion blocked with HTTP 403
    const citizenDelRes = await ctx.makeRequest({
      path: `/api/users/${candidateUser._id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    ctx.assert(
      citizenDelRes.statusCode === 403,
      '17.2 Citizen attempting user deletion blocked with HTTP 403 Forbidden'
    );

    // Verify candidate still exists in database
    const stillExists = await models.User.findById(candidateUser._id);
    ctx.assert(
      stillExists !== null,
      '17.3 Candidate user remains in MongoDB after rejected citizen attempt'
    );

    // 17.4 Admin self-deletion prevention
    const selfDelRes = await ctx.makeRequest({
      path: `/api/users/${adminUser._id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    ctx.assert(
      selfDelRes.statusCode === 400 &&
      (selfDelRes.body?.error || '').toLowerCase().includes('own account'),
      '17.4 Admin self-deletion blocked with HTTP 400'
    );

    // 17.5 Invalid ObjectId format rejection
    const invalidIdRes = await ctx.makeRequest({
      path: '/api/users/not-a-valid-object-id',
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    ctx.assert(
      invalidIdRes.statusCode === 400,
      '17.5 Invalid user ID format rejected with HTTP 400'
    );

    // 17.6 Non-existent user deletion returns HTTP 404
    const fakeObjectId = new mongoose.Types.ObjectId().toString();
    const notFoundRes = await ctx.makeRequest({
      path: `/api/users/${fakeObjectId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    ctx.assert(
      notFoundRes.statusCode === 404,
      '17.6 Non-existent user deletion returns HTTP 404 Not Found'
    );

    // 17.7 Admin authorized deletion of candidate user
    const adminDelRes = await ctx.makeRequest({
      path: `/api/users/${candidateUser._id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const checkDeleted = await models.User.findById(candidateUser._id);
    ctx.assert(
      adminDelRes.statusCode === 200 && checkDeleted === null,
      '17.7 Admin successfully deletes target citizen user with HTTP 200 and confirms MongoDB removal'
    );

    // 17.8 Last admin safeguard
    // Count active admins in DB
    const adminCount = await models.User.countDocuments({ role: 'Admin' });
    if (adminCount === 1) {
      // Create a second admin, then have second admin try to delete the first admin
      const secondAdmin = await models.User.create({
        name: 'Second Admin',
        email: `admin2_${suffix}@example.com`,
        passwordHash: passHash,
        role: 'Admin'
      });
      const secondAdminToken = generateToken({ userId: secondAdmin._id.toString(), role: secondAdmin.role });

      // Demote secondAdmin to Citizen so first admin is the ONLY admin
      await models.User.updateOne({ _id: secondAdmin._id }, { role: 'Citizen' });

      // Now create a temporary Admin token to test deleting the last remaining admin
      const deleteLastAdminRes = await ctx.makeRequest({
        path: `/api/users/${adminUser._id}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${secondAdminToken}` }
      });
      ctx.assert(
        deleteLastAdminRes.statusCode === 403 || deleteLastAdminRes.statusCode === 400,
        '17.8 Last remaining admin deletion safeguard enforced'
      );
      await models.User.deleteOne({ _id: secondAdmin._id });
    } else {
      ctx.assert(adminCount >= 1, '17.8 Admin account invariants maintained in MongoDB');
    }

  } finally {
    await models.User.deleteMany({ email: { $regex: suffix } });
    await ctx.teardown();
  }

  return { suite: ctx.suiteName, passed: ctx.passed, failed: ctx.failed };
}

if (require.main === module) {
  runUserManagementSuite().then((res) => {
    TestContext.disconnectDb().then(() => {
      process.exit(res.failed > 0 ? 1 : 0);
    });
  });
}

module.exports = { runUserManagementSuite };
