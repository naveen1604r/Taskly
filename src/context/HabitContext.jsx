import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useActivityContext } from './ActivityContext';
import { useNotificationsContext } from './NotificationsContext';
import { useTaskContext } from './TaskContext';
import { useAuthContext } from './AuthContext';
import { api } from '../services/api';
import { getTodayDateString } from '../utils/taskStorage';
import {
  HABITS_STORAGE_KEY,
  HABIT_LOGS_STORAGE_KEY,
  HABIT_ORDER_STORAGE_KEY,
  HABIT_SETTINGS_STORAGE_KEY,
  loadHabitsFromStorage,
  loadHabitLogsFromStorage,
  loadHabitSettingsFromStorage,
  generateHabitId,
  generateHabitLogId,
  isHabitScheduledForDate,
  getHabitProgressForDate,
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateCompletionRate,
  getTodayHabitSummary,
  getWeeklyHabitStats,
  getHabitCategoryStats,
  getHabitPerformance,
  defaultHabitSettings,
} from '../utils/habitUtils';

const HabitContext = createContext(null);

export function HabitProvider({ children }) {
  const { logActivity } = useActivityContext() || {};
  const { addReminder, deleteReminder, showToast } = useNotificationsContext() || {};
  const { addTask } = useTaskContext() || {};
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthContext();

  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [habitOrder, setHabitOrder] = useState(() => {
    try {
      const raw = localStorage.getItem(HABIT_ORDER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [habitSettings, setHabitSettings] = useState(() => loadHabitSettingsFromStorage());

  // Fetch habits and logs from backend API
  const fetchHabitsData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setHabits([]);
      setHabitLogs([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const [habitsRes, logsRes] = await Promise.allSettled([
        api.habits.getAll(),
        api.habits.getAllLogs(),
      ]);

      if (habitsRes.status === 'fulfilled' && habitsRes.value.success) {
        const rawHabits = habitsRes.value.data.habits || [];
        setHabits(
          rawHabits.map((h) => ({
            id: String(h.id),
            name: h.name,
            description: h.description || '',
            icon: h.icon || 'Flame',
            color: h.color || '#7C3AED',
            category: h.category || 'Health',
            frequency: h.frequency || 'daily',
            targetCount: Number(h.targetPerDay) || 1,
            targetPerDay: Number(h.targetPerDay) || 1,
            unit: h.targetUnit || 'times',
            reminderTime: h.reminderTime || '09:00',
            reminderEnabled: Boolean(h.reminderTime),
            currentStreak: Number(h.currentStreak) || 0,
            bestStreak: Number(h.bestStreak) || 0,
            totalCompleted: Number(h.totalCompleted) || 0,
            archived: Boolean(h.archived),
            createdAt: h.createdAt,
            updatedAt: h.updatedAt,
          }))
        );
      }

      if (logsRes.status === 'fulfilled' && logsRes.value.success) {
        const rawLogs = logsRes.value.data.logs || [];
        setHabitLogs(
          rawLogs.map((l) => ({
            id: String(l.id),
            habitId: String(l.habitId),
            date: l.logDate,
            logDate: l.logDate,
            completed: Boolean(l.completed),
            count: Number(l.progressCount) || 0,
            progressCount: Number(l.progressCount) || 0,
            notes: l.notes || '',
            createdAt: l.createdAt,
          }))
        );
      }
    } catch (err) {
      console.warn('Failed to load habits from API:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchHabitsData();
    }
  }, [fetchHabitsData, isAuthLoading]);

  // Modal states
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Sync to localStorage as client fallback cache
  useEffect(() => {
    try {
      localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
    } catch (e) {
      console.error('Failed to save habits:', e);
    }
  }, [habits]);

  useEffect(() => {
    try {
      localStorage.setItem(HABIT_LOGS_STORAGE_KEY, JSON.stringify(habitLogs));
    } catch (e) {
      console.error('Failed to save habit logs:', e);
    }
  }, [habitLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(HABIT_ORDER_STORAGE_KEY, JSON.stringify(habitOrder));
    } catch (e) {
      console.error('Failed to save habit order:', e);
    }
  }, [habitOrder]);

  useEffect(() => {
    try {
      localStorage.setItem(HABIT_SETTINGS_STORAGE_KEY, JSON.stringify(habitSettings));
    } catch (e) {
      console.error('Failed to save habit settings:', e);
    }
  }, [habitSettings]);

  // Modals
  const openCreateHabitModal = useCallback((initialData = null) => {
    setEditingHabit(initialData);
    setIsHabitModalOpen(true);
  }, []);

  const openEditHabitModal = useCallback((habit) => {
    setEditingHabit(habit);
    setIsHabitModalOpen(true);
  }, []);

  const closeHabitModal = useCallback(() => {
    setIsHabitModalOpen(false);
    setEditingHabit(null);
  }, []);

  // Update Settings
  const updateHabitSettings = useCallback((updates) => {
    setHabitSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Add Habit
  const addHabit = useCallback(async (data) => {
    const now = new Date().toISOString();
    let newHabit = null;

    if (isAuthenticated) {
      try {
        const res = await api.habits.create({
          name: data.name?.trim() || 'New Habit',
          description: data.description?.trim() || '',
          category: data.category || 'Health',
          frequency: typeof data.frequency === 'string' ? data.frequency : 'custom',
          targetPerDay: Number(data.targetCount) || 1,
          targetUnit: data.unit?.trim() || 'times',
          color: data.color || '#7C3AED',
          icon: data.icon || 'Flame',
          reminderTime: data.reminderTime || '09:00',
        });
        if (res.success && res.data?.habit) {
          const h = res.data.habit;
          newHabit = {
            id: String(h.id),
            name: h.name,
            description: h.description || '',
            icon: h.icon || 'Flame',
            color: h.color || '#7C3AED',
            category: h.category || 'Health',
            frequency: h.frequency || 'daily',
            targetCount: Number(h.targetPerDay) || 1,
            targetPerDay: Number(h.targetPerDay) || 1,
            unit: h.targetUnit || 'times',
            reminderTime: h.reminderTime || '09:00',
            reminderEnabled: Boolean(h.reminderTime),
            currentStreak: Number(h.currentStreak) || 0,
            bestStreak: Number(h.bestStreak) || 0,
            totalCompleted: Number(h.totalCompleted) || 0,
            archived: Boolean(h.archived),
            createdAt: h.createdAt,
            updatedAt: h.updatedAt,
          };
        }
      } catch (err) {
        console.warn('API createHabit warning:', err.message);
      }
    }

    if (!newHabit) {
      newHabit = {
        id: generateHabitId(),
        name: data.name?.trim() || 'New Habit',
        description: data.description?.trim() || '',
        icon: data.icon || 'Flame',
        color: data.color || '#7C3AED',
        category: data.category || 'Health',
        frequency: data.frequency || 'daily',
        weeklyDay: typeof data.weeklyDay === 'number' ? data.weeklyDay : 0,
        targetCount: Math.max(1, Number(data.targetCount) || 1),
        targetPerDay: Math.max(1, Number(data.targetCount) || 1),
        unit: data.unit?.trim() || (Number(data.targetCount) > 1 ? 'times' : 'session'),
        reminderTime: data.reminderTime || '09:00',
        reminderEnabled: Boolean(data.reminderEnabled),
        routineGroup: data.routineGroup || 'none',
        goalId: data.goalId || null,
        projectId: data.projectId || null,
        archived: false,
        createdAt: now,
        updatedAt: now,
      };
    }

    setHabits((prev) => [newHabit, ...prev]);

    // Schedule notification reminder if enabled
    if (newHabit.reminderEnabled && addReminder) {
      try {
        addReminder({
          title: `Habit: ${newHabit.name}`,
          message: newHabit.description || `Time to build consistency with ${newHabit.name}`,
          date: getTodayDateString(),
          time: newHabit.reminderTime,
          repeat: newHabit.frequency === 'weekdays' ? 'weekdays' : newHabit.frequency === 'weekly' ? 'weekly' : 'daily',
          priority: 'normal',
          entityType: 'habit',
          entityId: newHabit.id,
        });
      } catch (e) {
        console.warn('Failed to schedule habit reminder:', e);
      }
    }

    if (logActivity) {
      logActivity({
        title: `Created habit "${newHabit.name}"`,
        category: 'Habits',
      });
    }

    if (showToast) {
      showToast(`Habit "${newHabit.name}" created!`, 'success');
    }

    return newHabit;
  }, [isAuthenticated, addReminder, logActivity, showToast]);

  // Update Habit
  const updateHabit = useCallback(async (id, updates) => {
    const now = new Date().toISOString();
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates, updatedAt: now } : h))
    );

    if (isAuthenticated) {
      try {
        await api.habits.update(id, {
          name: updates.name,
          description: updates.description,
          category: updates.category,
          frequency: typeof updates.frequency === 'string' ? updates.frequency : undefined,
          targetPerDay: updates.targetCount !== undefined ? Number(updates.targetCount) : undefined,
          targetUnit: updates.unit,
          color: updates.color,
          icon: updates.icon,
          reminderTime: updates.reminderTime,
          archived: updates.archived,
        });
      } catch (err) {
        console.warn('API updateHabit warning:', err.message);
      }
    }

    if (logActivity) {
      logActivity({
        title: `Updated habit "${updates.name || id}"`,
        category: 'Habits',
      });
    }

    if (showToast) {
      showToast('Habit updated', 'success');
    }
  }, [isAuthenticated, logActivity, showToast]);

  // Delete Habit
  const deleteHabit = useCallback(async (id) => {
    const target = habits.find((h) => h.id === id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setHabitLogs((prev) => prev.filter((l) => l.habitId !== id));
    setHabitOrder((prev) => prev.filter((hId) => hId !== id));

    if (isAuthenticated) {
      try {
        await api.habits.delete(id);
      } catch (err) {
        console.warn('API deleteHabit warning:', err.message);
      }
    }

    if (logActivity && target) {
      logActivity({
        title: `Deleted habit "${target.name}" and historical records`,
        category: 'Habits',
      });
    }

    if (showToast) {
      showToast(`Habit "${target?.name || ''}" deleted`, 'info');
    }
  }, [isAuthenticated, habits, logActivity, showToast]);

  // Archive Habit
  const archiveHabit = useCallback(async (id) => {
    updateHabit(id, { archived: true });
    if (isAuthenticated) {
      try {
        await api.habits.archive(id);
      } catch (err) {
        console.warn('API archiveHabit warning:', err.message);
      }
    }
    if (showToast) showToast('Habit archived', 'info');
  }, [isAuthenticated, updateHabit, showToast]);

  // Restore Habit
  const restoreHabit = useCallback(async (id) => {
    updateHabit(id, { archived: false });
    if (isAuthenticated) {
      try {
        await api.habits.restore(id);
      } catch (err) {
        console.warn('API restoreHabit warning:', err.message);
      }
    }
    if (showToast) showToast('Habit restored', 'success');
  }, [isAuthenticated, updateHabit, showToast]);

  // Core Habit Logging / Progress
  const setHabitProgress = useCallback(async (habitId, newCount, dateStr = getTodayDateString()) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const target = Math.max(1, Number(habit.targetCount) || 1);
    const clampedCount = Math.min(target, Math.max(0, Number(newCount) || 0));
    const isCompleted = clampedCount >= target;
    const now = new Date().toISOString();

    setHabitLogs((prev) => {
      const existingIndex = prev.findIndex((l) => String(l.habitId) === String(habitId) && (l.date === dateStr || l.logDate === dateStr));
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          count: clampedCount,
          progressCount: clampedCount,
          targetCount: target,
          completed: isCompleted,
          completedAt: isCompleted ? (updated[existingIndex].completedAt || now) : null,
        };
        return updated;
      } else {
        const newLog = {
          id: generateHabitLogId(),
          habitId: String(habitId),
          date: dateStr,
          logDate: dateStr,
          count: clampedCount,
          progressCount: clampedCount,
          targetCount: target,
          completed: isCompleted,
          completedAt: isCompleted ? now : null,
          createdAt: now,
        };
        return [newLog, ...prev];
      }
    });

    if (isAuthenticated) {
      try {
        const res = await api.habits.logProgress(habitId, {
          logDate: dateStr,
          completed: isCompleted,
          progressCount: clampedCount,
        });

        if (res.success && res.data?.habit) {
          const updatedH = res.data.habit;
          setHabits((prev) =>
            prev.map((h) =>
              String(h.id) === String(habitId)
                ? {
                    ...h,
                    currentStreak: Number(updatedH.currentStreak) || 0,
                    bestStreak: Number(updatedH.bestStreak) || 0,
                    totalCompleted: Number(updatedH.totalCompleted) || 0,
                  }
                : h
            )
          );
        }
      } catch (err) {
        console.warn('API logProgress warning:', err.message);
      }
    }

    // Check streak achievement celebration
    if (isCompleted) {
      const currentStreak = calculateCurrentStreak(habit, habitLogs) + 1;
      if (logActivity) {
        logActivity({
          title: `Completed habit "${habit.name}" (${clampedCount}/${target} ${habit.unit})`,
          category: 'Habits',
        });
        if (currentStreak > 0 && currentStreak % 7 === 0) {
          logActivity({
            title: `🔥 ${currentStreak}-day streak achieved for "${habit.name}"!`,
            category: 'Habits',
          });
        }
      }
      if (showToast) {
        showToast(`✓ Completed "${habit.name}"!`, 'success');
      }
    }
  }, [habits, habitLogs, logActivity, showToast]);

  // Increment measurable habit
  const incrementHabit = useCallback((habitId, dateStr = getTodayDateString()) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    const p = getHabitProgressForDate(habit, habitLogs, dateStr);
    const nextCount = Math.min(habit.targetCount, p.count + 1);
    setHabitProgress(habitId, nextCount, dateStr);
  }, [habits, habitLogs, setHabitProgress]);

  // Decrement measurable habit
  const decrementHabit = useCallback((habitId, dateStr = getTodayDateString()) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    const p = getHabitProgressForDate(habit, habitLogs, dateStr);
    const nextCount = Math.max(0, p.count - 1);
    setHabitProgress(habitId, nextCount, dateStr);
  }, [habits, habitLogs, setHabitProgress]);

  // Toggle or direct complete binary habit
  const toggleHabitComplete = useCallback((habitId, dateStr = getTodayDateString()) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    const p = getHabitProgressForDate(habit, habitLogs, dateStr);
    if (p.completed) {
      setHabitProgress(habitId, 0, dateStr);
      if (showToast) showToast(`Marked "${habit.name}" incomplete`, 'info');
    } else {
      setHabitProgress(habitId, habit.targetCount, dateStr);
    }
  }, [habits, habitLogs, setHabitProgress, showToast]);

  // Undo completion (Requirement 11)
  const undoHabitCompletion = useCallback((habitId, dateStr = getTodayDateString()) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    const p = getHabitProgressForDate(habit, habitLogs, dateStr);
    if (habit.targetCount > 1 && p.count > 0) {
      setHabitProgress(habitId, p.count - 1, dateStr);
    } else {
      setHabitProgress(habitId, 0, dateStr);
    }
    if (showToast) showToast(`Undid completion for "${habit.name}"`, 'info');
    if (logActivity) {
      logActivity({
        title: `Undid completion for habit "${habit.name}"`,
        category: 'Habits',
      });
    }
  }, [habits, habitLogs, setHabitProgress, showToast, logActivity]);

  // Create Task from Habit (Requirement 29)
  const createTaskFromHabit = useCallback((habitId) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit || !addTask) return;

    addTask({
      title: habit.name,
      description: habit.description || `Session for habit: ${habit.name}`,
      priority: 'medium',
      category: habit.category || 'General',
      duration: habit.unit === 'minutes' ? habit.targetCount : 30,
      durationUnit: 'minutes',
      dueDate: getTodayDateString(),
      dueTime: habit.reminderTime || '10:00',
      projectId: habit.projectId || null,
      goalId: habit.goalId || null,
      status: 'pending',
    });

    if (showToast) showToast(`Created task from habit "${habit.name}"`, 'success');
  }, [habits, addTask, showToast]);

  // Reorder habits within routine
  const reorderHabits = useCallback((newOrder) => {
    setHabitOrder(newOrder);
  }, []);

  // Getters
  const getHabit = useCallback((id) => habits.find((h) => h.id === id), [habits]);
  const activeHabits = useMemo(() => habits.filter((h) => !h.archived), [habits]);
  const archivedHabits = useMemo(() => habits.filter((h) => h.archived), [habits]);

  const todaySummary = useMemo(
    () => getTodayHabitSummary(habits, habitLogs, getTodayDateString()),
    [habits, habitLogs]
  );

  const weeklyStats = useMemo(
    () => getWeeklyHabitStats(habits, habitLogs),
    [habits, habitLogs]
  );

  const categoryStats = useMemo(
    () => getHabitCategoryStats(habits, habitLogs),
    [habits, habitLogs]
  );

  const performanceStats = useMemo(
    () => getHabitPerformance(habits, habitLogs),
    [habits, habitLogs]
  );

  const value = {
    habits,
    habitLogs,
    habitOrder,
    habitSettings,
    activeHabits,
    archivedHabits,
    todaySummary,
    weeklyStats,
    categoryStats,
    performanceStats,

    // Modal
    isHabitModalOpen,
    editingHabit,
    openCreateHabitModal,
    openEditHabitModal,
    closeHabitModal,

    // CRUD
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    restoreHabit,

    // Logging & Progress
    setHabitProgress,
    incrementHabit,
    decrementHabit,
    toggleHabitComplete,
    undoHabitCompletion,

    // Integrations
    createTaskFromHabit,
    reorderHabits,
    updateHabitSettings,
    getHabit,
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}

export function useHabitContext() {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabitContext must be used within a HabitProvider');
  }
  return context;
}
