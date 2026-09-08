import notificationRepository from '../repositories/notificationRepository.js';
import { validateNotification } from '../validators/notificationValidator.js';

export const createNotification = async (userId, data) => {
  const validation = validateNotification(data);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }
  return await notificationRepository.createNotification(userId, data);
};

export const getNotifications = async (userId, query = {}) => {
  const filters = {
    isRead: query.isRead !== undefined ? (query.isRead === 'true' || query.isRead === true) : undefined,
    limit: query.limit,
  };
  return await notificationRepository.findNotificationsByUser(userId, filters);
};

export const markAsRead = async (id, userId) => {
  const existing = await notificationRepository.findNotificationById(id, userId);
  if (!existing) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }
  return await notificationRepository.markAsRead(id, userId);
};

export const markAllAsRead = async (userId) => {
  return await notificationRepository.markAllAsRead(userId);
};

export const deleteNotification = async (id, userId) => {
  const existing = await notificationRepository.findNotificationById(id, userId);
  if (!existing) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }
  return await notificationRepository.deleteNotification(id, userId);
};

export const clearAllNotifications = async (userId) => {
  return await notificationRepository.clearAll(userId);
};

export default {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
};
