const path = require('path');
const mongoose = require(path.resolve(__dirname, '../backend/node_modules/mongoose'));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jaldrishti';

async function cleanup() {
  console.log(`Connecting to ${MONGODB_URI}...`);
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  console.log('--- STARTING SELECTIVE CLEANUP OF TEST & DEMO DATA ---');

  // 1. Users
  const realEmails = ['admin@jaldrishti.org', 'alvaro95gaming@gmail.com'];
  const usersBefore = await db.collection('users').find({}).toArray();
  console.log(`Total users before: ${usersBefore.length}`);
  
  const usersToDelete = usersBefore.filter(u => !realEmails.includes(u.email));
  const usersToKeep = usersBefore.filter(u => realEmails.includes(u.email));
  console.log(`Preserving ${usersToKeep.length} real users: ${usersToKeep.map(u => u.email).join(', ')}`);
  console.log(`Deleting ${usersToDelete.length} test/demo users`);

  const userDelRes = await db.collection('users').deleteMany({ email: { $nin: realEmails } });
  console.log(`Users deleted: ${userDelRes.deletedCount}`);

  // Find preserved citizen user id to verify imagecheck association
  const alvaroUser = usersToKeep.find(u => u.email === 'alvaro95gaming@gmail.com');
  const alvaroUserId = alvaroUser ? alvaroUser._id : null;

  // 2. Sensor Nodes
  const realNodeIds = ['NODE-01-INDORE-WARD12'];
  const nodesBefore = await db.collection('sensornodes').find({}).toArray();
  console.log(`\nTotal sensor nodes before: ${nodesBefore.length}`);
  const nodesToKeep = nodesBefore.filter(n => realNodeIds.includes(n.nodeId));
  const nodesToDelete = nodesBefore.filter(n => !realNodeIds.includes(n.nodeId));
  console.log(`Preserving ${nodesToKeep.length} real nodes: ${nodesToKeep.map(n => n.nodeId).join(', ')}`);
  console.log(`Deleting ${nodesToDelete.length} dummy/test nodes: ${nodesToDelete.map(n => n.nodeId).join(', ')}`);

  const nodeDelRes = await db.collection('sensornodes').deleteMany({ nodeId: { $nin: realNodeIds } });
  console.log(`Sensor nodes deleted: ${nodeDelRes.deletedCount}`);

  // 3. Readings
  // All 293 readings are synthetic/test mathematical or runner points
  const readingsCountBefore = await db.collection('readings').countDocuments();
  console.log(`\nTotal readings before: ${readingsCountBefore}`);
  const readingDelRes = await db.collection('readings').deleteMany({});
  console.log(`Readings deleted: ${readingDelRes.deletedCount}`);

  // 4. Alerts
  const alertsCountBefore = await db.collection('alerts').countDocuments();
  console.log(`\nTotal alerts before: ${alertsCountBefore}`);
  const alertDelRes = await db.collection('alerts').deleteMany({});
  console.log(`Alerts deleted: ${alertDelRes.deletedCount}`);

  // 5. Notifications
  const notifsCountBefore = await db.collection('notifications').countDocuments();
  console.log(`\nTotal notifications before: ${notifsCountBefore}`);
  const notifDelRes = await db.collection('notifications').deleteMany({});
  console.log(`Notifications deleted: ${notifDelRes.deletedCount}`);

  // 6. Contact Inquiries
  const realContactEmail = 'anikeshjain2006@gmail.com';
  const inquiriesBefore = await db.collection('contactinquiries').find({}).toArray();
  console.log(`\nTotal contact inquiries before: ${inquiriesBefore.length}`);
  const inquiriesToKeep = inquiriesBefore.filter(i => i.email === realContactEmail);
  console.log(`Preserving ${inquiriesToKeep.length} real inquiry: ${inquiriesToKeep.map(i => `${i.name} (${i.email})`).join(', ')}`);
  
  const inquiryDelRes = await db.collection('contactinquiries').deleteMany({ email: { $ne: realContactEmail } });
  console.log(`Contact inquiries deleted: ${inquiryDelRes.deletedCount}`);

  // 7. Image Checks
  const checksBefore = await db.collection('imagechecks').find({}).toArray();
  console.log(`\nTotal image checks before: ${checksBefore.length}`);
  const checksToKeep = checksBefore.filter(c => alvaroUserId && c.userId && c.userId.toString() === alvaroUserId.toString());
  console.log(`Preserving ${checksToKeep.length} real image check uploaded by user ${alvaroUserId}`);

  let checkDelRes;
  if (alvaroUserId) {
    checkDelRes = await db.collection('imagechecks').deleteMany({ userId: { $ne: alvaroUserId } });
  } else {
    // If not found by ID, filter by known non-test record
    console.log('Alvaro user ID not matched directly, filtering test checks...');
    checkDelRes = await db.collection('imagechecks').deleteMany({
      $or: [
        { predictedClass: /test/i },
        { notes: /test/i }
      ]
    });
  }
  console.log(`Image checks deleted: ${checkDelRes.deletedCount}`);

  // 8. Thresholds (Preserve all 4)
  const thresholdsCount = await db.collection('thresholds').countDocuments();
  console.log(`\nThresholds preserved: ${thresholdsCount} (No thresholds deleted)`);

  // Verification Summary
  console.log('\n--- VERIFICATION: CURRENT DB STATE ---');
  const collections = ['users', 'sensornodes', 'readings', 'alerts', 'notifications', 'contactinquiries', 'imagechecks', 'thresholds'];
  for (const col of collections) {
    const count = await db.collection(col).countDocuments();
    console.log(`Collection "${col}": ${count} records remaining`);
  }

  await mongoose.disconnect();
  console.log('Cleanup script finished successfully.');
}

cleanup().catch(err => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
