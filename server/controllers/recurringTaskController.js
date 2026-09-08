import recurringTaskService from '../services/recurringTaskService.js';

export const createRecurringTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const task = await recurringTaskService.createRecurringTask(userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Recurring task created',
      data: { recurringTask: task },
    });
  } catch (error) {
    next(error);
  }
};

export const getRecurringTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const recurringTasks = await recurringTaskService.getRecurringTasks(userId, req.query);
    res.status(200).json({
      success: true,
      data: { recurringTasks },
    });
  } catch (error) {
    next(error);
  }
};

export const getRecurringTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const recurringTask = await recurringTaskService.getRecurringTaskById(req.params.id, userId);
    res.status(200).json({
      success: true,
      data: { recurringTask },
    });
  } catch (error) {
    next(error);
  }
};

export const updateRecurringTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const recurringTask = await recurringTaskService.updateRecurringTask(req.params.id, userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Recurring task updated',
      data: { recurringTask },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRecurringTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await recurringTaskService.deleteRecurringTask(req.params.id, userId);
    res.status(200).json({
      success: true,
      message: 'Recurring task deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const pauseRecurringTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const recurringTask = await recurringTaskService.pauseRecurringTask(req.params.id, userId);
    res.status(200).json({
      success: true,
      message: 'Recurring task paused',
      data: { recurringTask },
    });
  } catch (error) {
    next(error);
  }
};

export const resumeRecurringTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const recurringTask = await recurringTaskService.resumeRecurringTask(req.params.id, userId);
    res.status(200).json({
      success: true,
      message: 'Recurring task resumed',
      data: { recurringTask },
    });
  } catch (error) {
    next(error);
  }
};

export const generateOccurrences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const targetDate = req.body?.targetDate || req.query?.targetDate;
    const tasks = await recurringTaskService.generateOccurrences(userId, targetDate);
    res.status(200).json({
      success: true,
      message: `Generated ${tasks.length} new occurrences`,
      data: { tasks },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createRecurringTask,
  getRecurringTasks,
  getRecurringTask,
  updateRecurringTask,
  deleteRecurringTask,
  pauseRecurringTask,
  resumeRecurringTask,
  generateOccurrences,
};
