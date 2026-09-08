import reminderService from '../services/reminderService.js';

export const createReminder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reminder = await reminderService.createReminder(userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Reminder created',
      data: { reminder },
    });
  } catch (error) {
    next(error);
  }
};

export const getReminders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reminders = await reminderService.getReminders(userId, req.query);
    res.status(200).json({
      success: true,
      data: { reminders },
    });
  } catch (error) {
    next(error);
  }
};

export const getReminder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reminder = await reminderService.getReminderById(req.params.id, userId);
    res.status(200).json({
      success: true,
      data: { reminder },
    });
  } catch (error) {
    next(error);
  }
};

export const updateReminder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reminder = await reminderService.updateReminder(req.params.id, userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Reminder updated',
      data: { reminder },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReminder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await reminderService.deleteReminder(req.params.id, userId);
    res.status(200).json({
      success: true,
      message: 'Reminder deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const toggleReminder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reminder = await reminderService.toggleReminder(req.params.id, userId);
    res.status(200).json({
      success: true,
      message: 'Reminder toggled',
      data: { reminder },
    });
  } catch (error) {
    next(error);
  }
};

export const snoozeReminder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const minutes = req.body?.minutes || 10;
    const reminder = await reminderService.snoozeReminder(req.params.id, userId, minutes);
    res.status(200).json({
      success: true,
      message: `Reminder snoozed for ${minutes} minutes`,
      data: { reminder },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createReminder,
  getReminders,
  getReminder,
  updateReminder,
  deleteReminder,
  toggleReminder,
  snoozeReminder,
};
