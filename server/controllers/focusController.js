import focusService from '../services/focusService.js';

export const createSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const session = await focusService.createSession(userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Focus session recorded',
      data: { session },
    });
  } catch (error) {
    next(error);
  }
};

export const getSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessions = await focusService.getSessions(userId, req.query);
    res.status(200).json({
      success: true,
      data: { sessions },
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const stats = await focusService.getStats(userId);
    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};

export const getSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const settings = await focusService.getSettings(userId);
    res.status(200).json({
      success: true,
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const settings = await focusService.updateSettings(userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Focus settings updated',
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createSession,
  getSessions,
  getStats,
  getSettings,
  updateSettings,
};
