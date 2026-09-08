/**
 * Note input validators
 */

export const validateCreateNote = (data = {}) => {
  const errors = [];

  // Title
  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    errors.push('Note title is required and must be a non-empty string');
  } else if (data.title.trim().length > 255) {
    errors.push('Note title cannot exceed 255 characters');
  }

  // Content
  if (data.content === undefined || data.content === null || typeof data.content !== 'string' || !data.content.trim()) {
    errors.push('Note content is required and cannot be empty');
  }

  // Category
  if (data.category && typeof data.category === 'string' && data.category.length > 100) {
    errors.push('Category cannot exceed 100 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUpdateNote = (data = {}) => {
  const errors = [];

  // Title (optional on update)
  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || !data.title.trim()) {
      errors.push('Note title cannot be empty');
    } else if (data.title.trim().length > 255) {
      errors.push('Note title cannot exceed 255 characters');
    }
  }

  // Content
  if (data.content !== undefined) {
    if (typeof data.content !== 'string' || !data.content.trim()) {
      errors.push('Note content cannot be empty');
    }
  }

  // Category
  if (data.category && typeof data.category === 'string' && data.category.length > 100) {
    errors.push('Category cannot exceed 100 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  validateCreateNote,
  validateUpdateNote,
};
