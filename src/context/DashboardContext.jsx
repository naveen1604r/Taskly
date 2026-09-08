import React, { createContext, useContext, useState, useEffect } from 'react';

const DASHBOARD_SETTINGS_KEY = 'taskly_dashboard_settings';

export const defaultWidgetOrder = [
  'todayOverview',
  'productivityScore',
  'todaysPriorities',
  'nextTask',
  'focusSummary',
  'quickActions',
  'overdueTasks',
  'upcomingTasks',
  'goalsOverview',
  'plannerSnapshot',
  'productivityChart',
  'weeklySummary',
  'timeAccuracy',
  'productivityTrends',
  'categoryStats',
  'routineSnapshot',
  'activeProjects',
  'recentActivity',
];

export const defaultWidgetVisibility = {
  todayOverview: true,
  productivityScore: true,
  todaysPriorities: true,
  nextTask: true,
  focusSummary: true,
  quickActions: true,
  overdueTasks: true,
  upcomingTasks: true,
  goalsOverview: true,
  plannerSnapshot: true,
  productivityChart: true,
  weeklySummary: true,
  timeAccuracy: true,
  productivityTrends: true,
  categoryStats: true,
  routineSnapshot: true,
  activeProjects: true,
  recentActivity: true,
};

export const widgetMetadata = {
  todayOverview: { title: "Today's Overview", description: 'Top summary of tasks, focus time & progress' },
  productivityScore: { title: 'Productivity Score', description: 'Dynamic 0-100 score & status assessment' },
  todaysPriorities: { title: "Today's Priorities", description: 'High-priority deliverables with focus triggers' },
  nextTask: { title: 'Next Up', description: 'Next scheduled task from Daily Planner' },
  focusSummary: { title: 'Focus Today', description: 'Pomodoro focus metrics, goal progress & streak' },
  quickActions: { title: 'Quick Actions', description: 'Quick creation shortcuts across all modules' },
  overdueTasks: { title: 'Overdue Tasks', description: 'Pending tasks past deadline with quick actions' },
  upcomingTasks: { title: 'Upcoming Tasks', description: 'Upcoming schedule for Today, Tomorrow & This Week' },
  goalsOverview: { title: 'Goals Overview', description: 'Active strategic goals with progress indicators' },
  plannerSnapshot: { title: 'Planner Snapshot', description: "Today's time-block schedule snapshot" },
  productivityChart: { title: 'Productivity Chart', description: '7-day tasks and focus time chart' },
  weeklySummary: { title: 'Weekly Summary', description: "Summary of this week's productivity metrics" },
  timeAccuracy: { title: 'Time Accuracy', description: 'Estimated vs actual tracked time comparison' },
  productivityTrends: { title: 'Productivity Trends', description: 'Peak performance and habit insights' },
  categoryStats: { title: 'Category Productivity', description: 'Task counts and completion by category' },
  routineSnapshot: { title: "Today's Routine", description: 'Recurring tasks and daily checklist' },
  activeProjects: { title: 'Active Projects', description: 'Strategic initiatives and cross-deliverable milestones' },
  recentActivity: { title: 'Recent Activity', description: 'Real-time log of completed work' },
};

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [widgetVisibility, setWidgetVisibility] = useState(() => {
    try {
      const saved = localStorage.getItem(DASHBOARD_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultWidgetVisibility, ...parsed.visibility };
      }
    } catch (e) {
      console.error('Failed to load dashboard settings:', e);
    }
    return defaultWidgetVisibility;
  });

  const [widgetOrder, setWidgetOrder] = useState(() => {
    try {
      const saved = localStorage.getItem(DASHBOARD_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.order) && parsed.order.length > 0) {
          // Ensure all default widgets exist in order
          const existing = parsed.order.filter((id) => defaultWidgetOrder.includes(id));
          const missing = defaultWidgetOrder.filter((id) => !existing.includes(id));
          return [...existing, ...missing];
        }
      }
    } catch (e) {
      console.error('Failed to load widget order:', e);
    }
    return defaultWidgetOrder;
  });

  const [selectedMetric, setSelectedMetric] = useState('completed_tasks'); // 'completed_tasks' | 'focus_minutes'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        DASHBOARD_SETTINGS_KEY,
        JSON.stringify({
          visibility: widgetVisibility,
          order: widgetOrder,
        })
      );
    } catch (e) {
      console.error('Failed to save dashboard settings:', e);
    }
  }, [widgetVisibility, widgetOrder]);

  const toggleWidget = (id) => {
    setWidgetVisibility((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const moveWidgetUp = (id) => {
    setWidgetOrder((prev) => {
      const index = prev.indexOf(id);
      if (index <= 0) return prev;
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const moveWidgetDown = (id) => {
    setWidgetOrder((prev) => {
      const index = prev.indexOf(id);
      if (index < 0 || index >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const resetDashboard = () => {
    setWidgetVisibility(defaultWidgetVisibility);
    setWidgetOrder(defaultWidgetOrder);
  };

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  const value = {
    widgetVisibility,
    widgetOrder,
    selectedMetric,
    setSelectedMetric,
    toggleWidget,
    moveWidgetUp,
    moveWidgetDown,
    resetDashboard,
    isSettingsOpen,
    openSettings,
    closeSettings,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
}
