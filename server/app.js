import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/env.js';
import apiRoutes from './routes/index.js';
import notFoundHandler from './middleware/notFoundMiddleware.js';
import errorHandler from './middleware/errorMiddleware.js';
import requestIdMiddleware from './middleware/requestIdMiddleware.js';
import loggerMiddleware from './middleware/loggerMiddleware.js';
import { apiLimiter, authLimiter } from './middleware/rateLimitMiddleware.js';

const app = express();

// 1. Request ID Middleware (Attach UUID to req.id and response header X-Request-Id)
app.use(requestIdMiddleware);

// 2. Structured Production Logging
app.use(loggerMiddleware);

// 3. Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // REST API JSON endpoints
    hidePoweredBy: true,
    xssFilter: true,
    noSniff: true,
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: config.isProduction
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
  })
);

// 4. CORS Configuration
// In production, strictly restrict to CLIENT_URL. In development, allow localhost/127.0.0.1.
const allowedOrigins = config.isProduction
  ? (config.clientUrl || '').split(',').map((url) => url.trim()).filter(Boolean)
  : [
      config.clientUrl,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
    ].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'],
  })
);

// 5. Request Body Parsing (Restricted to 1MB)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 6. Rate Limiting
// Apply stricter rate limiter to authentication endpoints (prevent brute-force attacks)
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Apply general API rate limiter to all /api routes
app.use('/api', apiLimiter);

// 7. Root API Discovery Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'Taskly Productivity API',
    version: '1.0.0',
    environment: config.nodeEnv,
    health: '/api/health',
    readiness: '/api/ready',
  });
});

// 8. Register All API Routes under /api prefix
app.use('/api', apiRoutes);

// 9. 404 Handler for undefined routes
app.use(notFoundHandler);

// 10. Centralized Production Error Handling Middleware
app.use(errorHandler);

export default app;
