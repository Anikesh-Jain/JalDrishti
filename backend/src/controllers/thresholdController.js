const thresholdService = require('../services/thresholdService');

/**
 * Retrieve all configured water quality thresholds
 * GET /api/thresholds
 */
const getThresholds = async (req, res, next) => {
  try {
    const thresholds = await thresholdService.getAllThresholds();
    return res.status(200).json({
      success: true,
      count: thresholds.length,
      thresholds
    });
  } catch (error) {
    console.error('[ThresholdController GetThresholds Error]:', error.message);
    next(error);
  }
};

/**
 * Retrieve a specific threshold by parameter
 * GET /api/thresholds/:parameter
 */
const getThresholdByParam = async (req, res, next) => {
  try {
    const parameter = req.params.parameter;
    const threshold = await thresholdService.getThresholdByParameter(parameter);

    if (!threshold) {
      return res.status(404).json({
        error: `Threshold for parameter '${parameter}' not found`
      });
    }

    return res.status(200).json({
      success: true,
      threshold
    });
  } catch (error) {
    console.error('[ThresholdController GetThresholdByParam Error]:', error.message);
    next(error);
  }
};

/**
 * Update a specific threshold limit (Admin only)
 * PUT /api/thresholds/:parameter
 */
const updateThreshold = async (req, res, next) => {
  try {
    const parameter = req.normalizedParameter;
    const updateData = {
      ...req.validatedThresholdData,
      userId: req.user && req.user._id ? req.user._id : null
    };

    const updated = await thresholdService.updateThreshold(parameter, updateData);

    if (!updated) {
      return res.status(404).json({
        error: `Threshold for parameter '${parameter}' not found`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Threshold for '${parameter}' updated successfully`,
      threshold: updated
    });
  } catch (error) {
    console.error('[ThresholdController UpdateThreshold Error]:', error.message);
    next(error);
  }
};

module.exports = {
  getThresholds,
  getThresholdByParam,
  updateThreshold
};
