import recurringTaskRepository from '../repositories/recurringTaskRepository.js';
import occurrenceRepository from '../repositories/occurrenceRepository.js';
import taskRepository from '../repositories/taskRepository.js';
import { validateRecurringTask } from '../validators/recurringTaskValidator.js';

export const createRecurringTask = async (userId, data) => {
  const validation = validateRecurringTask(data, false);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }
  return await recurringTaskRepository.createRecurringTask(userId, data);
};

export const getRecurringTasks = async (userId, query = {}) => {
  const filters = {
    isActive: query.isActive !== undefined ? (query.isActive === 'true' || query.isActive === true) : undefined,
  };
  return await recurringTaskRepository.findRecurringTasksByUser(userId, filters);
};

export const getRecurringTaskById = async (id, userId) => {
  const item = await recurringTaskRepository.findRecurringTaskById(id, userId);
  if (!item) {
    const error = new Error('Recurring task not found');
    error.statusCode = 404;
    throw error;
  }
  return item;
};

export const updateRecurringTask = async (id, userId, updates) => {
  const existing = await recurringTaskRepository.findRecurringTaskById(id, userId);
  if (!existing) {
    const error = new Error('Recurring task not found');
    error.statusCode = 404;
    throw error;
  }

  const validation = validateRecurringTask(updates, true);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  return await recurringTaskRepository.updateRecurringTask(id, userId, updates);
};

export const deleteRecurringTask = async (id, userId) => {
  const existing = await recurringTaskRepository.findRecurringTaskById(id, userId);
  if (!existing) {
    const error = new Error('Recurring task not found');
    error.statusCode = 404;
    throw error;
  }
  return await recurringTaskRepository.deleteRecurringTask(id, userId);
};

export const pauseRecurringTask = async (id, userId) => {
  const existing = await recurringTaskRepository.findRecurringTaskById(id, userId);
  if (!existing) {
    const error = new Error('Recurring task not found');
    error.statusCode = 404;
    throw error;
  }
  return await recurringTaskRepository.pauseRecurringTask(id, userId);
};

export const resumeRecurringTask = async (id, userId) => {
  const existing = await recurringTaskRepository.findRecurringTaskById(id, userId);
  if (!existing) {
    const error = new Error('Recurring task not found');
    error.statusCode = 404;
    throw error;
  }
  return await recurringTaskRepository.resumeRecurringTask(id, userId);
};

/**
 * Check if rule applies to a specific date string (YYYY-MM-DD)
 */
const doesRuleMatchDate = (rule, dateStr) => {
  if (rule.startDate && dateStr < rule.startDate) return false;
  if (rule.endDate && dateStr > rule.endDate) return false;

  const dateObj = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday

  switch (rule.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'weekly':
      if (Array.isArray(rule.daysOfWeek) && rule.daysOfWeek.length > 0) {
        return rule.daysOfWeek.includes(dayOfWeek);
      }
      return true;
    case 'monthly':
      if (rule.dayOfMonth) {
        return dateObj.getDate() === rule.dayOfMonth;
      }
      return true;
    default:
      return true;
  }
};

/**
 * Generate occurrences idempotently for active recurring tasks
 */
export const generateOccurrences = async (userId, targetDateStr = null) => {
  const dateStr = targetDateStr || new Date().toISOString().slice(0, 10);
  const activeRules = await recurringTaskRepository.findRecurringTasksByUser(userId, { isActive: true });

  const generatedTasks = [];

  for (const rule of activeRules) {
    if (!doesRuleMatchDate(rule, dateStr)) continue;

    // Check if occurrence already exists
    const existingOcc = await occurrenceRepository.findOccurrence(userId, rule.id, dateStr);
    if (existingOcc) continue;

    // Create a new task for this occurrence
    const newTask = await taskRepository.createTask(userId, {
      title: rule.title,
      description: rule.description,
      priority: rule.priority,
      category: rule.category,
      estimatedDuration: rule.estimatedDuration,
      dueDate: dateStr,
      dueTime: rule.time,
      plannedDate: dateStr,
      plannedStartTime: rule.time,
      projectId: rule.projectId,
      goalId: rule.goalId,
      tags: rule.tags,
      recurringTaskId: String(rule.id),
      occurrenceDate: dateStr,
    });

    // Record occurrence in database
    await occurrenceRepository.recordOccurrence(userId, rule.id, newTask.id, dateStr);
    await recurringTaskRepository.updateRecurringTask(rule.id, userId, {
      lastGeneratedDate: dateStr,
    });

    generatedTasks.push(newTask);
  }

  return generatedTasks;
};

export default {
  createRecurringTask,
  getRecurringTasks,
  getRecurringTaskById,
  updateRecurringTask,
  deleteRecurringTask,
  pauseRecurringTask,
  resumeRecurringTask,
  generateOccurrences,
};
