/**
 * Taskly Production Rate Limiting Middleware
 * In-memory sliding window rate limiter with zero external dependencies.
 * Automatically cleans up expired windows, tracks client IP addresses,
 * and sets RFC-standard rate limit response headers.
 */

class MemoryStore {
  constructor(windowMs = 15 * 60 * 1000) {
    this.windowMs = windowMs;
    this.hits = new Map();

    // Periodic cleanup of stale IP windows every 5 minutes
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.hits.entries()) {
        if (now > record.resetTime) {
          this.hits.delete(key);
        }
      }
    }, 5 * 60 * 1000);

    // Ensure timer does not block Node process exit
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  increment(key) {
    const now = Date.now();
    let record = this.hits.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      this.hits.set(key, record);
      return {
        count: 1,
        resetTime: record.resetTime,
      };
    }

    record.count += 1;
    return {
      count: record.count,
      resetTime: record.resetTime,
    };
  }

  resetKey(key) {
    this.hits.delete(key);
  }

  resetAll() {
    this.hits.clear();
  }
}

/**
 * Factory for creating custom rate limiters
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 mins)
 * @param {number} options.max - Max requests allowed per window (default: 100)
 * @param {string} options.message - Error message on 429
 * @param {Function} options.keyGenerator - Function to extract client key (default: req.ip)
 */
export const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const max = options.max || 100;
  const message = options.message || 'Too many requests from this IP, please try again later.';
  const keyGenerator =
    options.keyGenerator ||
    ((req) => {
      return (
        req.ip ||
        req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.socket?.remoteAddress ||
        'unknown_ip'
      );
    });

  const store = new MemoryStore(windowMs);

  const rateLimiter = (req, res, next) => {
    // Skip if disabled (e.g. during specific automated tests if opted-out)
    if (req.skipRateLimit) {
      return next();
    }

    // Do not count preflight OPTIONS requests towards rate limit
    if (req.method === 'OPTIONS') {
      return next();
    }

    const key = keyGenerator(req);
    const { count, resetTime } = store.increment(key);
    const remaining = Math.max(0, max - count);
    const retryAfterSeconds = Math.ceil((resetTime - Date.now()) / 1000);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000));

    if (count > max) {
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        message,
        retryAfter: retryAfterSeconds,
      });
    }

    next();
  };

  rateLimiter.store = store;
  return rateLimiter;
};

/**
 * General API Rate Limiter
 * 500 requests per 15 minutes per IP
 */
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many API requests from this IP. Please try again in a few minutes.',
});

/**
 * Stricter Authentication Rate Limiter
 * 20 attempts per 15 minutes per IP to prevent brute-force attacks on login/register
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
});

export default {
  createRateLimiter,
  apiLimiter,
  authLimiter,
};
