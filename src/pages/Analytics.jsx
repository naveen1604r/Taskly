import React from 'react';
import AnalyticsHeader from '../components/analytics/AnalyticsHeader';
import AnalyticsOverview from '../components/analytics/AnalyticsOverview';
import TaskCompletionChart from '../components/analytics/TaskCompletionChart';
import FocusTimeChart from '../components/analytics/FocusTimeChart';
import TaskStatusChart from '../components/analytics/TaskStatusChart';
import PriorityAnalysis from '../components/analytics/PriorityAnalysis';
import CategoryAnalysis from '../components/analytics/CategoryAnalysis';
import TimeAccuracy from '../components/analytics/TimeAccuracy';
import ProductivityTrend from '../components/analytics/ProductivityTrend';
import FocusStreak from '../components/analytics/FocusStreak';
import ProductivityInsights from '../components/analytics/ProductivityInsights';
import GoalAnalytics from '../components/analytics/GoalAnalytics';
import SubtaskAnalytics from '../components/analytics/SubtaskAnalytics';
import RecurringAnalytics from '../components/analytics/RecurringAnalytics';
import HabitAnalytics from '../components/analytics/HabitAnalytics';
import TopTasks from '../components/analytics/TopTasks';
import AnalyticsTable from '../components/analytics/AnalyticsTable';

export default function Analytics() {
  return (
    <div className="space-y-6 sm:space-y-7 pb-16 animate-in fade-in duration-200">
      {/* 1. Header with Range Selector, Filters, and Exports */}
      <AnalyticsHeader />

      {/* 2. Top Overview Cards (6 metrics) */}
      <AnalyticsOverview />

      {/* 3. Primary Activity & Velocity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskCompletionChart />
        <FocusTimeChart />
      </div>

      {/* 4. Status Breakdown & Priority Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskStatusChart />
        <PriorityAnalysis />
      </div>

      {/* 5. Category Analysis & Time Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryAnalysis />
        <TimeAccuracy />
      </div>

      {/* 6. Productivity Score History & Focus Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductivityTrend />
        <FocusStreak />
      </div>

      {/* 7. Generated Insights & Strategic Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductivityInsights />
        <GoalAnalytics />
      </div>

      {/* 8. Subtasks & Routines Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubtaskAnalytics />
        <RecurringAnalytics />
      </div>

      {/* 9. Habit Analytics & Streaks */}
      <HabitAnalytics />

      {/* 10. Top Tasks */}
      <TopTasks />

      {/* 10. Detailed Tasks Table Report */}
      <AnalyticsTable />
    </div>
  );
}
