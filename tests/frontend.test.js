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
        code.includes('process.env.ADMIN_EMAIL') ||
        code.includes('VITE_ADMIN_EMAIL') ||
        (env.GEMINI_API_KEY && code.includes(env.GEMINI_API_KEY))
      ) {
        bundleClean = false;
        break;
      }
    }
  }
  ctx.assert(
    bundleClean,
    '15.5 Production frontend bundle strictly free of backend secrets and admin env configs'
  );

  // 15.6 Integrated Admin Portal navigation gated by server-verified Admin role
  const headerCode = fs.readFileSync(path.join(frontendDir, 'src/layouts/Header.jsx'), 'utf8');
  const sidebarCode = fs.readFileSync(path.join(frontendDir, 'src/layouts/Sidebar.jsx'), 'utf8');
  const appLayoutCode = fs.readFileSync(path.join(frontendDir, 'src/layouts/AppLayout.jsx'), 'utf8');
  const hasAdminPortalNav =
    headerCode.includes('Admin Portal') &&
    headerCode.includes('isAdmin') &&
    sidebarCode.includes('Admin Portal') &&
    sidebarCode.includes('isAdmin') &&
    appLayoutCode.includes('Admin Portal') &&
    appLayoutCode.includes("user.role === 'Admin'");
  ctx.assert(
    hasAdminPortalNav,
    '15.6 Integrated Admin Portal entry present in Header, Sidebar, and AppLayout and strictly gated by Admin role'
  );

  // 15.7 Typography system verification (Inter + IBM Plex Mono only, no conflicting font imports)
  const indexHtmlCode = fs.readFileSync(path.join(frontendDir, 'index.html'), 'utf8');
  const tailwindCode = fs.readFileSync(path.join(frontendDir, 'tailwind.config.js'), 'utf8');
  const cssCode = fs.readFileSync(path.join(frontendDir, 'src/styles/index.css'), 'utf8');
  const typographyValid =
    indexHtmlCode.includes('family=Inter:wght@400;500;600;700') &&
    indexHtmlCode.includes('family=IBM+Plex+Mono:wght@400;500;600') &&
    !indexHtmlCode.includes('IBM+Plex+Sans') &&
    !indexHtmlCode.includes('JetBrains+Mono') &&
    tailwindCode.includes("'Inter'") &&
    tailwindCode.includes("'IBM Plex Mono'") &&
    !tailwindCode.includes('IBM Plex Sans') &&
    !tailwindCode.includes('JetBrains Mono') &&
    cssCode.includes("'Inter'") &&
    cssCode.includes("'IBM Plex Mono'");
  ctx.assert(
    typographyValid,
    '15.7 Typography strictly configured with Inter (400/500/600/700) and IBM Plex Mono (400/500/600) with zero conflicting font families'
  );

  return { suite: ctx.suiteName, passed: ctx.passed, failed: ctx.failed };
}

if (require.main === module) {
  runFrontendSuite().then((res) => {
    process.exit(res.failed > 0 ? 1 : 0);
  });
}

module.exports = { runFrontendSuite };
