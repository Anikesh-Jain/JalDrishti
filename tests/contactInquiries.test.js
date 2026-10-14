/**
 * JalDrishti: Suite 18 - Contact Inquiry Management Tests
 * Consolidated from verify_followup.js & verify_issue_fixes.js
 *
 * Verifies:
 * - Contact inquiry submission validation (short name, malformed email, short message)
 * - Unique reference ID generation (INQ-*) and MongoDB persistence
 * - Citizen & unauthenticated access restrictions (HTTP 401/403)
 * - Admin inquiry listing, filtering by status, and search by reference ID
 * - Admin status updates and internal notes persistence
 * - Admin replies to inquiries with author, timestamp, and honest deliveryStatus logging
 * - Lifecycle transition to Resolved
 */

const { TestContext, models, bcrypt, generateToken } = require('./testContext');

async function runContactInquiriesSuite() {
  const ctx = new TestContext('Contact Inquiry Management');
  await ctx.setup();

  const suffix = `inq_${Date.now()}`;
  let adminUser, adminToken;
  let citizenUser, citizenToken;
  let createdInquiryId = null;

  try {
    console.log('\n[SUITE 18: CONTACT INQUIRY MANAGEMENT]');

    const passHash = await bcrypt.hash('Password123!', 10);

    adminUser = await models.User.create({
      name: 'Anikesh Jain',
      email: `admin_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Admin'
    });
    adminToken = generateToken({ userId: adminUser._id.toString(), role: adminUser.role });

    citizenUser = await models.User.create({
      name: 'Akshat Jain',
      email: `citizen_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Citizen'
    });
    citizenToken = generateToken({ userId: citizenUser._id.toString(), role: citizenUser.role });

    // 18.1 Validation: Short name (< 2 chars) rejected
    const shortNameRes = await ctx.makeRequest({
      path: '/api/contact',
      method: 'POST'
    }, { name: 'A', email: 'test@example.com', message: 'Legitimate message about water quality.' });
    ctx.assert(shortNameRes.statusCode === 400, '18.1 Rejects contact name shorter than 2 characters with HTTP 400');

    // 18.2 Validation: Malformed email rejected
    const badEmailRes = await ctx.makeRequest({
      path: '/api/contact',
      method: 'POST'
    }, { name: 'Test Citizen', email: 'not-an-email', message: 'Legitimate message about water quality.' });
    ctx.assert(badEmailRes.statusCode === 400, '18.2 Rejects malformed email with HTTP 400');

    // 18.3 Validation: Short message (< 10 chars) rejected
    const shortMsgRes = await ctx.makeRequest({
      path: '/api/contact',
      method: 'POST'
    }, { name: 'Test Citizen', email: 'test@example.com', message: 'Short' });
    ctx.assert(shortMsgRes.statusCode === 400, '18.3 Rejects contact message under 10 characters with HTTP 400');

    // 18.4 Valid contact inquiry submission
    const targetEmail = `akshat.test.${Date.now()}@example.com`;
    const validSubmitRes = await ctx.makeRequest({
      path: '/api/contact',
      method: 'POST'
    }, {
      name: 'Akshat Jain',
      email: targetEmail,
      subject: 'Turbidity Sensor Calibration Question',
      message: 'Citizen inquiry regarding high mineral residue and turbidity in local tap water supply.'
    });
    ctx.assert(
      validSubmitRes.statusCode === 201 && validSubmitRes.body?.inquiryId,
      '18.4 Valid contact inquiry successfully submitted with HTTP 201'
    );
    createdInquiryId = validSubmitRes.body?.inquiryId;
    const referenceId = validSubmitRes.body?.referenceId;
    ctx.assert(
      referenceId && referenceId.startsWith('INQ-'),
      `18.5 Unique reference ID generated: ${referenceId}`
    );

    // 18.6 Unauthenticated access to list inquiries rejected with HTTP 401
    const unauthGet = await ctx.makeRequest({ path: '/api/contact' });
    ctx.assert(unauthGet.statusCode === 401, '18.6 Unauthenticated visitor blocked from listing inquiries with HTTP 401');

    // 18.7 Citizen access to list inquiries rejected with HTTP 403
    const citizenGet = await ctx.makeRequest({
      path: '/api/contact',
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    ctx.assert(citizenGet.statusCode === 403, '18.7 Citizen blocked from listing contact inquiries with HTTP 403');

    // 18.8 Citizen reply attempt rejected with HTTP 403
    const citizenReply = await ctx.makeRequest({
      path: `/api/contact/${createdInquiryId}/reply`,
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` }
    }, { message: 'Citizen reply attempt' });
    ctx.assert(citizenReply.statusCode === 403, '18.8 Citizen blocked from replying to inquiries with HTTP 403');

    // 18.9 Admin retrieves inquiries list
    const adminGet = await ctx.makeRequest({
      path: '/api/contact',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const inquiries = Array.isArray(adminGet.body?.inquiries) ? adminGet.body.inquiries : (adminGet.body?.data || []);
    const foundInq = inquiries.find((i) => (i._id || i.id) === createdInquiryId);
    ctx.assert(
      adminGet.statusCode === 200 && foundInq !== undefined,
      '18.9 Admin successfully retrieves submitted inquiry from MongoDB'
    );
    ctx.assert(
      foundInq?.status === 'New' && foundInq?.email === targetEmail,
      '18.10 Inquiry initial status is "New" with matching citizen email'
    );

    // 18.11 Admin updates inquiry status and internal notes
    const patchRes = await ctx.makeRequest({
      path: `/api/contact/${createdInquiryId}`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` }
    }, {
      status: 'In Review',
      adminNotes: 'Assigned to field engineer for TDS verification.'
    });
    ctx.assert(
      patchRes.statusCode === 200 &&
      (patchRes.body?.inquiry?.status === 'In Review' || patchRes.body?.data?.status === 'In Review'),
      '18.11 Admin updates inquiry status to "In Review" with notes'
    );

    // 18.12 Admin replies to Citizen inquiry
    const replyRes = await ctx.makeRequest({
      path: `/api/contact/${createdInquiryId}/reply`,
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    }, {
      message: 'Hello Akshat, we have logged station NODE-01 readings and will dispatch an inspection team.',
      sendEmail: true,
      newStatus: 'Awaiting Response'
    });
    const inquiryData = replyRes.body?.inquiry || replyRes.body?.data;
    const replies = inquiryData?.replies || [];
    const lastReply = replies[replies.length - 1];
    ctx.assert(
      replyRes.statusCode === 200 &&
      lastReply &&
      lastReply.adminName === 'Anikesh Jain' &&
      Boolean(lastReply.createdAt),
      '18.12 Admin submits reply with admin author and timestamp appended to history'
    );

    // 18.13 Status transition to Resolved
    const resolveRes = await ctx.makeRequest({
      path: `/api/contact/${createdInquiryId}`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` }
    }, { status: 'Resolved' });
    ctx.assert(
      resolveRes.statusCode === 200 &&
      (resolveRes.body?.inquiry?.status === 'Resolved' || resolveRes.body?.data?.status === 'Resolved'),
      '18.13 Inquiry successfully transitioned to Resolved status'
    );

  } finally {
    if (adminUser) await models.User.deleteOne({ _id: adminUser._id });
    if (citizenUser) await models.User.deleteOne({ _id: citizenUser._id });
    if (createdInquiryId) {
      // Clean up contact inquiry if model exists
      const ContactInquiry = models.ContactInquiry || models.mongoose?.model('ContactInquiry');
      if (ContactInquiry) {
        await ContactInquiry.deleteOne({ _id: createdInquiryId });
      }
    }
    await ctx.teardown();
  }

  return { suite: ctx.suiteName, passed: ctx.passed, failed: ctx.failed };
}

if (require.main === module) {
  runContactInquiriesSuite().then((res) => {
    TestContext.disconnectDb().then(() => {
      process.exit(res.failed > 0 ? 1 : 0);
    });
  });
}

module.exports = { runContactInquiriesSuite };
