import activityService from '../services/activityService.js';

export const createActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const activity = await activityService.createActivity(userId, req.body);
    res.status(201).json({
      success: true,
      data: { activity },
    });
  } catch (error) {
    next(error);
  }
};

export const getActivities = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const activities = await activityService.getActivities(userId, req.query);
    res.status(200).json({
      success: true,
      data: { activities },
    });
  } catch (error) {
    next(error);
  }
};

export const clearActivities = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await activityService.clearActivities(userId);
    res.status(200).json({
      success: true,
      message: 'All activities cleared',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createActivity,
  getActivities,
  clearActivities,
};
