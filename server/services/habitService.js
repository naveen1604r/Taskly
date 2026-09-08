import habitRepository from '../repositories/habitRepository.js';
import habitLogRepository from '../repositories/habitLogRepository.js';
import { validateCreateHabit, validateUpdateHabit, validateHabitLog } from '../validators/habitValidator.js';

export const createHabit = async (userId, data) => {
  const validation = validateCreateHabit(data);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }
  return await habitRepository.createHabit(userId, data);
};

export const getHabits = async (userId, query = {}) => {
  const filters = {
    archived: query.archived !== undefined ? (query.archived === 'true' || query.archived === true) : undefined,
    category: query.category,
    frequency: query.frequency,
  };
  return await habitRepository.findHabitsByUser(userId, filters);
};

export const getHabitById = async (habitId, userId) => {
  const habit = await habitRepository.findHabitByIdForUser(habitId, userId);
  if (!habit) {
    const error = new Error('Habit not found');
    error.statusCode = 404;
    throw error;
  }
  return habit;
};

export const updateHabit = async (habitId, userId, updates) => {
  const existing = await habitRepository.findHabitByIdForUser(habitId, userId);
  if (!existing) {
    const error = new Error('Habit not found');
    error.statusCode = 404;
    throw error;
  }

  const validation = validateUpdateHabit(updates);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  return await habitRepository.updateHabit(habitId, userId, updates);
};

export const deleteHabit = async (habitId, userId) => {
  const existing = await habitRepository.findHabitByIdForUser(habitId, userId);
  if (!existing) {
    const error = new Error('Habit not found');
    error.statusCode = 404;
    throw error;
  }
  return await habitRepository.deleteHabit(habitId, userId);
};

export const archiveHabit = async (habitId, userId) => {
  const existing = await habitRepository.findHabitByIdForUser(habitId, userId);
  if (!existing) {
    const error = new Error('Habit not found');
    error.statusCode = 404;
    throw error;
  }
  return await habitRepository.archiveHabit(habitId, userId);
};

export const restoreHabit = async (habitId, userId) => {
  const existing = await habitRepository.findHabitByIdForUser(habitId, userId);
  if (!existing) {
    const error = new Error('Habit not found');
    error.statusCode = 404;
    throw error;
  }
  return await habitRepository.restoreHabit(habitId, userId);
};

// Habit Logs
export const logProgress = async (habitId, userId, data) => {
  const existing = await habitRepository.findHabitByIdForUser(habitId, userId);
  if (!existing) {
    const error = new Error('Habit not found');
    error.statusCode = 404;
    throw error;
  }

  const validation = validateHabitLog(data);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  const log = await habitLogRepository.upsertLog(
    userId,
    habitId,
    data.log_date || data.logDate,
    data.completed,
    data.progress_count !== undefined ? data.progress_count : data.progressCount,
    data.notes
  );

  const updatedHabit = await habitRepository.findHabitByIdForUser(habitId, userId);
  return { log, habit: updatedHabit };
};

export const getHabitLogs = async (habitId, userId, query = {}) => {
  const existing = await habitRepository.findHabitByIdForUser(habitId, userId);
  if (!existing) {
    const error = new Error('Habit not found');
    error.statusCode = 404;
    throw error;
  }
  return await habitLogRepository.getLogsForHabit(userId, habitId, query.startDate, query.endDate);
};

export const getAllHabitLogs = async (userId, query = {}) => {
  return await habitLogRepository.getAllLogsForUser(userId, query.startDate, query.endDate);
};

export default {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
  archiveHabit,
  restoreHabit,
  logProgress,
  getHabitLogs,
  getAllHabitLogs,
};
