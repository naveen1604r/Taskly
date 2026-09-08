import { getSystemHealth } from '../services/healthService.js';
import { checkDatabaseHealth } from '../repositories/healthRepository.js';

/**
 * Handle GET /api/health (Liveness Probe)
 * Confirms that the Express API process is alive and accepting traffic.
 */
export const getHealth = async (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    message: 'Taskly API is running',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
};

/**
 * Handle GET /api/ready (Readiness Probe)
 * Verifies database connection readiness without exposing sensitive internals.
 */
export const getReadiness = async (req, res) => {
  try {
    const dbStatus = await checkDatabaseHealth();

    if (dbStatus.connected) {
      return res.status(200).json({
        success: true,
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(503).json({
      success: false,
      status: 'not_ready',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      status: 'not_ready',
      database: 'error',
      timestamp: new Date().toISOString(),
    });
  }
};

export default {
  getHealth,
  getReadiness,
};
