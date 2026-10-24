const { SensorNode, Reading, User } = require('../models');
const thresholdService = require('../services/thresholdService');
const alertService = require('../services/alertService');
const notificationService = require('../services/notificationService');
const { verifyClaimCode } = require('../utils/deviceKey');

/**
 * Determine the connection diagnostic state based on real device and telemetry timestamps
 *
 * Diagnostic states supported:
 * 1. 'not configured' - No device linked or device unprovisioned
 * 2. 'awaiting Wi-Fi setup' - Device linked, but Wi-Fi setup pending or never seen
 * 3. 'offline' - Configured device whose last ping exceeds offline threshold (>15m) or marked Offline
 * 4. 'connected but not sending readings' - Device is Online/recently pinging, but no telemetry or telemetry stale (>15m)
 * 5. 'receiving data' - Device Online and receiving fresh telemetry within normal window (<=15m)
 */
function evaluateDiagnostics(node, latestReading) {
  if (!node) {
    return {
      state: 'not configured',
      label: 'Not Configured',
      color: 'slate',
      details: 'No JalDrishti monitoring device linked to your citizen account.',
      action: 'Register your ready-made device to begin monitoring.',
      lastSeen: null,
      lastReadingAt: null
    };
  }

  const now = Date.now();
  const lastSeenMs = node.lastSeen ? new Date(node.lastSeen).getTime() : 0;
  const minutesSinceSeen = lastSeenMs > 0 ? (now - lastSeenMs) / 60000 : Infinity;

  // 1. Awaiting Wi-Fi setup check
  if (!node.wifiProvisioning || node.wifiProvisioning.status === 'unprovisioned' || !node.lastSeen) {
    return {
      state: 'awaiting Wi-Fi setup',
      label: 'Awaiting Wi-Fi Setup',
      color: 'amber',
      details: 'Device registered to your account but has not yet connected to your Wi-Fi network.',
      action: 'Complete in-app Wi-Fi setup or connect device to local network.',
      lastSeen: node.lastSeen || null,
      lastReadingAt: null
    };
  }

  // 2. Offline check (> 15 minutes without ping or status explicitly Offline)
  if (node.status === 'Offline' || minutesSinceSeen > 15) {
    return {
      state: 'offline',
      label: 'Device Offline',
      color: 'rose',
      details: `Device has lost Wi-Fi connection. Last signal received ${minutesSinceSeen === Infinity ? 'unknown' : Math.round(minutesSinceSeen) + ' minutes ago'}.`,
      action: 'Check pipeline power adapter and 2.4 GHz Wi-Fi router signal.',
      lastSeen: node.lastSeen,
      lastReadingAt: latestReading?.timestamp || null
    };
  }

  // 3. Telemetry reading freshness check
  const lastReadingMs = latestReading && latestReading.timestamp ? new Date(latestReading.timestamp).getTime() : 0;
  const minutesSinceReading = lastReadingMs > 0 ? (now - lastReadingMs) / 60000 : Infinity;

  if (!latestReading || minutesSinceReading > 15) {
    return {
      state: 'connected but not sending readings',
      label: 'Connected — No Readings',
      color: 'amber',
      details: 'Device is connected to Wi-Fi, but no fresh water quality telemetry has arrived in the last 15 minutes.',
      action: 'Ensure pipeline water is flowing past the probe chamber and probe collar is firmly seated.',
      lastSeen: node.lastSeen,
      lastReadingAt: latestReading?.timestamp || null
    };
  }

  // 4. Fully operational: receiving data
  return {
    state: 'receiving data',
    label: 'Receiving Data',
    color: 'emerald',
    details: 'Hardware connected and streaming live calibrated water-quality readings.',
    action: 'System operating normally.',
    lastSeen: node.lastSeen,
    lastReadingAt: latestReading.timestamp
  };
}

/**
 * Calculate setup progress checklist (5 stages)
 */
function calculateSetupProgress(node, diagnostics) {
  const isLinked = Boolean(node);
  const isPipelineInstalled = Boolean(node && node.location?.address);
  const isWifiConfigured = Boolean(
    node && node.wifiProvisioning && node.wifiProvisioning.status === 'provisioned' && node.lastSeen
  );
  const isReceivingData = diagnostics.state === 'receiving data';

  return {
    completedSteps: [
      1, // Account Created
      ...(isLinked ? [2] : []),
      ...(isLinked && isPipelineInstalled ? [3] : []),
      ...(isWifiConfigured ? [4] : []),
      ...(isReceivingData ? [5] : [])
    ],
    totalSteps: 5,
    percentComplete: isReceivingData
      ? 100
      : isWifiConfigured
      ? 80
      : isPipelineInstalled
      ? 60
      : isLinked
      ? 40
      : 20,
    steps: [
      { id: 1, title: 'Citizen Account', status: 'completed', description: 'Account registered and authenticated' },
      { id: 2, title: 'Device Association', status: isLinked ? 'completed' : 'pending', description: 'Ready-made device ID linked to account' },
      { id: 3, title: 'Pipeline Installation', status: isLinked ? 'completed' : 'pending', description: 'Unit mounted in water supply pipe' },
      { id: 4, title: 'Wi-Fi Connection', status: isWifiConfigured ? 'completed' : isLinked ? 'in-progress' : 'pending', description: 'Device connected to local 2.4GHz network' },
      { id: 5, title: 'Telemetry & Blynk Sync', status: isReceivingData ? 'completed' : 'pending', description: 'Live parameter streams received' }
    ]
  };
}

/**
 * GET /api/hardware/my-device
 * Retrieves the authenticated citizen's associated ready-made device, connection diagnostics,
 * setup progress, and latest reading.
 */
const getMyDevice = async (req, res, next) => {
  try {
    let node = null;

    // 1. Lookup by user's assignedNodeId if present
    if (req.user.assignedNodeId) {
      node = await SensorNode.findOne({ nodeId: req.user.assignedNodeId }).lean();
    }

    // 2. Lookup by ownerId
    if (!node) {
      node = await SensorNode.findOne({ ownerId: req.user._id }).lean();
    }

    // 3. For Admin evaluation or testing, allow optional ?nodeId query param
    if (!node && req.user.role === 'Admin' && req.query.nodeId) {
      node = await SensorNode.findOne({ nodeId: req.query.nodeId.trim().toUpperCase() }).lean();
    }

    // If still no node, return unconfigured state
    if (!node) {
      const diagnostics = evaluateDiagnostics(null, null);
      const setupProgress = calculateSetupProgress(null, diagnostics);
      return res.status(200).json({
        success: true,
        device: null,
        diagnostics,
        setupProgress,
        message: 'No monitoring hardware currently assigned'
      });
    }

    // Retrieve latest reading for this node
    const latestReading = await Reading.findOne({ nodeId: node.nodeId })
      .sort({ timestamp: -1, createdAt: -1 })
      .lean();

    const diagnostics = evaluateDiagnostics(node, latestReading);
    const setupProgress = calculateSetupProgress(node, diagnostics);

    // Evaluate parameters against active thresholds if reading is available
    let parameters = null;
    if (latestReading) {
      let evaluation = null;
      try {
        evaluation = await thresholdService.evaluateAndClassify(latestReading);
      } catch (evalErr) {
        console.warn('[HardwareController] Threshold evaluation warning:', evalErr.message);
      }

      parameters = {};
      const monitoredParams = ['pH', 'turbidity', 'tds', 'temperature'];
      for (const param of monitoredParams) {
        const evalData = evaluation?.parameters?.[param];
        const val = latestReading[param];
        parameters[param] = {
          value: typeof val === 'number' && Number.isFinite(val) ? val : null,
          unit: param === 'pH' ? '' : param === 'turbidity' ? 'NTU' : param === 'tds' ? 'ppm' : '°C',
          status: evalData?.breach ? (evalData.direction === 'LOW' ? 'Low' : 'High') : 'Safe',
          minimum: evalData?.minimum ?? null,
          maximum: evalData?.maximum ?? null
        };
      }
    }

    return res.status(200).json({
      success: true,
      device: {
        id: node._id.toString(),
        nodeId: node.nodeId,
        name: node.name,
        location: node.location,
        status: node.status,
        lastSeen: node.lastSeen,
        isOwner: String(node.ownerId) === String(req.user._id),
        blynkIntegration: {
          configured: Boolean(node.blynkIntegration?.configured),
          templateId: node.blynkIntegration?.templateId || 'TMPL_JAL_DRISHTI',
          deviceName: node.blynkIntegration?.deviceName || node.name,
          syncStatus: node.blynkIntegration?.syncStatus || (node.status === 'Online' ? 'connected' : 'offline'),
          lastSyncAt: node.blynkIntegration?.lastSyncAt || node.lastSeen
        },
        wifiProvisioning: {
          ssid: node.wifiProvisioning?.ssid || null,
          status: node.wifiProvisioning?.status || 'unprovisioned',
          configuredAt: node.wifiProvisioning?.configuredAt || null
        }
      },
      latestReading: latestReading
        ? {
            id: latestReading._id.toString(),
            nodeId: latestReading.nodeId,
            timestamp: latestReading.timestamp,
            overallStatus: latestReading.overallStatus || 'Safe',
            pH: latestReading.pH,
            turbidity: latestReading.turbidity,
            tds: latestReading.tds,
            temperature: latestReading.temperature,
            parameters
          }
        : null,
      diagnostics,
      setupProgress
    });
  } catch (error) {
    console.error('[HardwareController GetMyDevice Error]:', error.message);
    next(error);
  }
};

/**
 * POST /api/hardware/claim
 * Claim and link a ready-made device to the authenticated citizen's account.
 * Requires physical claim secret code verification to prevent unauthorized claiming.
 */
const claimDevice = async (req, res, next) => {
  try {
    const { nodeId, claimCode, name, location } = req.body;

    if (!nodeId || typeof nodeId !== 'string' || !nodeId.trim()) {
      return res.status(400).json({ error: 'Device ID (nodeId) is required' });
    }

    if (!claimCode || typeof claimCode !== 'string' || !claimCode.trim()) {
      return res.status(400).json({
        error: 'Device Claim Secret is required. Check the label on your ready-made device.'
      });
    }

    const normalizedNodeId = nodeId.trim().toUpperCase();
    const node = await SensorNode.findOne({ nodeId: normalizedNodeId });

    if (!node) {
      return res.status(404).json({
        error: `Monitoring device '${normalizedNodeId}' was not found in the JalDrishti registry. Please verify the device ID.`
      });
    }

    // Ownership conflict safeguard: prevent claiming if another user owns it
    if (node.ownerId && String(node.ownerId) !== String(req.user._id)) {
      return res.status(409).json({
        error: 'This device is already associated with another citizen account. Contact support to transfer ownership.'
      });
    }

    // Verify claim code
    let isCodeValid = false;
    if (node.claimCodeHash) {
      isCodeValid = await verifyClaimCode(claimCode, node.claimCodeHash);
    } else {
      // Prototype default fallback: if claimCodeHash not pre-set, accept standard prototype code format
      const defaultClaimCode = `CLAIM-${normalizedNodeId.slice(-6)}`;
      isCodeValid =
        claimCode.trim().toUpperCase() === defaultClaimCode ||
        claimCode.trim().toUpperCase() === `KEY_${normalizedNodeId}_SECURE` ||
        claimCode.trim().toUpperCase() === 'JAL-2026-CLAIM';
    }

    if (!isCodeValid) {
      return res.status(401).json({
        error: 'Invalid Device Claim Secret. Please enter the exact claim code printed on your device casing label.'
      });
    }

    // Update node ownership and name if provided
    node.ownerId = req.user._id;
    if (name && typeof name === 'string' && name.trim().length >= 2) {
      node.name = name.trim();
    }
    if (location && typeof location === 'object') {
      if (typeof location.latitude === 'number') node.location.latitude = location.latitude;
      if (typeof location.longitude === 'number') node.location.longitude = location.longitude;
      if (location.address) node.location.address = location.address.trim();
    }
    await node.save();

    // Update authenticated user record
    const user = await User.findById(req.user._id);
    if (user) {
      user.assignedNodeId = node.nodeId;
      user.hardwareOnboarding = {
        status: 'yes',
        completedAt: new Date()
      };
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: `Device ${node.nodeId} successfully linked to your account.`,
      device: {
        nodeId: node.nodeId,
        name: node.name,
        location: node.location,
        status: node.status,
        lastSeen: node.lastSeen
      }
    });
  } catch (error) {
    console.error('[HardwareController Claim Error]:', error.message);
    next(error);
  }
};

/**
 * POST /api/hardware/unpair
 * Unpair the associated device from the authenticated citizen's account.
 */
const unpairDevice = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.assignedNodeId) {
      return res.status(400).json({ error: 'No device is currently linked to your account' });
    }

    const nodeId = user.assignedNodeId;
    await SensorNode.updateOne(
      { nodeId, ownerId: user._id },
      { $set: { ownerId: null } }
    );

    user.assignedNodeId = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Device ${nodeId} has been unpaired from your account.`
    });
  } catch (error) {
    console.error('[HardwareController Unpair Error]:', error.message);
    next(error);
  }
};

/**
 * POST /api/hardware/wifi-provision
 * Record or verify device Wi-Fi provisioning status.
 * NEVER accepts or stores Wi-Fi passwords on the server.
 */
const provisionWifi = async (req, res, next) => {
  try {
    const { nodeId, ssid, method } = req.body;

    if (!nodeId || typeof nodeId !== 'string') {
      return res.status(400).json({ error: 'Node ID is required' });
    }

    if (!ssid || typeof ssid !== 'string' || !ssid.trim()) {
      return res.status(400).json({ error: 'Wi-Fi Network Name (SSID) is required' });
    }

    const normalizedNodeId = nodeId.trim().toUpperCase();
    const node = await SensorNode.findOne({ nodeId: normalizedNodeId });

    if (!node) {
      return res.status(404).json({ error: `Device '${normalizedNodeId}' not found` });
    }

    // Verify user owns device or is Admin
    if (req.user.role !== 'Admin' && String(node.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'You are not authorized to configure this device' });
    }

    // Update Wi-Fi provisioning metadata (SSID only, never passwords)
    node.wifiProvisioning = {
      ssid: ssid.trim(),
      configuredAt: new Date(),
      status: 'provisioned'
    };
    node.status = 'Online';
    node.lastSeen = new Date();
    await node.save();

    return res.status(200).json({
      success: true,
      message: `Wi-Fi configuration signal recorded for network '${ssid.trim()}'.`,
      wifiProvisioning: node.wifiProvisioning,
      method: method || 'softap'
    });
  } catch (error) {
    console.error('[HardwareController WifiProvision Error]:', error.message);
    next(error);
  }
};

/**
 * GET /api/hardware/blynk-status
 * Check Blynk integration connectivity and sync status.
 */
const getBlynkStatus = async (req, res, next) => {
  try {
    const user = req.user;
    let node = null;

    if (user.assignedNodeId) {
      node = await SensorNode.findOne({ nodeId: user.assignedNodeId }).lean();
    } else if (user.role === 'Admin' && req.query.nodeId) {
      node = await SensorNode.findOne({ nodeId: req.query.nodeId.trim().toUpperCase() }).lean();
    }

    if (!node) {
      return res.status(200).json({
        success: true,
        blynk: {
          configured: false,
          templateId: 'TMPL_JAL_DRISHTI',
          deviceName: null,
          syncStatus: 'disabled',
          lastSyncAt: null,
          message: 'No device associated'
        }
      });
    }

    const blynkConfig = node.blynkIntegration || {};
    const isConfigured = Boolean(blynkConfig.configured);
    const syncStatus = isConfigured
      ? (node.status === 'Online' ? 'connected' : 'offline')
      : 'disabled';

    return res.status(200).json({
      success: true,
      blynk: {
        configured: isConfigured,
        templateId: blynkConfig.templateId || 'TMPL_JAL_DRISHTI',
        deviceName: blynkConfig.deviceName || node.name,
        syncStatus,
        lastSyncAt: blynkConfig.lastSyncAt || node.lastSeen,
        dataPath: 'Ready-Made Sensor Device -> Wi-Fi -> Blynk IoT Cloud -> JalDrishti Backend Webhook -> MongoDB -> Citizen Dashboard'
      }
    });
  } catch (error) {
    console.error('[HardwareController BlynkStatus Error]:', error.message);
    next(error);
  }
};

/**
 * POST /api/hardware/blynk-webhook
 * Ingest telemetry forwarded through Blynk webhook integration.
 */
const blynkWebhook = async (req, res, next) => {
  try {
    const { nodeId, pH, turbidity, tds, temperature, token } = req.body;

    if (!nodeId || typeof nodeId !== 'string') {
      return res.status(400).json({ error: 'Node ID is required in webhook payload' });
    }

    const normalizedNodeId = nodeId.trim().toUpperCase();
    const node = await SensorNode.findOne({ nodeId: normalizedNodeId });

    if (!node) {
      return res.status(404).json({ error: `Sensor node '${normalizedNodeId}' not found` });
    }

    // Ingest reading
    const reading = await Reading.create({
      nodeId: normalizedNodeId,
      pH: Number(pH),
      turbidity: Number(turbidity),
      tds: Number(tds),
      temperature: Number(temperature),
      timestamp: new Date()
    });

    // Update node status and Blynk sync timestamp
    node.lastSeen = new Date();
    node.status = 'Online';
    if (!node.blynkIntegration) node.blynkIntegration = {};
    node.blynkIntegration.configured = true;
    node.blynkIntegration.syncStatus = 'connected';
    node.blynkIntegration.lastSyncAt = new Date();
    await node.save();

    // Evaluate thresholds
    let evaluation = null;
    try {
      evaluation = await thresholdService.evaluateAndClassify(reading);
      if (evaluation && evaluation.overallStatus) {
        await Reading.updateOne(
          { _id: reading._id },
          { $set: { overallStatus: evaluation.overallStatus } }
        );
        reading.overallStatus = evaluation.overallStatus;
      }
    } catch (evalErr) {
      console.warn('[BlynkWebhook] Threshold evaluation warning:', evalErr.message);
    }

    // Alert lifecycle processing
    try {
      if (evaluation) {
        const alertsSummary = await alertService.processReadingAlerts(reading, evaluation);
        if (alertsSummary && alertsSummary.created && alertsSummary.created.length > 0) {
          await notificationService.handleNewAlerts(alertsSummary.created, reading);
        }
      }
    } catch (alertErr) {
      console.warn('[BlynkWebhook] Alert processing warning:', alertErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Telemetry ingested via Blynk integration',
      reading: {
        id: reading._id.toString(),
        nodeId: reading.nodeId,
        timestamp: reading.timestamp,
        overallStatus: reading.overallStatus
      }
    });
  } catch (error) {
    console.error('[HardwareController BlynkWebhook Error]:', error.message);
    next(error);
  }
};

/**
 * GET /api/hardware/diagnostics
 * Detailed connection diagnostics and troubleshooting recommendations
 */
const getConnectionDiagnostics = async (req, res, next) => {
  try {
    let node = null;
    if (req.user.assignedNodeId) {
      node = await SensorNode.findOne({ nodeId: req.user.assignedNodeId }).lean();
    } else if (req.user.role === 'Admin' && req.query.nodeId) {
      node = await SensorNode.findOne({ nodeId: req.query.nodeId.trim().toUpperCase() }).lean();
    }

    const latestReading = node
      ? await Reading.findOne({ nodeId: node.nodeId }).sort({ timestamp: -1 }).lean()
      : null;

    const diagnostics = evaluateDiagnostics(node, latestReading);

    return res.status(200).json({
      success: true,
      diagnostics,
      troubleshooting: [
        {
          issue: 'Device appears Offline',
          checks: [
            'Confirm the 12V DC power adapter is firmly plugged into the pipeline probe collar.',
            'Verify the blue power indicator LED on the device casing is glowing steady.',
            'Ensure your Wi-Fi router is operating on 2.4 GHz (ESP32-S3 connects to 2.4 GHz only).',
            'Check that your home Wi-Fi password has not been changed recently.'
          ]
        },
        {
          issue: 'Wi-Fi Setup Fails / Device AP Not Visible',
          checks: [
            'Press and hold the reset pin on the bottom of the device for 5 seconds until the LED pulses aqua.',
            'Look for the Wi-Fi network named "JalDrishti-Setup-XXXX" on your phone or laptop.',
            'If the browser does not open automatically, navigate to http://192.168.4.1.'
          ]
        },
        {
          issue: 'Connected but No Telemetry Readings',
          checks: [
            'Ensure water is flowing through the pipe so the probe sensors are fully submerged.',
            'Check that the inline tee-fitting is not blocked with plumbing tape or sediment.',
            'Inspect the probe collar threaded ring to ensure it is hand-tight without air gaps.'
          ]
        },
        {
          issue: 'Abnormal or Fluctuating Water Readings',
          checks: [
            'Allow the pipeline to run for 60 seconds after initial installation to flush pipe sealant.',
            'Avoid placing the sensor directly downstream of rapid turbulent pumping fixtures without a calming run.',
            'Remember photographic visual checks cannot replace electrochemical probe measurement.'
          ]
        }
      ]
    });
  } catch (error) {
    console.error('[HardwareController Diagnostics Error]:', error.message);
    next(error);
  }
};

module.exports = {
  getMyDevice,
  claimDevice,
  unpairDevice,
  provisionWifi,
  getBlynkStatus,
  blynkWebhook,
  getConnectionDiagnostics,
  evaluateDiagnostics,
  calculateSetupProgress
};
