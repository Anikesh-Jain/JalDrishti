const env = require('../../config/env');
const { ImageCheck } = require('../../models');
const HostedVisionProvider = require('./providers/hostedVisionProvider');
const MockVisionProvider = require('./providers/mockVisionProvider');

/**
 * JalDrishti Phase 23: Image Screening Service
 *
 * Provider-agnostic service for AI-assisted visual water screening.
 * Decouples the application from concrete vision providers.
 *
 * Enforces:
 * - Strict provider output validation
 * - Mandatory plain-language advisory guidance
 * - Safe persistence in MongoDB ImageCheck collection
 * - Sanitized return contracts (no secrets or server paths)
 * - Safe 503 error propagation when hosted provider credentials are missing
 */

class ImageScreeningService {
  constructor() {
    this.customAdapter = null;
    this.hostedProvider = new HostedVisionProvider({
      apiKey: env.GEMINI_API_KEY,
      model: env.AI_SCREENING_MODEL
    });
    this.mockProvider = new MockVisionProvider();
  }

  /**
   * Inject a test adapter (strictly for automated testing)
   * @param {Object} adapter
   */
  setAdapter(adapter) {
    this.customAdapter = adapter;
  }

  /**
   * Reset adapter to default configured provider
   */
  resetAdapter() {
    this.customAdapter = null;
  }

  /**
   * Resolve active vision provider
   * @returns {Object} Active provider instance
   */
  getProvider() {
    if (this.customAdapter) {
      return this.customAdapter;
    }

    const providerType = (env.AI_SCREENING_PROVIDER || 'gemini').toLowerCase();

    // Mock provider is strictly prohibited as default in production
    if (providerType === 'mock') {
      if (env.isProduction) {
        console.warn('[SECURITY WARNING] Mock vision provider requested in production environment! Forcing hosted provider.');
        return this.hostedProvider;
      }
      return this.mockProvider;
    }

    return this.hostedProvider;
  }

  /**
   * Retrieve operational status of the vision screening system
   * @returns {Object} { available: boolean, provider: string, model: string, message: string }
   */
  getStatus() {
    const provider = this.getProvider();
    const available = typeof provider.isAvailable === 'function' ? provider.isAvailable() : true;

    return {
      available,
      provider: provider.name || 'unknown',
      model: provider.model || env.AI_SCREENING_MODEL,
      message: available
        ? 'AI Water Image Screening service is online.'
        : 'AI Water Image Screening is currently unavailable. Hosted vision credentials are not configured in this academic environment.'
    };
  }

  /**
   * Validate provider output against strict system specifications
   *
   * @param {Object} rawOutput - Output returned by provider
   * @returns {Object} Validated and normalized output
   */
  validateProviderOutput(rawOutput) {
    if (!rawOutput || typeof rawOutput !== 'object') {
      const err = new Error('Invalid AI provider response: Output is not an object.');
      err.code = 'INVALID_PROVIDER_OUTPUT';
      err.status = 502;
      throw err;
    }

    const validResults = ['Safe', 'Unsafe', 'Rejected'];
    const result = rawOutput.result;
    if (!validResults.includes(result)) {
      const err = new Error(`Invalid AI provider classification: '${result}'. Expected Safe, Unsafe, or Rejected.`);
      err.code = 'INVALID_PROVIDER_OUTPUT';
      err.status = 502;
      throw err;
    }

    const confidence = Number(rawOutput.confidence);
    if (isNaN(confidence) || confidence < 0 || confidence > 100) {
      const err = new Error(`Invalid AI provider confidence score: '${rawOutput.confidence}'. Expected number between 0 and 100.`);
      err.code = 'INVALID_PROVIDER_OUTPUT';
      err.status = 502;
      throw err;
    }

    let advisory = typeof rawOutput.advisory === 'string' ? rawOutput.advisory.trim() : '';
    if (!advisory) {
      const err = new Error('AI provider did not supply an advisory message.');
      err.code = 'INVALID_PROVIDER_OUTPUT';
      err.status = 502;
      throw err;
    }

    // Standard disclaimer enforcement: visual screening cannot prove potability
    const disclaimerNotice = 'Advisory only. Visual analysis cannot confirm water is safe for drinking. For confirmation, laboratory or sensor testing is required.';
    if (!advisory.toLowerCase().includes('laboratory') && !advisory.toLowerCase().includes('advisory')) {
      advisory = `${advisory} Note: ${disclaimerNotice}`;
    }

    const isWaterImage = rawOutput.isWaterImage !== undefined ? Boolean(rawOutput.isWaterImage) : result !== 'Rejected';

    return {
      result,
      confidence: Math.round(confidence * 10) / 10, // Round to 1 decimal place
      advisory,
      isWaterImage
    };
  }

  /**
   * Execute complete image screening flow and persist ImageCheck entity
   *
   * @param {Object} params
   * @param {Buffer} params.imageBuffer - Sanitized image file buffer
   * @param {string} params.mimeType - Verified MIME type
   * @param {string} [params.filename] - Sanitized filename
   * @param {string|mongoose.Types.ObjectId} params.userId - Authenticated user ID
   * @param {string} [params.testPreset] - Explicit test scenario preset (test only)
   * @returns {Promise<Object>} Persisted and sanitized ImageCheck record
   */
  async screenImage({ imageBuffer, mimeType, filename = '', userId, testPreset = null }) {
    if (!userId) {
      const err = new Error('User authentication context is required for image screening.');
      err.status = 401;
      throw err;
    }

    if (!imageBuffer || !Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
      const err = new Error('Valid image file buffer is required.');
      err.status = 400;
      throw err;
    }

    const provider = this.getProvider();

    // Check provider availability
    if (typeof provider.isAvailable === 'function' && !provider.isAvailable()) {
      const err = new Error(
        'AI water image screening service is currently unavailable. Hosted vision credentials are not configured in this academic environment.'
      );
      err.code = 'PROVIDER_UNAVAILABLE';
      err.status = 503;
      throw err;
    }

    // Invoke provider
    let providerOutput;
    try {
      providerOutput = await provider.analyzeImage({
        imageBuffer,
        mimeType,
        filename,
        testPreset
      });
    } catch (providerErr) {
      // If error already carries status (e.g. 503 for timeout/unavailable), re-throw
      if (providerErr.status) {
        throw providerErr;
      }
      const err = new Error(`AI screening provider error: ${providerErr.message}`);
      err.code = providerErr.code || 'PROVIDER_EXECUTION_ERROR';
      err.status = 502;
      throw err;
    }

    // Validate provider output
    const validated = this.validateProviderOutput(providerOutput);

    // Persist to MongoDB ImageCheck collection (Phase 3 schema)
    // imagePath is kept empty to avoid storing temporary filesystem paths in DB
    const imageCheckRecord = await ImageCheck.create({
      userId,
      imagePath: '',
      result: validated.result,
      confidence: validated.confidence,
      advisory: validated.advisory,
      isWaterImage: validated.isWaterImage,
      timestamp: new Date()
    });

    // Return sanitized result contract
    return {
      id: imageCheckRecord._id,
      result: imageCheckRecord.result,
      confidence: imageCheckRecord.confidence,
      advisory: imageCheckRecord.advisory,
      isWaterImage: imageCheckRecord.isWaterImage,
      timestamp: imageCheckRecord.timestamp
    };
  }

  /**
   * Retrieve screening history for authenticated user (or all if admin)
   *
   * @param {Object} params
   * @param {string|mongoose.Types.ObjectId} params.userId - Authenticated user ID
   * @param {string} params.userRole - Authenticated user role
   * @param {number} [params.limit=10] - Number of items
   * @param {number} [params.page=1] - Page number
   * @param {boolean} [params.all=false] - Admin view all records
   * @returns {Promise<Object>} { items, total, page, totalPages }
   */
  async getScreeningHistory({ userId, userRole, limit = 10, page = 1, all = false }) {
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    // Build filter: Citizen can ONLY view their own records; Admin can view all if requested
    const filter = (all && userRole === 'Admin') ? {} : { userId };

    const [records, total] = await Promise.all([
      ImageCheck.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .select('-imagePath')
        .lean(),
      ImageCheck.countDocuments(filter)
    ]);

    const sanitizedItems = records.map((rec) => ({
      id: rec._id,
      result: rec.result,
      confidence: rec.confidence,
      advisory: rec.advisory,
      isWaterImage: rec.isWaterImage,
      timestamp: rec.timestamp
    }));

    return {
      items: sanitizedItems,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit) || 1
    };
  }
}

const defaultImageScreeningService = new ImageScreeningService();

module.exports = defaultImageScreeningService;
module.exports.ImageScreeningService = ImageScreeningService;
