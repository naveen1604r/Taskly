/**
 * Task and Subtask Validation Utilities
 */

const ALLOWED_STATUSES = ['pending', 'in_progress', 'completed'];
const ALLOWED_PRIORITIES = ['low', 'medium', 'high'];

export const validateCreateTask = (data = {}) => {
  const errors = [];

  // Title
  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    errors.push('Task title is required.');
  } else if (data.title.trim().length > 255) {
    errors.push('Task title must not exceed 255 characters.');
  }

  // Description
  if (data.description && typeof data.description === 'string' && data.description.length > 5000) {
    errors.push('Task description must not exceed 5000 characters.');
  }

  // Status
  if (data.status && !ALLOWED_STATUSES.includes(data.status)) {
    errors.push(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}.`);
  }

  // Priority
  if (data.priority && !ALLOWED_PRIORITIES.includes(data.priority)) {
    errors.push(`Priority must be one of: ${ALLOWED_PRIORITIES.join(', ')}.`);
  }

  // Duration
  if (data.estimatedDuration !== undefined && (isNaN(Number(data.estimatedDuration)) || Number(data.estimatedDuration) < 0)) {
    errors.push('Estimated duration must be a non-negative number.');
  }

  if (data.actualDuration !== undefined && (isNaN(Number(data.actualDuration)) || Number(data.actualDuration) < 0)) {
    errors.push('Actual duration must be a non-negative number.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUpdateTask = (data = {}) => {
  const errors = [];

  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || !data.title.trim()) {
      errors.push('Task title cannot be empty.');
    } else if (data.title.trim().length > 255) {
      errors.push('Task title must not exceed 255 characters.');
    }
  }

  if (data.status !== undefined && !ALLOWED_STATUSES.includes(data.status)) {
    errors.push(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}.`);
  }

  if (data.priority !== undefined && !ALLOWED_PRIORITIES.includes(data.priority)) {
    errors.push(`Priority must be one of: ${ALLOWED_PRIORITIES.join(', ')}.`);
  }

  if (data.estimatedDuration !== undefined && (isNaN(Number(data.estimatedDuration)) || Number(data.estimatedDuration) < 0)) {
    errors.push('Estimated duration must be a non-negative number.');
  }

  if (data.actualDuration !== undefined && (isNaN(Number(data.actualDuration)) || Number(data.actualDuration) < 0)) {
    errors.push('Actual duration must be a non-negative number.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateSubtask = (data = {}) => {
  const errors = [];

  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    errors.push('Subtask title is required.');
  } else if (data.title.trim().length > 255) {
    errors.push('Subtask title must not exceed 255 characters.');
  }

  if (data.priority && !ALLOWED_PRIORITIES.includes(data.priority)) {
    errors.push(`Priority must be one of: ${ALLOWED_PRIORITIES.join(', ')}.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  validateCreateTask,
  validateUpdateTask,
  validateSubtask,
};
