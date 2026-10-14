const multer = require('multer');
const path = require('path');
const env = require('../config/env');

/**
 * JalDrishti Phase 23: Image Upload & Validation Middleware
 *
 * Implements hardened multipart image ingestion:
 * - In-memory buffer storage to eliminate lingering temporary files
 * - Configurable size restriction (default 5MB)
 * - Strict MIME validation (JPEG, PNG, WEBP)
 * - Deep content magic-number verification (rejects renamed binaries/scripts)
 * - Filename sanitization preventing path traversal
 * - Zero leakage of server filesystem paths
 */

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Configure in-memory storage: file content lives in RAM buffer only during request lifecycle
const storage = multer.memoryStorage();

// Pre-filter MIME types in multer
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    const error = new Error(
      `Unsupported image format: '${file.mimetype}'. Allowed formats: JPEG, PNG, WEBP.`
    );
    error.status = 400;
    error.code = 'UNSUPPORTED_IMAGE_FORMAT';
    return cb(error, false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: env.IMAGE_MAX_SIZE_BYTES || 5 * 1024 * 1024,
    files: 1
  },
  fileFilter
});

/**
 * Express middleware to handle single image upload with Multer error handling
 */
const handleImageUpload = (req, res, next) => {
  const uploadSingle = upload.single('image');

  uploadSingle(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: `Image file exceeds maximum allowable size of ${Math.round(
              (env.IMAGE_MAX_SIZE_BYTES || 5242880) / (1024 * 1024)
            )}MB.`
          });
        }
        return res.status(400).json({
          error: `File upload error: ${err.message}`
        });
      }

      const status = err.status || 400;
      return res.status(status).json({
        error: err.message || 'Image upload rejected'
      });
    }

    next();
  });
};

/**
 * Deep content inspection: validates binary magic numbers
 * Ensures uploaded buffer matches real image headers rather than spoofed MIME extensions.
 *
 * Supported Signatures:
 * - JPEG: FF D8 FF
 * - PNG:  89 50 4E 47 0D 0A 1A 0A
 * - WEBP: 52 49 46 46 (RIFF) ... 57 45 42 50 (WEBP)
 */
function validateImageMagicBytes(buffer) {
  if (!buffer || buffer.length < 12) {
    return false;
  }

  // Check JPEG (FF D8 FF)
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // Check PNG (89 50 4E 47 0D 0A 1A 0A)
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // Check WEBP (RIFF....WEBP)
  const isRiff =
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
  const isWebp =
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
  if (isRiff && isWebp) {
    return 'image/webp';
  }

  return false;
}

/**
 * Post-upload validation middleware: verifies file presence, non-zero size, and magic bytes
 */
const validateUploadedImage = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'No image file provided. Please attach an image under the "image" field.'
    });
  }

  if (!req.file.buffer || req.file.buffer.length === 0 || req.file.size === 0) {
    return res.status(400).json({
      error: 'Uploaded image file is empty (0 bytes).'
    });
  }

  // Validate real binary content
  const detectedType = validateImageMagicBytes(req.file.buffer);
  if (!detectedType) {
    return res.status(400).json({
      error: 'Invalid file content: The uploaded file is not a valid JPEG, PNG, or WEBP image.'
    });
  }

  // Sanitize filename preventing path traversal or shell character injection
  const baseName = path.basename(req.file.originalname || 'upload.jpg');
  req.file.sanitizedFilename = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
  req.file.detectedMimeType = detectedType;

  next();
};

module.exports = {
  handleImageUpload,
  validateUploadedImage,
  validateImageMagicBytes
};
