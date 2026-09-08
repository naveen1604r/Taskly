import projectRepository from '../repositories/projectRepository.js';
import goalRepository from '../repositories/goalRepository.js';
import { validateCreateProject, validateUpdateProject } from '../validators/projectValidators.js';

export const createProject = async (userId, data) => {
  const validation = validateCreateProject(data);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  // Requirement 20: Verify goal ownership before linking
  if (data.goalId) {
    const linkedGoal = await goalRepository.findGoalByIdForUser(data.goalId, userId);
    if (!linkedGoal) {
      const error = new Error('Assigned goal not found or does not belong to you');
      error.statusCode = 400;
      throw error;
    }
  }

  return await projectRepository.createProject(userId, data);
};

export const getProjects = async (userId, query = {}) => {
  const filters = {
    status: query.status,
    priority: query.priority,
    goalId: query.goalId,
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

  return await projectRepository.findProjectsByUser(userId, filters, sort, pagination);
};

export const getProjectById = async (projectId, userId) => {
  const project = await projectRepository.findProjectByIdForUser(projectId, userId);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }
  return project;
};

export const updateProject = async (projectId, userId, updates) => {
  const existing = await projectRepository.findProjectByIdForUser(projectId, userId);
  if (!existing) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const validation = validateUpdateProject(updates);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  // Requirement 20: Verify goal ownership if updating goalId
  if (updates.goalId) {
    const linkedGoal = await goalRepository.findGoalByIdForUser(updates.goalId, userId);
    if (!linkedGoal) {
      const error = new Error('Assigned goal not found or does not belong to you');
      error.statusCode = 400;
      throw error;
    }
  }

  return await projectRepository.updateProject(projectId, userId, updates);
};

export const deleteProject = async (projectId, userId) => {
  const existing = await projectRepository.findProjectByIdForUser(projectId, userId);
  if (!existing) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  return await projectRepository.deleteProject(projectId, userId);
};

export const completeProject = async (projectId, userId) => {
  const existing = await projectRepository.findProjectByIdForUser(projectId, userId);
  if (!existing) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  return await projectRepository.completeProject(projectId, userId);
};

export const archiveProject = async (projectId, userId) => {
  const existing = await projectRepository.findProjectByIdForUser(projectId, userId);
  if (!existing) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  return await projectRepository.archiveProject(projectId, userId);
};

export const restoreProject = async (projectId, userId) => {
  const existing = await projectRepository.findProjectByIdForUser(projectId, userId);
  if (!existing) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  return await projectRepository.restoreProject(projectId, userId);
};

export default {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  completeProject,
  archiveProject,
  restoreProject,
};
