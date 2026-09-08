import mysql from 'mysql2/promise';
import config from './env.js';

let pool = null;

/**
 * Get or initialize MySQL connection pool
 */
export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      database: config.db.database,
      user: config.db.user,
      password: config.db.password,
      waitForConnections: config.db.waitForConnections,
      connectionLimit: config.db.connectionLimit,
      queueLimit: config.db.queueLimit,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }
  return pool;
};

/**
 * Test MySQL connection
 * Returns { connected: boolean, message: string, error?: string }
 */
export const testDbConnection = async () => {
  try {
    const currentPool = getPool();
    const connection = await currentPool.getConnection();
    try {
      await connection.query('SELECT 1 + 1 AS result');
      return {
        connected: true,
        message: 'MySQL connection successful',
      };
    } finally {
      connection.release();
    }
  } catch (error) {
    let friendlyMessage = 'Unable to connect to MySQL database.';

    if (error.code === 'ECONNREFUSED') {
      friendlyMessage = `MySQL server connection refused at ${config.db.host}:${config.db.port}. Please ensure the MySQL service is running.`;
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      friendlyMessage = `Access denied for user '${config.db.user}'. Please check DB_USER and DB_PASSWORD in server/.env.`;
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      friendlyMessage = `Database '${config.db.database}' does not exist. Please run server/database/schema.sql to initialize it.`;
    }

    return {
      connected: false,
      message: friendlyMessage,
      code: error.code || 'DB_ERROR',
    };
  }
};

/**
 * Gracefully close MySQL connection pool
 */
export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

export default {
  getPool,
  testDbConnection,
  closePool,
};

