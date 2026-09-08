import React, { useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useFocusContext } from '../context/FocusContext';
import { useDashboardContext } from '../context/DashboardContext';
import { useSettingsContext } from '../context/SettingsContext';
import { useAuthContext } from '../context/AuthContext';
import { getTodayDateString } from '../utils/taskStorage';
import { getDashboardMessage, getOverdueTasks } from '../utils/dashboardUtils';

// Modular Dashboard Widgets
import TodayOverview from '../components/dashboard/TodayOverview';
import ProductivityScore from '../components/dashboard/ProductivityScore';
import TodaysPriorities from '../components/dashboard/TodaysPriorities';
import NextTask from '../components/dashboard/NextTask';
import FocusSummary from '../components/dashboard/FocusSummary';
import QuickActions from '../components/dashboard/QuickActions';
import OverdueTasks from '../components/dashboard/OverdueTasks';
import UpcomingTasks from '../components/dashboard/UpcomingTasks';
import GoalsOverview from '../components/dashboard/GoalsOverview';
import PlannerSnapshot from '../components/dashboard/PlannerSnapshot';
import ProductivityChart from '../components/dashboard/ProductivityChart';
import WeeklySummary from '../components/dashboard/WeeklySummary';
import TimeAccuracy from '../components/dashboard/TimeAccuracy';
import ProductivityTrends from '../components/dashboard/ProductivityTrends';
import CategoryStats from '../components/dashboard/CategoryStats';
import RoutineSnapshot from '../components/dashboard/RoutineSnapshot';
import RecentActivity from '../components/dashboard/RecentActivity';
import ActiveProjects from '../components/dashboard/ActiveProjects';
import UpcomingRemindersWidget from '../components/dashboard/UpcomingRemindersWidget';
import InboxWidget from '../components/dashboard/InboxWidget';
import HabitWidget from '../components/dashboard/HabitWidget';
import DashboardSettings from '../components/dashboard/DashboardSettings';

import { Sliders, Sparkles, Sun, Moon, CloudSun } from 'lucide-react';
import Button from '../components/common/Button';

export default function Dashboard() {
  const { tasks } = useTaskContext();
  const { dailyStats, totalFocusTimeToday, dailyFocusGoalMinutes = 120 } = useFocusContext();
  const { widgetVisibility, widgetOrder, openSettings } = useDashboardContext();
  const { settings } = useSettingsContext();
  const { user } = useAuthContext();

  const profileName = user?.name || settings?.profile?.name || 'User';
  const todayStr = getTodayDateString();

  const todayTasks = tasks.filter(
    (t) => t.dueDate === todayStr || t.plannedDate === todayStr
  );
  const completedToday = todayTasks.filter((t) => t.status === 'completed').length;
  const completedRatio = todayTasks.length > 0 ? completedToday / todayTasks.length : 0;
  const overdueTasks = getOverdueTasks(tasks);

  const todayFocusMinutes = Math.round((totalFocusTimeToday || dailyStats?.totalDuration || 0) / 60);
  const focusGoalAchieved = todayFocusMinutes >= dailyFocusGoalMinutes;

  // Deterministic daily personalized message (Requirement 19)
  const message = useMemo(() => {
    return getDashboardMessage({
      todayTasks,
      overdueCount: overdueTasks.length,
      focusGoalAchieved,
      completedRatio,
    });
  }, [todayTasks, overdueTasks.length, focusGoalAchieved, completedRatio]);

  // Greeting based on time of day
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const GreetingIcon = hour < 12 ? Sun : hour < 18 ? CloudSun : Moon;

  // Render widget map
  const renderWidget = (id) => {
    if (!widgetVisibility[id]) return null;

    switch (id) {
      case 'todayOverview':
        return <TodayOverview key={id} />;

      case 'productivityScore':
        return <ProductivityScore key={id} />;

      case 'todaysPriorities':
        return <TodaysPriorities key={id} />;

      case 'nextTask':
        return <NextTask key={id} />;

      case 'focusSummary':
        return <FocusSummary key={id} />;

      case 'quickActions':
        return <QuickActions key={id} />;

      case 'overdueTasks':
        return <OverdueTasks key={id} />;

      case 'upcomingTasks':
        return <UpcomingTasks key={id} />;

      case 'goalsOverview':
        return <GoalsOverview key={id} />;

      case 'plannerSnapshot':
        return <PlannerSnapshot key={id} />;

      case 'productivityChart':
        return <ProductivityChart key={id} />;

      case 'weeklySummary':
        return <WeeklySummary key={id} />;

      case 'timeAccuracy':
        return <TimeAccuracy key={id} />;

      case 'productivityTrends':
        return <ProductivityTrends key={id} />;

      case 'categoryStats':
        return <CategoryStats key={id} />;

      case 'routineSnapshot':
        return <RoutineSnapshot key={id} />;

      case 'recentActivity':
        return <RecentActivity key={id} />;

      case 'activeProjects':
        return <ActiveProjects key={id} />;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7 pb-16 animate-in fade-in duration-200">
      {/* 1. Header & Contextual Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#c4b5fd] bg-[#7C3AED]/15 px-2.5 py-0.5 rounded-full border border-[#7C3AED]/25">
              <GreetingIcon className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>{timeGreeting}, {profileName}</span>
            </span>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {message.title}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {message.subtitle}
          </p>
        </div>

        {/* Dashboard Customization Button (Requirement 20) */}
        <button
          type="button"
          onClick={openSettings}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#11151F] hover:bg-[#171C27] border border-white/[0.08] hover:border-white/[0.18] text-slate-300 hover:text-white transition-all self-start sm:self-auto shadow-xs"
        >
          <Sliders className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>Customize Widgets</span>
        </button>
      </div>

      {/* 2. Top Metric Row: TodayOverview */}
      {widgetVisibility.todayOverview && <TodayOverview />}

      {/* 3. Core Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priorities, Next Task, Chart, Planner */}
        <div className="lg:col-span-2 space-y-6">
          {widgetVisibility.todaysPriorities && <TodaysPriorities />}
          {widgetVisibility.nextTask && <NextTask />}
          {widgetVisibility.productivityChart && <ProductivityChart />}
          {widgetVisibility.plannerSnapshot && <PlannerSnapshot />}
          {widgetVisibility.upcomingTasks && <UpcomingTasks />}
          {widgetVisibility.weeklySummary && <WeeklySummary />}
        </div>

        {/* Right 1 Col: Score, Focus, Quick Actions, Overdue, Goals, Trends, Habits */}
        <div className="lg:col-span-1 space-y-6">
          {widgetVisibility.productivityScore && <ProductivityScore />}
          {widgetVisibility.focusSummary && <FocusSummary />}
          {widgetVisibility.quickActions && <QuickActions />}
          {widgetVisibility.overdueTasks && <OverdueTasks />}
          <InboxWidget />
          <HabitWidget />
          <UpcomingRemindersWidget />
          {widgetVisibility.goalsOverview && <GoalsOverview />}
          {widgetVisibility.timeAccuracy && <TimeAccuracy />}
          {widgetVisibility.productivityTrends && <ProductivityTrends />}
          {widgetVisibility.categoryStats && <CategoryStats />}
          {widgetVisibility.routineSnapshot && <RoutineSnapshot />}
          {widgetVisibility.recentActivity && <RecentActivity />}
        </div>
      </div>

      {/* Dashboard Settings Customization Modal */}
      <DashboardSettings />
    </div>
  );
}
