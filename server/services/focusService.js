import focusRepository from '../repositories/focusRepository.js';
import { validateCreateSession, validateUpdateSettings } from '../validators/focusValidator.js';

export const createSession = async (userId, data) => {
  const validation = validateCreateSession(data);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }
  return await focusRepository.createSession(userId, data);
};

export const getSessions = async (userId, query = {}) => {
  const filters = {
    completed: query.completed !== undefined ? (query.completed === 'true' || query.completed === true) : undefined,
    sessionType: query.sessionType,
    limit: query.limit,
  };
  return await focusRepository.findSessionsByUser(userId, filters);
};

export const getStats = async (userId) => {
  return await focusRepository.getStats(userId);
};

export const getSettings = async (userId) => {
  return await focusRepository.getSettings(userId);
};

export const updateSettings = async (userId, data) => {
  const validation = validateUpdateSettings(data);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }
  return await focusRepository.updateSettings(userId, data);
};

export default {
  createSession,
  getSessions,
  getStats,
  getSettings,
  updateSettings,
};
