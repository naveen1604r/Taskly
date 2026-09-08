/**
 * Habit and Habit Log input validators
 */

export const validateCreateHabit = (data = {}) => {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.push('Habit name is required and cannot be empty');
  } else if (data.name.trim().length > 255) {
    errors.push('Habit name cannot exceed 255 characters');
  }

  const validFrequencies = ['daily', 'weekly', 'weekdays', 'weekends', 'custom'];
  if (data.frequency && !validFrequencies.includes(data.frequency)) {
    errors.push(`Invalid frequency. Allowed: ${validFrequencies.join(', ')}`);
  }

  if (data.target_per_day !== undefined && data.target_per_day !== null) {
    const target = Number(data.target_per_day);
    if (isNaN(target) || target <= 0) {
      errors.push('target_per_day must be a positive integer');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUpdateHabit = (data = {}) => {
  const errors = [];

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || !data.name.trim()) {
      errors.push('Habit name cannot be empty');
    } else if (data.name.trim().length > 255) {
      errors.push('Habit name cannot exceed 255 characters');
    }
  }

  const validFrequencies = ['daily', 'weekly', 'weekdays', 'weekends', 'custom'];
  if (data.frequency && !validFrequencies.includes(data.frequency)) {
    errors.push(`Invalid frequency. Allowed: ${validFrequencies.join(', ')}`);
  }

  if (data.target_per_day !== undefined && data.target_per_day !== null) {
    const target = Number(data.target_per_day);
    if (isNaN(target) || target <= 0) {
      errors.push('target_per_day must be a positive integer');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateHabitLog = (data = {}) => {
  const errors = [];
  const dateVal = data.log_date || data.logDate;

  if (!dateVal || typeof dateVal !== 'string' || !dateVal.trim()) {
    errors.push('log_date is required (YYYY-MM-DD)');
  }

  if (data.progress_count !== undefined && data.progress_count !== null) {
    const count = Number(data.progress_count);
    if (isNaN(count) || count < 0) {
      errors.push('progress_count must be a non-negative number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  validateCreateHabit,
  validateUpdateHabit,
  validateHabitLog,
};
