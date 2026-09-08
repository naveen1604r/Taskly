import { getTodayDateString, getOffsetDateString } from './taskStorage';

/**
 * Dynamically check if a task is overdue
 * A task is overdue when:
 * 1. Status is NOT 'completed'
 * 2. Has a dueDate and the date (plus optional dueTime) has passed compared to now
 */
export const isTaskOverdue = (task) => {
  if (!task || task.status === 'completed' || !task.dueDate) {
    return false;
  }

  const todayStr = getTodayDateString();
  if (task.dueDate < todayStr) {
    return true;
  }

  // If due today, check if dueTime has passed
  if (task.dueDate === todayStr && task.dueTime) {
    const now = new Date();
    const [dueH, dueM] = task.dueTime.split(':').map(Number);
    const dueMinutes = dueH * 60 + dueM;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return nowMinutes > dueMinutes;
  }

  return false;
};

/**
 * Filter by Status
 * Handles 'all', 'pending', 'in_progress', 'completed', 'overdue'
 */
export const filterByStatus = (tasks = [], status = 'all') => {
  if (!status || status === 'all') return tasks;

  if (status === 'overdue') {
    return tasks.filter((t) => isTaskOverdue(t));
  }

  return tasks.filter((t) => t.status === status);
};

/**
 * Filter by Priority
 * 'all', 'high', 'medium', 'low'
 */
export const filterByPriority = (tasks = [], priority = 'all') => {
  if (!priority || priority === 'all') return tasks;
  return tasks.filter((t) => t.priority === priority);
};

/**
 * Filter by Category
 */
export const filterByCategory = (tasks = [], category = 'all') => {
  if (!category || category === 'all') return tasks;
  return tasks.filter((t) => t.category?.toLowerCase() === category.toLowerCase());
};

/**
 * Filter by Tags
 * Matches if task has all/any of the selected tags
 */
export const filterByTags = (tasks = [], selectedTags = []) => {
  if (!selectedTags || selectedTags.length === 0) return tasks;

  return tasks.filter((t) => {
    const taskTags = Array.isArray(t.tags) ? t.tags.map((tg) => tg.toLowerCase()) : [];
    // Matches if task contains at least one of the selected tags
    return selectedTags.some((st) => taskTags.includes(st.toLowerCase()));
  });
};

/**
 * Filter by Date Preset
 * 'all', 'today', 'tomorrow', 'this_week', 'next_week', 'this_month', 'overdue', 'custom'
 */
export const filterByDate = (tasks = [], datePreset = 'all', customRange = {}) => {
  if (!datePreset || datePreset === 'all') return tasks;

  const todayStr = getTodayDateString();
  const tomorrowStr = getOffsetDateString(1);

  if (datePreset === 'today') {
    return tasks.filter((t) => t.dueDate === todayStr || t.plannedDate === todayStr);
  }

  if (datePreset === 'tomorrow') {
    return tasks.filter((t) => t.dueDate === tomorrowStr || t.plannedDate === tomorrowStr);
  }

  if (datePreset === 'overdue') {
    return tasks.filter((t) => isTaskOverdue(t));
  }

  if (datePreset === 'this_week') {
    const now = new Date();
    const currentDay = now.getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const mondayStr = getOffsetDateString(diffToMonday);
    const sundayStr = getOffsetDateString(diffToMonday + 6);

    return tasks.filter((t) => {
      const d = t.dueDate || t.plannedDate;
      return d && d >= mondayStr && d <= sundayStr;
    });
  }

  if (datePreset === 'next_week') {
    const now = new Date();
    const currentDay = now.getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const nextMondayStr = getOffsetDateString(diffToMonday + 7);
    const nextSundayStr = getOffsetDateString(diffToMonday + 13);

    return tasks.filter((t) => {
      const d = t.dueDate || t.plannedDate;
      return d && d >= nextMondayStr && d <= nextSundayStr;
    });
  }

  if (datePreset === 'this_month') {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const monthPrefix = `${y}-${m}`;

    return tasks.filter((t) => {
      const d = t.dueDate || t.plannedDate;
      return d && d.startsWith(monthPrefix);
    });
  }

  if (datePreset === 'custom') {
    const { start, end } = customRange;
    if (!start && !end) return tasks;

    return tasks.filter((t) => {
      const d = t.dueDate || t.plannedDate;
      if (!d) return false;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }

  return tasks;
};

/**
 * Filter by Estimated Duration
 * '<15m', '15-30m', '30-60m', '1-2h', '2h+'
 */
export const filterByDuration = (tasks = [], durationPreset = 'all') => {
  if (!durationPreset || durationPreset === 'all') return tasks;

  return tasks.filter((t) => {
    let mins = Number(t.estimatedDuration || t.duration) || 0;
    if (t.durationUnit === 'hours') mins = mins * 60;

    switch (durationPreset) {
      case '<15m':
        return mins < 15;
      case '15-30m':
        return mins >= 15 && mins <= 30;
      case '30-60m':
        return mins > 30 && mins <= 60;
      case '1-2h':
        return mins > 60 && mins <= 120;
      case '2h+':
        return mins > 120;
      default:
        return true;
    }
  });
};

/**
 * Filter by Goal
 */
export const filterByGoal = (tasks = [], goalId = 'all') => {
  if (!goalId || goalId === 'all') return tasks;
  if (goalId === 'no_goal') return tasks.filter((t) => !t.goalId);
  return tasks.filter((t) => t.goalId === goalId);
};

/**
 * Apply all active filters simultaneously
 */
export const applyAllFilters = (tasks = [], filters = {}) => {
  let result = [...tasks];

  if (filters.status && filters.status !== 'all') {
    result = filterByStatus(result, filters.status);
  }

  if (filters.priority && filters.priority !== 'all') {
    result = filterByPriority(result, filters.priority);
  }

  if (filters.category && filters.category !== 'all') {
    result = filterByCategory(result, filters.category);
  }

  if (Array.isArray(filters.tags) && filters.tags.length > 0) {
    result = filterByTags(result, filters.tags);
  }

  if (filters.date && filters.date !== 'all') {
    result = filterByDate(result, filters.date, filters.customRange);
  }

  if (filters.duration && filters.duration !== 'all') {
    result = filterByDuration(result, filters.duration);
  }

  if (filters.goalId && filters.goalId !== 'all') {
    result = filterByGoal(result, filters.goalId);
  }

  return result;
};

/**
 * Sort Tasks
 * Options:
 * - 'recently_updated' (default)
 * - 'newest'
 * - 'oldest'
 * - 'due_date'
 * - 'priority'
 * - 'estimated_duration'
 * - 'actual_duration'
 * - 'alphabetical'
 * - 'completion_status'
 *
 * Supports sortDirection: 'desc' | 'asc'
 */
export const sortTasks = (tasks = [], sortBy = 'recently_updated', sortDirection = 'desc') => {
  const sorted = [...tasks];
  const isAsc = sortDirection === 'asc';

  const priorityWeights = {
    high: 3,
    medium: 2,
    low: 1,
  };

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'recently_updated': {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        comparison = timeB - timeA;
        break;
      }

      case 'newest': {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        comparison = timeB - timeA;
        break;
      }

      case 'oldest': {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        comparison = timeA - timeB;
        break;
      }

      case 'due_date': {
        const dateA = a.dueDate ? `${a.dueDate}T${a.dueTime || '00:00'}` : '9999-99-99';
        const dateB = b.dueDate ? `${b.dueDate}T${b.dueTime || '00:00'}` : '9999-99-99';
        comparison = dateA.localeCompare(dateB);
        break;
      }

      case 'priority': {
        const weightA = priorityWeights[a.priority] || 0;
        const weightB = priorityWeights[b.priority] || 0;
        comparison = weightB - weightA;
        break;
      }

      case 'estimated_duration': {
        let minsA = Number(a.estimatedDuration || a.duration) || 0;
        if (a.durationUnit === 'hours') minsA *= 60;
        let minsB = Number(b.estimatedDuration || b.duration) || 0;
        if (b.durationUnit === 'hours') minsB *= 60;
        comparison = minsB - minsA;
        break;
      }

      case 'actual_duration': {
        const actA = Number(a.actualDuration) || 0;
        const actB = Number(b.actualDuration) || 0;
        comparison = actB - actA;
        break;
      }

      case 'alphabetical': {
        comparison = (a.title || '').localeCompare(b.title || '');
        break;
      }

      case 'completion_status': {
        const statusOrder = { pending: 1, in_progress: 2, completed: 3 };
        const orderA = statusOrder[a.status] || 0;
        const orderB = statusOrder[b.status] || 0;
        comparison = orderA - orderB;
        break;
      }

      default:
        comparison = 0;
    }

    // Flip comparison if ascending when default is descending (or vice-versa)
    return isAsc ? -comparison : comparison;
  });

  return sorted;
};
