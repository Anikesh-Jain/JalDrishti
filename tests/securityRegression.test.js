/**
 * JalDrishti: Suite 13 - Security Regression Tests
 */

const { TestContext, models, env, bcrypt, generateToken } = require('./testContext');

async function runSecurityRegressionSuite() {
  const ctx = new TestContext('Security Regression');
  await ctx.setup();

  const suffix = `secreg_${Date.now()}`;
  let citizenUser, citizenToken;

  try {
    console.log('\n[SUITE 13: SECURITY REGRESSION]');

    const passHash = await bcrypt.hash('Password123!', 10);
    citizenUser = await models.User.create({
      name: 'Sec Citizen',
      email: `citizen_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Citizen'
    });
    citizenToken = generateToken({ userId: citizenUser._id.toString(), role: citizenUser.role });

    // 13.1 NoSQL operator injection in query string sanitized (SEC-01)
    const noSqlAlertsRes = await ctx.makeRequest({
      path: '/api/alerts?status%5B%24ne%5D=Active',
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    ctx.assert(
      noSqlAlertsRes.statusCode === 200 && Array.isArray(noSqlAlertsRes.body?.data),
      '13.1 NoSQL operator injection in query string safely sanitized without error (SEC-01)'
    );

    // 13.2 Non-string login credentials rejected with HTTP 400 (SEC-02)
    const badLoginRes = await ctx.makeRequest({
      path: '/api/auth/login',
      method: 'POST'
    }, { email: { $gt: '' }, password: { $gt: '' } });
    ctx.assert(
      badLoginRes.statusCode === 400,
      '13.2 Non-string login credentials rejected with HTTP 400 without crashing (SEC-02)'
    );

    // 13.3 Mongoose CastError handled globally with HTTP 400 (SEC-03)
    const castErrorRes = await ctx.makeRequest({
      path: '/api/alerts/non-hex-invalid-id',
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    ctx.assert(
      castErrorRes.statusCode === 400 && castErrorRes.body?.stack === undefined,
      '13.3 Malformed ObjectId produces clean HTTP 400 without leaking stack traces (SEC-03)'
    );

    // 13.4 Express X-Powered-By header suppressed (SEC-05)
    const healthRes = await ctx.makeRequest({ path: '/health' });
    ctx.assert(
      healthRes.headers['x-powered-by'] === undefined,
      '13.4 Express X-Powered-By header suppressed (SEC-05)'
    );

    // 13.5 Helmet security headers present
    ctx.assert(
      healthRes.headers['x-content-type-options'] === 'nosniff',
      '13.5 Helmet security headers enforced (X-Content-Type-Options: nosniff)'
    );

    // 13.6 Unauthorized CORS browser origin rejected with HTTP 403
    const badCorsRes = await ctx.makeRequest({
      path: '/health',
      headers: { Origin: 'https://malicious-external-site.org' }
    });
    ctx.assert(
      badCorsRes.statusCode === 403,
      '13.6 Unauthorized CORS browser origin rejected with HTTP 403'
    );

    // 13.7 Sensitive secrets exclusion from error responses
    const notFoundRes = await ctx.makeRequest({ path: '/api/non-existent-test-path' });
    const rawError = JSON.stringify(notFoundRes.body || {});
    ctx.assert(
      !rawError.includes(env.JWT_SECRET) && !rawError.includes('mongodb://'),
      '13.7 Error responses do not leak database connection strings or JWT secret'
    );

  } finally {
    if (citizenUser) await models.User.deleteOne({ _id: citizenUser._id });
    await ctx.teardown();
  }

  return { suite: ctx.suiteName, passed: ctx.passed, failed: ctx.failed };
}

if (require.main === module) {
  runSecurityRegressionSuite().then((res) => {
    TestContext.disconnectDb().then(() => {
      process.exit(res.failed > 0 ? 1 : 0);
    });
  });
}

module.exports = { runSecurityRegressionSuite };
