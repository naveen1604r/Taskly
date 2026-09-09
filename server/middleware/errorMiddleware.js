import config from '../config/env.js';

/**
 * Centralized Production Error Handling Middleware
 * In development: provides informative error messages and stack traces.
 * In production: returns sanitized, safe error responses without leaking SQL,
 * paths, credentials, or internal implementation details.
 */
export const errorHandler = (err, req, res, next) => {
  // Determine HTTP status code
  let statusCode = res.statusCode !== 200 && res.statusCode !== 204 ? res.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error classes
  if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message || 'Validation failed';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request payload exceeds 1MB size limit';
  } else if (
    err.code === 'ECONNREFUSED' ||
    err.code === 'ER_ACCESS_DENIED_ERROR' ||
    err.code === 'PROTOCOL_CONNECTION_LOST'
  ) {
    statusCode = 503;
    message = config.isProduction
      ? 'Database service temporarily unavailable. Please try again later.'
      : 'Database service temporarily unavailable. Please verify MySQL server and credentials in server/.env.';
  } else if (err.code && typeof err.code === 'string' && err.code.startsWith('ER_')) {
    statusCode = 500;
    message = config.isProduction ? 'A database error occurred' : `Database error: ${err.message}`;
  } else if (statusCode === 500 && config.isProduction) {
    message = 'Internal server error';
  }

  // In development, log internal errors with stack traces to terminal
  if (!config.isProduction && statusCode >= 500) {
    console.error(`\x1b[31m[ERROR ${statusCode}]\x1b[0m ${req.method} ${req.originalUrl || req.url}:`, err.message || err);
    if (err.stack) {
      console.error(err.stack);
    }
  }

  // Consistent JSON response
  const responsePayload = {
    success: false,
    message,
  };

  if (req.id) {
    responsePayload.requestId = req.id;
  }

  // Include stack trace ONLY in non-production environments
  if (!config.isProduction && err.stack) {
    responsePayload.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
};

export default errorHandler;
