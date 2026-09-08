import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  loadTasksFromStorage,
  getTodayDateString,
  cleanDemoTasks,
  isDemoTask,
  STORAGE_KEY,
} from '../utils/taskStorage';
import { createSubtask, duplicateTask } from '../utils/taskUtils';
import { useAuthContext } from './AuthContext';
import { api } from '../services/api';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthContext();

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const dismissToast = () => {
    setToast(null);
  };

  // Fetch tasks from server
  const fetchTasksFromServer = useCallback(async () => {
    if (!isAuthenticated) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.tasks.getAll();
      const serverTasks = cleanDemoTasks(res?.data?.tasks || []);
      setTasks(serverTasks);
    } catch (err) {
      console.warn('Failed to fetch tasks from server:', err.message);
      setError(err.message || 'Unable to connect to Taskly server.');
      // Do not silently invent tasks
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  // Initial load and auth sync
  useEffect(() => {
    if (!isAuthLoading) {
      fetchTasksFromServer();
    }
  }, [isAuthLoading, isAuthenticated, user?.id, fetchTasksFromServer]);

  // Get single task by ID (supports number or string ID)
  const getTaskById = (id) => {
    if (!id) return null;
    return tasks.find((t) => String(t.id) === String(id)) || null;
  };

  // Remove demo / sample tasks safely
  const removeDemoTasks = () => {
    const cleaned = cleanDemoTasks(tasks);
    const removedCount = tasks.length - cleaned.length;
    setTasks(cleaned);
    showToast(`Removed ${removedCount} demo / sample tasks`, 'info');
    return removedCount;
  };

  // Add Task
  const addTask = async (taskData) => {
    setIsCreating(true);
    setError(null);
    try {
      const payload = {
        title: taskData.title?.trim() || 'Untitled Task',
        description: taskData.description?.trim() || '',
        priority: taskData.priority || 'medium',
        category: taskData.category?.trim() || 'General',
        duration: Number(taskData.duration) || 30,
        durationUnit: taskData.durationUnit || 'minutes',
        estimatedDuration: Number(taskData.estimatedDuration || taskData.duration) || 30,
        actualDuration: Number(taskData.actualDuration) || 0,
        dueDate: taskData.dueDate || null,
        dueTime: taskData.dueTime || null,
        plannedDate: taskData.plannedDate || null,
        plannedStartTime: taskData.plannedStartTime || null,
        status: taskData.status || 'pending',
        goalId: taskData.goalId || null,
        projectId: taskData.projectId || null,
        recurringTaskId: taskData.recurringTaskId || null,
        occurrenceDate: taskData.occurrenceDate || null,
        tags: Array.isArray(taskData.tags) ? taskData.tags : [],
        dependencyIds: Array.isArray(taskData.dependencyIds) ? taskData.dependencyIds : [],
        reminder: taskData.reminder || 'none',
        customReminderDate: taskData.customReminderDate || null,
        customReminderTime: taskData.customReminderTime || null,
        subtasks: Array.isArray(taskData.subtasks) ? taskData.subtasks : [],
        taskNotes: taskData.taskNotes || '',
      };

      if (isAuthenticated) {
        const res = await api.tasks.create(payload);
        const created = res.data.task;
        setTasks((prev) => [created, ...prev]);
        showToast('Task created successfully', 'success');
        closeTaskModal();
        return created;
      } else {
        const now = new Date().toISOString();
        const localCreated = {
          id: `task-${Date.now()}`,
          ...payload,
          createdAt: now,
          updatedAt: now,
        };
        setTasks((prev) => [localCreated, ...prev]);
        showToast('Task created', 'success');
        closeTaskModal();
        return localCreated;
      }
    } catch (err) {
      const msg = err.data?.message || err.message || 'Unable to connect to Taskly server. Please try again.';
      setError(msg);
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  // Update Task
  const updateTask = async (id, updatedFields) => {
    setIsUpdating(true);
    setError(null);
    try {
      if (isAuthenticated && !String(id).startsWith('task-')) {
        const res = await api.tasks.update(id, updatedFields);
        const updated = res.data.task;
        setTasks((prev) => prev.map((t) => (String(t.id) === String(id) ? updated : t)));
        showToast('Task updated successfully', 'success');
        closeTaskModal();
        return updated;
      } else {
        const now = new Date().toISOString();
        setTasks((prev) =>
          prev.map((t) => {
            if (String(t.id) === String(id)) {
              return { ...t, ...updatedFields, updatedAt: now };
            }
            return t;
          })
        );
        showToast('Task updated successfully', 'success');
        closeTaskModal();
      }
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to update task. Please try again.';
      setError(msg);
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Task
  const deleteTask = async (id) => {
    setIsDeleting(true);
    setError(null);
    try {
      if (isAuthenticated && !String(id).startsWith('task-')) {
        await api.tasks.delete(id);
      }
      setTasks((prev) => prev.filter((t) => String(t.id) !== String(id)));
      showToast('Task deleted successfully', 'success');
      setTaskToDelete(null);
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to delete task. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle completion status
  const toggleTaskStatus = async (id) => {
    const task = tasks.find((t) => String(t.id) === String(id));
    if (!task) return;
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';

    try {
      if (isAuthenticated && !String(id).startsWith('task-')) {
        const res = await api.tasks.updateStatus(id, nextStatus);
        const updated = res.data.task;
        setTasks((prev) => prev.map((t) => (String(t.id) === String(id) ? updated : t)));
      } else {
        setTasks((prev) =>
          prev.map((t) =>
            String(t.id) === String(id)
              ? { ...t, status: nextStatus, completedAt: nextStatus === 'completed' ? new Date().toISOString() : null }
              : t
          )
        );
      }
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  // Set explicit status
  const setTaskStatus = async (id, newStatus) => {
    try {
      if (isAuthenticated && !String(id).startsWith('task-')) {
        const res = await api.tasks.updateStatus(id, newStatus);
        const updated = res.data.task;
        setTasks((prev) => prev.map((t) => (String(t.id) === String(id) ? updated : t)));
      } else {
        setTasks((prev) =>
          prev.map((t) =>
            String(t.id) === String(id)
              ? { ...t, status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : null }
              : t
          )
        );
      }
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  // Subtask: Add Subtask
  const addSubtask = async (taskId, subtaskData) => {
    const title = typeof subtaskData === 'string' ? subtaskData : subtaskData.title;
    const priority = typeof subtaskData === 'object' ? subtaskData.priority : 'medium';

    try {
      if (isAuthenticated && !String(taskId).startsWith('task-')) {
        const res = await api.tasks.createSubtask(taskId, { title, priority });
        const newSubtask = res.data.subtask;
        setTasks((prev) =>
          prev.map((t) => {
            if (String(t.id) === String(taskId)) {
              const existing = Array.isArray(t.subtasks) ? t.subtasks : [];
              return { ...t, subtasks: [...existing, newSubtask] };
            }
            return t;
          })
        );
        showToast('Subtask added', 'success');
        return newSubtask;
      } else {
        const newSubtask = createSubtask(title, priority);
        setTasks((prev) =>
          prev.map((t) => {
            if (String(t.id) === String(taskId)) {
              const existing = Array.isArray(t.subtasks) ? t.subtasks : [];
              return { ...t, subtasks: [...existing, newSubtask] };
            }
            return t;
          })
        );
        showToast('Subtask added', 'success');
        return newSubtask;
      }
    } catch {
      showToast('Failed to add subtask', 'error');
    }
  };

  // Subtask: Update Subtask
  const updateSubtask = async (taskId, subtaskId, updates) => {
    try {
      if (isAuthenticated && !String(taskId).startsWith('task-') && !String(subtaskId).startsWith('subtask-')) {
        const res = await api.tasks.updateSubtask(taskId, subtaskId, updates);
        const updated = res.data.subtask;
        setTasks((prev) =>
          prev.map((t) => {
            if (String(t.id) === String(taskId)) {
              const existing = Array.isArray(t.subtasks) ? t.subtasks : [];
              return {
                ...t,
                subtasks: existing.map((st) => (String(st.id) === String(subtaskId) ? updated : st)),
              };
            }
            return t;
          })
        );
      } else {
        setTasks((prev) =>
          prev.map((t) => {
            if (String(t.id) === String(taskId)) {
              const existing = Array.isArray(t.subtasks) ? t.subtasks : [];
              return {
                ...t,
                subtasks: existing.map((st) =>
                  String(st.id) === String(subtaskId) ? { ...st, ...updates } : st
                ),
              };
            }
            return t;
          })
        );
      }
      showToast('Subtask updated', 'success');
    } catch {
      showToast('Failed to update subtask', 'error');
    }
  };

  // Subtask: Delete Subtask
  const deleteSubtask = async (taskId, subtaskId) => {
    try {
      if (isAuthenticated && !String(taskId).startsWith('task-') && !String(subtaskId).startsWith('subtask-')) {
        await api.tasks.deleteSubtask(taskId, subtaskId);
      }
      setTasks((prev) =>
        prev.map((t) => {
          if (String(t.id) === String(taskId)) {
            const existing = Array.isArray(t.subtasks) ? t.subtasks : [];
            return {
              ...t,
              subtasks: existing.filter((st) => String(st.id) !== String(subtaskId)),
            };
          }
          return t;
        })
      );
      showToast('Subtask removed', 'info');
    } catch {
      showToast('Failed to remove subtask', 'error');
    }
  };

  // Subtask: Toggle Subtask Completion
  const toggleSubtask = async (taskId, subtaskId) => {
    const task = tasks.find((t) => String(t.id) === String(taskId));
    if (!task) return false;
    const subtask = (task.subtasks || []).find((st) => String(st.id) === String(subtaskId));
    if (!subtask) return false;

    const nextCompleted = !subtask.completed;

    try {
      if (isAuthenticated && !String(taskId).startsWith('task-') && !String(subtaskId).startsWith('subtask-')) {
        const res = await api.tasks.updateSubtask(taskId, subtaskId, { completed: nextCompleted });
        const updated = res.data.subtask;
        setTasks((prev) =>
          prev.map((t) => {
            if (String(t.id) === String(taskId)) {
              return {
                ...t,
                subtasks: (t.subtasks || []).map((st) =>
                  String(st.id) === String(subtaskId) ? updated : st
                ),
              };
            }
            return t;
          })
        );
      } else {
        setTasks((prev) =>
          prev.map((t) => {
            if (String(t.id) === String(taskId)) {
              return {
                ...t,
                subtasks: (t.subtasks || []).map((st) =>
                  String(st.id) === String(subtaskId)
                    ? { ...st, completed: nextCompleted, completedAt: nextCompleted ? new Date().toISOString() : null }
                    : st
                ),
              };
            }
            return t;
          })
        );
      }
      return nextCompleted;
    } catch {
      showToast('Failed to toggle subtask', 'error');
      return subtask.completed;
    }
  };

  // Subtask: Reorder Subtasks
  const reorderSubtasks = (taskId, newSubtasksList) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (String(t.id) === String(taskId)) {
          return {
            ...t,
            subtasks: newSubtasksList,
          };
        }
        return t;
      })
    );
  };

  // Task: Duplicate Task
  const duplicateTaskById = async (taskId, options = {}) => {
    const sourceTask = tasks.find((t) => String(t.id) === String(taskId));
    if (!sourceTask) return null;

    const dup = duplicateTask(sourceTask, options);
    return await addTask(dup);
  };

  // Task: Update specific task notes
  const updateTaskNotes = async (taskId, notesText) => {
    await updateTask(taskId, { taskNotes: notesText });
  };

  // Task: Add tag
  const addTagToTask = async (taskId, tagText) => {
    const cleanTag = tagText.trim().replace(/^#/, '');
    if (!cleanTag) return;

    const task = tasks.find((t) => String(t.id) === String(taskId));
    if (!task) return;

    const currentTags = Array.isArray(task.tags) ? task.tags : [];
    if (currentTags.includes(cleanTag)) return;

    const newTags = [...currentTags, cleanTag];
    await updateTask(taskId, { tags: newTags });
    showToast(`Added tag #${cleanTag}`, 'success');
  };

  // Task: Remove tag
  const removeTagFromTask = async (taskId, tagToRemove) => {
    const task = tasks.find((t) => String(t.id) === String(taskId));
    if (!task) return;

    const currentTags = Array.isArray(task.tags) ? task.tags : [];
    const newTags = currentTags.filter((tg) => tg !== tagToRemove);
    await updateTask(taskId, { tags: newTags });
  };

  // Modal open/close controls
  const openCreateModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const openDeleteModal = (task) => {
    setTaskToDelete(task);
  };

  const closeDeleteModal = () => {
    setTaskToDelete(null);
  };

  // Dynamic statistics calculations
  const stats = useMemo(() => {
    const today = getTodayDateString();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length;

    // Today specific calculations
    const todayTasksList = tasks.filter((t) => t.dueDate === today);
    const todayTotal = todayTasksList.length;
    const todayCompleted = todayTasksList.filter((t) => t.status === 'completed').length;
    const todayPending = todayTasksList.filter((t) => t.status !== 'completed').length;

    // Overall & today productivity rate
    const overallProductivityRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const todayProductivityRate = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      todayTotal,
      todayCompleted,
      todayPending,
      todayTasksList,
      overallProductivityRate,
      todayProductivityRate,
    };
  }, [tasks]);

  const value = {
    tasks,
    stats,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    refreshTasks: fetchTasksFromServer,
    getTaskById,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    setTaskStatus,
    // Subtasks API
    addSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtask,
    reorderSubtasks,
    // Additional task operations
    duplicateTaskById,
    updateTaskNotes,
    addTagToTask,
    removeTagFromTask,
    // Modal states & helpers
    isTaskModalOpen,
    editingTask,
    openCreateModal,
    openEditModal,
    closeTaskModal,
    taskToDelete,
    openDeleteModal,
    closeDeleteModal,
    // Toast
    toast,
    dismissToast,
    showToast,
    // Demo cleanup
    removeDemoTasks,
    isDemoTask,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}

export default TaskContext;
