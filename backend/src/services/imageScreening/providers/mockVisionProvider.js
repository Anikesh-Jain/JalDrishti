/**
 * JalDrishti Phase 23: Mock Vision Provider (TEST ONLY)
 *
 * Provides deterministic classification results for automated test suites
 * and pipeline verification.
 *
 * CRITICAL ARCHITECTURAL CONSTRAINTS:
 * - This mock provider is strictly for test execution and offline pipeline verification.
 * - It must NEVER be used as the default production provider.
 * - It must NOT silently substitute for a missing live vision API in production.
 */

class MockVisionProvider {
  constructor(options = {}) {
    this.name = 'mock-vision';
    this.model = options.model || 'academic-mock-v1';
    this.forcedPreset = options.forcedPreset || null;
  }

  /**
   * Check whether this provider is available.
   * Always true for testing purposes.
   * @returns {boolean}
   */
  isAvailable() {
    return true;
  }

  /**
   * Set a forced preset for testing specific edge cases
   * @param {string|null} preset - 'clear' | 'murky' | 'non-water' | 'malformed' | null
   */
  setForcedPreset(preset) {
    this.forcedPreset = preset;
  }

  /**
   * Execute deterministic image analysis for automated verification
   *
   * @param {Object} params
   * @param {Buffer} params.imageBuffer - Image file buffer
   * @param {string} params.mimeType - MIME type of image
   * @param {string} [params.filename] - Original or sanitized filename
   * @param {string} [params.testPreset] - Explicit scenario preset
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeImage({ imageBuffer, mimeType, filename = '', testPreset = null }) {
    const preset = (this.forcedPreset || testPreset || '').toLowerCase();
    const fname = (filename || '').toLowerCase();

    // 1. Simulation of malformed provider response (for error-handling verification)
    if (preset === 'malformed') {
      return {
        corrupted: true,
        missingFields: true
      };
    }

    // 2. Simulation of invalid confidence (for boundary validation verification)
    if (preset === 'invalid-confidence') {
      return {
        result: 'Safe',
        confidence: 150.0, // Exceeds 100
        advisory: 'Invalid confidence testing payload',
        isWaterImage: true,
        provider: this.name,
        model: this.model
      };
    }

    // 3. Non-water image scenario (SRS TC05 / Synopsis TC11: Rejected)
    if (
      preset === 'non-water' ||
      preset === 'rejected' ||
      fname.includes('non-water') ||
      fname.includes('nonwater') ||
      fname.includes('rejected') ||
      fname.includes('cat') ||
      fname.includes('laptop') ||
      fname.includes('object')
    ) {
      return {
        result: 'Rejected',
        confidence: 95.0,
        advisory: 'The uploaded image does not appear to contain a water sample or open water body. Please submit a well-lit photo of water in a clear container.',
        isWaterImage: false,
        provider: this.name,
        model: this.model
      };
    }

    // 4. Murky / muddy / contaminated water scenario (SRS TC05 / Synopsis TC11: Unsafe)
    if (
      preset === 'murky' ||
      preset === 'muddy' ||
      preset === 'unsafe' ||
      fname.includes('murky') ||
      fname.includes('muddy') ||
      fname.includes('unsafe') ||
      fname.includes('turbid')
    ) {
      return {
        result: 'Unsafe',
        confidence: 88.5,
        advisory: 'Visual screening indicates noticeable turbidity, discoloration, or suspended particulate matter. Further laboratory testing is strongly advised before domestic consumption or use.',
        isWaterImage: true,
        provider: this.name,
        model: this.model
      };
    }

    // 5. Clear water scenario (SRS TC05 / Synopsis TC11: Safe)
    return {
      result: 'Safe',
      confidence: 92.5,
      advisory: 'Visual screening indicates clear water sample with no visible suspended particulate matter or discoloration. Note: Visual screening cannot verify chemical or microbiological potability; laboratory testing is recommended.',
      isWaterImage: true,
      provider: this.name,
      model: this.model
    };
  }
}

module.exports = MockVisionProvider;
