import { checkDatabaseHealth } from '../repositories/healthRepository.js';

export const getSystemHealth = async () => {
  const dbStatus = await checkDatabaseHealth();

  return {
    apiStatus: 'running',
    database: dbStatus.connected ? 'connected' : 'disconnected',
    databaseMessage: dbStatus.message,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  };
};

export default {
  getSystemHealth,
};
