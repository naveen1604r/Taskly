/**
 * Focus Mode & Pomodoro Timer utilities, calculations, and local persistence
 */

import { getTodayDateString } from './taskStorage';

export const FOCUS_SETTINGS_KEY = 'taskly_focus_settings';
export const FOCUS_SESSIONS_KEY = 'taskly_focus_sessions';
export const FOCUS_ACTIVE_SESSION_KEY = 'taskly_focus_active_session';

export const defaultFocusSettings = {
  focusDuration: 25, // minutes
  shortBreakDuration: 5, // minutes
  longBreakDuration: 15, // minutes
  sessionsBeforeLongBreak: 4,
  dailyFocusGoal: 120, // minutes
  autoStartBreak: false,
  autoStartFocus: false,
  timerSound: true,
  desktopNotifications: true,
};

// Initial seed focus sessions (Empty by default)
export const defaultFocusSessions = [];

export const loadFocusSettings = () => {
  try {
    const raw = localStorage.getItem(FOCUS_SETTINGS_KEY);
    if (!raw) return defaultFocusSettings;
    return { ...defaultFocusSettings, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to load focus settings:', e);
    return defaultFocusSettings;
  }
};

export const saveFocusSettings = (settings) => {
  try {
    localStorage.setItem(FOCUS_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save focus settings:', e);
  }
};

export const loadFocusSessions = () => {
  try {
    const raw = localStorage.getItem(FOCUS_SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load focus sessions:', e);
    return [];
  }
};

export const saveFocusSessions = (sessions) => {
  try {
    localStorage.setItem(FOCUS_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save focus sessions:', e);
  }
};

export const loadActiveSessionState = () => {
  try {
    const raw = localStorage.getItem(FOCUS_ACTIVE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const saveActiveSessionState = (state) => {
  try {
    if (!state) {
      localStorage.removeItem(FOCUS_ACTIVE_SESSION_KEY);
    } else {
      localStorage.setItem(FOCUS_ACTIVE_SESSION_KEY, JSON.stringify(state));
    }
  } catch (e) {
    console.error('Failed to save active focus state:', e);
  }
};

/**
 * Format total seconds into MM:SS or HH:MM:SS
 */
export const formatFocusTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const s = Math.floor(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Format minutes into "Xh Ym"
 */
export const formatDurationMinutes = (minutes) => {
  if (!minutes || minutes <= 0) return '0m';
  const m = Math.round(minutes);
  const hrs = Math.floor(m / 60);
  const remainingMins = m % 60;

  if (hrs === 0) return `${remainingMins}m`;
  if (remainingMins === 0) return `${hrs}h`;
  return `${hrs}h ${remainingMins}m`;
};

/**
 * Calculate completion percentage for circular timer ring (0 to 100)
 */
export const calculateFocusProgress = (elapsedSeconds, totalSeconds) => {
  if (!totalSeconds || totalSeconds <= 0) return 0;
  return Math.min(100, Math.max(0, (elapsedSeconds / totalSeconds) * 100));
};

/**
 * Filter sessions occurring on a specific YYYY-MM-DD local date
 */
export const getSessionsForDate = (sessions = [], targetDateStr) => {
  if (!targetDateStr) return [];
  return sessions.filter((s) => {
    if (!s.createdAt) return false;
    const sessionDate = s.createdAt.substring(0, 10);
    return sessionDate === targetDateStr;
  });
};

/**
 * Calculate total focus time for today in minutes
 */
export const calculateTodayFocusTime = (sessions = [], todayDateStr = getTodayDateString()) => {
  const daySessions = getSessionsForDate(sessions, todayDateStr);
  return daySessions
    .filter((s) => s.sessionType === 'focus' && s.completed)
    .reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
};

/**
 * Calculate total focus time for this week in minutes
 */
export const calculateWeeklyFocusTime = (sessions = [], todayDateStr = getTodayDateString()) => {
  const [y, m, d] = todayDateStr.split('-').map(Number);
  const today = new Date(y, m - 1, d);
  const dayOfWeek = today.getDay(); // 0 is Sun
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  return sessions
    .filter((s) => {
      if (s.sessionType !== 'focus' || !s.completed || !s.createdAt) return false;
      const sDate = new Date(s.createdAt);
      return sDate >= startOfWeek;
    })
    .reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
};

/**
 * Calculate total focus time for this month in minutes
 */
export const calculateMonthlyFocusTime = (sessions = [], todayDateStr = getTodayDateString()) => {
  const currentPrefix = todayDateStr.substring(0, 7); // YYYY-MM
  return sessions
    .filter((s) => {
      if (s.sessionType !== 'focus' || !s.completed || !s.createdAt) return false;
      return s.createdAt.substring(0, 7) === currentPrefix;
    })
    .reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
};

/**
 * Calculate focus streak in consecutive active days
 */
export const calculateFocusStreak = (sessions = [], todayDateStr = getTodayDateString()) => {
  // Collect all unique dates with at least 1 completed focus session
  const activeDateSet = new Set(
    sessions
      .filter((s) => s.sessionType === 'focus' && s.completed && s.createdAt)
      .map((s) => s.createdAt.substring(0, 10))
  );

  const [y, m, d] = todayDateStr.split('-').map(Number);
  let streak = 0;
  let checkDate = new Date(y, m - 1, d);

  // Check if today has a session; if not, check if yesterday had one to keep streak alive
  const todayKey = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  if (!activeDateSet.has(todayKey)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count backwards
  while (true) {
    const yr = checkDate.getFullYear();
    const mo = String(checkDate.getMonth() + 1).padStart(2, '0');
    const dy = String(checkDate.getDate()).padStart(2, '0');
    const dateKey = `${yr}-${mo}-${dy}`;

    if (activeDateSet.has(dateKey)) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Calculate average focus session duration in minutes
 */
export const calculateAverageSessionDuration = (sessions = []) => {
  const focusSessions = sessions.filter((s) => s.sessionType === 'focus' && s.completed);
  if (focusSessions.length === 0) return 0;
  const total = focusSessions.reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
  return Math.round(total / focusSessions.length);
};

/**
 * Total focus time spent on a specific task in minutes
 */
export const getTaskFocusTime = (taskId, sessions = []) => {
  if (!taskId) return 0;
  return sessions
    .filter((s) => s.taskId === taskId && s.sessionType === 'focus' && s.completed)
    .reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
};

/**
 * Daily focus goal progress calculation
 */
export const calculateDailyFocusGoalProgress = (todayMinutes, dailyGoalMinutes = 120) => {
  const goal = Math.max(1, dailyGoalMinutes);
  const percentage = Math.round((todayMinutes / goal) * 100);
  const isReached = todayMinutes >= goal;
  const remaining = Math.max(0, goal - todayMinutes);

  return {
    todayMinutes,
    dailyGoalMinutes: goal,
    percentage,
    isReached,
    remainingMinutes: remaining,
  };
};

/**
 * Find task with the highest cumulative focus duration
 */
export const getMostFocusedTask = (sessions = [], tasks = []) => {
  const timeMap = {};
  sessions
    .filter((s) => s.sessionType === 'focus' && s.completed && s.taskId)
    .forEach((s) => {
      timeMap[s.taskId] = (timeMap[s.taskId] || 0) + (Number(s.duration) || 0);
    });

  let topTaskId = null;
  let maxTime = 0;
  Object.entries(timeMap).forEach(([taskId, duration]) => {
    if (duration > maxTime) {
      maxTime = duration;
      topTaskId = taskId;
    }
  });

  if (!topTaskId) return null;
  const task = tasks.find((t) => t.id === topTaskId);
  return {
    taskId: topTaskId,
    taskTitle: task?.title || 'Unknown Task',
    focusMinutes: maxTime,
  };
};

/**
 * Find most productive day of the week based on focus history
 */
export const getMostProductiveDay = (sessions = []) => {
  const dayMinutes = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  sessions
    .filter((s) => s.sessionType === 'focus' && s.completed && s.createdAt)
    .forEach((s) => {
      const d = new Date(s.createdAt);
      dayMinutes[d.getDay()] += Number(s.duration) || 0;
    });

  let topIdx = 0;
  let maxMin = 0;
  dayMinutes.forEach((min, idx) => {
    if (min > maxMin) {
      maxMin = min;
      topIdx = idx;
    }
  });

  return {
    dayName: dayNames[topIdx],
    totalMinutes: maxMin,
  };
};

/**
 * Compare estimated vs actual task durations across tasks
 */
export const calculateEstimatedVsActual = (tasks = []) => {
  const comparedTasks = tasks
    .filter((t) => (t.actualDuration && t.actualDuration > 0) || (t.estimatedDuration && t.estimatedDuration > 0))
    .map((t) => {
      const estimated = Number(t.estimatedDuration || t.duration) || 0;
      const actual = Number(t.actualDuration) || 0;
      const diff = actual - estimated; // positive = over estimate, negative = under estimate

      return {
        id: t.id,
        title: t.title,
        status: t.status,
        estimated,
        actual,
        diff,
        isOver: diff > 0,
        diffFormatted: diff > 0 ? `+${diff}m over estimate` : diff < 0 ? `${Math.abs(diff)}m under estimate` : 'Exactly on estimate',
      };
    });

  const totalEstimated = comparedTasks.reduce((acc, t) => acc + t.estimated, 0);
  const totalActual = comparedTasks.reduce((acc, t) => acc + t.actual, 0);
  const efficiency = totalEstimated > 0 ? Math.round((totalEstimated / Math.max(1, totalActual)) * 100) : 100;

  return {
    comparedTasks,
    totalEstimated,
    totalActual,
    efficiency,
  };
};
