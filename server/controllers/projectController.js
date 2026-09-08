import projectService from '../services/projectService.js';

export const createProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const project = await projectService.createProject(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await projectService.getProjects(userId, req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;
    const project = await projectService.getProjectById(projectId, userId);

    res.status(200).json({
      success: true,
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;
    const project = await projectService.updateProject(projectId, userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;
    await projectService.deleteProject(projectId, userId);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully. Associated tasks have been unassigned.',
    });
  } catch (error) {
    next(error);
  }
};

export const completeProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;
    const project = await projectService.completeProject(projectId, userId);

    res.status(200).json({
      success: true,
      message: 'Project marked as completed',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

export const archiveProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;
    const project = await projectService.archiveProject(projectId, userId);

    res.status(200).json({
      success: true,
      message: 'Project archived',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

export const restoreProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;
    const project = await projectService.restoreProject(projectId, userId);

    res.status(200).json({
      success: true,
      message: 'Project restored to active',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  completeProject,
  archiveProject,
  restoreProject,
};
