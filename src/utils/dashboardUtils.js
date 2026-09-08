import { getTodayDateString, getOffsetDateString } from './taskStorage';
import { isTaskOverdue } from './filterUtils';
import { parseTimeToMinutes } from './plannerUtils';

/**
 * Get Today's Summary Metrics
 */
export const getTodaySummary = ({ tasks = [], todayFocusMinutes = 0, todayStr }) => {
  const targetDate = todayStr || getTodayDateString();

  const todayTasks = tasks.filter(
    (t) => t.dueDate === targetDate || t.plannedDate === targetDate
  );

  const total = todayTasks.length;
  const completed = todayTasks.filter((t) => t.status === 'completed').length;
  const remaining = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Format focus time
  const focusH = Math.floor(todayFocusMinutes / 60);
  const focusM = todayFocusMinutes % 60;
  const focusTimeFormatted =
    focusH > 0 ? `${focusH}h ${focusM}m` : `${focusM}m`;

  return {
    todayTasks,
    total,
    completed,
    remaining,
    percentage,
    todayFocusMinutes,
    focusTimeFormatted,
  };
};

/**
 * Calculate Dynamic Productivity Score (0 - 100)
 * Deterministic formula:
 * - 35% Task Completion Rate today
 * - 25% Focus Goal Progress
 * - 20% Goals active progress
 * - 20% Planned vs executed tasks
 * - Overdue penalty: -5 pts per overdue task (max -20)
 */
export const calculateProductivityScore = ({
  todayTasks = [],
  overdueTasks = [],
  todayFocusMinutes = 0,
  dailyFocusGoalMinutes = 120,
  goals = [],
}) => {
  const totalToday = todayTasks.length;
  const completedToday = todayTasks.filter((t) => t.status === 'completed').length;

  if (totalToday === 0 && todayFocusMinutes === 0 && goals.length === 0) {
    return {
      score: 0,
      status: 'No Activity Yet',
      color: 'text-slate-400 border-slate-700 bg-slate-800/40',
      breakdown: {
        taskPoints: 0,
        focusPoints: 0,
        goalPoints: 0,
        momentumPoints: 0,
        overduePenalty: 0,
      },
    };
  }

  // 1. Task Completion (35 pts)
  const taskFactor = totalToday > 0 ? (completedToday / totalToday) * 35 : 0;

  // 2. Focus Time (25 pts)
  const goalMins = dailyFocusGoalMinutes || 120;
  const focusRatio = Math.min(todayFocusMinutes / goalMins, 1.2);
  const focusFactor = Math.min(focusRatio * 25, 25);

  // 3. Goal Progress (20 pts)
  let goalFactor = 0;
  if (goals.length > 0) {
    const avgGoalProgress =
      goals.reduce((acc, g) => acc + (Number(g.progress) || 0), 0) / goals.length;
    goalFactor = (avgGoalProgress / 100) * 20;
  }

  // 4. Momentum / Baseline (20 pts)
  const baseMomentum = completedToday > 0 ? 20 : 0;

  // 5. Overdue Penalty (Up to -20 pts)
  const overduePenalty = Math.min(overdueTasks.length * 5, 20);

  let rawScore = Math.round(taskFactor + focusFactor + goalFactor + baseMomentum - overduePenalty);
  const score = Math.max(0, Math.min(100, rawScore));

  let status = 'Good';
  let color = 'text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/10';

  if (score === 0) {
    status = 'No Activity Yet';
    color = 'text-slate-400 border-slate-700 bg-slate-800/40';
  } else if (score >= 85) {
    status = 'Excellent';
    color = 'text-[#7C3AED] border-[#7C3AED]/30 bg-[#7C3AED]/10';
  } else if (score >= 70) {
    status = 'Good';
    color = 'text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/10';
  } else if (score >= 50) {
    status = 'Average';
    color = 'text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10';
  } else {
    status = 'Needs Attention';
    color = 'text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/10';
  }

  return {
    score,
    status,
    color,
    breakdown: {
      taskPoints: Math.round(taskFactor),
      focusPoints: Math.round(focusFactor),
      goalPoints: Math.round(goalFactor),
      momentumPoints: baseMomentum,
      overduePenalty,
    },
  };
};

/**
 * Get Today's Top Priority Tasks
 */
export const getTodayPriorities = (tasks = [], limit = 5) => {
  const todayStr = getTodayDateString();

  return tasks
    .filter((t) => {
      if (t.status === 'completed') return false;
      const isDueToday = t.dueDate === todayStr || t.plannedDate === todayStr;
      const isHighPriority = t.priority === 'high';
      return isDueToday || isHighPriority;
    })
    .sort((a, b) => {
      const pWeights = { high: 3, medium: 2, low: 1 };
      const pDiff = (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
      if (pDiff !== 0) return pDiff;

      const timeA = a.plannedStartTime || a.dueTime || '99:99';
      const timeB = b.plannedStartTime || b.dueTime || '99:99';
      return timeA.localeCompare(timeB);
    })
    .slice(0, limit);
};

/**
 * Get Next Upcoming Planned Task
 */
export const getNextTask = ({ tasks = [], selectedDate }) => {
  const dateKey = selectedDate || getTodayDateString();
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const dayTasks = tasks.filter(
    (t) => (t.plannedDate || t.dueDate) === dateKey && t.status !== 'completed'
  );

  const timedTasks = dayTasks
    .map((t) => {
      const startTime = t.plannedStartTime || t.dueTime;
      const startMinutes = parseTimeToMinutes(startTime);
      return {
        ...t,
        startMinutes,
      };
    })
    .filter((t) => t.startMinutes !== null)
    .sort((a, b) => a.startMinutes - b.startMinutes);

  // Find next task whose start time is in the future
  const next = timedTasks.find((t) => t.startMinutes >= currentMinutes);

  if (next) {
    const diff = next.startMinutes - currentMinutes;
    const startsInFormatted =
      diff < 60 ? `${diff} min` : `${Math.floor(diff / 60)}h ${diff % 60}m`;
    return {
      task: next,
      startsIn: startsInFormatted,
      isUpcoming: true,
    };
  }

  // If none in the future, return first pending planned task of the day
  if (dayTasks.length > 0) {
    return {
      task: dayTasks[0],
      startsIn: 'Scheduled Today',
      isUpcoming: false,
    };
  }

  return null;
};

/**
 * Get Overdue Tasks with formatted overdue duration
 */
export const getOverdueTasks = (tasks = []) => {
  const now = new Date();
  const todayStr = getTodayDateString();

  return tasks
    .filter((t) => isTaskOverdue(t))
    .map((t) => {
      let overdueText = 'Overdue';
      if (t.dueDate) {
        const dueObj = new Date(t.dueDate);
        const todayObj = new Date(todayStr);
        const diffDays = Math.floor((todayObj - dueObj) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          overdueText = 'Overdue today';
        } else if (diffDays === 1) {
          overdueText = '1 day overdue';
        } else if (diffDays > 1) {
          overdueText = `${diffDays} days overdue`;
        }
      }

      return {
        ...t,
        overdueText,
      };
    })
    .sort((a, b) => {
      const dateA = a.dueDate || '9999-99-99';
      const dateB = b.dueDate || '9999-99-99';
      return dateA.localeCompare(dateB);
    });
};

/**
 * Get Upcoming Tasks grouped by Today, Tomorrow, This Week
 */
export const getUpcomingTasks = (tasks = []) => {
  const todayStr = getTodayDateString();
  const tomorrowStr = getOffsetDateString(1);

  const now = new Date();
  const currentDay = now.getDay();
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const sundayStr = getOffsetDateString(diffToMonday + 6);

  const active = tasks.filter((t) => t.status !== 'completed');

  const today = active.filter((t) => (t.dueDate || t.plannedDate) === todayStr);
  const tomorrow = active.filter((t) => (t.dueDate || t.plannedDate) === tomorrowStr);
  const thisWeek = active.filter((t) => {
    const d = t.dueDate || t.plannedDate;
    return d && d > tomorrowStr && d <= sundayStr;
  });

  return {
    today,
    tomorrow,
    thisWeek,
    totalUpcoming: today.length + tomorrow.length + thisWeek.length,
  };
};

/**
 * Get Weekly Summary
 */
export const getWeeklySummary = ({ tasks = [], focusSessions = [], goals = [] }) => {
  const now = new Date();
  const currentDay = now.getDay();
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const mondayStr = getOffsetDateString(diffToMonday);
  const sundayStr = getOffsetDateString(diffToMonday + 6);

  const weekTasks = tasks.filter((t) => {
    const created = t.createdAt ? t.createdAt.split('T')[0] : '';
    const due = t.dueDate || '';
    return (created >= mondayStr && created <= sundayStr) || (due >= mondayStr && due <= sundayStr);
  });

  const completedTasks = tasks.filter((t) => {
    const compDate = t.completedAt ? t.completedAt.split('T')[0] : '';
    return t.status === 'completed' && compDate >= mondayStr && compDate <= sundayStr;
  });

  const subtasksCompleted = tasks.reduce((acc, t) => {
    if (!Array.isArray(t.subtasks)) return acc;
    return (
      acc +
      t.subtasks.filter((st) => {
        if (!st.completed) return false;
        const compDate = st.completedAt ? st.completedAt.split('T')[0] : '';
        return compDate >= mondayStr && compDate <= sundayStr;
      }).length
    );
  }, 0);

  const weekFocusSessions = focusSessions.filter((s) => {
    const date = s.startTime ? s.startTime.split('T')[0] : s.date || '';
    return date >= mondayStr && date <= sundayStr;
  });

  const totalFocusMinutes = weekFocusSessions.reduce(
    (acc, s) => acc + (Number(s.duration) || Number(s.durationMinutes) || 0),
    0
  );

  const focusHours = Math.floor(totalFocusMinutes / 60);
  const focusRemainderMinutes = totalFocusMinutes % 60;

  return {
    tasksCompletedCount: completedTasks.length,
    tasksCreatedCount: weekTasks.length,
    focusMinutes: totalFocusMinutes,
    focusTimeFormatted: `${focusHours}h ${focusRemainderMinutes}m`,
    focusSessionsCount: weekFocusSessions.length,
    subtasksCompletedCount: subtasksCompleted,
    goalsCount: goals.length,
  };
};

/**
 * Get Category Statistics
 */
export const getCategoryStats = (tasks = []) => {
  const map = {};

  tasks.forEach((t) => {
    const cat = t.category || 'General';
    if (!map[cat]) {
      map[cat] = { category: cat, total: 0, completed: 0 };
    }
    map[cat].total += 1;
    if (t.status === 'completed') {
      map[cat].completed += 1;
    }
  });

  return Object.values(map)
    .map((item) => ({
      ...item,
      percentage: item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
};

/**
 * Get Productivity Trends
 */
export const getProductivityTrends = ({ tasks = [], focusSessions = [] }) => {
  // Day of week completion aggregation
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayCounts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

  tasks.forEach((t) => {
    if (t.status === 'completed' && t.completedAt) {
      const d = new Date(t.completedAt);
      const name = dayNames[d.getDay()];
      dayCounts[name] = (dayCounts[name] || 0) + 1;
    }
  });

  const completedTasksWithDate = tasks.filter((t) => t.status === 'completed' && t.completedAt);
  let peakDay = 'None';
  let maxCount = 0;
  if (completedTasksWithDate.length > 0) {
    Object.entries(dayCounts).forEach(([day, count]) => {
      if (count > maxCount) {
        maxCount = count;
        peakDay = day;
      }
    });
  }

  // Top focus category
  const catFocusMap = {};
  focusSessions.forEach((s) => {
    const cat = s.category || 'General';
    const mins = Number(s.duration) || Number(s.durationMinutes) || 0;
    catFocusMap[cat] = (catFocusMap[cat] || 0) + mins;
  });

  let topCategory = 'None';
  let maxMins = 0;
  if (focusSessions.length > 0) {
    Object.entries(catFocusMap).forEach(([cat, mins]) => {
      if (mins > maxMins) {
        maxMins = mins;
        topCategory = cat;
      }
    });
  }

  // Average daily focus
  const totalFocus = focusSessions.reduce(
    (acc, s) => acc + (Number(s.duration) || Number(s.durationMinutes) || 0),
    0
  );
  const avgDailyFocusMins = focusSessions.length > 0 ? Math.round(totalFocus / 7) : 0;

  return {
    peakDay,
    topCategory,
    avgDailyFocusMins,
  };
};

/**
 * Get Contextual Personalized Greeting Message
 */
export const getDashboardMessage = ({
  todayTasks = [],
  overdueCount = 0,
  focusGoalAchieved = false,
  completedRatio = 0,
}) => {
  if (todayTasks.length === 0) {
    return {
      title: 'Your day is clear!',
      subtitle: 'Add a task or schedule deliverables to kickstart your day.',
    };
  }

  if (completedRatio >= 1) {
    return {
      title: 'Outstanding achievement! 🎉',
      subtitle: "You've completed all tasks scheduled for today.",
    };
  }

  if (overdueCount >= 3) {
    return {
      title: `${overdueCount} tasks are overdue`,
      subtitle: 'Consider rescheduling or prioritizing them today to regain momentum.',
    };
  }

  if (focusGoalAchieved) {
    return {
      title: 'Daily focus goal accomplished! 🔥',
      subtitle: "You've completed your targeted focus blocks for today.",
    };
  }

  if (completedRatio >= 0.5) {
    return {
      title: 'Great progress today!',
      subtitle: 'You are over halfway through your scheduled commitments.',
    };
  }

  return {
    title: 'Ready for a productive session?',
    subtitle: 'Focus on high-priority items and track your milestones.',
  };
};
