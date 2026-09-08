import { getTodayDateString, getOffsetDateString } from './taskStorage';
import { isTaskOverdue } from './filterUtils';

/**
 * Resolve Date Range strings and labels
 */
export const resolveDateRange = (rangeKey = 'last_7_days', customStart = '', customEnd = '') => {
  const todayStr = getTodayDateString();
  const now = new Date();

  switch (rangeKey) {
    case 'today':
      return { start: todayStr, end: todayStr, label: 'Today', daysCount: 1 };

    case 'yesterday': {
      const yest = getOffsetDateString(-1);
      return { start: yest, end: yest, label: 'Yesterday', daysCount: 1 };
    }

    case 'last_7_days': {
      const start = getOffsetDateString(-6);
      return { start, end: todayStr, label: 'Last 7 Days', daysCount: 7 };
    }

    case 'last_14_days': {
      const start = getOffsetDateString(-13);
      return { start, end: todayStr, label: 'Last 14 Days', daysCount: 14 };
    }

    case 'last_30_days': {
      const start = getOffsetDateString(-29);
      return { start, end: todayStr, label: 'Last 30 Days', daysCount: 30 };
    }

    case 'this_week': {
      const currentDay = now.getDay();
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const start = getOffsetDateString(diffToMonday);
      const end = getOffsetDateString(diffToMonday + 6);
      return { start, end, label: 'This Week', daysCount: 7 };
    }

    case 'this_month': {
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const start = `${y}-${m}-01`;
      const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
      const end = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
      return { start, end, label: 'This Month', daysCount: lastDay };
    }

    case 'custom': {
      const start = customStart || getOffsetDateString(-7);
      const end = customEnd || todayStr;
      const sDate = new Date(start);
      const eDate = new Date(end);
      const diffDays = Math.max(1, Math.round((eDate - sDate) / (1000 * 60 * 60 * 24)) + 1);
      return { start, end, label: `${start} to ${end}`, daysCount: diffDays };
    }

    default:
      return { start: getOffsetDateString(-6), end: todayStr, label: 'Last 7 Days', daysCount: 7 };
  }
};

/**
 * Transparent 0-100 Productivity Score Calculation
 * Weights:
 * - Task completion rate: 35%
 * - Focus goal achievement: 25%
 * - Overdue control: 15%
 * - Planned task execution: 15%
 * - Goal progress: 10%
 */
export const calculateProductivityScore = ({
  completedCount = 0,
  totalCount = 0,
  focusMinutes = 0,
  targetFocusMinutes = 120,
  overdueCount = 0,
  plannedCompletedCount = 0,
  totalPlannedCount = 0,
  avgGoalProgress = 0,
}) => {
  if (totalCount === 0 && focusMinutes === 0 && totalPlannedCount === 0) {
    return {
      score: 0,
      status: 'No Activity Yet',
      badgeColor: 'text-slate-400 border-slate-700 bg-slate-800/40',
      factors: {
        taskScore: 0,
        focusScore: 0,
        overdueScore: 0,
        planScore: 0,
        goalScore: 0,
      },
    };
  }

  // 1. Task Completion (0 - 35)
  const taskRate = totalCount > 0 ? completedCount / totalCount : 0;
  const taskScore = Math.min(taskRate * 35, 35);

  // 2. Focus Time (0 - 25)
  const targetFocus = Math.max(targetFocusMinutes, 60);
  const focusRate = targetFocus > 0 ? Math.min(focusMinutes / targetFocus, 1.2) : 0;
  const focusScore = Math.min(focusRate * 25, 25);

  // 3. Overdue Control (0 - 15)
  const overduePenalty = Math.min(overdueCount * 3, 15);
  const overdueScore = totalCount > 0 ? Math.max(0, 15 - overduePenalty) : 0;

  // 4. Planned Task Execution (0 - 15)
  const planRate = totalPlannedCount > 0 ? plannedCompletedCount / totalPlannedCount : 0;
  const planScore = Math.min(planRate * 15, 15);

  // 5. Goal Progress (0 - 10)
  const goalScore = Math.min(((avgGoalProgress || 0) / 100) * 10, 10);

  const rawScore = Math.round(taskScore + focusScore + overdueScore + planScore + goalScore);
  const score = Math.max(0, Math.min(100, rawScore));

  let status = 'Good';
  let badgeColor = 'text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/10';

  if (score === 0) {
    status = 'No Activity Yet';
    badgeColor = 'text-slate-400 border-slate-700 bg-slate-800/40';
  } else if (score >= 85) {
    status = 'Excellent';
    badgeColor = 'text-[#7C3AED] border-[#7C3AED]/30 bg-[#7C3AED]/10';
  } else if (score >= 70) {
    status = 'Good';
    badgeColor = 'text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/10';
  } else if (score >= 50) {
    status = 'Average';
    badgeColor = 'text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10';
  } else {
    status = 'Needs Attention';
    badgeColor = 'text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/10';
  }

  return {
    score,
    status,
    badgeColor,
    factors: {
      taskCompletion: Math.round(taskScore),
      focusTime: Math.round(focusScore),
      overdueControl: Math.round(overdueScore),
      plannedExecution: Math.round(planScore),
      goalProgress: Math.round(goalScore),
    },
  };
};

/**
 * Filter tasks, sessions, and records within a date range and optional criteria
 */
export const filterEntitiesByRange = ({
  tasks = [],
  sessions = [],
  activities = [],
  goals = [],
  dateRange = {},
  filters = {},
}) => {
  const { start, end } = dateRange;

  // 1. Tasks in range (by dueDate, plannedDate, or completedAt/createdAt)
  let rangeTasks = tasks.filter((t) => {
    const d = t.dueDate || t.plannedDate || (t.createdAt ? t.createdAt.split('T')[0] : '');
    const comp = t.completedAt ? t.completedAt.split('T')[0] : '';
    const inRange = (d >= start && d <= end) || (comp >= start && comp <= end);
    return inRange;
  });

  // Apply filters
  if (filters.category && filters.category !== 'all') {
    rangeTasks = rangeTasks.filter((t) => t.category?.toLowerCase() === filters.category.toLowerCase());
  }
  if (filters.priority && filters.priority !== 'all') {
    rangeTasks = rangeTasks.filter((t) => t.priority === filters.priority);
  }
  if (filters.status && filters.status !== 'all') {
    if (filters.status === 'overdue') {
      rangeTasks = rangeTasks.filter((t) => isTaskOverdue(t));
    } else {
      rangeTasks = rangeTasks.filter((t) => t.status === filters.status);
    }
  }
  if (filters.goalId && filters.goalId !== 'all') {
    rangeTasks = rangeTasks.filter((t) => t.goalId === filters.goalId);
  }
  if (Array.isArray(filters.tags) && filters.tags.length > 0) {
    rangeTasks = rangeTasks.filter((t) => {
      const taskTags = Array.isArray(t.tags) ? t.tags : [];
      return filters.tags.some((ft) => taskTags.includes(ft));
    });
  }

  // 2. Focus Sessions in range
  const rangeSessions = sessions.filter((s) => {
    const sDate = s.startTime ? s.startTime.split('T')[0] : s.date || '';
    return sDate >= start && sDate <= end;
  });

  // 3. Activities in range
  const rangeActivities = activities.filter((a) => {
    const aDate = a.timestamp ? a.timestamp.split('T')[0] : a.createdAt ? a.createdAt.split('T')[0] : '';
    return aDate >= start && aDate <= end;
  });

  return {
    rangeTasks,
    rangeSessions,
    rangeActivities,
  };
};

/**
 * Calculate Comprehensive Analytics Dataset
 */
export const calculateAdvancedAnalytics = ({
  tasks = [],
  sessions = [],
  activities = [],
  goals = [],
  dateRange = {},
  filters = {},
  dailyFocusGoalMinutes = 120,
}) => {
  const { start, end, daysCount = 7 } = dateRange;
  const { rangeTasks, rangeSessions, rangeActivities } = filterEntitiesByRange({
    tasks,
    sessions,
    activities,
    goals,
    dateRange,
    filters,
  });

  // Basic Metrics
  const totalTasks = rangeTasks.length;
  const completedTasks = rangeTasks.filter((t) => t.status === 'completed');
  const completedTasksCount = completedTasks.length;
  const inProgressTasksCount = rangeTasks.filter((t) => t.status === 'in_progress').length;
  const pendingTasksCount = rangeTasks.filter((t) => t.status === 'pending' || !t.status).length;
  const overdueTasksCount = rangeTasks.filter((t) => isTaskOverdue(t)).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  // Focus Time & Sessions
  const totalFocusMinutes = rangeSessions.reduce(
    (acc, s) => acc + (Number(s.duration) || Number(s.durationMinutes) || 0),
    0
  );
  const focusHours = Math.floor(totalFocusMinutes / 60);
  const focusRemainingMins = totalFocusMinutes % 60;
  const focusTimeFormatted = `${focusHours}h ${focusRemainingMins}m`;
  const focusSessionsCount = rangeSessions.length;

  // Average Task Duration
  let totalEstimatedMins = 0;
  let totalActualMins = 0;
  completedTasks.forEach((t) => {
    let est = Number(t.estimatedDuration || t.duration) || 30;
    if (t.durationUnit === 'hours') est *= 60;
    totalEstimatedMins += est;
    totalActualMins += Number(t.actualDuration) || est;
  });
  const avgTaskDuration = completedTasksCount > 0 ? Math.round(totalActualMins / completedTasksCount) : 0;

  // Time Accuracy
  const timeDifferenceMins = totalActualMins - totalEstimatedMins;
  const estAccuracy =
    totalEstimatedMins > 0
      ? Math.max(0, Math.round((1 - Math.abs(timeDifferenceMins) / totalEstimatedMins) * 100))
      : 0;

  // Daily Chart Data Generator
  const dailyData = [];
  const sDateObj = new Date(start);
  const eDateObj = new Date(end);

  for (let d = new Date(sDateObj); d <= eDateObj; d.setDate(d.getDate() + 1)) {
    const dStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

    const dayTasks = tasks.filter((t) => {
      const comp = t.completedAt ? t.completedAt.split('T')[0] : '';
      return t.status === 'completed' && comp === dStr;
    });

    const dayFocus = sessions
      .filter((s) => {
        const sDate = s.startTime ? s.startTime.split('T')[0] : s.date || '';
        return sDate === dStr;
      })
      .reduce((acc, s) => acc + (Number(s.duration) || Number(s.durationMinutes) || 0), 0);

    const isGoalMet = dayFocus >= (dailyFocusGoalMinutes || 120);

    // Calculate dynamic daily score
    const dayScoreObj = calculateProductivityScore({
      completedCount: dayTasks.length,
      totalCount: dayTasks.length,
      focusMinutes: dayFocus,
      targetFocusMinutes: dailyFocusGoalMinutes,
      overdueCount: 0,
      plannedCompletedCount: dayTasks.length,
      totalPlannedCount: dayTasks.length,
      avgGoalProgress: 0,
    });

    dailyData.push({
      dateStr: dStr,
      dayName,
      completedTasks: dayTasks.length,
      focusMinutes: dayFocus,
      isGoalMet,
      productivityScore: dayScoreObj.score,
    });
  }

  // Priority Breakdown
  const priorityStats = {
    high: { total: 0, completed: 0, rate: 0 },
    medium: { total: 0, completed: 0, rate: 0 },
    low: { total: 0, completed: 0, rate: 0 },
  };

  rangeTasks.forEach((t) => {
    const p = t.priority || 'medium';
    if (priorityStats[p]) {
      priorityStats[p].total += 1;
      if (t.status === 'completed') priorityStats[p].completed += 1;
    }
  });

  Object.keys(priorityStats).forEach((p) => {
    const item = priorityStats[p];
    item.rate = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
  });

  // Category Breakdown & Category Accuracy
  const categoryMap = {};
  rangeTasks.forEach((t) => {
    const cat = t.category || 'General';
    if (!categoryMap[cat]) {
      categoryMap[cat] = {
        category: cat,
        total: 0,
        completed: 0,
        focusMinutes: 0,
        estimatedMins: 0,
        actualMins: 0,
      };
    }
    categoryMap[cat].total += 1;
    if (t.status === 'completed') {
      categoryMap[cat].completed += 1;
      let est = Number(t.estimatedDuration || t.duration) || 30;
      if (t.durationUnit === 'hours') est *= 60;
      categoryMap[cat].estimatedMins += est;
      categoryMap[cat].actualMins += Number(t.actualDuration) || est;
    }
  });

  rangeSessions.forEach((s) => {
    const cat = s.category || 'General';
    const mins = Number(s.duration) || Number(s.durationMinutes) || 0;
    if (categoryMap[cat]) {
      categoryMap[cat].focusMinutes += mins;
    }
  });

  const categoryStats = Object.values(categoryMap)
    .map((c) => ({
      ...c,
      completionRate: c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0,
      differenceMins: c.actualMins - c.estimatedMins,
      accuracyRate:
        c.estimatedMins > 0
          ? Math.max(0, Math.round((1 - Math.abs(c.actualMins - c.estimatedMins) / c.estimatedMins) * 100))
          : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Subtask Analytics
  let totalSubtasks = 0;
  let completedSubtasks = 0;
  rangeTasks.forEach((t) => {
    if (Array.isArray(t.subtasks)) {
      totalSubtasks += t.subtasks.length;
      completedSubtasks += t.subtasks.filter((st) => st.completed).length;
    }
  });
  const subtaskCompletionRate =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Goals Analytics
  const activeGoals = goals.map((g) => {
    const goalTasks = tasks.filter((t) => t.goalId === g.id);
    const goalCompleted = goalTasks.filter((t) => t.status === 'completed').length;
    const goalRemaining = goalTasks.length - goalCompleted;
    return {
      id: g.id,
      title: g.title,
      progress: Number(g.progress) || 0,
      totalTasks: goalTasks.length,
      completedTasks: goalCompleted,
      remainingTasks: goalRemaining,
      targetDate: g.targetDate || '',
      category: g.category || 'General',
    };
  });

  const avgGoalProgress =
    goals.length > 0
      ? Math.round(goals.reduce((acc, g) => acc + (Number(g.progress) || 0), 0) / goals.length)
      : 0;

  // Overall Productivity Score
  const scoreObj = calculateProductivityScore({
    completedCount: completedTasksCount,
    totalCount: totalTasks,
    focusMinutes: totalFocusMinutes,
    targetFocusMinutes: (dailyFocusGoalMinutes || 120) * daysCount,
    overdueCount: overdueTasksCount,
    plannedCompletedCount: completedTasksCount,
    totalPlannedCount: totalTasks,
    avgGoalProgress,
  });

  // Historical Trend (Comparison with previous period)
  const prevPeriodStart = getOffsetDateString(-daysCount * 2);
  const prevPeriodEnd = getOffsetDateString(-daysCount - 1);
  const prevPeriodTasks = tasks.filter((t) => {
    const comp = t.completedAt ? t.completedAt.split('T')[0] : '';
    return t.status === 'completed' && comp >= prevPeriodStart && comp <= prevPeriodEnd;
  }).length;

  const prevPeriodFocus = sessions
    .filter((s) => {
      const sDate = s.startTime ? s.startTime.split('T')[0] : s.date || '';
      return sDate >= prevPeriodStart && sDate <= prevPeriodEnd;
    })
    .reduce((acc, s) => acc + (Number(s.duration) || Number(s.durationMinutes) || 0), 0);

  const taskTrendDiff = completedTasksCount - prevPeriodTasks;
  const taskTrendPercent =
    prevPeriodTasks > 0 ? Math.round((taskTrendDiff / prevPeriodTasks) * 100) : 0;

  const focusTrendDiff = totalFocusMinutes - prevPeriodFocus;
  const focusTrendPercent =
    prevPeriodFocus > 0 ? Math.round((focusTrendDiff / prevPeriodFocus) * 100) : 0;

  // Top Tasks
  const mostTimeConsuming = [...completedTasks]
    .sort((a, b) => (Number(b.actualDuration) || 0) - (Number(a.actualDuration) || 0))
    .slice(0, 5);

  const mostFocused = [...rangeTasks]
    .sort((a, b) => (Number(b.actualDuration) || 0) - (Number(a.actualDuration) || 0))
    .slice(0, 5);

  const fastestCompleted = [...completedTasks]
    .filter((t) => Number(t.actualDuration) > 0)
    .sort((a, b) => (Number(a.actualDuration) || 0) - (Number(b.actualDuration) || 0))
    .slice(0, 5);

  // Most Productive Day
  let peakDay = 'None';
  let maxDayScore = 0;
  if (completedTasksCount > 0 || totalFocusMinutes > 0) {
    dailyData.forEach((d) => {
      const dayCombined = d.completedTasks * 10 + d.focusMinutes;
      if (dayCombined > maxDayScore) {
        maxDayScore = dayCombined;
        peakDay = d.dayName;
      }
    });
  }

  // Most Productive Time of Day
  const timeBuckets = { Morning: 0, Afternoon: 0, Evening: 0 };
  rangeActivities.forEach((a) => {
    const time = a.timestamp || a.createdAt;
    if (time) {
      const h = new Date(time).getHours();
      if (h >= 5 && h < 12) timeBuckets.Morning++;
      else if (h >= 12 && h < 18) timeBuckets.Afternoon++;
      else timeBuckets.Evening++;
    }
  });

  let peakTime = 'None';
  if (rangeActivities.length > 0) {
    if (timeBuckets.Morning >= timeBuckets.Afternoon && timeBuckets.Morning >= timeBuckets.Evening && timeBuckets.Morning > 0) {
      peakTime = 'Morning (9 AM – 12 PM)';
    } else if (timeBuckets.Afternoon >= timeBuckets.Morning && timeBuckets.Afternoon >= timeBuckets.Evening && timeBuckets.Afternoon > 0) {
      peakTime = 'Afternoon (2 PM – 5 PM)';
    } else if (timeBuckets.Evening > 0) {
      peakTime = 'Evening (6 PM – 9 PM)';
    }
  }

  // Daily Focus Goal Success %
  const goalMetDaysCount = dailyData.filter((d) => d.isGoalMet).length;
  const goalSuccessRate =
    dailyData.length > 0 ? Math.round((goalMetDaysCount / dailyData.length) * 100) : 0;

  return {
    // Overview Metrics
    totalTasks,
    completedTasksCount,
    inProgressTasksCount,
    pendingTasksCount,
    overdueTasksCount,
    completionRate,
    totalFocusMinutes,
    focusTimeFormatted,
    focusSessionsCount,
    avgTaskDuration,
    productivityScore: scoreObj.score,
    scoreStatus: scoreObj.status,
    scoreBadgeColor: scoreObj.badgeColor,
    scoreFactors: scoreObj.factors,

    // Time Accuracy
    totalEstimatedMins,
    totalActualMins,
    timeDifferenceMins,
    estAccuracy,

    // Trend & Growth
    taskTrendPercent,
    focusTrendPercent,
    prevPeriodTasks,
    prevPeriodFocus,

    // Visual Charts Data
    dailyData,
    priorityStats,
    categoryStats,
    subtaskStats: {
      total: totalSubtasks,
      completed: completedSubtasks,
      remaining: totalSubtasks - completedSubtasks,
      rate: subtaskCompletionRate,
    },
    activeGoals,
    topTasks: {
      mostTimeConsuming,
      mostFocused,
      fastestCompleted,
    },
    insights: {
      peakDay,
      peakTime,
      goalSuccessRate,
      goalMetDaysCount,
      totalDays: dailyData.length,
    },
  };
};

/**
 * Generate CSV Report string from task dataset
 */
export const generateAnalyticsCSV = (tasks = [], metrics = {}) => {
  const headers = [
    'Task ID',
    'Title',
    'Category',
    'Priority',
    'Status',
    'Due Date',
    'Estimated (min)',
    'Actual (min)',
    'Variance (min)',
    'Subtasks Total',
    'Subtasks Completed',
  ];

  const rows = tasks.map((t) => {
    const est = Number(t.estimatedDuration || t.duration) || 30;
    const act = Number(t.actualDuration) || (t.status === 'completed' ? est : 0);
    const subTotal = Array.isArray(t.subtasks) ? t.subtasks.length : 0;
    const subDone = Array.isArray(t.subtasks) ? t.subtasks.filter((st) => st.completed).length : 0;

    return [
      `"${t.id}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${t.category || 'General'}"`,
      `"${t.priority || 'medium'}"`,
      `"${t.status || 'pending'}"`,
      `"${t.dueDate || ''}"`,
      est,
      act,
      act - est,
      subTotal,
      subDone,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};
