/**
 * Reminder input validator
 */

export const validateReminder = (data = {}, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      errors.push('Title is required and cannot be empty');
    } else if (data.title.trim().length > 255) {
      errors.push('Title cannot exceed 255 characters');
    }
  }

  if (!isUpdate && (!data.time || typeof data.time !== 'string')) {
    errors.push('Time is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  validateReminder,
};
