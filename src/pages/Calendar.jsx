import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useActivityContext } from '../context/ActivityContext';
import { useSettingsContext } from '../context/SettingsContext';
import {
  CALENDAR_SETTINGS_KEY,
  defaultCalendarSettings,
  formatDateKey,
  parseDateKey,
  calculateTaskEndTime,
  detectScheduleConflict,
} from '../utils/calendarUtils';
import { getTodayDateString, getOffsetDateString } from '../utils/taskStorage';

import CalendarHeader from '../components/calendar/CalendarHeader';
import CalendarToolbar from '../components/calendar/CalendarToolbar';
import MonthView from '../components/calendar/MonthView';
import WeekView from '../components/calendar/WeekView';
import DayView from '../components/calendar/DayView';
import AgendaView from '../components/calendar/AgendaView';
import UnscheduledTasks from '../components/calendar/UnscheduledTasks';
import CalendarTaskPopover from '../components/calendar/CalendarTaskPopover';
import CalendarLegend from '../components/calendar/CalendarLegend';
import CalendarSettings from '../components/calendar/CalendarSettings';

export default function Calendar() {
  const { tasks, updateTask, openCreateModal, showToast } = useTaskContext();
  const { logActivity } = useActivityContext();
  const { settings: appSettings } = useSettingsContext();

  // Calendar Settings Persistence
  const [calendarSettings, setCalendarSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(CALENDAR_SETTINGS_KEY);
      return saved ? { ...defaultCalendarSettings, ...JSON.parse(saved) } : defaultCalendarSettings;
    } catch {
      return defaultCalendarSettings;
    }
  });

  const [selectedDate, setSelectedDate] = useState(() => calendarSettings.selectedDate || getTodayDateString());
  const [currentView, setCurrentView] = useState(() => calendarSettings.view || 'month');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priority: 'all',
    projectId: 'all',
    status: 'all',
    goalId: 'all',
  });

  // Modal / Drawer state
  const [isUnscheduledOpen, setIsUnscheduledOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [popoverTask, setPopoverTask] = useState(null);

  // Sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        CALENDAR_SETTINGS_KEY,
        JSON.stringify({ ...calendarSettings, view: currentView, selectedDate })
      );
    } catch (e) {
      console.error('Failed to save calendar settings:', e);
    }
  }, [calendarSettings, currentView, selectedDate]);

  // Derived Month / Year from selectedDate
  const dateObj = useMemo(() => parseDateKey(selectedDate), [selectedDate]);
  const currentYear = dateObj.getFullYear();
  const currentMonth = dateObj.getMonth(); // 0-indexed

  // View Title Formatting
  const viewTitle = useMemo(() => {
    if (currentView === 'month') {
      return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (currentView === 'week') {
      const weekStart = new Date(dateObj);
      const dayOfWeek = weekStart.getDay();
      const diff = calendarSettings.weekStartsOn === 'monday' ? (dayOfWeek === 0 ? 6 : dayOfWeek - 1) : dayOfWeek;
      weekStart.setDate(weekStart.getDate() - diff);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${startMonth} – ${endMonth}`;
    }
    if (currentView === 'day') {
      return dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    }
    return `Agenda — ${dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  }, [dateObj, currentView, calendarSettings.weekStartsOn]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    const d = parseDateKey(selectedDate);
    if (currentView === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (currentView === 'week' || currentView === 'agenda') {
      d.setDate(d.getDate() - 7);
    } else if (currentView === 'day') {
      d.setDate(d.getDate() - 1);
    }
    setSelectedDate(formatDateKey(d));
  }, [selectedDate, currentView]);

  const handleNext = useCallback(() => {
    const d = parseDateKey(selectedDate);
    if (currentView === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else if (currentView === 'week' || currentView === 'agenda') {
      d.setDate(d.getDate() + 7);
    } else if (currentView === 'day') {
      d.setDate(d.getDate() + 1);
    }
    setSelectedDate(formatDateKey(d));
  }, [selectedDate, currentView]);

  const handleToday = useCallback(() => {
    setSelectedDate(getTodayDateString());
  }, []);

  // Keyboard Shortcuts (Requirement 31)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in form controls
      const tag = e.target.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) {
        return;
      }

      switch (e.key) {
        case 't':
        case 'T':
          e.preventDefault();
          handleToday();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setCurrentView('month');
          break;
        case 'w':
        case 'W':
          e.preventDefault();
          setCurrentView('week');
          break;
        case 'd':
        case 'D':
          e.preventDefault();
          setCurrentView('day');
          break;
        case 'a':
        case 'A':
          e.preventDefault();
          setCurrentView('agenda');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToday, handlePrev, handleNext]);

  // Drag & Drop Date Scheduling (Month View)
  const handleDropTaskDate = (taskId, targetDate) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    updateTask(taskId, { plannedDate: targetDate });
    if (showToast) showToast(`Moved "${task.title}" to ${targetDate}`, 'success');
    if (logActivity) {
      logActivity({
        title: `Rescheduled "${task.title}" to ${targetDate}`,
        category: 'Calendar',
        relatedTaskId: taskId,
      });
    }
  };

  // Drag & Drop Time Slot Scheduling (Week & Day Views)
  const handleDropTaskTime = (taskId, targetDate, targetTime) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const duration = Number(task.estimatedDuration || task.duration) || 30;
    const conflict = detectScheduleConflict(taskId, targetDate, targetTime, duration, tasks);

    if (conflict && showToast) {
      showToast(`Warning: Overlaps with "${conflict.title}"`, 'warning');
    }

    updateTask(taskId, {
      plannedDate: targetDate,
      plannedStartTime: targetTime,
    });

    if (showToast && !conflict) {
      showToast(`Scheduled "${task.title}" at ${targetTime} (${targetDate})`, 'success');
    }

    if (logActivity) {
      logActivity({
        title: `Scheduled "${task.title}" at ${targetTime} on ${targetDate}`,
        category: 'Calendar',
        relatedTaskId: taskId,
      });
    }
  };

  // Resizing Task Duration
  const handleResizeDuration = (taskId, newDuration) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    updateTask(taskId, { estimatedDuration: newDuration });
    if (showToast) showToast(`Updated duration for "${task.title}" to ${newDuration}m`, 'success');
  };

  // Quick Add handler
  const handleQuickAdd = (targetDate, targetTime = null) => {
    openCreateModal({
      plannedDate: targetDate,
      plannedStartTime: targetTime || '09:00',
    });
  };

  // Unscheduled Deliverables Count
  const unscheduledCount = useMemo(() => {
    return tasks.filter((t) => !t.plannedDate && t.status !== 'completed').length;
  }, [tasks]);

  return (
    <div className="space-y-5 sm:space-y-6 pb-16 animate-in fade-in duration-200">
      {/* 1. Calendar Header (Title, Nav & View Switcher) */}
      <CalendarHeader
        viewTitle={viewTitle}
        currentView={currentView}
        selectedDate={selectedDate}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onDateChange={setSelectedDate}
        onViewChange={setCurrentView}
      />

      {/* 2. Calendar Toolbar (Search, Filters, Unscheduled Drawer, Settings) */}
      <CalendarToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFilterChange={(k, v) => setFilters((prev) => ({ ...prev, [k]: v }))}
        onClearFilters={() =>
          setFilters({ priority: 'all', projectId: 'all', status: 'all', goalId: 'all' })
        }
        unscheduledCount={unscheduledCount}
        onToggleUnscheduled={() => setIsUnscheduledOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCreateModal={() => handleQuickAdd(selectedDate)}
      />

      {/* 3. Main Calendar Content Area */}
      <div className="min-h-[480px]">
        {currentView === 'month' && (
          <MonthView
            currentYear={currentYear}
            currentMonth={currentMonth}
            tasks={tasks}
            settings={calendarSettings}
            filters={filters}
            searchQuery={searchQuery}
            onTaskClick={setPopoverTask}
            onDropTask={handleDropTaskDate}
            onQuickAdd={handleQuickAdd}
          />
        )}

        {currentView === 'week' && (
          <WeekView
            selectedDate={selectedDate}
            tasks={tasks}
            settings={calendarSettings}
            filters={filters}
            searchQuery={searchQuery}
            onTaskClick={setPopoverTask}
            onDropTaskTime={handleDropTaskTime}
            onQuickAddSlot={handleQuickAdd}
            onResizeDuration={handleResizeDuration}
          />
        )}

        {currentView === 'day' && (
          <DayView
            selectedDate={selectedDate}
            tasks={tasks}
            settings={calendarSettings}
            filters={filters}
            searchQuery={searchQuery}
            onTaskClick={setPopoverTask}
            onDropTaskTime={handleDropTaskTime}
            onQuickAddSlot={handleQuickAdd}
            onResizeDuration={handleResizeDuration}
          />
        )}

        {currentView === 'agenda' && (
          <AgendaView
            tasks={tasks}
            settings={calendarSettings}
            filters={filters}
            searchQuery={searchQuery}
            onTaskClick={setPopoverTask}
          />
        )}
      </div>

      {/* 4. Calendar Legend */}
      <CalendarLegend />

      {/* Task Details Popover */}
      <CalendarTaskPopover
        task={popoverTask}
        isOpen={Boolean(popoverTask)}
        onClose={() => setPopoverTask(null)}
      />

      {/* Unscheduled Tasks Drawer */}
      <UnscheduledTasks
        isOpen={isUnscheduledOpen}
        onClose={() => setIsUnscheduledOpen(false)}
        onTaskClick={(task) => {
          setIsUnscheduledOpen(false);
          setPopoverTask(task);
        }}
      />

      {/* Calendar Settings Modal */}
      <CalendarSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={calendarSettings}
        onUpdateSettings={setCalendarSettings}
      />
    </div>
  );
}
