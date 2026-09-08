import React, { createContext, useContext, useState, useMemo } from 'react';
import { useTaskContext } from './TaskContext';
import { useFocusContext } from './FocusContext';
import { useActivityContext } from './ActivityContext';
import { useGoalsContext } from './GoalsContext';
import { useNotesContext } from './NotesContext';
import { useRecurringTaskContext } from './RecurringTaskContext';
import { useBoardContext } from './BoardContext';
import {
  resolveDateRange,
  calculateAdvancedAnalytics,
  generateAnalyticsCSV,
} from '../utils/analyticsUtils';
import { getTodayDateString, getOffsetDateString } from '../utils/taskStorage';

const defaultFilters = {
  category: 'all',
  priority: 'all',
  status: 'all',
  goalId: 'all',
  tags: [],
};

const AnalyticsContext = createContext(null);

export function AnalyticsProvider({ children }) {
  const { tasks } = useTaskContext();
  const { sessions = [], dailyFocusGoalMinutes = 120 } = useFocusContext();
  const { activities = [] } = useActivityContext();
  const { goals = [] } = useGoalsContext();
  const { notes = [] } = useNotesContext();
  const { recurringTasks = [] } = useRecurringTaskContext();
  let columnCounts = { pending: 0, inProgress: 0, completed: 0 };
  try {
    const boardCtx = useBoardContext();
    if (boardCtx?.columnCounts) {
      columnCounts = boardCtx.columnCounts;
    }
  } catch {
    columnCounts = {
      pending: tasks.filter((t) => t.status === 'pending' || !t.status).length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    };
  }

  // Date Range state (Default: 'last_7_days')
  const [selectedRange, setSelectedRange] = useState('last_7_days');
  const [customStart, setCustomStart] = useState(() => getOffsetDateString(-7));
  const [customEnd, setCustomEnd] = useState(() => getTodayDateString());

  // Chart type switcher (Bar vs Line)
  const [chartType, setChartType] = useState('bar');

  // Analytics Filters
  const [analyticsFilters, setAnalyticsFilters] = useState(defaultFilters);

  // Resolved Date Range object
  const dateRange = useMemo(() => {
    return resolveDateRange(selectedRange, customStart, customEnd);
  }, [selectedRange, customStart, customEnd]);

  // Derived Analytics Metrics
  const metrics = useMemo(() => {
    return calculateAdvancedAnalytics({
      tasks,
      sessions,
      activities,
      goals,
      dateRange,
      filters: analyticsFilters,
      dailyFocusGoalMinutes,
    });
  }, [tasks, sessions, activities, goals, dateRange, analyticsFilters, dailyFocusGoalMinutes]);

  const setAnalyticsFilter = (key, value) => {
    setAnalyticsFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearAnalyticsFilters = () => {
    setAnalyticsFilters(defaultFilters);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (analyticsFilters.category !== 'all') count++;
    if (analyticsFilters.priority !== 'all') count++;
    if (analyticsFilters.status !== 'all') count++;
    if (analyticsFilters.goalId !== 'all') count++;
    if (Array.isArray(analyticsFilters.tags) && analyticsFilters.tags.length > 0) count++;
    return count;
  }, [analyticsFilters]);

  // CSV Export
  const downloadCSV = () => {
    const csvContent = generateAnalyticsCSV(metrics.dailyData ? tasks : [], metrics);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `taskly_analytics_${dateRange.start}_to_${dateRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Report
  const printReport = () => {
    window.print();
  };

  const value = {
    selectedRange,
    setSelectedRange,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    dateRange,
    chartType,
    setChartType,
    analyticsFilters,
    setAnalyticsFilter,
    clearAnalyticsFilters,
    activeFilterCount,
    metrics,
    recurringTasks,
    columnCounts,
    downloadCSV,
    printReport,
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
}
