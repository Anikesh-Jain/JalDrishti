/**
 * JalDrishti: Suite 1 - Authentication Tests
 * Includes core auth, password hashing, JWT security, profile updates,
 * forgot/reset password flows, and demo login integrity.
 */

const crypto = require('crypto');
const { TestContext, models, env, bcrypt, jwt } = require('./testContext');

async function runAuthSuite() {
  const ctx = new TestContext('Authentication');
  await ctx.setup();

  const suffix = `auth_${Date.now()}`;
  const validEmail = `user_${suffix}@example.com`;
  const plainPassword = 'Password123!';
  let createdUserId = null;

  try {
    console.log('\n[SUITE 1: AUTHENTICATION]');

    // 1.1 Registration success
    const regRes = await ctx.makeRequest({
      path: '/api/auth/register',
      method: 'POST'
    }, {
      name: 'Auth Test User',
      email: validEmail,
      password: plainPassword,
      phone: '+919876543210'
    });
    ctx.assert(
      regRes.statusCode === 201 && regRes.body?.token && regRes.body?.user?.email === validEmail,
      '1.1 Public registration succeeds with HTTP 201 and valid JWT'
    );
    if (regRes.body?.user?._id) {
      createdUserId = regRes.body.user._id;
    }

    // 1.2 Sensitive fields omitted from registration response
    ctx.assert(
      regRes.body?.user?.password === undefined && regRes.body?.user?.passwordHash === undefined,
      '1.2 Sensitive password and passwordHash omitted from registration response'
    );

    // 1.3 Role escalation prevented during registration
    const escalateEmail = `escalate_${suffix}@example.com`;
    const escalateRes = await ctx.makeRequest({
      path: '/api/auth/register',
      method: 'POST'
    }, {
      name: 'Escalate Attempt',
      email: escalateEmail,
      password: plainPassword,
      role: 'Admin'
    });
    ctx.assert(
      escalateRes.statusCode === 201 && escalateRes.body?.user?.role === 'Citizen',
      '1.3 Privilege escalation prevented: explicit role: "Admin" defaults to "Citizen"'
    );
    if (escalateRes.body?.user?._id) {
      await models.User.deleteOne({ _id: escalateRes.body.user._id });
    }

    // 1.4 Duplicate registration rejection
    const dupRes = await ctx.makeRequest({
      path: '/api/auth/register',
      method: 'POST'
    }, {
      name: 'Duplicate User',
      email: validEmail,
      password: plainPassword
    });
    ctx.assert(
      dupRes.statusCode === 409 && (dupRes.body?.error || dupRes.body?.message),
      '1.4 Duplicate registration rejected with HTTP 409 Conflict'
    );

    // 1.5 Password hashing verified in database
    const dbUser = await models.User.findOne({ email: validEmail });
    const isHashed = dbUser && dbUser.passwordHash && dbUser.passwordHash !== plainPassword && dbUser.passwordHash.startsWith('$2');
    ctx.assert(
      isHashed && await bcrypt.compare(plainPassword, dbUser.passwordHash),
      '1.5 User password strictly stored as bcrypt hash in MongoDB'
    );

    // 1.6 Login success with valid credentials
    const loginRes = await ctx.makeRequest({
      path: '/api/auth/login',
      method: 'POST'
    }, {
      email: validEmail,
      password: plainPassword
    });
    ctx.assert(
      loginRes.statusCode === 200 && loginRes.body?.token && loginRes.body?.user?.email === validEmail,
      '1.6 Login succeeds with HTTP 200 and signed JWT issued'
    );
    const validToken = loginRes.body?.token;

    // 1.7 Passwords omitted from login response
    ctx.assert(
      loginRes.body?.user?.password === undefined && loginRes.body?.user?.passwordHash === undefined,
      '1.7 Sensitive password fields omitted from login response'
    );

    // 1.8 Login failure with incorrect password
    const badPassRes = await ctx.makeRequest({
      path: '/api/auth/login',
      method: 'POST'
    }, {
      email: validEmail,
      password: 'WrongPassword999!'
    });
    ctx.assert(
      badPassRes.statusCode === 401 && (badPassRes.body?.error || badPassRes.body?.message),
      '1.8 Login with incorrect password rejected with HTTP 401'
    );

    // 1.9 Login failure with unknown user
    const unknownUserRes = await ctx.makeRequest({
      path: '/api/auth/login',
      method: 'POST'
    }, {
      email: `nonexistent_${suffix}@example.com`,
      password: plainPassword
    });
    ctx.assert(
      unknownUserRes.statusCode === 401 && (unknownUserRes.body?.error || unknownUserRes.body?.message),
      '1.9 Login with unknown user email rejected with HTTP 401'
    );

    // 1.10 Malformed credentials rejected with HTTP 400
    const malformedRes = await ctx.makeRequest({
      path: '/api/auth/login',
      method: 'POST'
    }, {
      email: { $ne: '' },
      password: 12345
    });
    ctx.assert(
      malformedRes.statusCode === 400 && (malformedRes.body?.error || malformedRes.body?.message),
      '1.10 Malformed non-string login credentials rejected with HTTP 400'
    );

    // 1.11 Short password on registration rejected with HTTP 400
    const shortPassRes = await ctx.makeRequest({
      path: '/api/auth/register',
      method: 'POST'
    }, {
      name: 'Short Pass',
      email: `short_${suffix}@example.com`,
      password: '123'
    });
    ctx.assert(
      shortPassRes.statusCode === 400,
      '1.11 Registration with short password (<6 chars) rejected with HTTP 400'
    );

    // 1.12 GET /api/auth/me with valid JWT
    const meValidRes = await ctx.makeRequest({
      path: '/api/auth/me',
      headers: { Authorization: `Bearer ${validToken}` }
    });
    ctx.assert(
      meValidRes.statusCode === 200 &&
      (meValidRes.body?.user?.email === validEmail || meValidRes.body?.data?.user?.email === validEmail),
      '1.12 GET /api/auth/me with valid JWT succeeds and returns user profile'
    );

    // 1.13 GET /api/auth/me without JWT returns HTTP 401
    const meNoTokenRes = await ctx.makeRequest({ path: '/api/auth/me' });
    ctx.assert(
      meNoTokenRes.statusCode === 401,
      '1.13 GET /api/auth/me without token rejected with HTTP 401'
    );

    // 1.14 GET /api/auth/me with tampered JWT returns HTTP 401
    const tamperedToken = validToken.slice(0, -6) + 'xyz123';
    const meTamperedRes = await ctx.makeRequest({
      path: '/api/auth/me',
      headers: { Authorization: `Bearer ${tamperedToken}` }
    });
    ctx.assert(
      meTamperedRes.statusCode === 401,
      '1.14 GET /api/auth/me with tampered JWT rejected with HTTP 401'
    );

    // 1.15 GET /api/auth/me with expired JWT returns HTTP 401
    const expiredToken = jwt.sign(
      { userId: dbUser._id.toString(), role: 'Citizen' },
      env.JWT_SECRET || 'secret',
      { expiresIn: '-5s' }
    );
    const meExpiredRes = await ctx.makeRequest({
      path: '/api/auth/me',
      headers: { Authorization: `Bearer ${expiredToken}` }
    });
    ctx.assert(
      meExpiredRes.statusCode === 401,
      '1.15 GET /api/auth/me with expired JWT rejected with HTTP 401'
    );

    // 1.16 Google Auth endpoint with missing credential returns HTTP 400
    const googleMissingRes = await ctx.makeRequest({
      path: '/api/auth/google',
      method: 'POST'
    }, {});
    ctx.assert(
      googleMissingRes.statusCode === 400,
      '1.16 Google Auth endpoint with missing credential returns HTTP 400'
    );

    // 1.17 Google Auth endpoint with invalid credential returns HTTP 401
    const googleInvalidRes = await ctx.makeRequest({
      path: '/api/auth/google',
      method: 'POST'
    }, { credential: 'invalid_fake_google_id_token' });
    ctx.assert(
      googleInvalidRes.statusCode === 401,
      '1.17 Google Auth endpoint with invalid credential handled safely with HTTP 401'
    );

    // 1.18 User Profile update via PUT /api/auth/profile
    const updateProfileRes = await ctx.makeRequest({
      path: '/api/auth/profile',
      method: 'PUT',
      headers: { Authorization: `Bearer ${validToken}` }
    }, {
      name: 'Auth Test User Updated',
      phone: '+919988776655',
      organization: 'JalDrishti Water Watchers',
      role: 'Admin' // Attempt privilege escalation
    });
    ctx.assert(
      updateProfileRes.statusCode === 200 &&
      updateProfileRes.body?.user?.name === 'Auth Test User Updated' &&
      updateProfileRes.body?.user?.role === 'Citizen',
      '1.18 PUT /api/auth/profile updates profile and strictly blocks privilege escalation to Admin'
    );

    // 1.19 Demo Login accounts verification
    const adminDemoRes = await ctx.makeRequest({
      path: '/api/auth/demo-login',
      method: 'POST'
    }, { role: 'Admin' });
    const citizenDemoRes = await ctx.makeRequest({
      path: '/api/auth/demo-login',
      method: 'POST'
    }, { role: 'Citizen' });
    ctx.assert(
      adminDemoRes.statusCode === 200 && adminDemoRes.body?.token &&
      citizenDemoRes.statusCode === 200 && citizenDemoRes.body?.token,
      '1.19 Demo logins succeed for Admin and Citizen roles with signed JWTs'
    );

    // 1.20 Forgot Password input validation & neutral response
    const invalidEmailForgot = await ctx.makeRequest({
      path: '/api/auth/forgot-password',
      method: 'POST'
    }, { email: 'not-an-email' });
    const nonExistentForgot = await ctx.makeRequest({
      path: '/api/auth/forgot-password',
      method: 'POST'
    }, { email: `ghost_${suffix}@example.com` });
    ctx.assert(
      invalidEmailForgot.statusCode === 400 &&
      nonExistentForgot.statusCode === 200 &&
      (nonExistentForgot.body?.message || '').toLowerCase().includes('if an account matches'),
      '1.20 Forgot password validates email syntax and yields neutral responses'
    );

    // 1.21 Forgot and Reset Password lifecycle
    const rawResetToken = 'test_tok_' + crypto.randomBytes(16).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');
    await models.User.updateOne(
      { _id: dbUser._id },
      {
        resetPasswordToken: hashedResetToken,
        resetPasswordExpires: new Date(Date.now() + 3600000)
      }
    );

    const newSecretPassword = 'BrandNewPassword789!';
    const resetSuccessRes = await ctx.makeRequest({
      path: '/api/auth/reset-password',
      method: 'POST'
    }, {
      token: rawResetToken,
      password: newSecretPassword,
      confirmPassword: newSecretPassword
    });
    ctx.assert(
      resetSuccessRes.statusCode === 200,
      '1.21 Reset password succeeds with valid single-use hashed token'
    );

    // 1.22 Token reuse rejection & credential authentication transition
    const reuseResetRes = await ctx.makeRequest({
      path: '/api/auth/reset-password',
      method: 'POST'
    }, {
      token: rawResetToken,
      password: 'AnotherPassword999!',
      confirmPassword: 'AnotherPassword999!'
    });
    const oldLoginRes = await ctx.makeRequest({
      path: '/api/auth/login',
      method: 'POST'
    }, {
      email: validEmail,
      password: plainPassword
    });
    const newLoginRes = await ctx.makeRequest({
      path: '/api/auth/login',
      method: 'POST'
    }, {
      email: validEmail,
      password: newSecretPassword
    });
    ctx.assert(
      reuseResetRes.statusCode === 400 &&
      oldLoginRes.statusCode === 401 &&
      newLoginRes.statusCode === 200 &&
      newLoginRes.body?.token,
      '1.22 Reset token reuse rejected, old password invalidated, new credentials authenticated'
    );

  } finally {
    // Cleanup
    if (createdUserId) {
      await models.User.deleteOne({ _id: createdUserId });
    }
    await models.User.deleteMany({ email: { $regex: suffix } });
    await ctx.teardown();
  }

  return { suite: ctx.suiteName, passed: ctx.passed, failed: ctx.failed };
}

if (require.main === module) {
  runAuthSuite().then((res) => {
    TestContext.disconnectDb().then(() => {
      process.exit(res.failed > 0 ? 1 : 0);
    });
  });
}

module.exports = { runAuthSuite };
