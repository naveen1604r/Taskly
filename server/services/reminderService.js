import reminderRepository from '../repositories/reminderRepository.js';
import { validateReminder } from '../validators/reminderValidator.js';

export const createReminder = async (userId, data) => {
  const validation = validateReminder(data, false);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }
  return await reminderRepository.createReminder(userId, data);
};

export const getReminders = async (userId, query = {}) => {
  const filters = {
    enabled: query.enabled !== undefined ? (query.enabled === 'true' || query.enabled === true) : undefined,
  };
  return await reminderRepository.findRemindersByUser(userId, filters);
};

export const getReminderById = async (id, userId) => {
  const reminder = await reminderRepository.findReminderById(id, userId);
  if (!reminder) {
    const error = new Error('Reminder not found');
    error.statusCode = 404;
    throw error;
  }
  return reminder;
};

export const updateReminder = async (id, userId, updates) => {
  const existing = await reminderRepository.findReminderById(id, userId);
  if (!existing) {
    const error = new Error('Reminder not found');
    error.statusCode = 404;
    throw error;
  }

  const validation = validateReminder(updates, true);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  return await reminderRepository.updateReminder(id, userId, updates);
};

export const deleteReminder = async (id, userId) => {
  const existing = await reminderRepository.findReminderById(id, userId);
  if (!existing) {
    const error = new Error('Reminder not found');
    error.statusCode = 404;
    throw error;
  }
  return await reminderRepository.deleteReminder(id, userId);
};

export const toggleReminder = async (id, userId) => {
  const existing = await reminderRepository.findReminderById(id, userId);
  if (!existing) {
    const error = new Error('Reminder not found');
    error.statusCode = 404;
    throw error;
  }
  return await reminderRepository.toggleReminder(id, userId);
};

export const snoozeReminder = async (id, userId, minutes) => {
  const existing = await reminderRepository.findReminderById(id, userId);
  if (!existing) {
    const error = new Error('Reminder not found');
    error.statusCode = 404;
    throw error;
  }
  return await reminderRepository.snoozeReminder(id, userId, minutes);
};

export default {
  createReminder,
  getReminders,
  getReminderById,
  updateReminder,
  deleteReminder,
  toggleReminder,
  snoozeReminder,
};
