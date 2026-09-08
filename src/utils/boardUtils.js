import { applyAllFilters, sortTasks, isTaskOverdue } from './filterUtils';

export const BOARD_ORDER_KEY = 'taskly_board_order';
export const BOARD_SETTINGS_KEY = 'taskly_board_settings';

export const COLUMNS = [
  { id: 'pending', title: 'Pending', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
  { id: 'in_progress', title: 'In Progress', color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' },
  { id: 'completed', title: 'Completed', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
];

/**
 * Safely normalize board ordering against active task list
 * Ensures:
 * 1. Deleted tasks are removed from board arrays
 * 2. New tasks are added to the front of their respective column array
 * 3. Status discrepancies are resolved
 */
export const normalizeBoardOrder = ({ tasks = [], currentOrder = {} }) => {
  const pendingSet = new Set();
  const inProgressSet = new Set();
  const completedSet = new Set();

  tasks.forEach((t) => {
    if (t.status === 'completed') {
      completedSet.add(t.id);
    } else if (t.status === 'in_progress') {
      inProgressSet.add(t.id);
    } else {
      pendingSet.add(t.id);
    }
  });

  const cleanOrder = {
    pending: [],
    in_progress: [],
    completed: [],
  };

  // 1. Preserve existing order for existing IDs
  (currentOrder.pending || []).forEach((id) => {
    if (pendingSet.has(id) && !cleanOrder.pending.includes(id)) {
      cleanOrder.pending.push(id);
      pendingSet.delete(id);
    }
  });

  (currentOrder.in_progress || []).forEach((id) => {
    if (inProgressSet.has(id) && !cleanOrder.in_progress.includes(id)) {
      cleanOrder.in_progress.push(id);
      inProgressSet.delete(id);
    }
  });

  (currentOrder.completed || []).forEach((id) => {
    if (completedSet.has(id) && !cleanOrder.completed.includes(id)) {
      cleanOrder.completed.push(id);
      completedSet.delete(id);
    }
  });

  // 2. Append any unindexed tasks (newly created or moved)
  pendingSet.forEach((id) => cleanOrder.pending.unshift(id));
  inProgressSet.forEach((id) => cleanOrder.in_progress.unshift(id));
  completedSet.forEach((id) => cleanOrder.completed.unshift(id));

  return cleanOrder;
};

/**
 * Filter, group, and sort tasks for Kanban display
 */
export const getTasksByStatus = ({
  tasks = [],
  boardOrder = { pending: [], in_progress: [], completed: [] },
  sortBy = 'manual',
  sortDirection = 'desc',
  activeFilters = {},
  searchQuery = '',
}) => {
  // 1. Apply active task filters
  let filtered = applyAllFilters(tasks, activeFilters);

  // 2. Apply search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        (Array.isArray(t.tags) && t.tags.some((tg) => tg.toLowerCase().includes(q))) ||
        (Array.isArray(t.subtasks) && t.subtasks.some((st) => st.title?.toLowerCase().includes(q)))
    );
  }

  // 3. Map into lookup dictionary
  const taskMap = new Map();
  filtered.forEach((t) => taskMap.set(t.id, t));

  const result = {
    pending: [],
    in_progress: [],
    completed: [],
  };

  if (sortBy === 'manual') {
    // Follow manual board order
    (boardOrder.pending || []).forEach((id) => {
      const task = taskMap.get(id);
      if (task && task.status !== 'completed' && task.status !== 'in_progress') {
        result.pending.push(task);
        taskMap.delete(id);
      }
    });

    (boardOrder.in_progress || []).forEach((id) => {
      const task = taskMap.get(id);
      if (task && task.status === 'in_progress') {
        result.in_progress.push(task);
        taskMap.delete(id);
      }
    });

    (boardOrder.completed || []).forEach((id) => {
      const task = taskMap.get(id);
      if (task && task.status === 'completed') {
        result.completed.push(task);
        taskMap.delete(id);
      }
    });

    // Residual tasks not yet placed in order
    taskMap.forEach((task) => {
      if (task.status === 'completed') {
        result.completed.push(task);
      } else if (task.status === 'in_progress') {
        result.in_progress.push(task);
      } else {
        result.pending.push(task);
      }
    });
  } else {
    // Property based sort
    const sorted = sortTasks(filtered, sortBy, sortDirection);
    sorted.forEach((task) => {
      if (task.status === 'completed') {
        result.completed.push(task);
      } else if (task.status === 'in_progress') {
        result.in_progress.push(task);
      } else {
        result.pending.push(task);
      }
    });
  }

  return result;
};

/**
 * Reorder task IDs within the same column
 */
export const reorderTasksInColumn = ({ boardOrder, columnId, sourceIndex, targetIndex }) => {
  const currentList = [...(boardOrder[columnId] || [])];
  if (
    sourceIndex < 0 ||
    sourceIndex >= currentList.length ||
    targetIndex < 0 ||
    targetIndex >= currentList.length
  ) {
    return boardOrder;
  }

  const [movedId] = currentList.splice(sourceIndex, 1);
  currentList.splice(targetIndex, 0, movedId);

  return {
    ...boardOrder,
    [columnId]: currentList,
  };
};

/**
 * Move task ID across columns
 */
export const moveTaskBetweenColumns = ({
  boardOrder,
  sourceColumn,
  targetColumn,
  taskId,
  targetIndex = null,
}) => {
  const sourceList = (boardOrder[sourceColumn] || []).filter((id) => id !== taskId);
  const targetList = (boardOrder[targetColumn] || []).filter((id) => id !== taskId);

  if (targetIndex !== null && targetIndex >= 0 && targetIndex <= targetList.length) {
    targetList.splice(targetIndex, 0, taskId);
  } else {
    targetList.unshift(taskId);
  }

  return {
    ...boardOrder,
    [sourceColumn]: sourceList,
    [targetColumn]: targetList,
  };
};

/**
 * Calculate Board Completion Progress
 */
export const getBoardProgress = (tasks = []) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    percentage,
  };
};

/**
 * Get Column Counts & Overdue Count
 */
export const getBoardColumnCounts = (tasks = []) => {
  let pending = 0;
  let inProgress = 0;
  let completed = 0;
  let overdue = 0;

  tasks.forEach((t) => {
    if (t.status === 'completed') {
      completed++;
    } else if (t.status === 'in_progress') {
      inProgress++;
    } else {
      pending++;
    }

    if (isTaskOverdue(t)) {
      overdue++;
    }
  });

  return {
    pending,
    inProgress,
    completed,
    overdue,
  };
};
