/**
 * Notification input validator
 */

export const validateNotification = (data = {}) => {
  const errors = [];

  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    errors.push('Notification title is required');
  }

  if (!data.message || typeof data.message !== 'string' || !data.message.trim()) {
    errors.push('Notification message is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  validateNotification,
};
