const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const { apiRateLimiter } = require('./middleware/rateLimitMiddleware');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Disable Express fingerprinting header
app.disable('x-powered-by');

// Security HTTP headers
app.use(helmet());

// Hardened CORS configuration (restricts origins to configured CLIENT_URL and local dev origins)
const parseOrigins = (raw) => {
  if (!raw) return [];
  return raw
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
};

const configuredOrigins = parseOrigins(env.CLIENT_URL);
const devOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

const allowedOriginsSet = new Set([
  ...configuredOrigins,
  ...(env.isProduction ? [] : devOrigins)
]);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, '');
    if (allowedOriginsSet.has(normalizedOrigin)) {
      return callback(null, true);
    }

    // Allow Vercel preview and canonical deployments when a vercel.app origin is configured
    const hasVercelConfigured = Array.from(allowedOriginsSet).some((o) => o.includes('.vercel.app'));
    if (hasVercelConfigured && normalizedOrigin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    return callback(new Error('CORS policy: Access denied for this origin.'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-device-key'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));


// HTTP request logger
if (env.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Protected body parsers with strict size limits to prevent payload-size abuse
app.use(express.json({ limit: env.BODY_LIMIT || '10kb' }));
app.use(express.urlencoded({ extended: true, limit: env.BODY_LIMIT || '10kb' }));

// Root Service Entrypoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to JalDrishti API — IoT Water Quality Monitoring Platform',
    version: 'v1.0.0',
    status: 'operational',
    health: '/health'
  });
});

// Health Check Endpoint (public, lightweight operational check)
app.get('/health', (req, res) => {
  const { isConnected } = require('./config/db');
  res.status(200).json({
    status: 'ok',
    service: 'JalDrishti Backend API',
    database: isConnected() ? 'connected' : 'disconnected',
    environment: env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// General API Rate Limiting for all /api endpoints
app.use('/api', apiRateLimiter);

// Authentication & Identity Routes (Phase 4 & 5)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Sensor Telemetry Ingestion Routes (Phase 7)
const sensorRoutes = require('./routes/sensorRoutes');
app.use('/api/sensor', sensorRoutes);
app.use('/api/sensors', sensorRoutes);

// Threshold Configuration Routes (Phase 8)
const thresholdRoutes = require('./routes/thresholdRoutes');
app.use('/api/thresholds', thresholdRoutes);

// Alert Lifecycle & History Routes (Phase 9)
const alertRoutes = require('./routes/alertRoutes');
app.use('/api/alerts', alertRoutes);

// Notification System & SMS Configuration Routes (Phase 10)
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

// Reporting & CSV Export Routes (Phase 21)
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

// AI Water Image Screening Routes (Phase 23)
const imageCheckRoutes = require('./routes/imageCheckRoutes');
app.use('/api/image-checks', imageCheckRoutes);

// User Management Routes (Admin Only)
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Contact Inquiries Routes (Phase 31 / Follow-up)
const contactRoutes = require('./routes/contactRoutes');
app.use('/api/contact', contactRoutes);

// Citizen Hardware Onboarding & Ready-Made Device Routes
const hardwareRoutes = require('./routes/hardwareRoutes');
app.use('/api/hardware', hardwareRoutes);

// Modular 404 handler for unmatched routes
app.use(notFoundHandler);

// Modular Centralized Error Handler (suppresses stack traces and sensitive details)
app.use(errorHandler);

module.exports = app;
