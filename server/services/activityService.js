import activityRepository from '../repositories/activityRepository.js';
import { validateActivity } from '../validators/activityValidator.js';

export const createActivity = async (userId, data) => {
  const validation = validateActivity(data);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }
  return await activityRepository.createActivity(userId, data);
};

export const getActivities = async (userId, query = {}) => {
  const filters = {
    type: query.type,
    entityType: query.entityType,
    entityId: query.entityId,
    limit: query.limit || 100,
  };
  return await activityRepository.findActivitiesByUser(userId, filters);
};

export const clearActivities = async (userId) => {
  return await activityRepository.clearActivities(userId);
};

export default {
  createActivity,
  getActivities,
  clearActivities,
};
