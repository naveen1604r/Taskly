import { isTaskOverdue } from './filterUtils';

/**
 * Check if a task is currently blocked by incomplete dependencies
 */
export const isTaskBlocked = (task, allTasks = []) => {
  if (!task || !Array.isArray(task.dependencyIds) || task.dependencyIds.length === 0) {
    return false;
  }
  if (task.status === 'completed') {
    return false;
  }

  const taskMap = new Map(allTasks.map((t) => [t.id, t]));

  // Check if at least one dependency is not completed
  return task.dependencyIds.some((depId) => {
    const depTask = taskMap.get(depId);
    return depTask && depTask.status !== 'completed';
  });
};

/**
 * Get the list of incomplete tasks blocking this task
 */
export const getBlockingTasks = (task, allTasks = []) => {
  if (!task || !Array.isArray(task.dependencyIds) || task.dependencyIds.length === 0) {
    return [];
  }

  const taskMap = new Map(allTasks.map((t) => [t.id, t]));
  return task.dependencyIds
    .map((depId) => taskMap.get(depId))
    .filter((depTask) => depTask && depTask.status !== 'completed');
};

/**
 * Get the list of downstream tasks that depend on this task
 */
export const getDependentTasks = (taskId, allTasks = []) => {
  if (!taskId || !Array.isArray(allTasks)) return [];

  return allTasks.filter(
    (t) => Array.isArray(t.dependencyIds) && t.dependencyIds.includes(taskId)
  );
};

/**
 * Get all resolved dependency objects for a task
 */
export const getTaskDependencies = (task, allTasks = []) => {
  if (!task || !Array.isArray(task.dependencyIds) || task.dependencyIds.length === 0) {
    return [];
  }

  const taskMap = new Map(allTasks.map((t) => [t.id, t]));
  return task.dependencyIds
    .map((depId) => {
      const depTask = taskMap.get(depId);
      if (!depTask) {
        return {
          id: depId,
          title: 'Deleted Task',
          isMissing: true,
          status: 'completed',
        };
      }
      return {
        ...depTask,
        isBlocked: isTaskBlocked(depTask, allTasks),
        isOverdue: isTaskOverdue(depTask),
        isMissing: false,
      };
    })
    .filter(Boolean);
};

/**
 * Detect if adding a dependency (taskId depends on newDependencyId) would create a cycle.
 * Traverses dependencies starting from newDependencyId to see if taskId is reachable.
 */
export const wouldCreateDependencyCycle = (taskId, newDependencyId, allTasks = []) => {
  if (!taskId || !newDependencyId) return false;
  if (taskId === newDependencyId) return true; // Self dependency

  const taskMap = new Map(allTasks.map((t) => [t.id, t]));
  const visited = new Set();
  const queue = [newDependencyId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (currentId === taskId) {
      return true; // Cycle detected
    }

    if (!visited.has(currentId)) {
      visited.add(currentId);
      const currentTask = taskMap.get(currentId);
      if (currentTask && Array.isArray(currentTask.dependencyIds)) {
        currentTask.dependencyIds.forEach((nextDepId) => {
          if (!visited.has(nextDepId)) {
            queue.push(nextDepId);
          }
        });
      }
    }
  }

  return false;
};

/**
 * Get available tasks that can be added as dependencies for taskId
 */
export const getAvailableDependencies = (
  taskId,
  allTasks = [],
  currentDependencyIds = [],
  searchQuery = ''
) => {
  const currentSet = new Set(currentDependencyIds || []);
  const q = (searchQuery || '').toLowerCase().trim();

  return allTasks.filter((t) => {
    if (t.id === taskId) return false; // Not self
    if (currentSet.has(t.id)) return false; // Already linked
    if (wouldCreateDependencyCycle(taskId, t.id, allTasks)) return false; // Prevents cycle

    if (q) {
      const titleMatch = t.title?.toLowerCase().includes(q);
      const catMatch = t.category?.toLowerCase().includes(q);
      return titleMatch || catMatch;
    }

    return true;
  });
};
