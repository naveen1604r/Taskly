/**
 * Project input validators
 */

export const validateCreateProject = (data = {}) => {
  const errors = [];

  // Name
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.push('Project name is required and must be a non-empty string');
  } else if (data.name.trim().length > 255) {
    errors.push('Project name cannot exceed 255 characters');
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

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUpdateProject = (data = {}) => {
  const errors = [];

  // Name (optional on update, but cannot be empty if provided)
  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || !data.name.trim()) {
      errors.push('Project name cannot be empty');
    } else if (data.name.trim().length > 255) {
      errors.push('Project name cannot exceed 255 characters');
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

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  validateCreateProject,
  validateUpdateProject,
};
