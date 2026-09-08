/**
 * Daily Planner scheduling utilities, time calculations, conflict detection, and slot suggestions
 */

/**
 * Convert HH:MM 24-hour string to minutes from midnight
 */
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length < 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

/**
 * Convert minutes from midnight to HH:MM 24-hour string
 */
export const minutesToTime24 = (totalMinutes) => {
  const normalized = Math.max(0, Math.min(24 * 60 - 1, totalMinutes));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Format HH:MM 24-hour time to 12-hour AM/PM string (e.g. "14:30" -> "02:30 PM")
 */
export const formatTimeDisplay = (timeStr) => {
  if (!timeStr) return '';
  const mins = parseTimeToMinutes(timeStr);
  if (mins === null) return timeStr;

  const hours = Math.floor(mins / 60);
  const m = mins % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 === 0 ? 12 : hours % 12;

  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
};

/**
 * Format minutes duration to "Xh Ym"
 */
export const formatDurationDisplay = (minutes) => {
  if (!minutes || minutes <= 0) return 'No duration';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/**
 * Calculate end time string given start time and duration in minutes
 */
export const calculateEndTime = (startTimeStr, durationMinutes) => {
  const startMinutes = parseTimeToMinutes(startTimeStr);
  if (startMinutes === null) return '';
  const dur = Math.max(0, parseInt(durationMinutes, 10) || 0);
  return minutesToTime24(startMinutes + dur);
};

/**
 * Get tasks planned for a specific date (or falling on dueDate if not planned)
 */
export const getTasksForDate = (tasks = [], dateStr) => {
  if (!dateStr) return [];
  return tasks.filter((t) => {
    if (t.plannedDate) {
      return t.plannedDate === dateStr;
    }
    return t.dueDate === dateStr;
  });
};

/**
 * Get unscheduled tasks (active tasks without planned date or due date)
 */
export const getUnscheduledTasks = (tasks = []) => {
  return tasks.filter((t) => {
    return t.status !== 'completed' && !t.plannedDate && !t.plannedStartTime;
  });
};

/**
 * Detect overlapping time slots among scheduled tasks for a given date
 * Returns { conflictIds: Set<taskId>, conflictPairs: Array<{ taskA, taskB }> }
 */
export const detectTimeConflicts = (tasksForDate = []) => {
  const scheduled = tasksForDate
    .map((t) => {
      const startMin = parseTimeToMinutes(t.plannedStartTime || t.dueTime);
      const dur = parseInt(t.estimatedDuration || t.duration, 10);
      if (startMin === null || isNaN(dur) || dur <= 0) return null;
      return {
        id: t.id,
        title: t.title,
        startMin,
        endMin: startMin + dur,
        task: t,
      };
    })
    .filter(Boolean);

  const conflictIds = new Set();
  const conflictPairs = [];

  for (let i = 0; i < scheduled.length; i++) {
    for (let j = i + 1; j < scheduled.length; j++) {
      const a = scheduled[i];
      const b = scheduled[j];

      // Overlap condition: max(startA, startB) < min(endA, endB)
      if (Math.max(a.startMin, b.startMin) < Math.min(a.endMin, b.endMin)) {
        conflictIds.add(a.id);
        conflictIds.add(b.id);
        conflictPairs.push({ taskA: a.task, taskB: b.task });
      }
    }
  }

  return { conflictIds, conflictPairs };
};

/**
 * Suggest available open time slots within configured day working hours
 */
export const getAvailableTimeSlots = (
  tasksForDate = [],
  dayStartStr = '06:00',
  dayEndStr = '22:00',
  requestedDurationMinutes = 60
) => {
  const dayStart = parseTimeToMinutes(dayStartStr) || 360; // 06:00
  const dayEnd = parseTimeToMinutes(dayEndStr) || 1320; // 22:00

  // Occupied intervals sorted by start time
  const busyIntervals = tasksForDate
    .map((t) => {
      const s = parseTimeToMinutes(t.plannedStartTime || t.dueTime);
      const dur = parseInt(t.estimatedDuration || t.duration, 10);
      if (s === null || isNaN(dur) || dur <= 0) return null;
      return { start: s, end: s + dur };
    })
    .filter(Boolean)
    .sort((a, b) => a.start - b.start);

  const openSlots = [];
  let currentPointer = dayStart;

  for (const interval of busyIntervals) {
    if (interval.start > currentPointer) {
      const gap = interval.start - currentPointer;
      if (gap >= requestedDurationMinutes) {
        openSlots.push({
          start: minutesToTime24(currentPointer),
          end: minutesToTime24(currentPointer + requestedDurationMinutes),
          gapMinutes: gap,
          displayLabel: `${formatTimeDisplay(minutesToTime24(currentPointer))} – ${formatTimeDisplay(
            minutesToTime24(currentPointer + requestedDurationMinutes)
          )}`,
        });
      }
    }
    currentPointer = Math.max(currentPointer, interval.end);
  }

  // Check remaining time until dayEnd
  if (dayEnd > currentPointer) {
    const gap = dayEnd - currentPointer;
    if (gap >= requestedDurationMinutes) {
      openSlots.push({
        start: minutesToTime24(currentPointer),
        end: minutesToTime24(currentPointer + requestedDurationMinutes),
        gapMinutes: gap,
        displayLabel: `${formatTimeDisplay(minutesToTime24(currentPointer))} – ${formatTimeDisplay(
          minutesToTime24(currentPointer + requestedDurationMinutes)
        )}`,
      });
    }
  }

  return openSlots.slice(0, 4); // return top 4 open suggestions
};

/**
 * Calculate workload and capacity metrics for a given date
 */
export const calculateDailyWorkload = (tasksForDate = [], workingHours = 8) => {
  let plannedMinutes = 0;
  let completedMinutes = 0;
  let tasksWithDuration = 0;

  tasksForDate.forEach((t) => {
    const dur = parseInt(t.estimatedDuration || t.duration, 10);
    if (!isNaN(dur) && dur > 0) {
      plannedMinutes += dur;
      tasksWithDuration += 1;
      if (t.status === 'completed') {
        completedMinutes += dur;
      }
    }
  });

  const availableMinutes = Math.max(60, workingHours * 60);
  const remainingMinutes = Math.max(0, plannedMinutes - completedMinutes);
  const workloadPercentage = Math.round((plannedMinutes / availableMinutes) * 100);
  const isOverloaded = plannedMinutes > availableMinutes;
  const overloadMinutes = Math.max(0, plannedMinutes - availableMinutes);

  return {
    plannedMinutes,
    plannedFormatted: formatDurationDisplay(plannedMinutes),
    completedMinutes,
    completedFormatted: formatDurationDisplay(completedMinutes),
    remainingMinutes,
    remainingFormatted: formatDurationDisplay(remainingMinutes),
    availableMinutes,
    availableFormatted: formatDurationDisplay(availableMinutes),
    workloadPercentage,
    isOverloaded,
    overloadFormatted: formatDurationDisplay(overloadMinutes),
    tasksWithDuration,
  };
};

/**
 * Identify current active task (● NOW) and next upcoming task based on local time
 */
export const getCurrentAndNextTask = (tasksForDate = [], isToday = true) => {
  if (!isToday) {
    return { currentTask: null, nextTask: null, startsInMinutes: null };
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let currentTask = null;
  let nextTask = null;
  let smallestUpcomingDiff = Infinity;

  tasksForDate.forEach((t) => {
    const startMin = parseTimeToMinutes(t.plannedStartTime || t.dueTime);
    const dur = parseInt(t.estimatedDuration || t.duration, 10) || 60;
    if (startMin === null) return;

    const endMin = startMin + dur;

    // Active currently: start <= now < end and task not completed
    if (startMin <= currentMinutes && currentMinutes < endMin && t.status !== 'completed') {
      currentTask = t;
    }

    // Upcoming after now
    if (startMin > currentMinutes && t.status !== 'completed') {
      const diff = startMin - currentMinutes;
      if (diff < smallestUpcomingDiff) {
        smallestUpcomingDiff = diff;
        nextTask = t;
      }
    }
  });

  return {
    currentTask,
    nextTask,
    startsInMinutes: nextTask ? smallestUpcomingDiff : null,
  };
};

/**
 * Calculate upcoming workload for the next several days
 */
export const getUpcomingWorkload = (tasks = [], todayStr, daysCount = 4) => {
  const result = [];
  const curr = new Date(todayStr);

  for (let i = 0; i < daysCount; i++) {
    const d = new Date(curr);
    d.setDate(curr.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    const dayTasks = getTasksForDate(tasks, dateKey);
    const totalMinutes = dayTasks.reduce((acc, t) => {
      const dur = parseInt(t.estimatedDuration || t.duration, 10);
      return acc + (isNaN(dur) ? 0 : dur);
    }, 0);

    let label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Tomorrow';

    result.push({
      date: dateKey,
      label,
      taskCount: dayTasks.length,
      totalMinutes,
      formattedTime: formatDurationDisplay(totalMinutes),
    });
  }

  return result;
};
