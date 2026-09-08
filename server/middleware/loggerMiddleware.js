import config from '../config/env.js';

/**
 * Production-safe logger middleware.
 * Logs method, route, status, response time, timestamp, and request ID.
 * Explicitly sanitizes and never logs sensitive headers (Authorization) or body fields (password, tokens).
 */
export const loggerMiddleware = (req, res, next) => {
  const startTime = process.hrtime();
  const timestamp = new Date().toISOString();

  // Listen for the response finish event
  res.on('finish', () => {
    const diff = process.hrtime(startTime);
    const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

    const logEntry = {
      timestamp,
      requestId: req.id || 'unknown',
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs: `${timeInMs}ms`,
      ip: req.ip || req.socket?.remoteAddress || 'unknown',
    };

    if (config.isProduction) {
      // In production, output single-line JSON structured log
      console.log(JSON.stringify(logEntry));
    } else {
      // In development, output clean formatted text
      const statusColor =
        res.statusCode >= 500
          ? '\x1b[31m' // Red
          : res.statusCode >= 400
          ? '\x1b[33m' // Yellow
          : res.statusCode >= 300
          ? '\x1b[36m' // Cyan
          : '\x1b[32m'; // Green
      const resetColor = '\x1b[0m';

      console.log(
        `[${logEntry.timestamp}] [${logEntry.requestId.slice(0, 8)}] ${logEntry.method} ${logEntry.path} ${statusColor}${logEntry.status}${resetColor} - ${logEntry.durationMs}`
      );
    }
  });

  next();
};

export default loggerMiddleware;
