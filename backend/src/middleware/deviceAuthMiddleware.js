const { SensorNode } = require('../models');
const { verifyDeviceKey } = require('../utils/deviceKey');

/**
 * Middleware to authenticate IoT sensor node requests via x-device-key header.
 *
 * Verifies:
 * 1. Presence of x-device-key header (401 if missing)
 * 2. Presence of nodeId in request body (400 if missing)
 * 3. Existence of referenced SensorNode (404 if not found)
 * 4. Validity of device key against stored deviceKeyHash (401 if invalid)
 * 5. Operational status of SensorNode (403 if status !== 'Online')
 */
const authenticateDevice = async (req, res, next) => {
  try {
    const rawDeviceKey = req.headers['x-device-key'];

    // 1. Validate device key header presence
    if (!rawDeviceKey || typeof rawDeviceKey !== 'string' || !rawDeviceKey.trim()) {
      return res.status(401).json({
        error: 'Missing device authentication credential in x-device-key header'
      });
    }

    // 2. Validate nodeId presence in payload
    const rawNodeId = req.body && req.body.nodeId;
    if (!rawNodeId || typeof rawNodeId !== 'string' || !rawNodeId.trim()) {
      return res.status(400).json({
        error: 'Node ID (nodeId) is required in request payload'
      });
    }

    const normalizedNodeId = rawNodeId.trim().toUpperCase();

    // 3. Lookup SensorNode by nodeId
    const sensorNode = await SensorNode.findOne({ nodeId: normalizedNodeId });
    if (!sensorNode) {
      return res.status(404).json({
        error: `Sensor node '${normalizedNodeId}' not found`
      });
    }

    // 4. Verify device key
    const isKeyValid = await verifyDeviceKey(rawDeviceKey, sensorNode.deviceKeyHash);
    if (!isKeyValid) {
      return res.status(401).json({
        error: 'Invalid device authentication credential'
      });
    }

    // 5. Verify SensorNode operational status
    if (sensorNode.status !== 'Online') {
      return res.status(403).json({
        error: `Sensor node '${normalizedNodeId}' is not active (current status: ${sensorNode.status})`
      });
    }

    // Attach validated sensor node to request
    req.sensorNode = sensorNode;
    next();
  } catch (error) {
    console.error('[DeviceAuthMiddleware Error]:', error.message);
    next(error);
  }
};

module.exports = {
  authenticateDevice
};
