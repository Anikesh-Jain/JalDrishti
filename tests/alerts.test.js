/**
 * JalDrishti: Suite 5 - Alert Lifecycle Tests
 */

const { TestContext, models } = require('./testContext');
const alertService = require('../backend/src/services/alertService');

async function runAlertsSuite() {
  const ctx = new TestContext('Alert Lifecycle');
  await ctx.setup();

  const suffix = `alert_${Date.now()}`;
  const testNodeId = `NODE_AL_${suffix}`.toUpperCase();
  const testNode2Id = `NODE_AL2_${suffix}`.toUpperCase();
  const createdReadingIds = [];

  try {
    console.log('\n[SUITE 5: ALERT LIFECYCLE]');

    // Helper to create a reading document with an _id
    async function createReadingDoc(nodeId, pH, turbidity = 2.0) {
      const doc = await models.Reading.create({
        nodeId,
        pH,
        turbidity,
        tds: 200,
        temperature: 25.0,
        timestamp: new Date()
      });
      createdReadingIds.push(doc._id);
      return doc;
    }

    // 5.1 Safe reading evaluation -> zero alerts created
    const safeReading = await createReadingDoc(testNodeId, 7.2);
    const safeEval = {
      hasBreach: false,
      breachedParameters: [],
      overallStatus: 'Safe',
      parameters: {
        pH: { evaluated: true, breach: false, value: 7.2, minimum: 6.5, maximum: 8.5 }
      }
    };
    const safeSummary = await alertService.processReadingAlerts(safeReading, safeEval);
    ctx.assert(
      safeSummary.created.length === 0 && safeSummary.maintained.length === 0,
      '5.1 Safe reading creates zero Alert documents'
    );

    // 5.2 Initial Breach -> creates exactly one new Active alert
    const breachReading = await createReadingDoc(testNodeId, 9.2);
    const breachEval = {
      hasBreach: true,
      breachedParameters: ['pH'],
      overallStatus: 'Unsafe',
      parameters: {
        pH: {
          evaluated: true,
          breach: true,
          direction: 'HIGH',
          value: 9.2,
          minimum: 6.5,
          maximum: 8.5
        }
      }
    };
    const breachSummary = await alertService.processReadingAlerts(breachReading, breachEval);
    ctx.assert(
      breachSummary.created.length === 1 && breachSummary.created[0].status === 'Active',
      '5.2 Initial breach creates exactly one Active alert document'
    );
    const activeAlertId = breachSummary.created[0]._id;

    // 5.3 Repeated breach (Debounce) -> updates existing alert, no duplicate created
    const repeatReading = await createReadingDoc(testNodeId, 9.4);
    const repeatEval = {
      hasBreach: true,
      breachedParameters: ['pH'],
      overallStatus: 'Unsafe',
      parameters: {
        pH: {
          evaluated: true,
          breach: true,
          direction: 'HIGH',
          value: 9.4,
          minimum: 6.5,
          maximum: 8.5
        }
      }
    };
    const repeatSummary = await alertService.processReadingAlerts(repeatReading, repeatEval);
    ctx.assert(
      repeatSummary.created.length === 0 && repeatSummary.maintained.length === 1,
      '5.3 Repeated breach deduplicated: zero new alerts, exactly one maintained'
    );

    // 5.4 Verify breachCount incremented and value updated
    const activeAlertDoc = await models.Alert.findById(activeAlertId);
    ctx.assert(
      activeAlertDoc && activeAlertDoc.breachCount >= 2 && activeAlertDoc.value === 9.4,
      '5.4 Active alert breachCount incremented and value updated'
    );

    // 5.5 Safe recovery reading -> transitions alert to Resolved
    const recoveryReading = await createReadingDoc(testNodeId, 7.3);
    const recoveryEval = {
      hasBreach: false,
      breachedParameters: [],
      overallStatus: 'Safe',
      parameters: {
        pH: { evaluated: true, breach: false, value: 7.3, minimum: 6.5, maximum: 8.5 }
      }
    };
    const recoverySummary = await alertService.processReadingAlerts(recoveryReading, recoveryEval);
    ctx.assert(
      recoverySummary.resolved.length === 1,
      '5.5 Safe recovery transitions existing active alert to Resolved'
    );

    const resolvedAlertDoc = await models.Alert.findById(activeAlertId);
    ctx.assert(
      resolvedAlertDoc.status === 'Resolved' && resolvedAlertDoc.resolvedAt !== null,
      '5.6 Resolved alert retains resolvedAt timestamp in MongoDB'
    );

    // 5.7 Subsequent re-breach creates brand NEW alert with distinct ID
    const rebreachReading = await createReadingDoc(testNodeId, 9.5);
    const rebreachEval = {
      hasBreach: true,
      breachedParameters: ['pH'],
      overallStatus: 'Unsafe',
      parameters: {
        pH: {
          evaluated: true,
          breach: true,
          direction: 'HIGH',
          value: 9.5,
          minimum: 6.5,
          maximum: 8.5
        }
      }
    };
    const rebreachSummary = await alertService.processReadingAlerts(rebreachReading, rebreachEval);
    ctx.assert(
      rebreachSummary.created.length === 1 && rebreachSummary.created[0]._id.toString() !== activeAlertId.toString(),
      '5.7 Re-breach after resolution creates brand NEW alert with unique ID'
    );

    // 5.8 Parameter independence: Turbidity breach creates separate alert alongside pH
    const turbBreachReading = await createReadingDoc(testNodeId, 7.2, 8.5);
    const turbBreachEval = {
      hasBreach: true,
      breachedParameters: ['turbidity'],
      overallStatus: 'Unsafe',
      parameters: {
        turbidity: {
          evaluated: true,
          breach: true,
          direction: 'HIGH',
          value: 8.5,
          minimum: 0.0,
          maximum: 5.0
        }
      }
    };
    const turbSummary = await alertService.processReadingAlerts(turbBreachReading, turbBreachEval);
    ctx.assert(
      turbSummary.created.length === 1 && turbSummary.created[0].parameter === 'turbidity',
      '5.8 Parameter independence: Turbidity breach creates distinct alert'
    );

    // 5.9 Node independence: Different node creates separate alert
    const node2BreachReading = await createReadingDoc(testNode2Id, 9.3);
    const node2Summary = await alertService.processReadingAlerts(node2BreachReading, breachEval);
    ctx.assert(
      node2Summary.created.length === 1 && node2Summary.created[0].nodeId === testNode2Id,
      '5.9 Node independence: Different sensor node creates distinct alert'
    );

    // 5.10 Direction independence: LOW direction vs HIGH direction
    const lowPhReading = await createReadingDoc(testNode2Id, 5.2);
    const lowPhEval = {
      hasBreach: true,
      breachedParameters: ['pH'],
      overallStatus: 'Unsafe',
      parameters: {
        pH: {
          evaluated: true,
          breach: true,
          direction: 'LOW',
          value: 5.2,
          minimum: 6.5,
          maximum: 8.5
        }
      }
    };
    const lowPhSummary = await alertService.processReadingAlerts(lowPhReading, lowPhEval);
    ctx.assert(
      lowPhSummary.created.length === 1 && lowPhSummary.created[0].direction === 'LOW',
      '5.10 Direction independence: LOW breach handled with direction: "LOW"'
    );

  } finally {
    await models.Alert.deleteMany({ nodeId: { $in: [testNodeId, testNode2Id] } });
    await models.Reading.deleteMany({ _id: { $in: createdReadingIds } });
    await ctx.teardown();
  }

  return { suite: ctx.suiteName, passed: ctx.passed, failed: ctx.failed };
}

if (require.main === module) {
  runAlertsSuite().then((res) => {
    TestContext.disconnectDb().then(() => {
      process.exit(res.failed > 0 ? 1 : 0);
    });
  });
}

module.exports = { runAlertsSuite };
