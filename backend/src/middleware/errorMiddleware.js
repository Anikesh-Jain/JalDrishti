const env = require('../config/env');

/**
 * Handle 404 for unmatched routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
};

/**
 * Centralized error handling middleware.
 * Ensures unexpected errors never leak stack traces, internal paths,
 * database connection strings, or JWT secrets to API clients.
 */
const errorHandler = (err, req, res, next) => {
  // CORS origin policy rejection
  if (err.message && err.message.startsWith('CORS policy:')) {
    return res.status(403).json({
      error: 'Access denied by CORS policy: Origin not allowed.'
    });
  }

  // Request body payload exceeds limit (HTTP 413)
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({
      error: 'Payload too large. Request body exceeds allowable limit.'
    });
  }

  // Malformed JSON syntax in request body (HTTP 400)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Malformed JSON payload in request body.'
    });
  }

  // Mongoose CastError (invalid ObjectId or type casting failure) (HTTP 400)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid resource identifier or parameter format.'
    });
  }

  // Mongoose schema validation failure (HTTP 400)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: err.message || 'Validation error.'
    });
  }

  const statusCode = err.status || err.statusCode || 500;

  // Server-side logging only: log error message without printing secrets
  console.error(`[ServerError] ${req.method} ${req.originalUrl} - Status ${statusCode}:`, err.message);

  // Client response: Never expose stack traces or internal implementation details
  const clientMessage = statusCode >= 500
    ? 'Internal Server Error'
    : (err.message || 'An unexpected error occurred');

  return res.status(statusCode).json({
    error: clientMessage
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
