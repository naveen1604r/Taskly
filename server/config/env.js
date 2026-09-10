import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Determine if SSL is required for MySQL connection
const getDbSslConfig = () => {
  if (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') {
    return { rejectUnauthorized: false };
  }
  if (process.env.DB_SSL === 'false' || process.env.DB_SSL === '0') {
    return undefined;
  }
  // Auto-enable SSL in production when connecting to a remote host (cloud MySQL providers require SSL)
  const host = process.env.DB_HOST || '';
  if (
    process.env.NODE_ENV === 'production' &&
    host &&
    host !== 'localhost' &&
    host !== '127.0.0.1'
  ) {
    return { rejectUnauthorized: false };
  }
  return undefined;
};

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    database: process.env.DB_NAME || 'taskly',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    ssl: getDbSslConfig(),
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'taskly_dev_jwt_secret_key_change_in_production_987654321',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};

export const validateEnv = () => {
  const errors = [];
  const warnings = [];

  const isProd = process.env.NODE_ENV === 'production';

  // Check critical production variables
  if (isProd) {
    if (!process.env.JWT_SECRET) {
      errors.push('JWT_SECRET must be explicitly defined in production.');
    } else if (
      process.env.JWT_SECRET === 'taskly_dev_jwt_secret_key_change_in_production_987654321' ||
      process.env.JWT_SECRET.length < 32
    ) {
      errors.push('JWT_SECRET must be a strong, unique key with at least 32 characters in production.');
    }

    if (!process.env.DB_HOST) {
      errors.push('DB_HOST is required in production.');
    } else if (process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1') {
      warnings.push("DB_HOST is set to 'localhost'. Render cannot access your local PC's MySQL database. Please provide a remote cloud MySQL host.");
    }

    if (!process.env.DB_USER) {
      errors.push('DB_USER is required in production.');
    }
    if (!process.env.DB_NAME) {
      errors.push('DB_NAME is required in production.');
    }
    if (!process.env.CLIENT_URL) {
      errors.push('CLIENT_URL is required in production to restrict CORS.');
    }
  } else {
    // Development warnings
    if (!process.env.JWT_SECRET) {
      warnings.push('JWT_SECRET not provided in development; using fallback development key.');
    }
    if (!process.env.DB_PASSWORD) {
      warnings.push('DB_PASSWORD is empty.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export default config;

