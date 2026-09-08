/**
 * Task and Subtask Utility Functions
 * Calculations, filtering, cloning, and state helpers
 */

/**
 * Generate a unique subtask ID
 */
export const generateSubtaskId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `subtask-${crypto.randomUUID()}`;
  }
  return `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a new subtask object
 */
export const createSubtask = (title, priority = 'medium') => {
  return {
    id: generateSubtaskId(),
    title: (title || '').trim(),
    completed: false,
    priority: priority || 'medium', // 'low' | 'medium' | 'high'
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
};

/**
 * Safely get subtasks array from a task
 */
export const getSubtasks = (task) => {
  if (!task || !Array.isArray(task.subtasks)) {
    return [];
  }
  return task.subtasks;
};

/**
 * Get completed subtasks for a task
 */
export const getCompletedSubtasks = (task) => {
  return getSubtasks(task).filter((st) => Boolean(st.completed));
};

/**
 * Get remaining (incomplete) subtasks for a task
 */
export const getRemainingSubtasks = (task) => {
  return getSubtasks(task).filter((st) => !st.completed);
};

/**
 * Calculate progress metrics for subtasks
 * Returns: { total, completed, remaining, percentage, isAllCompleted }
 */
export const calculateSubtaskProgress = (task) => {
  const subtasks = getSubtasks(task);
  const total = subtasks.length;
  if (total === 0) {
    return {
      total: 0,
      completed: 0,
      remaining: 0,
      percentage: 0,
      isAllCompleted: false,
    };
  }

  const completed = subtasks.filter((st) => Boolean(st.completed)).length;
  const remaining = total - completed;
  const percentage = Math.round((completed / total) * 100);
  const isAllCompleted = total > 0 && completed === total;

  return {
    total,
    completed,
    remaining,
    percentage,
    isAllCompleted,
  };
};

/**
 * Check if all subtasks are completed (only true if there is at least one subtask)
 */
export const areAllSubtasksCompleted = (task) => {
  const subtasks = getSubtasks(task);
  if (subtasks.length === 0) return false;
  return subtasks.every((st) => Boolean(st.completed));
};

/**
 * Calculate overall task completion percentage
 * If task has subtasks, derives from subtasks percentage;
 * otherwise 100% if task is completed, 50% if in_progress, 0% if pending.
 */
export const calculateTaskCompletionPercentage = (task) => {
  if (!task) return 0;
  const subtasks = getSubtasks(task);
  if (subtasks.length > 0) {
    return calculateSubtaskProgress(task).percentage;
  }
  if (task.status === 'completed') return 100;
  if (task.status === 'in_progress') return 50;
  return 0;
};

/**
 * Duplicate a task
 * Do NOT copy: id, status (reset to 'pending'), completedAt (null),
 * actualDuration (0), createdAt (new date), updatedAt (new date), focus history.
 * Subtasks are copied as incomplete subtasks with new IDs.
 */
export const duplicateTask = (task, options = {}) => {
  const now = new Date().toISOString();
  const baseSubtasks = getSubtasks(task);

  // Re-generate subtasks with fresh IDs and incomplete status
  const copiedSubtasks = (options.copySubtasks !== false ? baseSubtasks : []).map((st) => ({
    id: generateSubtaskId(),
    title: st.title,
    priority: st.priority || 'medium',
    completed: false,
    createdAt: now,
    completedAt: null,
  }));

  const newId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? `task-${crypto.randomUUID()}`
      : `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    ...task,
    id: newId,
    title: options.title || `${task.title} (Copy)`,
    description: task.description || '',
    status: 'pending',
    priority: task.priority || 'medium',
    category: task.category || 'General',
    tags: Array.isArray(task.tags) ? [...task.tags] : [],
    estimatedDuration: task.estimatedDuration || task.duration || 30,
    duration: task.duration || 30,
    durationUnit: task.durationUnit || 'minutes',
    actualDuration: 0,
    dueDate: task.dueDate || '',
    dueTime: task.dueTime || '',
    plannedDate: task.plannedDate || '',
    plannedStartTime: task.plannedStartTime || '',
    goalId: task.goalId || null,
    taskNotes: task.taskNotes || '',
    subtasks: copiedSubtasks,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };
};

/**
 * Format subtask count and percentage for compact display
 * e.g. "3/5 completed" or "60%"
 */
export const formatSubtaskSummary = (task) => {
  const { total, completed, percentage } = calculateSubtaskProgress(task);
  if (total === 0) return null;
  return {
    label: `${completed}/${total} completed`,
    percentage,
  };
};
