import { getTodayDateString, getOffsetDateString } from './taskStorage';
import { isTaskBlocked } from './dependencyUtils';
import { isTaskOverdue } from './filterUtils';

export const CALENDAR_SETTINGS_KEY = 'taskly_calendar_settings';

export const defaultCalendarSettings = {
  view: 'month', // 'month' | 'week' | 'day' | 'agenda'
  selectedDate: getTodayDateString(),
  weekStartsOn: 'monday', // 'monday' | 'sunday'
  showWeekends: true,
  showCompleted: true,
  startHour: 8,
  endHour: 20,
  workStartHour: 9,
  workEndHour: 18,
  autoScrollNow: true,
};

/**
 * Format date object to YYYY-MM-DD safely without UTC shift
 */
export const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Parse YYYY-MM-DD string into local Date object safely
 */
export const parseDateKey = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return new Date();
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date();
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
};

/**
 * Calculate task end time given start time string (HH:mm) and duration in minutes
 */
export const calculateTaskEndTime = (startTimeStr, durationMinutes = 30) => {
  if (!startTimeStr || typeof startTimeStr !== 'string') return '09:30';
  const [hStr, mStr] = startTimeStr.split(':');
  let hours = parseInt(hStr, 10) || 9;
  let mins = parseInt(mStr, 10) || 0;

  const totalMins = hours * 60 + mins + Number(durationMinutes);
  const endHours = Math.floor(totalMins / 60) % 24;
  const endMins = totalMins % 60;

  return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
};

/**
 * Generate 35-42 days grid for Month View
 */
export const getMonthGrid = (year, monthIndex, weekStartsOn = 'monday', showWeekends = true) => {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const daysInMonth = lastDay.getDate();

  let startDayOfWeek = firstDay.getDay(); // 0 is Sunday, 1 is Monday
  if (weekStartsOn === 'monday') {
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  }

  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
  const cells = [];

  // Previous month padding
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const prevMonthDate = new Date(year, monthIndex - 1, dayNum);
    cells.push({
      dateStr: formatDateKey(prevMonthDate),
      dayNumber: dayNum,
      isCurrentMonth: false,
      isWeekend: prevMonthDate.getDay() === 0 || prevMonthDate.getDay() === 6,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(year, monthIndex, d);
    cells.push({
      dateStr: formatDateKey(curDate),
      dayNumber: d,
      isCurrentMonth: true,
      isWeekend: curDate.getDay() === 0 || curDate.getDay() === 6,
    });
  }

  // Next month padding to complete 35 or 42 grid
  const remaining = 35 - cells.length > 0 ? 35 - cells.length : 42 - cells.length;
  for (let n = 1; n <= remaining; n++) {
    const nextMonthDate = new Date(year, monthIndex + 1, n);
    cells.push({
      dateStr: formatDateKey(nextMonthDate),
      dayNumber: n,
      isCurrentMonth: false,
      isWeekend: nextMonthDate.getDay() === 0 || nextMonthDate.getDay() === 6,
    });
  }

  if (!showWeekends) {
    return cells.filter((c) => !c.isWeekend);
  }

  return cells;
};

/**
 * Generate array of days for Week View
 */
export const getWeekDays = (baseDateStr, weekStartsOn = 'monday', showWeekends = true) => {
  const baseDate = parseDateKey(baseDateStr);
  let dayOfWeek = baseDate.getDay();
  if (weekStartsOn === 'monday') {
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  }

  // Monday (or Sunday) of the current week
  const startOfWeek = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() - dayOfWeek);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i);
    const dateStr = formatDateKey(d);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    if (showWeekends || !isWeekend) {
      days.push({
        dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        isToday: dateStr === getTodayDateString(),
        isWeekend,
      });
    }
  }

  return days;
};

/**
 * Generate hourly time slots (e.g. 08:00 -> 20:00)
 */
export const getHourlySlots = (startHour = 8, endHour = 20) => {
  const slots = [];
  for (let h = startHour; h <= endHour; h++) {
    const timeStr = `${String(h).padStart(2, '0')}:00`;
    const period = h < 12 ? 'AM' : 'PM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    slots.push({
      hour: h,
      timeStr,
      label: `${displayHour}:00 ${period}`,
    });
  }
  return slots;
};

/**
 * Check if a task is visible given active filters and search query
 */
export const isTaskVisibleInCalendar = (task, { priority = 'all', projectId = 'all', status = 'all', goalId = 'all', search = '', showCompleted = true } = {}) => {
  if (!showCompleted && task.status === 'completed') return false;
  if (priority !== 'all' && task.priority !== priority) return false;
  if (projectId !== 'all' && task.projectId !== projectId) return false;
  if (status !== 'all' && task.status !== status) return false;
  if (goalId !== 'all' && task.goalId !== goalId) return false;

  if (search.trim()) {
    const q = search.toLowerCase().trim();
    const titleMatch = task.title?.toLowerCase().includes(q);
    const descMatch = task.description?.toLowerCase().includes(q);
    const catMatch = task.category?.toLowerCase().includes(q);
    if (!titleMatch && !descMatch && !catMatch) return false;
  }

  return true;
};

/**
 * Group tasks for Agenda View
 */
export const getAgendaGroups = (tasks, baseDateStr = getTodayDateString()) => {
  const todayStr = getTodayDateString();
  const tomorrowStr = getOffsetDateString(1);

  const groups = {
    today: { label: 'Today', date: todayStr, tasks: [] },
    tomorrow: { label: 'Tomorrow', date: tomorrowStr, tasks: [] },
    thisWeek: { label: 'This Week', tasks: [] },
    later: { label: 'Upcoming', tasks: [] },
    unscheduled: { label: 'Unscheduled', tasks: [] },
  };

  tasks.forEach((t) => {
    const targetDate = t.plannedDate || t.dueDate;
    if (!targetDate) {
      groups.unscheduled.tasks.push(t);
    } else if (targetDate === todayStr) {
      groups.today.tasks.push(t);
    } else if (targetDate === tomorrowStr) {
      groups.tomorrow.tasks.push(t);
    } else if (targetDate > tomorrowStr && targetDate <= getOffsetDateString(7)) {
      groups.thisWeek.tasks.push(t);
    } else if (targetDate > getOffsetDateString(7)) {
      groups.later.tasks.push(t);
    } else {
      // Overdue/Past
      groups.today.tasks.push(t);
    }
  });

  // Sort tasks within groups by start time
  Object.keys(groups).forEach((key) => {
    groups[key].tasks.sort((a, b) => {
      const timeA = a.plannedStartTime || '23:59';
      const timeB = b.plannedStartTime || '23:59';
      return timeA.localeCompare(timeB);
    });
  });

  return groups;
};

/**
 * Detect scheduling overlap
 */
export const detectScheduleConflict = (taskId, targetDate, targetStartTime, durationMinutes, allTasks = []) => {
  if (!targetDate || !targetStartTime) return null;

  const [hStr, mStr] = targetStartTime.split(':');
  const startMins = (parseInt(hStr, 10) || 0) * 60 + (parseInt(mStr, 10) || 0);
  const endMins = startMins + Number(durationMinutes || 30);

  const overlappingTask = allTasks.find((t) => {
    if (t.id === taskId) return false;
    if ((t.plannedDate || t.dueDate) !== targetDate) return false;
    if (!t.plannedStartTime) return false;

    const [thStr, tmStr] = t.plannedStartTime.split(':');
    const tStartMins = (parseInt(thStr, 10) || 0) * 60 + (parseInt(tmStr, 10) || 0);
    const tDur = Number(t.estimatedDuration || t.duration) || 30;
    const tEndMins = tStartMins + tDur;

    // Check overlap: (StartA < EndB) && (EndA > StartB)
    return startMins < tEndMins && endMins > tStartMins;
  });

  return overlappingTask || null;
};
