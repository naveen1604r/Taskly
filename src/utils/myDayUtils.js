import { getTodayDateString, getOffsetDateString } from './taskStorage';
import { isTaskBlocked } from './dependencyUtils';

export const MY_DAY_SETTINGS_KEY = 'taskly_my_day_settings';

export const defaultMyDaySettings = {
  showOverdue: true,
  showCompleted: true,
  showUnscheduled: true,
  showFocusSummary: true,
  showProjects: true,
  showGoals: true,
  defaultView: 'focused', // 'focused' | 'all'
};

/**
 * Filter today's tasks and categorize into structured sections
 */
export const getMyDayTaskSections = (tasks = []) => {
  const todayStr = getTodayDateString();

  const overdue = [];
  const todaysPriorities = [];
  const scheduled = [];
  const unscheduled = [];
  const completedToday = [];

  tasks.forEach((task) => {
    const taskDate = task.plannedDate || task.dueDate;
    const isCompleted = task.status === 'completed';

    // 1. Completed Today
    if (isCompleted) {
      if (task.completedAt?.split('T')[0] === todayStr || taskDate === todayStr) {
        completedToday.push(task);
      }
      return;
    }

    // 2. Overdue (Due before today and incomplete)
    if (taskDate && taskDate < todayStr) {
      overdue.push(task);
      return;
    }

    // 3. Today's Deliverables (planned or due today)
    if (taskDate === todayStr) {
      if (task.priority === 'high' || task.plannedDate === todayStr) {
        todaysPriorities.push(task);
      }

      if (task.plannedStartTime) {
        scheduled.push(task);
      } else {
        unscheduled.push(task);
      }
    }
  });

  // Sort scheduled tasks chronologically by start time
  scheduled.sort((a, b) => {
    const timeA = a.plannedStartTime || '23:59';
    const timeB = b.plannedStartTime || '23:59';
    return timeA.localeCompare(timeB);
  });

  return {
    overdue,
    todaysPriorities,
    scheduled,
    unscheduled,
    completedToday,
    totalTodayActive: scheduled.length + unscheduled.length,
  };
};

/**
 * Calculate daily workload status and capacity
 */
export const calculateMyDayWorkload = (todayTasks = [], workStartHour = 9, workEndHour = 18) => {
  const availableHours = Math.max(1, workEndHour - workStartHour);
  const availableMinutes = availableHours * 60;

  let totalEstimatedMinutes = 0;
  let plannedMinutes = 0;
  let unscheduledMinutes = 0;

  todayTasks.forEach((t) => {
    if (t.status === 'completed') return;
    const dur = Number(t.estimatedDuration || t.duration) || 30;
    totalEstimatedMinutes += dur;
    if (t.plannedStartTime) {
      plannedMinutes += dur;
    } else {
      unscheduledMinutes += dur;
    }
  });

  const loadRatio = totalEstimatedMinutes / availableMinutes;
  let status = 'Balanced';
  let color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  if (loadRatio < 0.4) {
    status = 'Light';
    color = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
  } else if (loadRatio <= 0.85) {
    status = 'Balanced';
    color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  } else if (loadRatio <= 1.1) {
    status = 'Heavy';
    color = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  } else {
    status = 'Overloaded';
    color = 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20';
  }

  return {
    totalEstimatedMinutes,
    plannedMinutes,
    unscheduledMinutes,
    availableMinutes,
    loadRatio,
    status,
    color,
    formattedWorkload: `${Math.floor(totalEstimatedMinutes / 60)}h ${totalEstimatedMinutes % 60}m`,
    formattedAvailable: `${availableHours}h 00m`,
  };
};

/**
 * Generate deterministic planning assistant suggestions
 */
export const generateDailyPlanSuggestions = ({
  tasks = [],
  inboxItems = [],
  workload = {},
}) => {
  const todayStr = getTodayDateString();
  const suggestions = [];

  const overdue = tasks.filter(
    (t) => t.status !== 'completed' && (t.plannedDate || t.dueDate) && (t.plannedDate || t.dueDate) < todayStr
  );
  const unscheduled = tasks.filter(
    (t) => t.status !== 'completed' && (t.plannedDate === todayStr || t.dueDate === todayStr) && !t.plannedStartTime
  );
  const blocked = tasks.filter(
    (t) => t.status !== 'completed' && (t.plannedDate === todayStr || t.dueDate === todayStr) && isTaskBlocked(t, tasks)
  );
  const unprocessedInbox = inboxItems.filter((i) => i.status === 'unprocessed');

  if (overdue.length > 0) {
    suggestions.push({
      id: 'sug-overdue',
      type: 'warning',
      title: `Resolve ${overdue.length} Overdue Task${overdue.length > 1 ? 's' : ''}`,
      desc: `You have overdue deliverables from previous days. Reschedule or complete them to keep your backlog clean.`,
      actionLabel: 'Review Overdue',
      actionType: 'scroll_overdue',
    });
  }

  if (blocked.length > 0) {
    suggestions.push({
      id: 'sug-blocked',
      type: 'danger',
      title: `${blocked.length} Deliverable${blocked.length > 1 ? 's' : ''} Currently Blocked`,
      desc: `Some tasks planned for today depend on unfinished prerequisites. Unblock them first before starting work.`,
      actionLabel: 'View Blockers',
      actionType: 'view_blockers',
    });
  }

  if (unscheduled.length > 0) {
    suggestions.push({
      id: 'sug-unscheduled',
      type: 'info',
      title: `Schedule ${unscheduled.length} Unassigned Task${unscheduled.length > 1 ? 's' : ''}`,
      desc: `Assigning start times creates a structured timeline and prevents task overload throughout your day.`,
      actionLabel: 'Schedule Now',
      actionType: 'schedule_tasks',
    });
  }

  if (unprocessedInbox.length > 0) {
    suggestions.push({
      id: 'sug-inbox',
      type: 'primary',
      title: `${unprocessedInbox.length} Quick Capture Item${unprocessedInbox.length > 1 ? 's' : ''} in Inbox`,
      desc: `Triage captured thoughts and convert them into actionable tasks, notes, or scheduled events.`,
      actionLabel: 'Open Inbox',
      actionType: 'navigate_inbox',
    });
  }

  if (workload.status === 'Overloaded') {
    suggestions.push({
      id: 'sug-overload',
      type: 'warning',
      title: 'Workload Exceeds Working Hours',
      desc: `Estimated time (${workload.formattedWorkload}) is greater than available hours (${workload.formattedAvailable}). Consider delegating or deferring low-priority items.`,
      actionLabel: 'Defer Low Priority',
      actionType: 'defer_tasks',
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: 'sug-optimal',
      type: 'success',
      title: 'Schedule is Balanced & Ready',
      desc: `Your day is well-structured with clear priorities and healthy time margins. Ready to begin your first focus block!`,
      actionLabel: 'Start Focus',
      actionType: 'start_focus',
    });
  }

  return suggestions;
};

/**
 * Generate Tomorrow's Planning Snapshot
 */
export const getTomorrowPreview = (tasks = []) => {
  const tomorrowStr = getOffsetDateString(1);
  const tomorrowTasks = tasks.filter(
    (t) => (t.plannedDate === tomorrowStr || t.dueDate === tomorrowStr) && t.status !== 'completed'
  );

  let totalMinutes = 0;
  tomorrowTasks.forEach((t) => {
    totalMinutes += Number(t.estimatedDuration || t.duration) || 30;
  });

  return {
    dateStr: tomorrowStr,
    tasks: tomorrowTasks,
    totalCount: tomorrowTasks.length,
    estimatedMinutes: totalMinutes,
    formattedDuration: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
  };
};

/**
 * Deterministic personalized daily message
 */
export const getMyDayGreeting = ({ totalToday = 0, completedCount = 0, overdueCount = 0, workload = 'Balanced' }) => {
  const hour = new Date().getHours();
  let timeOfDay = 'morning';
  if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  if (hour >= 17) timeOfDay = 'evening';

  if (overdueCount > 0) {
    return {
      title: `Good ${timeOfDay}!`,
      subtitle: `You have ${overdueCount} overdue item${overdueCount > 1 ? 's' : ''} to clear before jumping into today's ${totalToday} planned tasks.`,
    };
  }

  if (totalToday === 0 && completedCount > 0) {
    return {
      title: `All done for today! 🎉`,
      subtitle: `You completed all ${completedCount} deliverables planned for today. Great momentum!`,
    };
  }

  if (totalToday === 0) {
    return {
      title: `Your day is wide open.`,
      subtitle: `No tasks currently planned for today. Use Quick Capture or the Planner to schedule your focus.`,
    };
  }

  if (workload === 'Heavy' || workload === 'Overloaded') {
    return {
      title: `Packed schedule today.`,
      subtitle: `${totalToday} tasks scheduled. Focus on your highest priority deliverables first.`,
    };
  }

  return {
    title: `Good ${timeOfDay}!`,
    subtitle: `You have ${totalToday} deliverable${totalToday > 1 ? 's' : ''} scheduled today (${workload} workload).`,
  };
};
