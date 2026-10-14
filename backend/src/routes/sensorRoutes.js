const express = require('express');
const { authenticateDevice } = require('../middleware/deviceAuthMiddleware');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validateSensorReading } = require('../validators/sensorValidator');
const sensorController = require('../controllers/sensorController');

const router = express.Router();

// IoT Sensor Ingestion Endpoints (Device Auth)
// Supports both plural and singular routes: POST /api/sensor/readings and POST /api/sensor/reading
router.post('/readings', authenticateDevice, validateSensorReading, sensorController.ingestReading);
router.post('/reading', authenticateDevice, validateSensorReading, sensorController.ingestReading);

// Authenticated Read Endpoints for Citizens & Admins (Bearer Token Auth)
router.get('/readings/latest', authenticate, requireRole(['Citizen', 'Admin']), sensorController.getLatestReading);
router.get('/latest', authenticate, requireRole(['Citizen', 'Admin']), sensorController.getLatestReading);
router.get('/readings/history', authenticate, requireRole(['Citizen', 'Admin']), sensorController.getHistoricalReadings);
router.get('/history', authenticate, requireRole(['Citizen', 'Admin']), sensorController.getHistoricalReadings);
router.get('/nodes', authenticate, requireRole(['Citizen', 'Admin']), sensorController.getSensorNodes);

// Admin-only Sensor Node Management Endpoints (Bearer Token Auth + Admin Role)
router.post('/nodes', authenticate, requireRole(['Admin']), sensorController.createSensorNode);
router.patch('/nodes/:nodeId', authenticate, requireRole(['Admin']), sensorController.updateSensorNode);
router.delete('/nodes/:nodeId', authenticate, requireRole(['Admin']), sensorController.deleteSensorNode);

module.exports = router;
