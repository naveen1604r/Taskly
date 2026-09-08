import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  GOALS_STORAGE_KEY,
  calculateTaskProgress,
  calculateMilestoneProgress,
  calculateAverageProgress,
  getGoalDeadlineInfo,
} from '../utils/goalUtils';
import { getTodayDateString } from '../utils/taskStorage';
import { useTaskContext } from './TaskContext';
import { useAuthContext } from './AuthContext';
import { api } from '../services/api';

const GoalsContext = createContext(null);

export function GoalsProvider({ children }) {
  const { showToast, tasks } = useTaskContext();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthContext();

  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Modal & Detailed View states
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [viewingGoal, setViewingGoal] = useState(null);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [taskLinkGoal, setTaskLinkGoal] = useState(null);

  // Fetch goals from backend API
  const fetchGoals = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setGoals([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.goals.getAll();
      if (response.success && response.data?.goals) {
        setGoals(response.data.goals);
      } else {
        setGoals([]);
      }
    } catch (err) {
      console.error('Failed to load goals from server:', err);
      setError(err.message || 'Unable to load goals');
      setGoals([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchGoals();
    }
  }, [isAuthLoading, fetchGoals]);

  // Keep viewingGoal in sync with goals array changes
  useEffect(() => {
    if (viewingGoal) {
      const fresh = goals.find((g) => String(g.id) === String(viewingGoal.id));
      if (fresh) {
        setViewingGoal(fresh);
      }
    }
  }, [goals]);

  // Add Goal
  const addGoal = async (data) => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await api.goals.create({
        title: data.title?.trim(),
        description: data.description?.trim() || '',
        category: data.category?.trim() || 'Learning',
        priority: data.priority || 'medium',
        startDate: data.startDate || getTodayDateString(),
        targetDate: data.targetDate || '',
        progressMode: data.progressMode || 'manual',
        progress: Math.min(100, Math.max(0, Number(data.progress) || 0)),
        status: 'active',
        icon: data.icon || 'Target',
        color: data.color || null,
        milestones: Array.isArray(data.milestones) ? data.milestones : [],
        relatedTaskIds: Array.isArray(data.relatedTaskIds) ? data.relatedTaskIds : [],
      });

      if (response.success && response.data?.goal) {
        const newGoal = response.data.goal;
        setGoals((prev) => [newGoal, ...prev]);
        showToast('Goal created successfully', 'success');
        closeGoalModal();
        return newGoal;
      }
      throw new Error(response.message || 'Failed to create goal');
    } catch (err) {
      console.error('Failed to add goal:', err);
      showToast(err.message || 'Unable to save goal. Please try again.', 'error');
      setError(err.message || 'Unable to save goal');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  // Update Goal
  const updateGoal = async (id, updatedFields) => {
    try {
      setIsUpdating(true);
      setError(null);

      // Re-calculate progress if in task or milestone mode
      const currentGoal = goals.find((g) => String(g.id) === String(id));
      const effectiveGoal = { ...currentGoal, ...updatedFields };

      if (effectiveGoal.progressMode === 'task') {
        effectiveGoal.progress = calculateTaskProgress(effectiveGoal.relatedTaskIds, tasks);
        updatedFields.progress = effectiveGoal.progress;
      } else if (effectiveGoal.progressMode === 'milestone') {
        effectiveGoal.progress = calculateMilestoneProgress(effectiveGoal.milestones);
        updatedFields.progress = effectiveGoal.progress;
      }

      const response = await api.goals.update(id, updatedFields);
      if (response.success && response.data?.goal) {
        const updated = response.data.goal;
        setGoals((prev) =>
          prev.map((g) => (String(g.id) === String(id) ? updated : g))
        );
        showToast('Goal updated successfully', 'success');
        closeGoalModal();
        return updated;
      }
      throw new Error(response.message || 'Failed to update goal');
    } catch (err) {
      console.error('Failed to update goal:', err);
      showToast(err.message || 'Unable to update goal. Please try again.', 'error');
      setError(err.message || 'Unable to update goal');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Goal (does NOT delete linked tasks)
  const deleteGoal = async (id) => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await api.goals.delete(id);
      if (response.success) {
        setGoals((prev) => prev.filter((g) => String(g.id) !== String(id)));
        if (viewingGoal && String(viewingGoal.id) === String(id)) {
          setViewingGoal(null);
        }
        showToast('Goal deleted successfully', 'success');
        setGoalToDelete(null);
        return true;
      }
      throw new Error(response.message || 'Failed to delete goal');
    } catch (err) {
      console.error('Failed to delete goal:', err);
      showToast(err.message || 'Unable to delete goal. Please try again.', 'error');
      setError(err.message || 'Unable to delete goal');
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  // Archive Goal
  const archiveGoal = async (id) => {
    try {
      const response = await api.goals.archive(id);
      if (response.success && response.data?.goal) {
        const updated = response.data.goal;
        setGoals((prev) =>
          prev.map((g) => (String(g.id) === String(id) ? updated : g))
        );
        showToast('Goal archived', 'success');
        return updated;
      }
    } catch (err) {
      console.error('Failed to archive goal:', err);
      showToast(err.message || 'Unable to archive goal', 'error');
      throw err;
    }
  };

  // Restore Goal
  const restoreGoal = async (id) => {
    try {
      const response = await api.goals.restore(id);
      if (response.success && response.data?.goal) {
        const updated = response.data.goal;
        setGoals((prev) =>
          prev.map((g) => (String(g.id) === String(id) ? updated : g))
        );
        showToast('Goal restored to active', 'success');
        return updated;
      }
    } catch (err) {
      console.error('Failed to restore goal:', err);
      showToast(err.message || 'Unable to restore goal', 'error');
      throw err;
    }
  };

  // Mark Goal Complete
  const completeGoal = async (id) => {
    try {
      const response = await api.goals.complete(id);
      if (response.success && response.data?.goal) {
        const updated = response.data.goal;
        setGoals((prev) =>
          prev.map((g) => (String(g.id) === String(id) ? updated : g))
        );
        showToast('Goal completed successfully', 'success');
        return updated;
      }
    } catch (err) {
      console.error('Failed to complete goal:', err);
      showToast(err.message || 'Unable to complete goal', 'error');
      throw err;
    }
  };

  // Update Goal Progress (Manual mode)
  const updateGoalProgress = async (id, newProgress) => {
    const clamped = Math.min(100, Math.max(0, Number(newProgress) || 0));
    try {
      const response = await api.goals.updateProgress(id, clamped);
      if (response.success && response.data?.goal) {
        const updated = response.data.goal;
        setGoals((prev) =>
          prev.map((g) => (String(g.id) === String(id) ? updated : g))
        );
        return updated;
      }
    } catch (err) {
      console.error('Failed to update goal progress:', err);
      showToast(err.message || 'Unable to update progress', 'error');
      throw err;
    }
  };

  // Add Milestone
  const addMilestone = async (goalId, title) => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    const currentGoal = goals.find((g) => String(g.id) === String(goalId));
    if (!currentGoal) return;

    const newM = {
      id: `m-${Date.now()}`,
      title: title.trim(),
      completed: false,
      createdAt: now,
      completedAt: null,
    };

    const milestones = [...(currentGoal.milestones || []), newM];
    const updates = { milestones };
    if (currentGoal.progressMode === 'milestone') {
      updates.progress = calculateMilestoneProgress(milestones);
    }

    try {
      const response = await api.goals.update(goalId, updates);
      if (response.success && response.data?.goal) {
        const updated = response.data.goal;
        setGoals((prev) =>
          prev.map((g) => (String(g.id) === String(goalId) ? updated : g))
        );
        showToast('Milestone added', 'success');
        return updated;
      }
    } catch (err) {
      console.error('Failed to add milestone:', err);
      showToast(err.message || 'Unable to add milestone', 'error');
    }
  };

  // Toggle Milestone completion
  const toggleMilestone = async (goalId, milestoneId) => {
    const currentGoal = goals.find((g) => String(g.id) === String(goalId));
    if (!currentGoal) return;

    const now = new Date().toISOString();
    const milestones = (currentGoal.milestones || []).map((m) => {
      if (String(m.id) === String(milestoneId)) {
        const isNowComplete = !m.completed;
        return {
          ...m,
          completed: isNowComplete,
          completedAt: isNowComplete ? now : null,
        };
      }
      return m;
    });

    const updates = { milestones };
    if (currentGoal.progressMode === 'milestone') {
      updates.progress = calculateMilestoneProgress(milestones);
    }

    try {
      const response = await api.goals.update(goalId, updates);
      if (response.success && response.data?.goal) {
        const updated = response.data.goal;
        setGoals((prev) =>
          prev.map((g) => (String(g.id) === String(goalId) ? updated : g))
        );
        return updated;
      }
    } catch (err) {
      console.error('Failed to toggle milestone:', err);
      showToast(err.message || 'Unable to update milestone', 'error');
    }
  };

  // Delete Milestone
  const deleteMilestone = async (goalId, milestoneId) => {
    const currentGoal = goals.find((g) => String(g.id) === String(goalId));
    if (!currentGoal) return;

    const milestones = (currentGoal.milestones || []).filter(
      (m) => String(m.id) !== String(milestoneId)
    );
    const updates = { milestones };
    if (currentGoal.progressMode === 'milestone') {
      updates.progress = calculateMilestoneProgress(milestones);
    }

    try {
      const response = await api.goals.update(goalId, updates);
      if (response.success && response.data?.goal) {
        const updated = response.data.goal;
        setGoals((prev) =>
          prev.map((g) => (String(g.id) === String(goalId) ? updated : g))
        );
        showToast('Milestone removed', 'success');
        return updated;
      }
    } catch (err) {
      console.error('Failed to delete milestone:', err);
      showToast(err.message || 'Unable to remove milestone', 'error');
    }
  };

  // Link/Unlink tasks to goal
  const setGoalRelatedTasks = async (goalId, newTaskIds) => {
    const currentGoal = goals.find((g) => String(g.id) === String(goalId));
    if (!currentGoal) return;

    const updates = { relatedTaskIds: newTaskIds };
    if (currentGoal.progressMode === 'task') {
      updates.progress = calculateTaskProgress(newTaskIds, tasks);
    }

    try {
      const response = await api.goals.update(goalId, updates);
      if (response.success && response.data?.goal) {
        const updated = response.data.goal;
        setGoals((prev) =>
          prev.map((g) => (String(g.id) === String(goalId) ? updated : g))
        );
        showToast('Linked tasks updated', 'success');
        closeLinkTaskModal();
        return updated;
      }
    } catch (err) {
      console.error('Failed to link tasks to goal:', err);
      showToast(err.message || 'Unable to link tasks', 'error');
    }
  };

  // Modal controls
  const openCreateGoalModal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const openEditGoalModal = (goal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const closeGoalModal = () => {
    setIsGoalModalOpen(false);
    setEditingGoal(null);
  };

  const openViewGoal = (goal) => {
    setViewingGoal(goal);
  };

  const closeViewGoal = () => {
    setViewingGoal(null);
  };

  const openDeleteGoalModal = (goal) => {
    setGoalToDelete(goal);
  };

  const closeDeleteGoalModal = () => {
    setGoalToDelete(null);
  };

  const openLinkTaskModal = (goal) => {
    setTaskLinkGoal(goal);
  };

  const closeLinkTaskModal = () => {
    setTaskLinkGoal(null);
  };

  // Dynamic Statistics
  const stats = useMemo(() => {
    const active = goals.filter((g) => g.status === 'active');
    const completed = goals.filter((g) => g.status === 'completed');
    const archived = goals.filter((g) => g.status === 'archived');

    const dueSoon = active.filter((g) => {
      const deadline = getGoalDeadlineInfo(g.targetDate, g.status);
      return deadline.isDueSoon;
    });

    const averageProgress = calculateAverageProgress(goals);

    return {
      activeGoals: active,
      activeGoalsCount: active.length,
      completedGoalsCount: completed.length,
      dueSoonGoalsCount: dueSoon.length,
      averageProgress,
      archivedGoalsCount: archived.length,
      totalGoalsCount: goals.length,
    };
  }, [goals]);

  const value = {
    goals,
    stats,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
    archiveGoal,
    restoreGoal,
    completeGoal,
    updateGoalProgress,
    addMilestone,
    toggleMilestone,
    deleteMilestone,
    setGoalRelatedTasks,
    // Modals
    isGoalModalOpen,
    editingGoal,
    openCreateGoalModal,
    openEditGoalModal,
    closeGoalModal,
    viewingGoal,
    openViewGoal,
    closeViewGoal,
    goalToDelete,
    openDeleteGoalModal,
    closeDeleteGoalModal,
    taskLinkGoal,
    openLinkTaskModal,
    closeLinkTaskModal,
    refreshGoals: fetchGoals,
  };

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
}

export function useGoalsContext(options = {}) {
  const context = useContext(GoalsContext);
  if (!context && !options?.optional) {
    throw new Error('useGoalsContext must be used within a GoalsProvider');
  }
  return context;
}
