import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useTaskContext } from './TaskContext';
import { useSettingsContext } from './SettingsContext';
import { useAuthContext } from './AuthContext';
import { api } from '../services/api';
import {
  generateOccurrencesForRange,
  getNextOccurrence,
  addDaysToDateString,
} from '../utils/recurrenceUtils';
import { getTodayDateString } from '../utils/taskStorage';

const RECURRING_STORAGE_KEY = 'taskly_recurring_tasks';

const loadRecurringRules = () => {
  try {
    const raw = localStorage.getItem(RECURRING_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load recurring tasks:', e);
    return [];
  }
};

const saveRecurringRules = (rules) => {
  try {
    localStorage.setItem(RECURRING_STORAGE_KEY, JSON.stringify(rules));
  } catch (e) {
    console.error('Failed to save recurring tasks:', e);
  }
};

const RecurringTaskContext = createContext(null);

export function RecurringTaskProvider({ children }) {
  const { tasks, addTask, deleteTask, showToast, isLoading: isTasksLoading, fetchTasks } = useTaskContext();
  const { settings } = useSettingsContext();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthContext();

  const [recurringTasks, setRecurringTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal dialog states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);

  const [isPauseConfirmOpen, setIsPauseConfirmOpen] = useState(false);
  const [ruleToPause, setRuleToPause] = useState(null);

  const [isSkipConfirmOpen, setIsSkipConfirmOpen] = useState(false);
  const [skipTarget, setSkipTarget] = useState(null);

  // Fetch recurring tasks from backend API
  const fetchRecurringData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setRecurringTasks([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const res = await api.recurringTasks.getAll();
      if (res.success && res.data?.recurringTasks) {
        setRecurringTasks(
          res.data.recurringTasks.map((r) => ({
            id: String(r.id),
            title: r.title,
            description: r.description || '',
            priority: r.priority || 'medium',
            category: r.category || 'General',
            estimatedDuration: Number(r.estimatedDuration) || 30,
            goalId: r.goalId || null,
            projectId: r.projectId || null,
            recurrence: {
              type: r.frequency || 'daily',
              interval: Number(r.intervalValue) || 1,
              daysOfWeek: Array.isArray(r.daysOfWeek) ? r.daysOfWeek : [],
              dayOfMonth: r.dayOfMonth || null,
              startDate: r.startDate,
              endDate: r.endDate || null,
            },
            plannedStartTime: r.time || null,
            enabled: Boolean(r.isActive),
            skippedDates: [],
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          }))
        );
      }
    } catch (err) {
      console.warn('Failed to load recurring tasks from API:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchRecurringData();
    }
  }, [fetchRecurringData, isAuthLoading]);

  // Save to localStorage as fallback cache
  useEffect(() => {
    saveRecurringRules(recurringTasks);
  }, [recurringTasks]);

  // Generate Occurrences into TaskContext
  const generateOccurrences = async (windowDays = 30) => {
    if (!Array.isArray(recurringTasks) || recurringTasks.length === 0) return 0;

    const today = getTodayDateString();

    if (isAuthenticated) {
      try {
        const res = await api.recurringTasks.generate(today);
        if (res.success && fetchTasks) {
          await fetchTasks();
        }
        return res.data?.tasks?.length || 0;
      } catch (err) {
        console.warn('API generateOccurrences warning:', err.message);
      }
    }

    const endRange = addDaysToDateString(today, windowDays);
    let createdCount = 0;
    const seenInBatch = new Set();

    recurringTasks.forEach((rule) => {
      if (!rule.enabled) return;

      const candidates = generateOccurrencesForRange(rule, today, endRange);

      candidates.forEach((candidate) => {
        const batchKey = `${rule.id}:${candidate.occurrenceDate}`;
        if (seenInBatch.has(batchKey)) return;

        // Prevent duplicate generation:
        const exists = tasks.some(
          (t) =>
            (t.recurringTaskId === rule.id &&
              (t.plannedDate === candidate.occurrenceDate ||
                t.dueDate === candidate.occurrenceDate ||
                t.occurrenceDate === candidate.occurrenceDate)) ||
            (t.title === candidate.title &&
              (t.plannedDate === candidate.occurrenceDate || t.dueDate === candidate.occurrenceDate) &&
              t.recurringTaskId)
        );

        if (!exists) {
          seenInBatch.add(batchKey);
          addTask({
            title: candidate.title,
            description: candidate.description,
            priority: candidate.priority,
            category: candidate.category,
            estimatedDuration: candidate.estimatedDuration,
            duration: candidate.estimatedDuration,
            durationUnit: 'minutes',
            goalId: candidate.goalId,
            plannedDate: candidate.plannedDate,
            dueDate: candidate.dueDate,
            plannedStartTime: candidate.plannedStartTime,
            dueTime: candidate.dueTime,
            status: 'pending',
            recurringTaskId: rule.id,
            occurrenceDate: candidate.occurrenceDate,
          });
          createdCount += 1;
        }
      });
    });

    return createdCount;
  };

  // Run generation once on startup if enabled in settings and there are rules
  const hasAutoGeneratedRef = useRef(false);
  useEffect(() => {
    if (isTasksLoading || isLoading) return;
    if (hasAutoGeneratedRef.current) return;
    if (!Array.isArray(recurringTasks) || recurringTasks.length === 0) return;

    const isGenerationEnabled = settings?.recurring?.autoGenerate ?? true;
    const windowDays = settings?.recurring?.generationWindow || 30;

    if (isGenerationEnabled) {
      hasAutoGeneratedRef.current = true;
      generateOccurrences(windowDays);
    }
  }, [settings, recurringTasks.length, isTasksLoading, isLoading]);

  // Actions
  const addRecurringTask = async (ruleData) => {
    let newRule = null;

    if (isAuthenticated) {
      try {
        const res = await api.recurringTasks.create({
          title: ruleData.title.trim(),
          description: ruleData.description?.trim() || '',
          frequency: ruleData.recurrence?.type || 'daily',
          intervalValue: Number(ruleData.recurrence?.interval) || 1,
          daysOfWeek: ruleData.recurrence?.daysOfWeek || [],
          startDate: ruleData.recurrence?.startDate || getTodayDateString(),
          endDate: ruleData.recurrence?.endDate || null,
          time: ruleData.plannedStartTime || null,
          priority: ruleData.priority || 'medium',
          category: ruleData.category || 'General',
          estimatedDuration: Number(ruleData.estimatedDuration) || 30,
        });

        if (res.success && res.data?.recurringTask) {
          const r = res.data.recurringTask;
          newRule = {
            id: String(r.id),
            title: r.title,
            description: r.description || '',
            priority: r.priority || 'medium',
            category: r.category || 'General',
            estimatedDuration: Number(r.estimatedDuration) || 30,
            goalId: r.goalId || null,
            projectId: r.projectId || null,
            recurrence: {
              type: r.frequency || 'daily',
              interval: Number(r.intervalValue) || 1,
              daysOfWeek: Array.isArray(r.daysOfWeek) ? r.daysOfWeek : [],
              dayOfMonth: r.dayOfMonth || null,
              startDate: r.startDate,
              endDate: r.endDate || null,
            },
            plannedStartTime: r.time || null,
            enabled: Boolean(r.isActive),
            skippedDates: [],
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          };
        }
      } catch (err) {
        console.warn('API createRecurringTask warning:', err.message);
      }
    }

    if (!newRule) {
      newRule = {
        id: `recurring-${Date.now()}`,
        title: ruleData.title.trim(),
        description: ruleData.description?.trim() || '',
        priority: ruleData.priority || 'medium',
        category: ruleData.category || 'General',
        estimatedDuration: Number(ruleData.estimatedDuration) || 60,
        goalId: ruleData.goalId || null,
        recurrence: {
          type: ruleData.recurrence.type || 'daily',
          interval: Number(ruleData.recurrence.interval) || 1,
          daysOfWeek: ruleData.recurrence.daysOfWeek || [],
          dayOfMonth: ruleData.recurrence.dayOfMonth || null,
          startDate: ruleData.recurrence.startDate || getTodayDateString(),
          endDate: ruleData.recurrence.endDate || null,
          customUnit: ruleData.recurrence.customUnit || 'days',
          customInterval: Number(ruleData.recurrence.customInterval) || 1,
        },
        plannedStartTime: ruleData.plannedStartTime || null,
        enabled: true,
        skippedDates: [],
        reminder: ruleData.reminder || 'none',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    setRecurringTasks((prev) => [newRule, ...prev]);
    showToast('Recurring task rule created', 'success');
    closeModal();

    // Trigger occurrence generation on backend
    if (isAuthenticated) {
      generateOccurrences(30);
    }

    return newRule;
  };

  const updateRecurringTask = async (id, updatedFields) => {
    setRecurringTasks((prev) =>
      prev.map((rule) => {
        if (rule.id === id) {
          return {
            ...rule,
            ...updatedFields,
            updatedAt: new Date().toISOString(),
          };
        }
        return rule;
      })
    );

    if (isAuthenticated) {
      try {
        await api.recurringTasks.update(id, {
          title: updatedFields.title,
          description: updatedFields.description,
          priority: updatedFields.priority,
          category: updatedFields.category,
          estimatedDuration: updatedFields.estimatedDuration,
          time: updatedFields.plannedStartTime,
        });
      } catch (err) {
        console.warn('API updateRecurringTask warning:', err.message);
      }
    }

    showToast('Recurring rule updated (future occurrences updated)', 'success');
    closeModal();
  };

  const deleteRecurringTask = async (id) => {
    setRecurringTasks((prev) => prev.filter((r) => r.id !== id));

    if (isAuthenticated) {
      try {
        await api.recurringTasks.delete(id);
      } catch (err) {
        console.warn('API deleteRecurringTask warning:', err.message);
      }
    }

    showToast('Recurring rule deleted (existing tasks preserved)', 'info');
    setIsDeleteConfirmOpen(false);
    setRuleToDelete(null);
  };

  const pauseRecurringTask = async (id) => {
    setRecurringTasks((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: false } : r))
    );

    if (isAuthenticated) {
      try {
        await api.recurringTasks.pause(id);
      } catch (err) {
        console.warn('API pauseRecurringTask warning:', err.message);
      }
    }

    showToast('Recurring task paused', 'info');
    setIsPauseConfirmOpen(false);
    setRuleToPause(null);
  };

  const resumeRecurringTask = async (id) => {
    setRecurringTasks((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: true } : r))
    );

    if (isAuthenticated) {
      try {
        await api.recurringTasks.resume(id);
      } catch (err) {
        console.warn('API resumeRecurringTask warning:', err.message);
      }
    }

    showToast('Recurring task resumed', 'success');
    setTimeout(() => generateOccurrences(30), 50);
  };

  const skipOccurrence = (ruleId, dateStr) => {
    // 1. Add date to skippedDates in recurring rule
    setRecurringTasks((prev) =>
      prev.map((r) => {
        if (r.id === ruleId) {
          const current = r.skippedDates || [];
          return {
            ...r,
            skippedDates: current.includes(dateStr) ? current : [...current, dateStr],
          };
        }
        return r;
      })
    );

    // 2. Remove the single generated task instance for this date if it exists
    const matchingTask = tasks.find(
      (t) =>
        t.recurringTaskId === ruleId &&
        (t.plannedDate === dateStr || t.dueDate === dateStr || t.occurrenceDate === dateStr)
    );
    if (matchingTask) {
      deleteTask(matchingTask.id);
    }

    showToast(`Occurrence for ${dateStr} skipped`, 'info');
    setIsSkipConfirmOpen(false);
    setSkipTarget(null);
  };

  // Modal open/close helpers
  const openCreateModal = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
  };

  const openDeleteConfirm = (rule) => {
    setRuleToDelete(rule);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setRuleToDelete(null);
    setIsDeleteConfirmOpen(false);
  };

  const openPauseConfirm = (rule) => {
    setRuleToPause(rule);
    setIsPauseConfirmOpen(true);
  };

  const closePauseConfirm = () => {
    setRuleToPause(null);
    setIsPauseConfirmOpen(false);
  };

  const openSkipConfirm = (rule, dateStr) => {
    setSkipTarget({ rule, dateStr });
    setIsSkipConfirmOpen(true);
  };

  const closeSkipConfirm = () => {
    setSkipTarget(null);
    setIsSkipConfirmOpen(false);
  };

  const value = {
    recurringTasks,
    addRecurringTask,
    updateRecurringTask,
    deleteRecurringTask,
    pauseRecurringTask,
    resumeRecurringTask,
    skipOccurrence,
    generateOccurrences,
    // Modals
    isModalOpen,
    editingRule,
    openCreateModal,
    openEditModal,
    closeModal,
    isDeleteConfirmOpen,
    ruleToDelete,
    openDeleteConfirm,
    closeDeleteConfirm,
    isPauseConfirmOpen,
    ruleToPause,
    openPauseConfirm,
    closePauseConfirm,
    isSkipConfirmOpen,
    skipTarget,
    openSkipConfirm,
    closeSkipConfirm,
  };

  return (
    <RecurringTaskContext.Provider value={value}>
      {children}
    </RecurringTaskContext.Provider>
  );
}

export function useRecurringTaskContext() {
  const context = useContext(RecurringTaskContext);
  if (!context) {
    return {
      recurringTasks: [],
      addRecurringTask: () => null,
      updateRecurringTask: () => {},
      deleteRecurringTask: () => {},
      pauseRecurringTask: () => {},
      resumeRecurringTask: () => {},
      skipOccurrence: () => {},
      generateOccurrences: () => 0,
      isModalOpen: false,
      editingRule: null,
      openCreateModal: () => {},
      openEditModal: () => {},
      closeModal: () => {},
      isDeleteConfirmOpen: false,
      ruleToDelete: null,
      openDeleteConfirm: () => {},
      closeDeleteConfirm: () => {},
      isPauseConfirmOpen: false,
      ruleToPause: null,
      openPauseConfirm: () => {},
      closePauseConfirm: () => {},
      isSkipConfirmOpen: false,
      skipTarget: null,
      openSkipConfirm: () => {},
      closeSkipConfirm: () => {},
    };
  }
  return context;
}
