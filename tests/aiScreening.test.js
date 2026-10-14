/**
 * JalDrishti: Suite 12 - AI Water Image Screening Tests
 * Includes multipart upload validation, magic byte detection, classifications,
 * student safety disclaimer, user data isolation, and Gemini model normalization.
 */

const { TestContext, models, env, bcrypt, generateToken, createValidJpegBuffer } = require('./testContext');
const imageScreeningService = require('../backend/src/services/imageScreening/imageScreeningService');
const MockVisionProvider = require('../backend/src/services/imageScreening/providers/mockVisionProvider');
const HostedVisionProvider = require('../backend/src/services/imageScreening/providers/hostedVisionProvider');

async function runAiScreeningSuite() {
  const ctx = new TestContext('AI Water Image Screening');
  await ctx.setup();

  const suffix = `ai_${Date.now()}`;
  let citizenA, citizenB, adminUser;
  let tokenA, tokenB, adminToken;
  const createdRecordIds = [];

  try {
    console.log('\n[SUITE 12: AI WATER IMAGE SCREENING]');

    const passHash = await bcrypt.hash('Password123!', 10);
    citizenA = await models.User.create({
      name: 'AI Citizen A',
      email: `citizenA_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Citizen'
    });
    tokenA = generateToken({ userId: citizenA._id.toString(), role: citizenA.role });

    citizenB = await models.User.create({
      name: 'AI Citizen B',
      email: `citizenB_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Citizen'
    });
    tokenB = generateToken({ userId: citizenB._id.toString(), role: citizenB.role });

    adminUser = await models.User.create({
      name: 'AI Admin',
      email: `admin_${suffix}@example.com`,
      passwordHash: passHash,
      role: 'Admin'
    });
    adminToken = generateToken({ userId: adminUser._id.toString(), role: adminUser.role });

    const boundary = '----WebKitFormBoundaryPHASE25AITEST';
    const validJpeg = createValidJpegBuffer();

    // Helper for multipart request
    function buildMultipart(filename, mimeType, buffer) {
      return Buffer.concat([
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`),
        buffer,
        Buffer.from(`\r\n--${boundary}--\r\n`)
      ]);
    }

    // 12.1 Unauthenticated upload rejected with HTTP 401
    const unauthMultipart = buildMultipart('test.jpg', 'image/jpeg', validJpeg);
    const unauthUploadRes = await ctx.makeRequest({
      path: '/api/image-checks/screen',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': unauthMultipart.length
      }
    }, unauthMultipart);
    ctx.assert(unauthUploadRes.statusCode === 401, '12.1 Unauthenticated image screening upload rejected with HTTP 401');

    // 12.2 Empty file upload (0 bytes) rejected with HTTP 400
    const emptyMultipart = buildMultipart('empty.jpg', 'image/jpeg', Buffer.alloc(0));
    const emptyRes = await ctx.makeRequest({
      path: '/api/image-checks/screen',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': emptyMultipart.length
      }
    }, emptyMultipart);
    ctx.assert(emptyRes.statusCode === 400, '12.2 Empty image upload (0 bytes) rejected with HTTP 400');

    // 12.3 Spoofed MIME non-image rejected via magic bytes with HTTP 400
    const spoofedBuffer = Buffer.from('NOT_A_REAL_IMAGE_FILE_JUST_TEXT');
    const spoofedMultipart = buildMultipart('spoof.jpg', 'image/jpeg', spoofedBuffer);
    const spoofedRes = await ctx.makeRequest({
      path: '/api/image-checks/screen',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': spoofedMultipart.length
      }
    }, spoofedMultipart);
    ctx.assert(spoofedRes.statusCode === 400, '12.3 Spoofed MIME non-image rejected via magic byte inspection with HTTP 400');

    // 12.4 Unsupported image format (.gif) rejected with HTTP 400
    const gifBuffer = Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00');
    const gifMultipart = buildMultipart('sample.gif', 'image/gif', gifBuffer);
    const gifRes = await ctx.makeRequest({
      path: '/api/image-checks/screen',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': gifMultipart.length
      }
    }, gifMultipart);
    ctx.assert(gifRes.statusCode === 400, '12.4 Unsupported image format (.gif) rejected with HTTP 400');

    // 12.5 Oversized file (>5MB) rejected with HTTP 400
    const bigBuffer = Buffer.alloc(5.5 * 1024 * 1024, 0x41);
    const bigMultipart = buildMultipart('oversized.jpg', 'image/jpeg', bigBuffer);
    const bigRes = await ctx.makeRequest({
      path: '/api/image-checks/screen',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bigMultipart.length
      }
    }, bigMultipart);
    ctx.assert(bigRes.statusCode === 400, '12.5 Oversized image upload (>5MB) rejected with HTTP 400');

    // 12.6 Deterministic scenarios with test mock provider
    const testMock = new MockVisionProvider();
    imageScreeningService.setAdapter(testMock);

    // Scenario A: Clear water
    const clearMultipart = buildMultipart('clear_water_test.jpg', 'image/jpeg', validJpeg);
    const clearRes = await ctx.makeRequest({
      path: '/api/image-checks/screen',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': clearMultipart.length
      }
    }, clearMultipart);
    ctx.assert(
      clearRes.statusCode === 201 &&
      clearRes.body?.data?.result === 'Safe' &&
      clearRes.body?.data?.isWaterImage === true,
      '12.6 Clear water test image classified as Safe with isWaterImage: true'
    );
    if (clearRes.body?.data?.id) createdRecordIds.push(clearRes.body.data.id);

    // Scenario B: Murky water
    const murkyMultipart = buildMultipart('murky_turbid_sample.jpg', 'image/jpeg', validJpeg);
    const murkyRes = await ctx.makeRequest({
      path: '/api/image-checks/screen',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': murkyMultipart.length
      }
    }, murkyMultipart);
    ctx.assert(
      murkyRes.statusCode === 201 &&
      murkyRes.body?.data?.result === 'Unsafe' &&
      murkyRes.body?.data?.isWaterImage === true,
      '12.7 Murky water test image classified as Unsafe with isWaterImage: true'
    );
    if (murkyRes.body?.data?.id) createdRecordIds.push(murkyRes.body.data.id);

    // Scenario C: Non-water image
    const nonWaterMultipart = buildMultipart('non-water-sample.jpg', 'image/jpeg', validJpeg);
    const nonWaterRes = await ctx.makeRequest({
      path: '/api/image-checks/screen',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': nonWaterMultipart.length
      }
    }, nonWaterMultipart);
    ctx.assert(
      nonWaterRes.statusCode === 201 &&
      nonWaterRes.body?.data?.result === 'Rejected' &&
      nonWaterRes.body?.data?.isWaterImage === false,
      '12.8 Non-water image rejected with result: "Rejected" and isWaterImage: false'
    );
    if (nonWaterRes.body?.data?.id) createdRecordIds.push(nonWaterRes.body.data.id);

    // 12.9 Confidence score strictly normalized
    const conf = clearRes.body?.data?.confidence;
    ctx.assert(
      typeof conf === 'number' && conf >= 0.0 && conf <= 100.0,
      '12.9 Confidence score strictly normalized between 0.0% and 100.0%'
    );

    // 12.10 Academic disclaimer note present in advisory
    ctx.assert(
      clearRes.body?.data?.advisory?.includes('drinking') || clearRes.body?.data?.advisory?.includes('laboratory'),
      '12.10 Plain-language advisory contains mandatory academic safety disclaimer'
    );

    // 12.11 ImageCheck persistence in MongoDB
    const persistedCheck = await models.ImageCheck.findById(clearRes.body?.data?.id);
    ctx.assert(
      persistedCheck && persistedCheck.userId.toString() === citizenA._id.toString(),
      '12.11 Screening record persisted in MongoDB ImageCheck collection'
    );

    // 12.12 Citizen screening history retrieval
    const historyRes = await ctx.makeRequest({
      path: '/api/image-checks',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const citizenItems = historyRes.body?.data?.items || historyRes.body?.data?.records || [];
    ctx.assert(
      historyRes.statusCode === 200 && citizenItems.length >= 3,
      '12.12 Citizen can retrieve historical screening records'
    );

    // 12.13 Citizen data isolation (Citizen B cannot view Citizen A's records)
    const historyBRes = await ctx.makeRequest({
      path: '/api/image-checks',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const historyBItems = historyBRes.body?.data?.items || historyBRes.body?.data?.records || [];
    const foundOtherUserRecord = historyBItems.some((r) => createdRecordIds.includes(r.id));
    ctx.assert(
      historyBRes.statusCode === 200 && !foundOtherUserRecord,
      '12.13 Strict data isolation: Citizen B cannot view Citizen A private screening checks'
    );

    // 12.14 Admin multi-user history query (?all=true)
    const adminHistoryRes = await ctx.makeRequest({
      path: '/api/image-checks?all=true',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminItems = adminHistoryRes.body?.data?.items || adminHistoryRes.body?.data?.records || [];
    ctx.assert(
      adminHistoryRes.statusCode === 200 && adminItems.length >= 3,
      '12.14 Admin authorized to query multi-user aggregated screening records (?all=true)'
    );

    // 12.15 Hosted vision provider model configuration & normalization (Gemini model audit)
    imageScreeningService.resetAdapter();
    const statusBefore = imageScreeningService.getStatus();
    const defaultProvider = new HostedVisionProvider({ apiKey: 'test-key' });
    const prefixedProvider = new HostedVisionProvider({ apiKey: 'test-key', model: 'models/gemini-3.8-flash' });
    const legacyProvider = new HostedVisionProvider({ apiKey: 'test-key', model: 'gemini-2.5-flash' });

    ctx.assert(
      statusBefore.model === 'gemini-3.8-flash' &&
      defaultProvider.model === 'gemini-3.8-flash' &&
      prefixedProvider.model === 'gemini-3.8-flash' &&
      legacyProvider.model === 'gemini-3.8-flash',
      '12.15 Image screening service selects gemini-3.8-flash and normalizes model prefixes/legacy overrides'
    );

    // 12.16 Unconfigured hosted vision provider returns HTTP 503
    const unconfiguredHosted = new HostedVisionProvider({ apiKey: '' });
    imageScreeningService.setAdapter(unconfiguredHosted);
    const hostedRes = await ctx.makeRequest({
      path: '/api/image-checks/screen',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': clearMultipart.length
      }
    }, clearMultipart);
    ctx.assert(
      hostedRes.statusCode === 503,
      '12.16 Hosted vision provider safely returns HTTP 503 when live API key is unconfigured'
    );

  } finally {
    imageScreeningService.resetAdapter();
    await models.User.deleteMany({ email: { $regex: suffix } });
    await models.ImageCheck.deleteMany({ _id: { $in: createdRecordIds } });
    await ctx.teardown();
  }

  return { suite: ctx.suiteName, passed: ctx.passed, failed: ctx.failed };
}

if (require.main === module) {
  runAiScreeningSuite().then((res) => {
    TestContext.disconnectDb().then(() => {
      process.exit(res.failed > 0 ? 1 : 0);
    });
  });
}

module.exports = { runAiScreeningSuite };
