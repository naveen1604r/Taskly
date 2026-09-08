import { testDbConnection } from '../config/db.js';

export const checkDatabaseHealth = async () => {
  return await testDbConnection();
};

export default {
  checkDatabaseHealth,
};
