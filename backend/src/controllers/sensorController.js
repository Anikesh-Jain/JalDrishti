const { Reading, SensorNode } = require('../models');
const thresholdService = require('../services/thresholdService');
const alertService = require('../services/alertService');
const notificationService = require('../services/notificationService');
const { maskPhoneNumber } = require('../services/notificationConfigService');
const { hashDeviceKey } = require('../utils/deviceKey');

/**
 * Ingest and persist a validated IoT water-quality reading.
 * POST /api/sensor/readings
 */
const ingestReading = async (req, res, next) => {
  try {
    const readingData = req.validatedReading;

    // 1. Create and persist Reading document in MongoDB
    const reading = await Reading.create({
      nodeId: readingData.nodeId,
      pH: readingData.pH,
      turbidity: readingData.turbidity,
      tds: readingData.tds,
      temperature: readingData.temperature,
      timestamp: readingData.timestamp
    });

    // 2. Update SensorNode lastSeen timestamp
    await SensorNode.updateOne(
      { _id: req.sensorNode._id },
      { $set: { lastSeen: new Date() } }
    );

    // 3. Phase 8: Evaluate reading against active configured thresholds
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
    } catch (evalError) {
      console.warn('[SensorController] Threshold evaluation warning:', evalError.message);
    }

    // 4. Phase 9: Alert lifecycle & debounce processing
    let alertsSummary = null;
    try {
      if (evaluation) {
        alertsSummary = await alertService.processReadingAlerts(reading, evaluation);
      }
    } catch (alertError) {
      console.warn('[SensorController] Alert lifecycle warning:', alertError.message);
    }

    // 5. Phase 10: Notification dispatch for newly created active alerts
    let notificationsSummary = null;
    try {
      if (alertsSummary && alertsSummary.created && alertsSummary.created.length > 0) {
        notificationsSummary = await notificationService.handleNewAlerts(alertsSummary.created, reading);
      }
    } catch (notifError) {
      console.warn('[SensorController] Notification dispatch warning:', notifError.message);
    }

    // 6. Return minimal, sanitized success response
    return res.status(201).json({
      success: true,
      message: 'Sensor reading recorded successfully',
      reading: {
        id: reading._id.toString(),
        nodeId: reading.nodeId,
        timestamp: reading.timestamp,
        pH: reading.pH,
        turbidity: reading.turbidity,
        tds: reading.tds,
        temperature: reading.temperature,
        overallStatus: reading.overallStatus
      },
      evaluation: evaluation ? {
        hasBreach: evaluation.hasBreach,
        breachedParameters: evaluation.breachedParameters,
        overallStatus: evaluation.overallStatus
      } : null,
      alerts: alertsSummary ? {
        createdCount: alertsSummary.created.length,
        maintainedCount: alertsSummary.maintained.length,
        resolvedCount: alertsSummary.resolved.length,
        created: alertsSummary.created.map((a) => ({
          id: a._id.toString(),
          parameter: a.parameter,
          direction: a.direction,
          status: a.status
        })),
        resolved: alertsSummary.resolved.map((a) => ({
          id: a._id.toString(),
          parameter: a.parameter,
          direction: a.direction,
          status: a.status
        }))
      } : null,
      notifications: notificationsSummary ? {
        sentCount: notificationsSummary.filter((n) => n.deliveryStatus === 'Sent').length,
        failedCount: notificationsSummary.filter((n) => n.deliveryStatus === 'Failed').length,
        total: notificationsSummary.length,
        items: notificationsSummary.map((n) => ({
          id: n._id ? n._id.toString() : null,
          alertId: n.alertId ? n.alertId.toString() : null,
          recipient: maskPhoneNumber(n.recipient),
          deliveryStatus: n.deliveryStatus,
          channel: n.channel
        }))
      } : null
    });
  } catch (error) {
    console.error('[SensorController Ingestion Error]:', error.message);
    next(error);
  }
};

/**
 * Retrieve the latest available sensor reading with sanitized citizen-safe metadata.
 * GET /api/sensor/readings/latest or GET /api/sensor/latest
 */
const getLatestReading = async (req, res, next) => {
  try {
    const { nodeId } = req.query;
    let reading = null;

    if (nodeId && typeof nodeId === 'string' && nodeId.trim()) {
      reading = await Reading.findOne({ nodeId: nodeId.trim().toUpperCase() })
        .sort({ timestamp: -1, createdAt: -1 })
        .lean();
    } else {
      // Prioritize finding the latest telemetry reading from registered active sensor nodes
      const registeredNodes = await SensorNode.find({}).select('nodeId').lean();
      const registeredNodeIds = registeredNodes.map((n) => n.nodeId);

      if (registeredNodeIds.length > 0) {
        reading = await Reading.findOne({ nodeId: { $in: registeredNodeIds } })
          .sort({ timestamp: -1, createdAt: -1 })
          .lean();
      }

      // If no reading from registered nodes exists, only fall back to non-test readings
      if (!reading) {
        reading = await Reading.findOne({
          nodeId: { $nin: [/^NODE_SEC_/, /^NODE_TEST_/, /^NODE_ACT_/] }
        })
          .sort({ timestamp: -1, createdAt: -1 })
          .lean();
      }
    }

    if (!reading) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No sensor readings available'
      });
    }

    const node = await SensorNode.findOne({ nodeId: reading.nodeId })
      .select('nodeId name location status lastSeen')
      .lean();

    // Phase 16: Authoritative parameter-level status evaluation via backend thresholdService
    let evaluation = null;
    try {
      evaluation = await thresholdService.evaluateAndClassify(reading);
    } catch (evalErr) {
      console.warn('[SensorController] Threshold evaluation warning in getLatestReading:', evalErr.message);
    }

    // Map parameters distinguishing Safe, Low, High, and Unknown
    const parameters = {};
    const monitoredParams = ['pH', 'turbidity', 'tds', 'temperature'];

    for (const param of monitoredParams) {
      const evalData = evaluation?.parameters?.[param];
      const val = reading[param];

      if (evalData && evalData.evaluated && typeof val === 'number' && Number.isFinite(val)) {
        let status = 'Safe';
        if (evalData.breach) {
          status = evalData.direction === 'LOW' ? 'Low' : 'High';
        }
        parameters[param] = {
          value: evalData.value,
          unit: evalData.unit || (param === 'pH' ? '' : param === 'turbidity' ? 'NTU' : param === 'tds' ? 'ppm' : '°C'),
          status,
          minimum: evalData.minimum,
          maximum: evalData.maximum
        };
      } else {
        parameters[param] = {
          value: typeof val === 'number' && Number.isFinite(val) ? val : null,
          unit: param === 'pH' ? '' : param === 'turbidity' ? 'NTU' : param === 'tds' ? 'ppm' : '°C',
          status: 'Unknown',
          minimum: null,
          maximum: null
        };
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        id: reading._id.toString(),
        nodeId: reading.nodeId,
        nodeName: node?.name || (reading.nodeId?.startsWith('NODE_') ? 'Bhagirathpura Supply Point 1' : reading.nodeId),
        location: node?.location || null,
        pH: reading.pH,
        turbidity: reading.turbidity,
        tds: reading.tds,
        temperature: reading.temperature,
        overallStatus: reading.overallStatus || evaluation?.overallStatus || 'Safe',
        timestamp: reading.timestamp || reading.createdAt,
        nodeStatus: node?.status || 'Online',
        nodeLastSeen: node?.lastSeen || null,
        parameters
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve sanitized historical sensor readings with bounded time-range filtering and limit.
 * GET /api/sensor/readings/history or GET /api/sensor/history
 *
 * Query Parameters:
 * - from: ISO date string / epoch (start boundary)
 * - to: ISO date string / epoch (end boundary)
 * - limit: number of records (default: 100, max: 1000)
 * - nodeId: optional sensor node identifier
 */
const getHistoricalReadings = async (req, res, next) => {
  try {
    const { from, to, limit, nodeId } = req.query;

    const filter = {};

    // 1. Time range boundaries
    const timestampFilter = {};
    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate.getTime())) {
        timestampFilter.$gte = fromDate;
      }
    } else {
      // Default boundary: last 24 hours if not explicitly provided
      timestampFilter.$gte = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    if (to) {
      const toDate = new Date(to);
      if (!isNaN(toDate.getTime())) {
        timestampFilter.$lte = toDate;
      }
    }

    if (Object.keys(timestampFilter).length > 0) {
      filter.timestamp = timestampFilter;
    }

    // 2. Optional nodeId filter
    if (nodeId && typeof nodeId === 'string' && nodeId.trim()) {
      filter.nodeId = nodeId.trim().toUpperCase();
    }

    // 3. Query safety: bounded limit enforcement
    const parsedLimit = parseInt(limit, 10);
    const safeLimit = !isNaN(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 1000)
      : 100;

    // Retrieve newest readings within the window, then sort chronologically ascending
    const readings = await Reading.find(filter)
      .sort({ timestamp: -1 })
      .limit(safeLimit)
      .lean();

    // Reverse to chronological order (oldest to newest) for chart plotting
    readings.reverse();

    // 4. Return sanitized payload without internal credentials or hashes
    return res.status(200).json({
      success: true,
      count: readings.length,
      timeRange: {
        from: timestampFilter.$gte || null,
        to: timestampFilter.$lte || null
      },
      data: readings.map((r) => ({
        id: r._id.toString(),
        nodeId: r.nodeId,
        pH: r.pH,
        turbidity: r.turbidity,
        tds: r.tds,
        temperature: r.temperature,
        overallStatus: r.overallStatus || 'Safe',
        timestamp: r.timestamp
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve sanitized sensor nodes list for map visualization (Phase 19).
 * GET /api/sensor/nodes
 */
const getSensorNodes = async (req, res, next) => {
  try {
    const nodes = await SensorNode.find()
      .select('nodeId name location status lastSeen')
      .lean();

    // Map each node to safe, sanitized format ensuring valid coordinates
    const sanitizedNodes = nodes.map((node) => {
      const lat = node.location?.latitude;
      const lng = node.location?.longitude;
      const hasValidCoords =
        typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90 &&
        typeof lng === 'number' && !isNaN(lng) && lng >= -180 && lng <= 180;

      return {
        id: node._id.toString(),
        nodeId: node.nodeId,
        name: node.name,
        location: {
          latitude: hasValidCoords ? lat : null,
          longitude: hasValidCoords ? lng : null,
          address: node.location?.address || ''
        },
        hasValidLocation: hasValidCoords,
        status: node.status || 'Unknown',
        lastSeen: node.lastSeen || null
      };
    });

    return res.status(200).json({
      success: true,
      count: sanitizedNodes.length,
      data: sanitizedNodes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register a new IoT sensor station (Admin-only)
 * POST /api/sensor/nodes
 */
const createSensorNode = async (req, res, next) => {
  try {
    const { nodeId, name, location, status, deviceKey } = req.body;

    if (!nodeId || typeof nodeId !== 'string' || !nodeId.trim()) {
      return res.status(400).json({ error: 'Sensor Node ID is required' });
    }

    const normalizedNodeId = nodeId.trim().toUpperCase();

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Station name must be at least 2 characters long' });
    }

    const lat = location?.latitude;
    const lng = location?.longitude;

    if (typeof lat !== 'number' || isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ error: 'Valid latitude between -90 and 90 is required' });
    }

    if (typeof lng !== 'number' || isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'Valid longitude between -180 and 180 is required' });
    }

    // Check for existing node
    const existing = await SensorNode.findOne({ nodeId: normalizedNodeId });
    if (existing) {
      return res.status(409).json({ error: `Sensor node '${normalizedNodeId}' already exists` });
    }

    const rawKey = deviceKey && typeof deviceKey === 'string' && deviceKey.trim()
      ? deviceKey.trim()
      : `KEY_${normalizedNodeId}_SECURE`;

    const deviceKeyHash = hashDeviceKey(rawKey);
    const validStatus = ['Online', 'Offline', 'Maintenance'].includes(status) ? status : 'Online';

    const newNode = await SensorNode.create({
      nodeId: normalizedNodeId,
      name: name.trim(),
      location: {
        latitude: lat,
        longitude: lng,
        address: location?.address ? location.address.trim() : ''
      },
      deviceKeyHash,
      status: validStatus,
      lastSeen: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Sensor node registered successfully',
      data: {
        id: newNode._id.toString(),
        nodeId: newNode.nodeId,
        name: newNode.name,
        location: newNode.location,
        status: newNode.status,
        lastSeen: newNode.lastSeen
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing sensor station's metadata or status (Admin-only)
 * PATCH /api/sensor/nodes/:nodeId
 */
const updateSensorNode = async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    if (!nodeId || typeof nodeId !== 'string') {
      return res.status(400).json({ error: 'Node ID is required' });
    }

    const normalizedNodeId = nodeId.trim().toUpperCase();
    const node = await SensorNode.findOne({ nodeId: normalizedNodeId });
    if (!node) {
      return res.status(404).json({ error: `Sensor node '${normalizedNodeId}' not found` });
    }

    const { name, location, status, deviceKey } = req.body;

    if (name && typeof name === 'string' && name.trim().length >= 2) {
      node.name = name.trim();
    }

    if (status && ['Online', 'Offline', 'Maintenance'].includes(status)) {
      node.status = status;
    }

    if (location) {
      if (typeof location.latitude === 'number' && !isNaN(location.latitude) && location.latitude >= -90 && location.latitude <= 90) {
        node.location.latitude = location.latitude;
      }
      if (typeof location.longitude === 'number' && !isNaN(location.longitude) && location.longitude >= -180 && location.longitude <= 180) {
        node.location.longitude = location.longitude;
      }
      if (location.address !== undefined) {
        node.location.address = location.address ? location.address.trim() : '';
      }
    }

    if (deviceKey && typeof deviceKey === 'string' && deviceKey.trim()) {
      node.deviceKeyHash = hashDeviceKey(deviceKey.trim());
    }

    await node.save();

    return res.status(200).json({
      success: true,
      message: 'Sensor node updated successfully',
      data: {
        id: node._id.toString(),
        nodeId: node.nodeId,
        name: node.name,
        location: node.location,
        status: node.status,
        lastSeen: node.lastSeen
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Decommission and delete a sensor station (Admin-only)
 * DELETE /api/sensor/nodes/:nodeId
 */
const deleteSensorNode = async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    if (!nodeId || typeof nodeId !== 'string') {
      return res.status(400).json({ error: 'Node ID is required' });
    }

    const normalizedNodeId = nodeId.trim().toUpperCase();
    const node = await SensorNode.findOneAndDelete({ nodeId: normalizedNodeId });
    if (!node) {
      return res.status(404).json({ error: `Sensor node '${normalizedNodeId}' not found` });
    }

    return res.status(200).json({
      success: true,
      message: `Sensor node ${normalizedNodeId} decommissioned successfully`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  ingestReading,
  getLatestReading,
  getHistoricalReadings,
  getSensorNodes,
  createSensorNode,
  updateSensorNode,
  deleteSensorNode
};



