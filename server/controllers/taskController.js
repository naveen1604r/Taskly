import taskService from '../services/taskService.js';

export const createTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const task = await taskService.createTask(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await taskService.getTasks(userId, req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const task = await taskService.getTaskById(taskId, userId);

    res.status(200).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const task = await taskService.updateTask(taskId, userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    await taskService.deleteTask(taskId, userId);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const completeTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const task = await taskService.completeTask(taskId, userId);

    res.status(200).json({
      success: true,
      message: 'Task marked as completed',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { status } = req.body;
    const task = await taskService.updateTaskStatus(taskId, userId, status);

    res.status(200).json({
      success: true,
      message: 'Task status updated',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Subtask Controller Handlers
 */
export const createSubtask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.taskId;
    const subtask = await taskService.createSubtask(taskId, userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Subtask added successfully',
      data: { subtask },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubtask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.taskId;
    const subtaskId = req.params.subtaskId;
    const subtask = await taskService.updateSubtask(subtaskId, taskId, userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Subtask updated successfully',
      data: { subtask },
    });
  } catch (error) {
    next(error);
  }
};

export const getSubtasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.taskId;
    const subtasks = await taskService.getSubtasks(taskId, userId);

    res.status(200).json({
      success: true,
      data: { subtasks },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubtask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.taskId;
    const subtaskId = req.params.subtaskId;
    await taskService.deleteSubtask(subtaskId, taskId, userId);

    res.status(200).json({
      success: true,
      message: 'Subtask deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  completeTask,
  updateStatus,
  getSubtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
};
