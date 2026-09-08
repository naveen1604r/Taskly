/**
 * Activity log input validator
 */

export const validateActivity = (data = {}) => {
  const errors = [];

  if (!data.type || typeof data.type !== 'string' || !data.type.trim()) {
    errors.push('Activity type is required');
  }

  if (!data.description || typeof data.description !== 'string' || !data.description.trim()) {
    errors.push('Activity description is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  validateActivity,
};
