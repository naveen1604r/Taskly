/**
 * Goal input validators
 */

export const validateCreateGoal = (data = {}) => {
  const errors = [];

  // Title
  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    errors.push('Goal title is required and must be a non-empty string');
  } else if (data.title.trim().length > 255) {
    errors.push('Goal title cannot exceed 255 characters');
  }

  // Description
  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== 'string') {
      errors.push('Description must be a string');
    } else if (data.description.length > 5000) {
      errors.push('Description cannot exceed 5000 characters');
    }
  }

  // Status
  const validStatuses = ['active', 'completed', 'archived'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  // Priority
  const validPriorities = ['low', 'medium', 'high'];
  if (data.priority && !validPriorities.includes(data.priority)) {
    errors.push(`Priority must be one of: ${validPriorities.join(', ')}`);
  }

  // Progress Mode
  const validModes = ['manual', 'task', 'milestone'];
  if (data.progressMode && !validModes.includes(data.progressMode)) {
    errors.push(`Progress mode must be one of: ${validModes.join(', ')}`);
  }

  // Progress
  if (data.progress !== undefined && data.progress !== null) {
    const num = Number(data.progress);
    if (isNaN(num) || num < 0 || num > 100) {
      errors.push('Progress must be a number between 0 and 100');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUpdateGoal = (data = {}) => {
  const errors = [];

  // Title (optional on update)
  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || !data.title.trim()) {
      errors.push('Goal title cannot be empty');
    } else if (data.title.trim().length > 255) {
      errors.push('Goal title cannot exceed 255 characters');
    }
  }

  // Description
  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== 'string') {
      errors.push('Description must be a string');
    } else if (data.description.length > 5000) {
      errors.push('Description cannot exceed 5000 characters');
    }
  }

  // Status
  const validStatuses = ['active', 'completed', 'archived'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  // Priority
  const validPriorities = ['low', 'medium', 'high'];
  if (data.priority && !validPriorities.includes(data.priority)) {
    errors.push(`Priority must be one of: ${validPriorities.join(', ')}`);
  }

  // Progress Mode
  const validModes = ['manual', 'task', 'milestone'];
  if (data.progressMode && !validModes.includes(data.progressMode)) {
    errors.push(`Progress mode must be one of: ${validModes.join(', ')}`);
  }

  // Progress
  if (data.progress !== undefined && data.progress !== null) {
    const num = Number(data.progress);
    if (isNaN(num) || num < 0 || num > 100) {
      errors.push('Progress must be a number between 0 and 100');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  validateCreateGoal,
  validateUpdateGoal,
};
