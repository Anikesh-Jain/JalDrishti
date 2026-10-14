const mongoose = require('mongoose');
const env = require('./env');

let isConnected = false;

/**
 * Connect to MongoDB using the configured MONGODB_URI
 */
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    isConnected = conn.connection.readyState === 1;
    console.log(`[JalDrishti DB] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    console.error(`[JalDrishti DB Error] Failed to connect to MongoDB: ${error.message}`);
    throw error;
  }
};

// Event listeners for connection monitoring
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('[JalDrishti DB] Connection established');
});

mongoose.connection.on('error', (err) => {
  console.error(`[JalDrishti DB] Connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('[JalDrishti DB] Disconnected from MongoDB');
});

/**
 * Disconnect from MongoDB gracefully
 */
const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[JalDrishti DB] Connection closed');
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  getConnection: () => mongoose.connection,
  isConnected: () => mongoose.connection.readyState === 1
};
