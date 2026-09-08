import goalRepository from '../repositories/goalRepository.js';
import { validateCreateGoal, validateUpdateGoal } from '../validators/goalValidators.js';

export const createGoal = async (userId, data) => {
  const validation = validateCreateGoal(data);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  return await goalRepository.createGoal(userId, data);
};

export const getGoals = async (userId, query = {}) => {
  const filters = {
    status: query.status,
    priority: query.priority,
    category: query.category,
    search: query.search || query.q,
  };

  const sort = {
    sortBy: query.sortBy || 'createdAt',
    sortDirection: query.sortDirection || 'desc',
  };

  const pagination = {
    page: query.page ? parseInt(query.page, 10) : 1,
    limit: query.limit ? parseInt(query.limit, 10) : null,
  };

  return await goalRepository.findGoalsByUser(userId, filters, sort, pagination);
};

export const getGoalById = async (goalId, userId) => {
  const goal = await goalRepository.findGoalByIdForUser(goalId, userId);
  if (!goal) {
    const error = new Error('Goal not found');
    error.statusCode = 404;
    throw error;
  }
  return goal;
};

export const updateGoal = async (goalId, userId, updates) => {
  const existing = await goalRepository.findGoalByIdForUser(goalId, userId);
  if (!existing) {
    const error = new Error('Goal not found');
    error.statusCode = 404;
    throw error;
  }

  const validation = validateUpdateGoal(updates);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  return await goalRepository.updateGoal(goalId, userId, updates);
};

export const deleteGoal = async (goalId, userId) => {
  const existing = await goalRepository.findGoalByIdForUser(goalId, userId);
  if (!existing) {
    const error = new Error('Goal not found');
    error.statusCode = 404;
    throw error;
  }

  return await goalRepository.deleteGoal(goalId, userId);
};

export const completeGoal = async (goalId, userId) => {
  const existing = await goalRepository.findGoalByIdForUser(goalId, userId);
  if (!existing) {
    const error = new Error('Goal not found');
    error.statusCode = 404;
    throw error;
  }

  return await goalRepository.completeGoal(goalId, userId);
};

export const archiveGoal = async (goalId, userId) => {
  const existing = await goalRepository.findGoalByIdForUser(goalId, userId);
  if (!existing) {
    const error = new Error('Goal not found');
    error.statusCode = 404;
    throw error;
  }

  return await goalRepository.archiveGoal(goalId, userId);
};

export const restoreGoal = async (goalId, userId) => {
  const existing = await goalRepository.findGoalByIdForUser(goalId, userId);
  if (!existing) {
    const error = new Error('Goal not found');
    error.statusCode = 404;
    throw error;
  }

  return await goalRepository.restoreGoal(goalId, userId);
};

export const updateProgress = async (goalId, userId, progress) => {
  const existing = await goalRepository.findGoalByIdForUser(goalId, userId);
  if (!existing) {
    const error = new Error('Goal not found');
    error.statusCode = 404;
    throw error;
  }

  return await goalRepository.updateProgress(goalId, userId, progress);
};

export default {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  completeGoal,
  archiveGoal,
  restoreGoal,
  updateProgress,
};
