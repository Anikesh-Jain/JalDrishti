const imageScreeningService = require('../services/imageScreening/imageScreeningService');

/**
 * JalDrishti Phase 23: Image Check Controller
 *
 * Handles HTTP requests for AI water image screening and history retrieval.
 * Enforces role authorization and sanitized API responses.
 */

/**
 * POST /api/image-checks/screen
 * Authenticated endpoint for water image screening
 */
const screenImage = async (req, res, next) => {
  try {
    const { buffer, detectedMimeType, mimetype, sanitizedFilename } = req.file;

    const result = await imageScreeningService.screenImage({
      imageBuffer: buffer,
      mimeType: detectedMimeType || mimetype,
      filename: sanitizedFilename,
      userId: req.user._id,
      testPreset: req.body.testPreset || null
    });

    return res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error.status === 503 || error.code === 'PROVIDER_UNAVAILABLE') {
      return res.status(503).json({
        error: error.message || 'AI image screening service is currently unavailable.',
        code: 'PROVIDER_UNAVAILABLE',
        available: false
      });
    }

    if (error.status === 400 || error.code === 'INVALID_PROVIDER_OUTPUT') {
      return res.status(error.status || 400).json({
        error: error.message
      });
    }

    next(error);
  }
};

/**
 * GET /api/image-checks
 * Authenticated endpoint for retrieving screening history
 */
const getHistory = async (req, res, next) => {
  try {
    const { limit, page, all } = req.query;

    const result = await imageScreeningService.getScreeningHistory({
      userId: req.user._id,
      userRole: req.user.role,
      limit,
      page,
      all: all === 'true'
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/image-checks/status
 * Authenticated operational readiness and provider availability check
 */
const getStatus = async (req, res, next) => {
  try {
    const status = imageScreeningService.getStatus();
    return res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  screenImage,
  getHistory,
  getStatus
};
