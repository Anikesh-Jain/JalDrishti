/**
 * JalDrishti: Consolidated Automated Software Test Suite Runner
 *
 * Master orchestrator executing all 18 automated test suites:
 * 1.  Authentication & Credential Security
 * 2.  Authorization & Role-Based Access Control (RBAC)
 * 3.  Sensor Telemetry Ingestion & Boundary Defense
 * 4.  Threshold Evaluation Engine
 * 5.  Alert Lifecycle & Deduplication
 * 6.  Notification Engine & SMS Dispatch
 * 7.  Historical Data Querying & Ordering
 * 8.  Alert History & Detail Retrieval
 * 9.  Sensor Node & Map Geographic API
 * 10. Reports & RFC4180 CSV Export
 * 11. Admin System & Alert Configuration
 * 12. AI Water Image Screening Pipeline
 * 13. Security Hardening & Vulnerability Remediation
 * 14. API Contract & Terminology Consistency
 * 15. Frontend Routing & Bundle Security
 * 16. Full Multi-User Integration Workflow
 * 17. User Management & Account Deletion Safeguards
 * 18. Contact Us & Inquiry Response Management
 * 19. Hardware & Device Onboarding
 */

const { TestContext } = require('./testContext');
const { runAuthSuite } = require('./auth.test');
const { runRbacSuite } = require('./rbac.test');
const { runSensorSuite } = require('./sensor.test');
const { runThresholdsSuite } = require('./thresholds.test');
const { runAlertsSuite } = require('./alerts.test');
const { runNotificationsSuite } = require('./notifications.test');
const { runHistorySuite } = require('./history.test');
const { runAlertHistorySuite } = require('./alertHistory.test');
const { runMapNodesSuite } = require('./mapNodes.test');
const { runReportsSuite } = require('./reports.test');
const { runAdminSettingsSuite } = require('./adminSettings.test');
const { runAiScreeningSuite } = require('./aiScreening.test');
const { runSecurityRegressionSuite } = require('./securityRegression.test');
const { runApiContractSuite } = require('./apiContract.test');
const { runFrontendSuite } = require('./frontend.test');
const { runFullIntegrationSuite } = require('./fullIntegration.test');
const { runUserManagementSuite } = require('./userManagement.test');
const { runContactInquiriesSuite } = require('./contactInquiries.test');
const { runHardwareSuite } = require('./hardware.test');

async function main() {
  console.log('================================================================================');
  console.log('JALDRISHTI — CONSOLIDATED AUTOMATED SOFTWARE TEST SUITE');
  console.log('Complete End-to-End Verification of System Architecture & Security');
  console.log('================================================================================');

  const suiteRunners = [
    runAuthSuite,
    runRbacSuite,
    runSensorSuite,
    runThresholdsSuite,
    runAlertsSuite,
    runNotificationsSuite,
    runHistorySuite,
    runAlertHistorySuite,
    runMapNodesSuite,
    runReportsSuite,
    runAdminSettingsSuite,
    runAiScreeningSuite,
    runSecurityRegressionSuite,
    runApiContractSuite,
    runFrontendSuite,
    runFullIntegrationSuite,
    runUserManagementSuite,
    runContactInquiriesSuite,
    runHardwareSuite
  ];

  const results = [];
  let totalPassed = 0;
  let totalFailed = 0;

  for (const runner of suiteRunners) {
    try {
      const res = await runner();
      results.push(res);
      totalPassed += res.passed;
      totalFailed += res.failed;
    } catch (err) {
      console.error(`[FATAL ERROR in suite ${runner.name}]:`, err);
      results.push({ suite: runner.name, passed: 0, failed: 1, error: err.message });
      totalFailed += 1;
    }
  }

  // Disconnect MongoDB cleanly
  await TestContext.disconnectDb();

  // Print Summary Table
  console.log('\n================================================================================');
  console.log('JALDRISHTI CONSOLIDATED SOFTWARE TEST SUITE SUMMARY');
  console.log('================================================================================');
  console.log(
    'TEST SUITE'.padEnd(35) +
    'STATUS'.padEnd(12) +
    'PASSED'.padEnd(10) +
    'FAILED'.padEnd(10) +
    'TOTAL'
  );
  console.log('--------------------------------------------------------------------------------');

  for (const r of results) {
    const status = r.failed === 0 ? 'PASS' : 'FAIL';
    const total = r.passed + r.failed;
    console.log(
      r.suite.padEnd(35) +
      status.padEnd(12) +
      String(r.passed).padEnd(10) +
      String(r.failed).padEnd(10) +
      String(total)
    );
  }

  const grandTotal = totalPassed + totalFailed;
  const overallStatus = totalFailed === 0 ? 'PASS' : 'FAIL';
  console.log('--------------------------------------------------------------------------------');
  console.log(
    'TOTAL'.padEnd(35) +
    overallStatus.padEnd(12) +
    String(totalPassed).padEnd(10) +
    String(totalFailed).padEnd(10) +
    String(grandTotal)
  );
  console.log('================================================================================\n');

  if (totalFailed > 0) {
    console.error(`Verification Failed with ${totalFailed} failure(s).`);
    process.exit(1);
  } else {
    console.log('All consolidated software tests passed successfully with 0 failures!');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
