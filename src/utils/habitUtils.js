import { getTodayDateString, getOffsetDateString } from './taskStorage';

export const HABITS_STORAGE_KEY = 'taskly_habits';
export const HABIT_LOGS_STORAGE_KEY = 'taskly_habit_logs';
export const HABIT_ORDER_STORAGE_KEY = 'taskly_habit_order';
export const HABIT_SETTINGS_STORAGE_KEY = 'taskly_habit_settings';

export const defaultHabitSettings = {
  habitTrackingEnabled: true,
  showHabitWidget: true,
  showHabitsInMyDay: true,
  celebrateStreaks: true,
  defaultHabitView: 'grid', // 'grid' | 'list' | 'calendar'
  remindOnlyIfIncomplete: true,
};

export const HABIT_CATEGORIES = [
  'Health',
  'Learning',
  'Work',
  'Personal',
  'Fitness',
  'Mindfulness',
  'Productivity',
  'Other',
];

export const ROUTINE_GROUPS = [
  { id: 'morning', label: 'Morning Routine', timeHint: '6:00 AM – 12:00 PM', icon: 'Sunrise' },
  { id: 'afternoon', label: 'Afternoon Routine', timeHint: '12:00 PM – 5:00 PM', icon: 'Sun' },
  { id: 'evening', label: 'Evening Routine', timeHint: '5:00 PM – 9:00 PM', icon: 'Sunset' },
  { id: 'night', label: 'Night Routine', timeHint: '9:00 PM – 12:00 AM', icon: 'Moon' },
  { id: 'none', label: 'Anytime / Other', timeHint: 'Flexible schedule', icon: 'Clock' },
];

/**
 * Format date object to YYYY-MM-DD safely without UTC shift
 */
export const formatDateKey = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return getTodayDateString();
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Parse YYYY-MM-DD string into local Date object safely without UTC timezone shift
 */
export const parseDateKey = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return new Date();
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date();
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  return new Date(y, m, d, 12, 0, 0); // midday to avoid DST hour shift
};

/**
 * Generate unique Habit ID
 */
export const generateHabitId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `habit-${crypto.randomUUID()}`;
  }
  return `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate unique Habit Log ID
 */
export const generateHabitLogId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `hlog-${crypto.randomUUID()}`;
  }
  return `hlog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if a habit is scheduled for a given dateStr (YYYY-MM-DD)
 */
export const isHabitScheduledForDate = (habit, dateStr) => {
  if (!habit || habit.archived) return false;
  if (!dateStr) return false;

  // Do not schedule before habit was created (by date string)
  if (habit.createdAt) {
    const createdDateStr = habit.createdAt.split('T')[0];
    if (dateStr < createdDateStr) return false;
  }

  const d = parseDateKey(dateStr);
  const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  const freq = habit.frequency;

  if (freq === 'daily') return true;

  if (freq === 'weekdays') {
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  if (freq === 'weekly') {
    // Scheduled once a week: default Sunday (0) or custom designated day
    const targetDay = typeof habit.weeklyDay === 'number' ? habit.weeklyDay : 0;
    return dayOfWeek === targetDay;
  }

  if (typeof freq === 'object' && freq !== null) {
    if (freq.type === 'custom' && Array.isArray(freq.days)) {
      return freq.days.includes(dayOfWeek);
    }
  }

  return true;
};

/**
 * Get progress & completion for a habit on a given dateStr
 */
export const getHabitProgressForDate = (habit, logs = [], dateStr) => {
  const target = Math.max(1, Number(habit.targetCount) || 1);
  const log = logs.find((l) => l.habitId === habit.id && l.date === dateStr);

  const count = log ? Math.min(target, Math.max(0, Number(log.count) || 0)) : 0;
  const completed = log ? Boolean(log.completed || count >= target) : false;
  const percentage = Math.min(100, Math.round((count / target) * 100));

  return {
    log,
    count,
    targetCount: target,
    completed,
    percentage,
  };
};

/**
 * Calculate Current Streak (consecutive completed scheduled days backwards from today)
 * Non-scheduled days DO NOT break streak.
 */
export const calculateCurrentStreak = (habit, logs = []) => {
  if (!habit) return 0;
  const todayStr = getTodayDateString();
  const createdDateStr = (habit.createdAt || todayStr).split('T')[0];

  let streak = 0;
  let currentDate = parseDateKey(todayStr);

  // Check today first:
  const isTodayScheduled = isHabitScheduledForDate(habit, todayStr);
  const todayProgress = getHabitProgressForDate(habit, logs, todayStr);

  if (isTodayScheduled && todayProgress.completed) {
    streak += 1;
  }

  // Now step backwards day by day from yesterday
  currentDate.setDate(currentDate.getDate() - 1);

  // Maximum check limit 365 days
  let safetyLimit = 365;
  while (safetyLimit > 0) {
    safetyLimit -= 1;
    const dateStr = formatDateKey(currentDate);

    // Stop if before creation date
    if (dateStr < createdDateStr) break;

    const isScheduled = isHabitScheduledForDate(habit, dateStr);

    if (isScheduled) {
      const progress = getHabitProgressForDate(habit, logs, dateStr);
      if (progress.completed) {
        streak += 1;
      } else {
        // Scheduled day was missed -> streak ends here!
        break;
      }
    }
    // Non-scheduled days are skipped, preserving streak.

    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

/**
 * Calculate Longest Historical Streak (maximum consecutive completed scheduled days)
 */
export const calculateLongestStreak = (habit, logs = []) => {
  if (!habit) return 0;
  const todayStr = getTodayDateString();
  const createdDateStr = (habit.createdAt || todayStr).split('T')[0];

  let maxStreak = 0;
  let currentRunningStreak = 0;

  // Iterate chronologically from createdAt to today
  let cursor = parseDateKey(createdDateStr);
  const end = parseDateKey(todayStr);

  while (cursor <= end) {
    const dateStr = formatDateKey(cursor);
    const isScheduled = isHabitScheduledForDate(habit, dateStr);

    if (isScheduled) {
      const progress = getHabitProgressForDate(habit, logs, dateStr);
      if (progress.completed) {
        currentRunningStreak += 1;
        if (currentRunningStreak > maxStreak) {
          maxStreak = currentRunningStreak;
        }
      } else {
        // Only reset if dateStr is in the past (if today is not completed yet, don't necessarily break historical best)
        if (dateStr < todayStr) {
          currentRunningStreak = 0;
        }
      }
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return maxStreak;
};

/**
 * Calculate Completion Rate over past N days (default 30 days)
 */
export const calculateCompletionRate = (habit, logs = [], days = 30) => {
  if (!habit) return 0;
  const todayStr = getTodayDateString();

  let scheduledDays = 0;
  let completedDays = 0;

  let cursor = parseDateKey(todayStr);

  for (let i = 0; i < days; i++) {
    const dateStr = formatDateKey(cursor);
    const isScheduled = isHabitScheduledForDate(habit, dateStr);

    if (isScheduled) {
      scheduledDays += 1;
      const progress = getHabitProgressForDate(habit, logs, dateStr);
      if (progress.completed) {
        completedDays += 1;
      }
    }

    cursor.setDate(cursor.getDate() - 1);
  }

  if (scheduledDays === 0) return 0;
  return Math.min(100, Math.round((completedDays / scheduledDays) * 100));
};

/**
 * Monthly Calendar Grid for a Habit (Heatmap view)
 */
export const getHabitCalendarData = (habit, logs = [], year, monthIndex) => {
  const todayStr = getTodayDateString();
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  // Day of week for first day (0=Sunday, adjust so Monday is first: Mon=0, ..., Sun=6)
  let startDayOfWeek = firstDayOfMonth.getDay();
  // 0 (Sun) -> 6, 1 (Mon) -> 0, etc.
  const mondayOffset = (startDayOfWeek + 6) % 7;

  const days = [];

  // Previous month trailing days
  const prevMonthTotalDays = new Date(year, monthIndex, 0).getDate();
  for (let i = mondayOffset - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    const d = new Date(year, monthIndex - 1, dayNum, 12, 0, 0);
    const dateStr = formatDateKey(d);
    days.push({
      dateStr,
      dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
      isScheduled: habit ? isHabitScheduledForDate(habit, dateStr) : false,
      completed: habit ? getHabitProgressForDate(habit, logs, dateStr).completed : false,
      count: habit ? getHabitProgressForDate(habit, logs, dateStr).count : 0,
      targetCount: habit ? habit.targetCount || 1 : 1,
    });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
    const d = new Date(year, monthIndex, dayNum, 12, 0, 0);
    const dateStr = formatDateKey(d);
    const isScheduled = habit ? isHabitScheduledForDate(habit, dateStr) : false;
    const progress = habit ? getHabitProgressForDate(habit, logs, dateStr) : { count: 0, completed: false };

    days.push({
      dateStr,
      dayNum,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
      isScheduled,
      completed: progress.completed,
      partial: !progress.completed && progress.count > 0,
      missed: isScheduled && !progress.completed && dateStr < todayStr,
      count: progress.count,
      targetCount: habit ? habit.targetCount || 1 : 1,
    });
  }

  // Next month leading days to complete grid (multiples of 7)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let dayNum = 1; dayNum <= remaining; dayNum++) {
    const d = new Date(year, monthIndex + 1, dayNum, 12, 0, 0);
    const dateStr = formatDateKey(d);
    days.push({
      dateStr,
      dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
      isScheduled: habit ? isHabitScheduledForDate(habit, dateStr) : false,
      completed: habit ? getHabitProgressForDate(habit, logs, dateStr).completed : false,
      count: habit ? getHabitProgressForDate(habit, logs, dateStr).count : 0,
      targetCount: habit ? habit.targetCount || 1 : 1,
    });
  }

  return days;
};

/**
 * Get Summary of Today's Habits
 */
export const getTodayHabitSummary = (habits = [], logs = [], dateStr = getTodayDateString()) => {
  const active = habits.filter((h) => !h.archived);
  const scheduledToday = active.filter((h) => isHabitScheduledForDate(h, dateStr));

  let completedToday = 0;
  scheduledToday.forEach((h) => {
    const p = getHabitProgressForDate(h, logs, dateStr);
    if (p.completed) completedToday += 1;
  });

  const remaining = Math.max(0, scheduledToday.length - completedToday);
  const rate = scheduledToday.length > 0 ? Math.round((completedToday / scheduledToday.length) * 100) : 0;

  // Find max current streak among active habits
  let maxCurrentStreak = 0;
  let maxBestStreak = 0;

  active.forEach((h) => {
    const cStreak = calculateCurrentStreak(h, logs);
    const bStreak = calculateLongestStreak(h, logs);
    if (cStreak > maxCurrentStreak) maxCurrentStreak = cStreak;
    if (bStreak > maxBestStreak) maxBestStreak = bStreak;
  });

  return {
    totalScheduled: scheduledToday.length,
    completedToday,
    remaining,
    completionRate: rate,
    maxCurrentStreak,
    maxBestStreak,
  };
};

/**
 * Get Weekly Statistics (past 7 days)
 */
export const getWeeklyHabitStats = (habits = [], logs = []) => {
  const active = habits.filter((h) => !h.archived);
  const days = [];
  let totalScheduled = 0;
  let totalCompleted = 0;

  for (let i = 6; i >= 0; i--) {
    const dateStr = getOffsetDateString(-i);
    const d = parseDateKey(dateStr);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

    let scheduledOnDay = 0;
    let completedOnDay = 0;

    active.forEach((h) => {
      if (isHabitScheduledForDate(h, dateStr)) {
        scheduledOnDay += 1;
        const p = getHabitProgressForDate(h, logs, dateStr);
        if (p.completed) completedOnDay += 1;
      }
    });

    totalScheduled += scheduledOnDay;
    totalCompleted += completedOnDay;

    const rate = scheduledOnDay > 0 ? Math.round((completedOnDay / scheduledOnDay) * 100) : 0;

    days.push({
      dateStr,
      dayName,
      scheduled: scheduledOnDay,
      completed: completedOnDay,
      rate,
    });
  }

  const overallRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

  return {
    days,
    totalScheduled,
    totalCompleted,
    overallRate,
  };
};

/**
 * Get Category Breakdown Statistics
 */
export const getHabitCategoryStats = (habits = [], logs = []) => {
  const active = habits.filter((h) => !h.archived);
  const map = {};

  active.forEach((h) => {
    const cat = h.category || 'Other';
    if (!map[cat]) {
      map[cat] = {
        category: cat,
        habitsCount: 0,
        totalRateSum: 0,
        habits: [],
      };
    }
    const rate = calculateCompletionRate(h, logs, 30);
    map[cat].habitsCount += 1;
    map[cat].totalRateSum += rate;
    map[cat].habits.push({
      id: h.id,
      name: h.name,
      rate,
      streak: calculateCurrentStreak(h, logs),
    });
  });

  return Object.values(map).map((group) => ({
    ...group,
    averageRate: group.habitsCount > 0 ? Math.round(group.totalRateSum / group.habitsCount) : 0,
  }));
};

/**
 * Top Habits and Needs Attention (Weakest)
 */
export const getHabitPerformance = (habits = [], logs = []) => {
  const active = habits.filter((h) => !h.archived);
  if (active.length === 0) {
    return { topHabits: [], needsAttention: [] };
  }

  const scored = active.map((h) => {
    const rate = calculateCompletionRate(h, logs, 30);
    const streak = calculateCurrentStreak(h, logs);
    const bestStreak = calculateLongestStreak(h, logs);
    return {
      id: h.id,
      name: h.name,
      category: h.category || 'General',
      icon: h.icon || 'Flame',
      color: h.color || '#7C3AED',
      rate,
      streak,
      bestStreak,
    };
  });

  scored.sort((a, b) => b.rate - a.rate);

  const topHabits = scored.slice(0, 3);
  const needsAttention = scored.filter((h) => h.rate < 60).slice(-3).reverse();

  return {
    topHabits,
    needsAttention,
  };
};

/**
 * Initial Seeds for Habits and Logs (Empty by default)
 */
export const seedInitialHabits = () => {
  return { habits: [], logs: [] };
};

/**
 * Load habits safely from localStorage
 */
export const loadHabitsFromStorage = () => {
  try {
    const raw = localStorage.getItem(HABITS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load habits from storage:', e);
    return [];
  }
};

/**
 * Load habit logs safely from localStorage
 */
export const loadHabitLogsFromStorage = () => {
  try {
    const raw = localStorage.getItem(HABIT_LOGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load habit logs from storage:', e);
    return [];
  }
};

/**
 * Load habit settings safely
 */
export const loadHabitSettingsFromStorage = () => {
  try {
    const raw = localStorage.getItem(HABIT_SETTINGS_STORAGE_KEY);
    if (!raw) return defaultHabitSettings;
    return { ...defaultHabitSettings, ...JSON.parse(raw) };
  } catch (e) {
    return defaultHabitSettings;
  }
};
