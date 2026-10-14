#!/usr/bin/env node
/**
 * JalDrishti Administrator Account Provisioning Tool
 *
 * Usage:
 *   node scripts/provision_admin.js [email] [password] [name] [phone]
 *
 * Defaults:
 *   Email:    admin@jaldrishti.org
 *   Password: Admin@JalDrishti2026!
 *   Name:     Municipal Administrator
 *   Phone:    +919876543210
 */

const path = require('path');
const dotenv = require(path.resolve(__dirname, '../backend/node_modules/dotenv'));
const mongoose = require(path.resolve(__dirname, '../backend/node_modules/mongoose'));
const bcrypt = require(path.resolve(__dirname, '../backend/node_modules/bcryptjs'));

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const { User } = require('../backend/src/models');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jaldrishti';

async function provisionAdmin() {
  const args = process.argv.slice(2);
  const email = (args[0] || 'admin@jaldrishti.org').trim().toLowerCase();
  const password = args[1] || process.env.INITIAL_ADMIN_PASSWORD || 'Admin@JalDrishti2026!';
  const name = args[2] || 'Municipal Administrator';
  const phone = args[3] || '+919876543210';

  console.log('================================================================');
  console.log('JALDRISHTI SECURE ADMINISTRATOR PROVISIONING');
  console.log('================================================================');
  console.log(`Connecting to: ${MONGODB_URI}`);

  await mongoose.connect(MONGODB_URI);

  const passwordHash = await bcrypt.hash(password, 10);

  const adminUser = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name,
        email,
        role: 'Admin',
        passwordHash,
        phone,
        status: 'Active',
        organization: 'Municipal Water Quality Board',
        lastLogin: new Date()
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`[SUCCESS] Administrator account successfully provisioned:`);
  console.log(`  - User ID:      ${adminUser._id}`);
  console.log(`  - Name:         ${adminUser.name}`);
  console.log(`  - Email:        ${adminUser.email}`);
  console.log(`  - Role:         ${adminUser.role}`);
  console.log(`  - Status:       ${adminUser.status}`);
  console.log(`  - Password:     [SECURE BCRYPT HASH PERSISTED]`);
  console.log('================================================================');

  await mongoose.disconnect();
}

provisionAdmin().catch((err) => {
  console.error('[PROVISION ERROR]:', err.message);
  process.exit(1);
});
