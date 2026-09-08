import habitService from '../services/habitService.js';

export const createHabit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const habit = await habitService.createHabit(userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Habit created successfully',
      data: { habit },
    });
  } catch (error) {
    next(error);
  }
};

export const getHabits = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const habits = await habitService.getHabits(userId, req.query);
    res.status(200).json({
      success: true,
      data: { habits },
    });
  } catch (error) {
    next(error);
  }
};

export const getHabit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const habit = await habitService.getHabitById(req.params.id, userId);
    res.status(200).json({
      success: true,
      data: { habit },
    });
  } catch (error) {
    next(error);
  }
};

export const updateHabit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const habit = await habitService.updateHabit(req.params.id, userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Habit updated successfully',
      data: { habit },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHabit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await habitService.deleteHabit(req.params.id, userId);
    res.status(200).json({
      success: true,
      message: 'Habit deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const archiveHabit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const habit = await habitService.archiveHabit(req.params.id, userId);
    res.status(200).json({
      success: true,
      message: 'Habit archived',
      data: { habit },
    });
  } catch (error) {
    next(error);
  }
};

export const restoreHabit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const habit = await habitService.restoreHabit(req.params.id, userId);
    res.status(200).json({
      success: true,
      message: 'Habit restored',
      data: { habit },
    });
  } catch (error) {
    next(error);
  }
};

export const logProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const habitId = req.params.id;
    const result = await habitService.logProgress(habitId, userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Habit progress logged',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getHabitLogs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const habitId = req.params.id;
    const logs = await habitService.getHabitLogs(habitId, userId, req.query);
    res.status(200).json({
      success: true,
      data: { logs },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllHabitLogs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const logs = await habitService.getAllHabitLogs(userId, req.query);
    res.status(200).json({
      success: true,
      data: { logs },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createHabit,
  getHabits,
  getHabit,
  updateHabit,
  deleteHabit,
  archiveHabit,
  restoreHabit,
  logProgress,
  getHabitLogs,
  getAllHabitLogs,
};
