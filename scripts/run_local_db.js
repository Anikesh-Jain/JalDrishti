const { MongoMemoryServer } = require('../backend/node_modules/mongodb-memory-server');

async function startLocalDatabase() {
  try {
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'jaldrishti'
      }
    });

    console.log(`[JalDrishti Local DB] MongoDB 8.2.6 Daemon Started Successfully!`);
    console.log(`[JalDrishti Local DB] Connection URI: ${mongod.getUri()}`);
    console.log(`[JalDrishti Local DB] Ready for connections on port 27017.`);

    const handleExit = async () => {
      console.log('\n[JalDrishti Local DB] Shutting down MongoDB daemon...');
      await mongod.stop();
      console.log('[JalDrishti Local DB] Stopped.');
      process.exit(0);
    };

    process.on('SIGINT', handleExit);
    process.on('SIGTERM', handleExit);
  } catch (err) {
    if (err.message.includes('EADDRINUSE') || err.message.includes('Port 27017')) {
      console.log('[JalDrishti Local DB] Port 27017 is already in use by an existing MongoDB instance.');
    } else {
      console.error('[JalDrishti Local DB Error]:', err.message);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  startLocalDatabase();
}

module.exports = { startLocalDatabase };
