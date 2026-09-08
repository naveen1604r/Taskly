/**
 * Task Templates storage and blueprint utilities
 */

export const TEMPLATES_STORAGE_KEY = 'taskly_task_templates';

const defaultTemplates = [];

export const loadTemplatesFromStorage = () => {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load templates from localStorage:', e);
    return [];
  }
};

export const saveTemplatesToStorage = (templates) => {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save templates to localStorage:', e);
  }
};

export const createTemplateBlueprintFromTask = (task, templateName) => {
  return {
    id: `template-${Date.now()}`,
    name: templateName?.trim() || task.title,
    title: task.title,
    description: task.description || '',
    priority: task.priority || 'medium',
    category: task.category || 'General',
    estimatedDuration: task.estimatedDuration || task.duration || 60,
    goalId: task.goalId || null,
    usageCount: 0,
    lastUsedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
