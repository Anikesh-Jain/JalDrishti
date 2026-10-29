const path = require('path');
const dotenv = require(path.resolve(__dirname, '../backend/node_modules/dotenv'));
const mongoose = require(path.resolve(__dirname, '../backend/node_modules/mongoose'));
const bcrypt = require(path.resolve(__dirname, '../backend/node_modules/bcryptjs'));

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const { SensorNode, Threshold, User, Reading, Alert } = require('../backend/src/models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jaldrishti';

/**
 * Provisional seed defaults for water quality thresholds.
 * As established in IMPLEMENTATION_DECISIONS.md (DEC-09), these values
 * represent configurable provisional defaults derived from BIS IS 10500:2012 references.
 */
const PROVISIONAL_DEFAULT_THRESHOLDS = [
  { parameter: 'pH', minimum: 6.5, maximum: 8.5, unit: 'pH' },
  { parameter: 'turbidity', minimum: 0.0, maximum: 5.0, unit: 'NTU' },
  { parameter: 'tds', minimum: 0.0, maximum: 500.0, unit: 'ppm' },
  { parameter: 'temperature', minimum: 10.0, maximum: 40.0, unit: '°C' }
];

/**
 * Prototype SensorNode metadata matching the 4 Indore monitoring stations
 */
const PROTOTYPE_SENSOR_NODES = [
  {
    nodeId: 'NODE-01-INDORE-WARD12',
    name: 'Station 1 — Bilawali Lake Intake (Indore)',
    location: {
      latitude: 22.6841,
      longitude: 75.8672,
      address: 'Bilawali Lake Water Supply Line, Ward 12, Indore, MP'
    },
    deviceKeyHash: 'dev_device_key_hash_ward12',
    status: 'Online',
    lastSeen: new Date()
  },
  {
    nodeId: 'NODE-02-PIPLIYAPALA',
    name: 'Station 2 — Pipliyapala Regional Lake',
    location: {
      latitude: 22.6896,
      longitude: 75.8458,
      address: 'Pipliyapala Regional Lake Intake, Indore, MP'
    },
    deviceKeyHash: 'dev_device_key_hash_pipliyapala',
    status: 'Online',
    lastSeen: new Date(Date.now() - 5 * 60000)
  },
  {
    nodeId: 'NODE-03-KHAN-RIVER-DIV',
    name: 'Station 3 — Khan River Diversion Canal',
    location: {
      latitude: 22.7625,
      longitude: 75.8412,
      address: 'Sanwer Road Industrial Area Diversion, Indore, MP'
    },
    deviceKeyHash: 'dev_device_key_hash_khan_div',
    status: 'Online',
    lastSeen: new Date(Date.now() - 2 * 60000)
  },
  {
    nodeId: 'NODE-04-SIRPUR-WETLAND',
    name: 'Station 4 — Sirpur Ramsar Wetland',
    location: {
      latitude: 22.6989,
      longitude: 75.8184,
      address: 'Sirpur Bird Sanctuary Reservoir, Dhar Road, Indore, MP'
    },
    deviceKeyHash: 'dev_device_key_hash_sirpur',
    status: 'Online',
    lastSeen: new Date(Date.now() - 8 * 60000)
  }
];

const PROTOTYPE_SENSOR_NODE = PROTOTYPE_SENSOR_NODES[0];

/**
 * Initial Administrator & Citizen User Accounts with Secure Passwords
 */
const INITIAL_USERS = [
  {
    name: 'Anikesh Jain',
    email: 'admin@jaldrishti.org',
    role: 'Admin',
    phone: '+919876543210',
    organization: 'Municipal Water Board',
    status: 'Active',
    password: process.env.INITIAL_ADMIN_PASSWORD || 'Admin@JalDrishti2026!'
  },
  {
    name: 'Akshat Jain',
    email: 'priya@example.com',
    role: 'Citizen',
    phone: '+919812345678',
    organization: 'Ward 12 Resident Association',
    status: 'Active',
    password: 'Citizen@JalDrishti2026!'
  },
  {
    name: 'Rahul Verma',
    email: 'rahul@example.com',
    role: 'Citizen',
    phone: '+919823456789',
    organization: 'Community Health Volunteer',
    status: 'Active',
    password: 'Citizen@JalDrishti2026!'
  },
  {
    name: 'Neha Singh',
    email: 'neha@example.com',
    role: 'Citizen',
    phone: '+919834567890',
    organization: 'Indore Civic Forum',
    status: 'Inactive',
    password: 'Citizen@JalDrishti2026!'
  },
  {
    name: 'Vikram Patel',
    email: 'vikram@example.com',
    role: 'Citizen',
    phone: '+919845678901',
    organization: 'Local Resident',
    status: 'Active',
    password: 'Citizen@JalDrishti2026!'
  }
];

const INITIAL_ADMIN_USER = INITIAL_USERS[0];

async function seedDatabase(customUri, options = {}) {
  const uri = customUri || MONGODB_URI;
  const includeDemo = options.includeDemo || process.argv.includes('--demo');
  const sanitizedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log(`[JalDrishti Seeder] Connecting to database at: ${sanitizedUri}`);
  console.log(`[JalDrishti Seeder] Mode: ${includeDemo ? 'DEMO SEED (includes simulated nodes, users, readings)' : 'PRODUCTION / CLEAN BASELINE (thresholds, hardware node, admin only)'}`);

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
  }

  console.log('[JalDrishti Seeder] Database connection established.');

  // 1. Seed Thresholds (Upsert by parameter name)
  console.log('[JalDrishti Seeder] Seeding configurable threshold records...');
  for (const t of PROVISIONAL_DEFAULT_THRESHOLDS) {
    await Threshold.findOneAndUpdate(
      { parameter: t.parameter },
      { $set: t },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`  - Threshold: ${t.parameter} [${t.minimum} - ${t.maximum} ${t.unit}] (Provisional Default)`);
  }

  // 2. Seed SensorNode(s)
  const nodesToSeed = includeDemo ? PROTOTYPE_SENSOR_NODES : [PROTOTYPE_SENSOR_NODE];
  console.log(`[JalDrishti Seeder] Seeding sensor node(s) (${nodesToSeed.length} node(s))...`);
  for (const node of nodesToSeed) {
    await SensorNode.findOneAndUpdate(
      { nodeId: node.nodeId },
      { $set: node },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`  - Node: ${node.nodeId} (${node.name})`);
  }

  // 3. Seed Users with secure bcrypt password hashing
  const usersToSeed = includeDemo ? INITIAL_USERS : [INITIAL_ADMIN_USER];
  console.log(`[JalDrishti Seeder] Seeding user(s) (${usersToSeed.length} user(s))...`);
  for (const userDef of usersToSeed) {
    const passwordHash = await bcrypt.hash(userDef.password, 10);
    const updateDoc = {
      name: userDef.name,
      email: userDef.email,
      role: userDef.role,
      phone: userDef.phone,
      organization: userDef.organization,
      status: userDef.status,
      passwordHash,
      lastLogin: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 3))
    };

    await User.findOneAndUpdate(
      { email: userDef.email },
      { $set: updateDoc },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`  - User: ${userDef.email} (Role: ${userDef.role}, Status: ${userDef.status})`);
  }

  // 4. Seed Time-Series Telemetry Readings (ONLY in demo mode)
  if (includeDemo) {
    console.log('[JalDrishti Seeder] Checking existing telemetry readings...');
    const readingCount = await Reading.countDocuments({ nodeId: PROTOTYPE_SENSOR_NODE.nodeId });
    if (readingCount < 10) {
      console.log('[JalDrishti Seeder] Seeding initial 24-hour demo telemetry readings...');
      const now = Date.now();
      const readings = [];
      for (let i = 48; i >= 0; i--) {
        const pointTime = new Date(now - i * 30 * 60 * 1000);
        const pH = Number((7.2 + (Math.sin(i / 4) * 0.3) + (Math.random() * 0.1)).toFixed(2));
        const turbidity = Number((2.1 + (Math.cos(i / 5) * 0.6) + (Math.random() * 0.2)).toFixed(2));
        const tds = Math.round(135 + Math.sin(i / 3) * 25 + Math.random() * 10);
        const temperature = Number((22.5 + Math.cos(i / 6) * 1.5 + Math.random() * 0.4).toFixed(1));

        readings.push({
          nodeId: PROTOTYPE_SENSOR_NODE.nodeId,
          pH,
          turbidity,
          tds,
          temperature,
          overallStatus: 'Safe',
          timestamp: pointTime,
          createdAt: pointTime
        });
      }

      const breachTime = new Date(now - 15 * 60 * 1000);
      readings.push({
        nodeId: 'NODE-03-KHAN-RIVER-DIV',
        pH: 8.20,
        turbidity: 5.65,
        tds: 485,
        temperature: 26.2,
        overallStatus: 'Caution',
        timestamp: breachTime,
        createdAt: breachTime
      });

      const inserted = await Reading.insertMany(readings);
      console.log(`  - Inserted ${inserted.length} demo telemetry readings.`);

      const breachReading = inserted[inserted.length - 1];
      await Alert.findOneAndUpdate(
        { nodeId: 'NODE-03-KHAN-RIVER-DIV', parameter: 'turbidity', status: 'Active' },
        {
          $set: {
            nodeId: 'NODE-03-KHAN-RIVER-DIV',
            readingId: breachReading._id,
            parameter: 'turbidity',
            value: 5.65,
            thresholdLimit: 5.0,
            thresholdMin: 0.0,
            thresholdMax: 5.0,
            direction: 'HIGH',
            severity: 'Critical',
            status: 'Active',
            breachCount: 3,
            lastBreachedAt: breachTime,
            timestamp: breachTime
          }
        },
        { upsert: true, new: true }
      );
      console.log('  - Seeded prototype active alert for NODE-03-KHAN-RIVER-DIV.');
    }
  } else {
    console.log('[JalDrishti Seeder] Clean baseline mode: Skipping synthetic readings and demo alerts.');
  }

  console.log('[JalDrishti Seeder] Seed operation completed successfully.');

  return {
    thresholdsCount: PROVISIONAL_DEFAULT_THRESHOLDS.length,
    nodeId: PROTOTYPE_SENSOR_NODE.nodeId,
    adminEmail: INITIAL_ADMIN_USER.email,
    includeDemo
  };
}

// Execute directly if run as a script
if (require.main === module) {
  seedDatabase()
    .then(async (result) => {
      console.log('[JalDrishti Seeder] Verification summary:', result);
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('[JalDrishti Seeder Error] Failed to seed database:', error.message);
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      process.exit(1);
    });
}

module.exports = {
  seedDatabase,
  PROVISIONAL_DEFAULT_THRESHOLDS,
  PROTOTYPE_SENSOR_NODE,
  PROTOTYPE_SENSOR_NODES,
  INITIAL_ADMIN_USER,
  INITIAL_USERS
};
