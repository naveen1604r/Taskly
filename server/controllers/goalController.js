import goalService from '../services/goalService.js';

export const createGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const goal = await goalService.createGoal(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: { goal },
    });
  } catch (error) {
    next(error);
  }
};

export const getGoals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await goalService.getGoals(userId, req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const goal = await goalService.getGoalById(goalId, userId);

    res.status(200).json({
      success: true,
      data: { goal },
    });
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const goal = await goalService.updateGoal(goalId, userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: { goal },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    await goalService.deleteGoal(goalId, userId);

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully. Associated projects and tasks have been unlinked.',
    });
  } catch (error) {
    next(error);
  }
};

export const completeGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const goal = await goalService.completeGoal(goalId, userId);

    res.status(200).json({
      success: true,
      message: 'Goal completed successfully',
      data: { goal },
    });
  } catch (error) {
    next(error);
  }
};

export const archiveGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const goal = await goalService.archiveGoal(goalId, userId);

    res.status(200).json({
      success: true,
      message: 'Goal archived',
      data: { goal },
    });
  } catch (error) {
    next(error);
  }
};

export const restoreGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const goal = await goalService.restoreGoal(goalId, userId);

    res.status(200).json({
      success: true,
      message: 'Goal restored to active',
      data: { goal },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const { progress } = req.body;
    const goal = await goalService.updateProgress(goalId, userId, progress);

    res.status(200).json({
      success: true,
      message: 'Goal progress updated successfully',
      data: { goal },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  completeGoal,
  archiveGoal,
  restoreGoal,
  updateProgress,
};
