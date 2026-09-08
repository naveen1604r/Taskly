import crypto from 'crypto';

/**
 * Request ID Middleware
 * Assigns or preserves a unique X-Request-Id header for every incoming HTTP request.
 * Attaches the ID to req.id for tracing and logging.
 */
export const requestIdMiddleware = (req, res, next) => {
  const existingId = req.headers['x-request-id'];
  const requestId = existingId && typeof existingId === 'string' && existingId.trim()
    ? existingId.trim()
    : crypto.randomUUID();

  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
};

export default requestIdMiddleware;
