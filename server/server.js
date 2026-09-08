import app from './app.js';
import config, { validateEnv } from './config/env.js';
import { testDbConnection, closePool } from './config/db.js';
import { initializeDatabase } from './database/initDb.js';

const PORT = process.env.PORT || config.port || 5000;

/**
 * Start the Taskly Express Server
 */
const startServer = async () => {
  try {
    console.log('====================================================');
    console.log('       TASKLY BACKEND SERVER INITIALIZATION        ');
    console.log('====================================================');
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Target Port: ${PORT}`);
    console.log(`Client URL:  ${config.clientUrl}`);
    console.log('----------------------------------------------------');

    // 1. Validate Production Environment Variables
    const envStatus = validateEnv();
    if (!envStatus.isValid) {
      console.error('❌ FATAL: Production environment validation failed:');
      envStatus.errors.forEach((err) => console.error(`  - ${err}`));
      console.error('\nPlease check server/.env and verify all required variables.\n');
      process.exit(1);
    }

    if (envStatus.warnings.length > 0) {
      envStatus.warnings.forEach((warn) => console.warn(`⚠ ${warn}`));
    }

    // 2. Test Database Connectivity
    console.log('Checking MySQL database connection...');
    const dbStatus = await testDbConnection();

    if (dbStatus.connected) {
      console.log('✔ MySQL Connection: CONNECTED (Database ready)');
      await initializeDatabase();
    } else {
      console.warn('⚠ MySQL Connection: DISCONNECTED');
      console.warn(`  Reason: ${dbStatus.message}`);
      console.warn('  Note: Server will continue running with in-memory resilient fallback. Check server/.env when ready.');
    }

    console.log('----------------------------------------------------');

    // 3. Start HTTP Listener
    const server = app.listen(PORT, () => {
      console.log(`🚀 Taskly API Server running at: http://localhost:${PORT}`);
      console.log(`🩺 Health check available at:     http://localhost:${PORT}/api/health`);
      console.log(` ready check available at:      http://localhost:${PORT}/api/ready`);
      console.log('====================================================\n');
    });

    // 4. Graceful Shutdown Handlers
    let isShuttingDown = false;
    const handleShutdown = async (signal) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      console.log(`\nReceived ${signal}. Gracefully terminating Taskly server...`);

      // 1. Stop accepting new HTTP requests
      server.close(async () => {
        console.log('✔ HTTP server stopped accepting connections.');

        // 2. Close MySQL connection pool
        try {
          await closePool();
          console.log('✔ MySQL connection pool closed successfully.');
        } catch (dbErr) {
          console.error('Error closing MySQL pool:', dbErr.message);
        }

        console.log('Taskly backend shutdown complete. Exiting cleanly.');
        process.exit(0);
      });

      // Force exit if shutdown takes longer than 10 seconds
      setTimeout(() => {
        console.error('Shutdown timed out after 10s, forcing exit.');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));

    // 5. Uncaught Exceptions & Rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Promise Rejection:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
    });
  } catch (error) {
    console.error('Fatal error during Taskly server startup:', error.message);
    process.exit(1);
  }
};

startServer();
