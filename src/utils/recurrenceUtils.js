/**
 * Recurrence calculation, date safety, human-readable summary, and occurrence generation
 */

import { getTodayDateString } from './taskStorage';

/**
 * Safe local date parsing: returns { year, month, day } where month is 1-12
 */
export const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return { year: y, month: m, day: d };
};

/**
 * Format year, month (1-12), day into YYYY-MM-DD
 */
export const formatLocalDate = (year, month, day) => {
  const y = String(year).padStart(4, '0');
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Number of days in a given year and month (1-indexed month)
 */
export const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

/**
 * Safe local date addition: adds N days without UTC timezone shifting
 */
export const addDaysToDateString = (dateStr, daysToAdd) => {
  const parsed = parseLocalDate(dateStr);
  if (!parsed) return dateStr;
  const dateObj = new Date(parsed.year, parsed.month - 1, parsed.day);
  dateObj.setDate(dateObj.getDate() + daysToAdd);
  return formatLocalDate(dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate());
};

/**
 * Difference in calendar days between two YYYY-MM-DD strings (date2 - date1)
 */
export const getDayDifference = (dateStr1, dateStr2) => {
  const p1 = parseLocalDate(dateStr1);
  const p2 = parseLocalDate(dateStr2);
  if (!p1 || !p2) return 0;
  const d1 = new Date(p1.year, p1.month - 1, p1.day);
  const d2 = new Date(p2.year, p2.month - 1, p2.day);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get weekday index for YYYY-MM-DD: 0 = Sun, 1 = Mon, ..., 6 = Sat
 */
export const getDayOfWeek = (dateStr) => {
  const p = parseLocalDate(dateStr);
  if (!p) return 0;
  return new Date(p.year, p.month - 1, p.day).getDay();
};

const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const weekdayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Ordinal suffix helper: 1 -> "1st", 2 -> "2nd", 3 -> "3rd", etc.
 */
export const getOrdinalSuffix = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/**
 * Human-readable recurrence summary
 */
export const getHumanRecurrenceSummary = (recurrence) => {
  if (!recurrence) return 'Does not repeat';
  const { type, interval = 1, daysOfWeek = [], dayOfMonth = 1, customUnit = 'days', customInterval = 1 } = recurrence;

  switch (type) {
    case 'daily':
      return interval === 1 ? 'Every day' : `Every ${interval} days`;

    case 'weekdays':
      return 'Every weekday (Monday – Friday)';

    case 'weekly': {
      if (!daysOfWeek || daysOfWeek.length === 0) return 'Weekly';
      const names = daysOfWeek
        .map((d) => weekdayNames[d])
        .filter(Boolean);
      if (names.length === 1) {
        return interval === 1 ? `Every week on ${names[0]}` : `Every ${interval} weeks on ${names[0]}`;
      }
      if (names.length === 2) {
        return `Every week on ${names[0]} and ${names[1]}`;
      }
      const last = names.pop();
      return `Every week on ${names.join(', ')} and ${last}`;
    }

    case 'monthly': {
      const suffix = getOrdinalSuffix(dayOfMonth || 1);
      return `Every month on the ${suffix} (skips months with fewer days)`;
    }

    case 'custom': {
      const u = customUnit === 'months' ? 'month(s)' : customUnit === 'weeks' ? 'week(s)' : 'day(s)';
      return `Every ${customInterval} ${u}`;
    }

    default:
      return 'Does not repeat';
  }
};

/**
 * Determine if a recurrence rule should trigger on a specific date string
 */
export const shouldOccurOnDate = (recurrence, dateStr, skippedDates = []) => {
  if (!recurrence || !dateStr) return false;
  const { type, interval = 1, daysOfWeek = [], dayOfMonth, startDate, endDate, customUnit = 'days', customInterval = 1 } = recurrence;

  // 1. Check bounds and skips
  if (startDate && dateStr < startDate) return false;
  if (endDate && dateStr > endDate) return false;
  if (skippedDates && skippedDates.includes(dateStr)) return false;

  const parsed = parseLocalDate(dateStr);
  if (!parsed) return false;
  const dayDiff = getDayDifference(startDate || dateStr, dateStr);
  if (dayDiff < 0) return false;

  switch (type) {
    case 'daily': {
      const step = Math.max(1, interval || 1);
      return dayDiff % step === 0;
    }

    case 'weekdays': {
      const dow = getDayOfWeek(dateStr);
      return dow >= 1 && dow <= 5; // Monday to Friday
    }

    case 'weekly': {
      const dow = getDayOfWeek(dateStr);
      if (!daysOfWeek.includes(dow)) return false;
      const step = Math.max(1, interval || 1);
      if (step === 1) return true;
      const weeksPassed = Math.floor(dayDiff / 7);
      return weeksPassed % step === 0;
    }

    case 'monthly': {
      const targetDay = dayOfMonth || 1;
      const maxDaysInThisMonth = getDaysInMonth(parsed.year, parsed.month);
      // Skip rule for invalid month days (e.g. Feb 31st)
      if (targetDay > maxDaysInThisMonth) return false;
      return parsed.day === targetDay;
    }

    case 'custom': {
      if (customUnit === 'days') {
        const step = Math.max(1, customInterval || 1);
        return dayDiff % step === 0;
      }
      if (customUnit === 'weeks') {
        const step = Math.max(1, customInterval || 1);
        const dow = getDayOfWeek(dateStr);
        const startDow = getDayOfWeek(startDate || dateStr);
        if (dow !== startDow) return false;
        const weeksPassed = Math.floor(dayDiff / 7);
        return weeksPassed % step === 0;
      }
      if (customUnit === 'months') {
        const startP = parseLocalDate(startDate);
        if (!startP) return false;
        if (parsed.day !== startP.day) return false;
        const monthsDiff = (parsed.year - startP.year) * 12 + (parsed.month - startP.month);
        const step = Math.max(1, customInterval || 1);
        return monthsDiff >= 0 && monthsDiff % step === 0;
      }
      return false;
    }

    default:
      return false;
  }
};

/**
 * Find next upcoming occurrence for a recurring rule (starting from fromDateStr)
 */
export const getNextOccurrence = (rule, fromDateStr) => {
  if (!rule || !rule.enabled) return null;
  const startCheck = fromDateStr || getTodayDateString();
  const baseDate = rule.recurrence?.startDate && rule.recurrence.startDate > startCheck ? rule.recurrence.startDate : startCheck;

  // Scan up to 366 days ahead
  for (let i = 0; i <= 366; i++) {
    const candidateDate = addDaysToDateString(baseDate, i);
    if (rule.recurrence?.endDate && candidateDate > rule.recurrence.endDate) {
      return null;
    }
    if (shouldOccurOnDate(rule.recurrence, candidateDate, rule.skippedDates)) {
      return candidateDate;
    }
  }

  return null;
};

/**
 * Generate preview of upcoming occurrences (up to maxCount)
 */
export const getRecurrencePreviewDates = (recurrence, skippedDates = [], maxCount = 5) => {
  if (!recurrence) return [];
  const today = getTodayDateString();
  const start = recurrence.startDate && recurrence.startDate > today ? recurrence.startDate : today;
  const dates = [];

  for (let i = 0; i <= 365 && dates.length < maxCount; i++) {
    const d = addDaysToDateString(start, i);
    if (recurrence.endDate && d > recurrence.endDate) break;
    if (shouldOccurOnDate(recurrence, d, skippedDates)) {
      dates.push(d);
    }
  }

  return dates;
};

/**
 * Generate occurrences for a date range [startDateStr, endDateStr]
 */
export const generateOccurrencesForRange = (rule, startDateStr, endDateStr) => {
  if (!rule || !rule.enabled) return [];
  const occurrences = [];
  let current = startDateStr;

  while (current <= endDateStr) {
    if (shouldOccurOnDate(rule.recurrence, current, rule.skippedDates)) {
      occurrences.push({
        recurringTaskId: rule.id,
        occurrenceDate: current,
        title: rule.title,
        description: rule.description || '',
        priority: rule.priority || 'medium',
        category: rule.category || 'General',
        estimatedDuration: rule.estimatedDuration || 60,
        duration: rule.estimatedDuration || 60,
        goalId: rule.goalId || null,
        plannedDate: current,
        dueDate: current,
        plannedStartTime: rule.plannedStartTime || null,
        dueTime: rule.plannedStartTime || null,
        status: 'pending',
      });
    }
    current = addDaysToDateString(current, 1);
  }

  return occurrences;
};

/**
 * Calculate completion rate and stats for a recurring task rule
 */
export const calculateRuleStats = (rule, tasks = []) => {
  const linkedTasks = tasks.filter((t) => t.recurringTaskId === rule.id);
  const total = linkedTasks.length;
  const completed = linkedTasks.filter((t) => t.status === 'completed').length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : null;

  return {
    totalOccurrences: total,
    completedOccurrences: completed,
    completionRate: rate,
    linkedTasks: linkedTasks.sort((a, b) => (b.plannedDate || b.dueDate || '').localeCompare(a.plannedDate || a.dueDate || '')),
  };
};
