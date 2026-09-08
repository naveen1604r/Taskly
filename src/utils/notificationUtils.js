/**
 * Notification and reminder utilities, date math, deduplication, quiet hours, and storage helpers
 */
import { getTodayDateString, getOffsetDateString } from './taskStorage';

export const NOTIFICATIONS_STORAGE_KEY = 'taskly_notifications';
export const REMINDERS_STORAGE_KEY = 'taskly_reminders';
export const NOTIFICATION_SETTINGS_KEY = 'taskly_notification_settings';

export const defaultNotificationSettings = {
  // Category Toggles
  taskDue: true,
  taskOverdue: true,
  taskCompleted: false,
  plannedTasks: true,
  projectDeadlines: true,
  projectBlocked: true,
  goalDue: true,
  goalCompleted: true,
  focusSession: true,
  focusGoal: true,
  recurringTasks: true,
  backupReminders: true,
  systemAlerts: true,
  activitySummary: false,

  // Timing & Preferences
  defaultReminderOffset: '15m', // 'none' | '5m' | '10m' | '15m' | '30m' | '1h' | '2h' | '1d'
  desktopNotifications: false,
  notificationSound: false,
  historyRetention: '60_days', // '30_days' | '60_days' | '90_days' | 'forever'

  // Quiet Hours
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00',
    allowUrgent: true,
  },

  // Daily Routine Reminders
  morningPlanning: {
    enabled: false,
    time: '08:30',
  },
  eveningReview: {
    enabled: false,
    time: '18:00',
  },
};

/**
 * Format relative time (e.g. "Just now", "10m ago", "2h ago", "Yesterday", "Sep 3")
 */
export const formatNotificationTime = (isoString) => {
  if (!isoString) return '';
  try {
    const time = new Date(isoString).getTime();
    const now = Date.now();
    const diffMs = now - time;

    if (diffMs < 0) return 'Just now';

    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

/**
 * Safe local Date-Time comparison without UTC offset distortions
 */
export const isDateTimeDue = (dateStr, timeStr) => {
  if (!dateStr) return false;
  const now = new Date();

  const [year, month, day] = dateStr.split('-').map(Number);
  let hours = 0;
  let minutes = 0;

  if (timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    hours = h || 0;
    minutes = m || 0;
  } else {
    hours = 23;
    minutes = 59;
  }

  const targetDate = new Date(year, month - 1, day, hours, minutes, 0);
  return now >= targetDate;
};

/**
 * Check if the current time falls inside quiet hours
 */
export const isQuietHoursNow = (quietHours = {}) => {
  if (!quietHours.enabled || !quietHours.start || !quietHours.end) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = quietHours.start.split(':').map(Number);
  const [endH, endM] = quietHours.end.split(':').map(Number);

  const startMinutes = (startH || 0) * 60 + (startM || 0);
  const endMinutes = (endH || 0) * 60 + (endM || 0);

  if (startMinutes <= endMinutes) {
    // Single day range (e.g. 13:00 to 15:00)
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // Overnight range (e.g. 22:00 to 07:00)
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
};

/**
 * Calculate target ISO timestamp for a snooze option
 */
export const calculateSnoozeTime = (option, customDate = null, customTime = null) => {
  const now = new Date();

  if (option === '10m') {
    return new Date(now.getTime() + 10 * 60 * 1000).toISOString();
  }
  if (option === '30m') {
    return new Date(now.getTime() + 30 * 60 * 1000).toISOString();
  }
  if (option === '1h') {
    return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  }
  if (option === 'tomorrow') {
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0);
    return tomorrow.toISOString();
  }
  if (option === 'custom' && customDate) {
    const [y, m, d] = customDate.split('-').map(Number);
    const [h, min] = (customTime || '09:00').split(':').map(Number);
    return new Date(y, m - 1, d, h || 9, min || 0, 0).toISOString();
  }

  return new Date(now.getTime() + 15 * 60 * 1000).toISOString();
};

/**
 * Calculate next occurrence for repeating reminders
 */
export const getNextOccurrence = (dateStr, repeat) => {
  if (!dateStr || repeat === 'none') return dateStr;

  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);

  if (repeat === 'daily') {
    d.setDate(d.getDate() + 1);
  } else if (repeat === 'weekdays') {
    d.setDate(d.getDate() + 1);
    while (d.getDay() === 0 || d.getDay() === 6) {
      d.setDate(d.getDate() + 1);
    }
  } else if (repeat === 'weekly') {
    d.setDate(d.getDate() + 7);
  } else if (repeat === 'monthly') {
    d.setMonth(d.getMonth() + 1);
  }

  const nextY = d.getFullYear();
  const nextM = String(d.getMonth() + 1).padStart(2, '0');
  const nextD = String(d.getDate()).padStart(2, '0');
  return `${nextY}-${nextM}-${nextD}`;
};

/**
 * Generate preview list of upcoming occurrences for repeating reminder
 */
export const getUpcomingReminderOccurrences = (dateStr, timeStr = '09:00', repeat = 'none', count = 5) => {
  if (!dateStr) return [];
  if (repeat === 'none') return [{ date: dateStr, time: timeStr }];

  const occurrences = [];
  let curDate = dateStr;

  for (let i = 0; i < count; i++) {
    const [y, m, d] = curDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    occurrences.push({
      date: curDate,
      time: timeStr,
      formatted: dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    });
    curDate = getNextOccurrence(curDate, repeat);
  }

  return occurrences;
};

/**
 * Deterministic event key for notification deduplication
 */
export const getNotificationEventKey = (type, entityId = '', timestampOrDate = '') => {
  return `${type}_${entityId}_${timestampOrDate}`;
};

/**
 * Group notifications into Today, Yesterday, and Earlier sections
 */
export const groupNotificationsByDate = (notifications = []) => {
  const todayStr = getTodayDateString();
  const yesterdayStr = getOffsetDateString(-1);

  const groups = {
    today: [],
    yesterday: [],
    earlier: [],
  };

  notifications.forEach((n) => {
    if (!n.createdAt) {
      groups.today.push(n);
      return;
    }
    const createdDateStr = n.createdAt.split('T')[0];
    if (createdDateStr === todayStr) {
      groups.today.push(n);
    } else if (createdDateStr === yesterdayStr) {
      groups.yesterday.push(n);
    } else {
      groups.earlier.push(n);
    }
  });

  return groups;
};

/**
 * Cleanup old notifications based on retention policy
 */
export const cleanupOldNotifications = (notifications = [], retention = '60_days') => {
  if (retention === 'forever') return notifications;

  let maxDays = 60;
  if (retention === '30_days') maxDays = 30;
  if (retention === '90_days') maxDays = 90;

  const cutoff = Date.now() - maxDays * 24 * 60 * 60 * 1000;

  return notifications.filter((n) => {
    if (!n.createdAt) return true;
    return new Date(n.createdAt).getTime() >= cutoff;
  });
};

/**
 * LocalStorage Helpers
 */
export const loadNotificationsFromStorage = () => {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to parse notifications:', e);
    return [];
  }
};

export const saveNotificationsToStorage = (notifications) => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to save notifications:', e);
  }
};

export const loadRemindersFromStorage = () => {
  try {
    const raw = localStorage.getItem(REMINDERS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to parse reminders:', e);
    return [];
  }
};

export const saveRemindersToStorage = (reminders) => {
  try {
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
  } catch (e) {
    console.error('Failed to save reminders:', e);
  }
};

export const loadSettingsFromStorage = () => {
  try {
    const raw = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(defaultNotificationSettings));
      return defaultNotificationSettings;
    }
    return { ...defaultNotificationSettings, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to parse notification settings:', e);
    return defaultNotificationSettings;
  }
};

export const saveSettingsToStorage = (settings) => {
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save notification settings:', e);
  }
};

/**
 * Seed initial sample notifications (Empty by default)
 */
export const seedNotifications = () => {
  return [];
};

/**
 * Seed initial sample reminders (Empty by default)
 */
export const seedReminders = () => {
  return [];
};
