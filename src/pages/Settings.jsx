import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import SettingsSidebar, { settingsTabs } from '../components/settings/SettingsSidebar';
import ProfileSettings from '../components/settings/ProfileSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';
import PreferenceSettings from '../components/settings/PreferenceSettings';
import NotificationSettings from '../components/notifications/NotificationSettings';
import TaskSettings from '../components/settings/TaskSettings';
import CalendarSettings from '../components/settings/CalendarSettings';
import FocusSettings from '../components/settings/FocusSettings';
import HabitSettings from '../components/settings/HabitSettings';
import DataManagement from '../components/settings/DataManagement';
import KeyboardShortcuts from '../components/settings/KeyboardShortcuts';
import AboutTaskly from '../components/settings/AboutTaskly';
import { useSettingsContext } from '../context/SettingsContext';
import { useTaskContext } from '../context/TaskContext';
import { useGoalsContext } from '../context/GoalsContext';
import { useNotificationsContext } from '../context/NotificationsContext';

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    if (tabParam && settingsTabs.some((t) => t.id === tabParam)) return tabParam;
    if (location.pathname.includes('/settings/data')) return 'data';
    return 'profile';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && settingsTabs.some((t) => t.id === tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    } else if (location.pathname.includes('/settings/data') && activeTab !== 'data') {
      setActiveTab('data');
    }
  }, [searchParams, location.pathname]);
  const { settings } = useSettingsContext();
  const { tasks } = useTaskContext();
  const { goals } = useGoalsContext();
  const { reminders } = useNotificationsContext();

  const pendingTasksCount = tasks.filter((t) => t.status === 'pending').length;
  const activeGoalsCount = goals.filter((g) => g.status === 'active').length;
  const activeRemindersCount = reminders.filter((r) => r.enabled).length;

  return (
    <div className="space-y-6 sm:space-y-7 pb-14">
      {/* 1. Header with Snapshot Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Settings</h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Manage your account, appearance, routines, and workspace preferences.
          </p>
        </div>

        {/* Top Mini Snapshot */}
        <div className="flex items-center gap-3 text-xs bg-[var(--bg-surface)] border border-[var(--border-primary)] px-3.5 py-2 rounded-xl text-[var(--text-secondary)] self-start sm:self-auto overflow-x-auto">
          <span>Theme: <strong className="text-[var(--text-primary)] capitalize">{settings.appearance.theme}</strong></span>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <span>Goals: <strong className="text-[#F59E0B]">{activeGoalsCount}</strong></span>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <span>Pending: <strong className="text-[#06B6D4]">{pendingTasksCount}</strong></span>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <span>Reminders: <strong className="text-pink-400">{activeRemindersCount}</strong></span>
        </div>
      </div>

      {/* Mobile Horizontal Tab Selector */}
      <div className="lg:hidden flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] overflow-x-auto">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-accent text-[var(--accent-foreground)] shadow-glow-primary font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Main Desktop Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Settings Navigation (Desktop) */}
        <div className="hidden lg:block lg:col-span-1 p-3 rounded-2xl bg-[#11151F] border border-white/[0.08] sticky top-20">
          <SettingsSidebar activeTab={activeTab} onSelectTab={setActiveTab} />
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-3 p-5 sm:p-7 rounded-2xl bg-[#11151F] border border-white/[0.08] min-h-[480px]">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'appearance' && <AppearanceSettings />}
          {activeTab === 'preferences' && <PreferenceSettings />}
          {activeTab === 'focus' && <FocusSettings />}
          {activeTab === 'habits' && <HabitSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'tasks' && <TaskSettings />}
          {activeTab === 'calendar' && <CalendarSettings />}
          {activeTab === 'data' && <DataManagement />}
          {activeTab === 'shortcuts' && <KeyboardShortcuts />}
          {activeTab === 'about' && <AboutTaskly />}
        </div>
      </div>
    </div>
  );
}
