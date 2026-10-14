/**
 * JalDrishti: Suite 15 - Frontend Verification Tests
 */

const fs = require('fs');
const path = require('path');
const { TestContext, env } = require('./testContext');

async function runFrontendSuite() {
  const ctx = new TestContext('Frontend Verification');

  console.log('\n[SUITE 15: FRONTEND VERIFICATION]');

  const frontendDir = path.resolve(__dirname, '../frontend');
  const appJsxPath = path.join(frontendDir, 'src/App.jsx');

  // 15.1 Route configuration inspection in App.jsx
  let appCode = '';
  if (fs.existsSync(appJsxPath)) {
    appCode = fs.readFileSync(appJsxPath, 'utf8');
  }

  const REQUIRED_ROUTES = [
    '/login',
    '/register',
    '/citizen',
    '/citizen/trends',
    '/citizen/alerts',
    '/citizen/map',
    '/citizen/image-screening',
    '/reports',
    '/admin',
    '/admin/settings'
  ];

  const allRoutesConfigured = REQUIRED_ROUTES.every((r) => appCode.includes(r));
  ctx.assert(
    allRoutesConfigured,
    '15.1 All 10 required application routes defined in App.jsx'
  );

  // 15.2 Role protection verification in routing
  ctx.assert(
    appCode.includes('RoleRoute') && appCode.includes("allowedRoles={['Admin']}"),
    '15.2 Admin routes protected by RoleRoute role guard'
  );

  // 15.3 Core page components exist
  const REQUIRED_PAGES = [
    'src/pages/LoginPage.jsx',
    'src/pages/RegisterPage.jsx',
    'src/pages/citizen/CitizenDashboardPage.jsx',
    'src/pages/citizen/CitizenTrendsPage.jsx',
    'src/pages/citizen/CitizenAlertsPage.jsx',
    'src/pages/citizen/CitizenMapPage.jsx',
    'src/pages/citizen/CitizenImageScreeningPage.jsx',
    'src/pages/admin/AdminDashboardPage.jsx',
    'src/pages/admin/AdminSettingsPage.jsx',
    'src/pages/reports/ReportsPage.jsx'
  ];

  const allPagesExist = REQUIRED_PAGES.every((p) => fs.existsSync(path.join(frontendDir, p)));
  ctx.assert(
    allPagesExist,
    '15.3 All 10 core page components physically exist on filesystem'
  );

  // 15.4 Production build verification
  const distHtml = path.join(frontendDir, 'dist/index.html');
  const distAssets = path.join(frontendDir, 'dist/assets');
  ctx.assert(
    fs.existsSync(distHtml) && fs.existsSync(distAssets),
    '15.4 Production distribution bundle exists (dist/index.html and dist/assets/)'
  );

  // 15.5 Bundle secrets check
  let bundleClean = true;
  if (fs.existsSync(distAssets)) {
    const jsFiles = fs.readdirSync(distAssets).filter((f) => f.endsWith('.js'));
    for (const f of jsFiles) {
      const code = fs.readFileSync(path.join(distAssets, f), 'utf8');
      if (
        (env.JWT_SECRET && code.includes(env.JWT_SECRET)) ||
        code.includes('mongodb://') ||
        code.includes('process.env.JWT_SECRET') ||
        (env.GEMINI_API_KEY && code.includes(env.GEMINI_API_KEY))
      ) {
        bundleClean = false;
        break;
      }
    }
  }
  ctx.assert(
    bundleClean,
    '15.5 Production frontend bundle strictly free of backend secrets'
  );

  return { suite: ctx.suiteName, passed: ctx.passed, failed: ctx.failed };
}

if (require.main === module) {
  runFrontendSuite().then((res) => {
    process.exit(res.failed > 0 ? 1 : 0);
  });
}

module.exports = { runFrontendSuite };
