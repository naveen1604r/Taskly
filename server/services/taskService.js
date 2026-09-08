import taskRepository from '../repositories/taskRepository.js';
import { validateCreateTask, validateUpdateTask, validateSubtask } from '../validators/taskValidators.js';

export const createTask = async (userId, data) => {
  const validation = validateCreateTask(data);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  return await taskRepository.createTask(userId, data);
};

export const getTasks = async (userId, query = {}) => {
  const filters = {
    status: query.status,
    priority: query.priority,
    category: query.category,
    projectId: query.projectId,
    goalId: query.goalId,
    dueDate: query.dueDate,
    plannedDate: query.plannedDate,
  };

  const sort = {
    sortBy: query.sortBy || 'createdAt',
    sortDirection: query.sortDirection || 'desc',
  };

  const pagination = {
    page: query.page ? parseInt(query.page, 10) : 1,
    limit: query.limit ? parseInt(query.limit, 10) : null,
  };

  return await taskRepository.findTasksByUser(userId, filters, sort, pagination);
};

export const getTaskById = async (taskId, userId) => {
  const task = await taskRepository.findTaskByIdForUser(taskId, userId);
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }
  return task;
};

export const updateTask = async (taskId, userId, updates) => {
  const existing = await taskRepository.findTaskByIdForUser(taskId, userId);
  if (!existing) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  const validation = validateUpdateTask(updates);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  return await taskRepository.updateTask(taskId, userId, updates);
};

export const deleteTask = async (taskId, userId) => {
  const existing = await taskRepository.findTaskByIdForUser(taskId, userId);
  if (!existing) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  return await taskRepository.deleteTask(taskId, userId);
};

export const completeTask = async (taskId, userId) => {
  const existing = await taskRepository.findTaskByIdForUser(taskId, userId);
  if (!existing) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  return await taskRepository.updateTask(taskId, userId, {
    status: 'completed',
    completedAt: new Date().toISOString(),
  });
};

export const updateTaskStatus = async (taskId, userId, status) => {
  const allowed = ['pending', 'in_progress', 'completed'];
  if (!allowed.includes(status)) {
    const error = new Error(`Invalid status: ${status}. Must be one of ${allowed.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const existing = await taskRepository.findTaskByIdForUser(taskId, userId);
  if (!existing) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  return await taskRepository.updateTask(taskId, userId, { status });
};

/**
 * Subtasks Service Methods
 */
export const createSubtask = async (taskId, userId, data) => {
  const task = await taskRepository.findTaskByIdForUser(taskId, userId);
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  const validation = validateSubtask(data);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  const position = Array.isArray(task.subtasks) ? task.subtasks.length : 0;
  return await taskRepository.createSubtask(taskId, userId, { ...data, position });
};

export const updateSubtask = async (subtaskId, taskId, userId, updates) => {
  const task = await taskRepository.findTaskByIdForUser(taskId, userId);
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  const updated = await taskRepository.updateSubtask(subtaskId, taskId, userId, updates);
  if (!updated) {
    const error = new Error('Subtask not found');
    error.statusCode = 404;
    throw error;
  }

  return updated;
};

export const deleteSubtask = async (subtaskId, taskId, userId) => {
  const task = await taskRepository.findTaskByIdForUser(taskId, userId);
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  const success = await taskRepository.deleteSubtask(subtaskId, taskId, userId);
  if (!success) {
    const error = new Error('Subtask not found');
    error.statusCode = 404;
    throw error;
  }

  return true;
};

export const getSubtasks = async (taskId, userId) => {
  const task = await taskRepository.findTaskByIdForUser(taskId, userId);
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  return await taskRepository.findSubtasksByTask(taskId, userId);
};

export default {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  completeTask,
  updateTaskStatus,
  getSubtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
};
