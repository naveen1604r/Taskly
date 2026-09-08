/**
 * Recurring task validator
 */

export const validateRecurringTask = (data = {}, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      errors.push('Title is required and cannot be empty');
    } else if (data.title.trim().length > 255) {
      errors.push('Title cannot exceed 255 characters');
    }
  }

  const validFrequencies = ['daily', 'weekly', 'biweekly', 'monthly', 'yearly', 'weekdays', 'custom'];
  if (data.frequency && !validFrequencies.includes(data.frequency)) {
    errors.push(`Invalid frequency. Allowed: ${validFrequencies.join(', ')}`);
  }

  if (data.priority) {
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(data.priority)) {
      errors.push(`Invalid priority. Allowed: ${validPriorities.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  validateRecurringTask,
};
