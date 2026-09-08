/**
 * Activity storage helper and duration / streak formatting utilities
 */
import { getTodayDateString, getOffsetDateString } from './taskStorage';

export const ACTIVITY_STORAGE_KEY = 'taskly_activities';

/**
 * Format minutes into clean human-readable duration
 * 30 -> 30m
 * 60 -> 1h
 * 90 -> 1h 30m
 * 135 -> 2h 15m
 */
export const formatDuration = (totalMinutes) => {
  const mins = Math.max(0, parseInt(totalMinutes, 10) || 0);
  if (mins === 0) return '0m';

  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (hours > 0 && remainingMins > 0) {
    return `${hours}h ${remainingMins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${remainingMins}m`;
};

/**
 * Calculate duration in minutes between HH:mm start and end times
 */
export const calculateDurationFromTimes = (startTime, endTime) => {
  if (!startTime || !endTime) return 60;

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;

  if (endMinutes < startMinutes) {
    // Crosses midnight
    endMinutes += 24 * 60;
  }

  const diff = endMinutes - startMinutes;
  return diff > 0 ? diff : 30;
};

/**
 * Format 24-hour time "14:30" to "02:30 PM"
 */
export const formatTimeDisplay = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  if (isNaN(hour)) return timeStr;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${String(formattedHour).padStart(2, '0')}:${m} ${ampm}`;
};

/**
 * Calculate active day streak based on recorded activity dates
 */
export const calculateStreak = (activities) => {
  if (!activities || activities.length === 0) return 1;

  const uniqueDates = Array.from(new Set(activities.map((a) => a.date).filter(Boolean))).sort().reverse();
  if (uniqueDates.length === 0) return 0;

  const today = getTodayDateString();
  const yesterday = getOffsetDateString(-1);

  // Check if user has activity today or yesterday to maintain active streak
  if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) {
    return 0;
  }

  let streak = 0;
  let currentDate = new Date(uniqueDates.includes(today) ? today : yesterday);

  for (let i = 0; i < 365; i++) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    if (uniqueDates.includes(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return Math.max(streak, 0);
};

export const initialSeedActivities = [];


export const loadActivitiesFromStorage = () => {
  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load activities from localStorage:', error);
    return [];
  }
};

export const saveActivitiesToStorage = (activities) => {
  try {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities));
  } catch (error) {
    console.error('Failed to save activities to localStorage:', error);
  }
};

/**
 * Format timestamp into relative "time ago" string
 */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now';
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
