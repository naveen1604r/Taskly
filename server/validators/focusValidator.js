/**
 * Focus session and settings validators
 */

export const validateCreateSession = (data = {}) => {
  const errors = [];

  if (data.duration_minutes !== undefined && data.duration_minutes !== null) {
    const duration = Number(data.duration_minutes);
    if (isNaN(duration) || duration <= 0) {
      errors.push('duration_minutes must be a positive number');
    }
  }

  if (data.rating !== undefined && data.rating !== null) {
    const rating = Number(data.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      errors.push('rating must be between 1 and 5');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUpdateSettings = (data = {}) => {
  const errors = [];

  const positiveNumericFields = [
    'pomodoro_duration',
    'short_break_duration',
    'long_break_duration',
    'long_break_interval',
  ];

  for (const field of positiveNumericFields) {
    if (data[field] !== undefined && data[field] !== null) {
      const val = Number(data[field]);
      if (isNaN(val) || val <= 0) {
        errors.push(`${field} must be a positive number`);
      }
    }
  }

  if (data.volume !== undefined && data.volume !== null) {
    const vol = Number(data.volume);
    if (isNaN(vol) || vol < 0 || vol > 100) {
      errors.push('volume must be between 0 and 100');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  validateCreateSession,
  validateUpdateSettings,
};
