const app = require('./src/app');
const env = require('./src/config/env');
const { connectDB, disconnectDB } = require('./src/config/db');

const PORT = env.PORT;

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.warn(`[JalDrishti Warning] Initial MongoDB connection failed: ${error.message}`);
    console.warn('[JalDrishti Warning] Server will continue running; background reconnection listeners active.');
  }

  const server = app.listen(PORT, () => {
    console.log(`[JalDrishti] Server listening on port ${PORT} in ${env.NODE_ENV} mode`);
    console.log(`[JalDrishti] Health check available at: http://localhost:${PORT}/health`);
  });

  // Handle server startup errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`[JalDrishti Error] Port ${PORT} is already in use.`);
    } else {
      console.error('[JalDrishti Error] Failed to start server:', error.message);
    }
    process.exit(1);
  });

  // Graceful shutdown handling
  const handleShutdown = async (signal) => {
    console.log(`\n[JalDrishti] Received ${signal}. Shutting down gracefully...`);
    try {
      await disconnectDB();
    } catch (err) {
      console.error('[JalDrishti Error] Error disconnecting DB:', err.message);
    }
    server.close(() => {
      console.log('[JalDrishti] Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer();
