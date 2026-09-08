import React, { createContext, useContext, useState, useMemo } from 'react';
import { useTaskContext } from './TaskContext';
import { useSettingsContext } from './SettingsContext';
import { getTodayDateString, getOffsetDateString } from '../utils/taskStorage';

const PlannerContext = createContext(null);

export function PlannerProvider({ children }) {
  const { tasks, updateTask, showToast } = useTaskContext();
  const { settings, updateSetting } = useSettingsContext();

  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Planner View Mode: 'timeline' | 'list'
  const [plannerView, setPlannerView] = useState('timeline');

  // Planner Sort Mode: 'time' | 'priority' | 'due_date' | 'duration'
  const [sortMode, setSortMode] = useState('time');

  // Working Hours (default 8)
  const workingHours = settings?.preferences?.dailyWorkingHours || 8;

  const setWorkingHours = (hours) => {
    updateSetting('preferences', 'dailyWorkingHours', Number(hours) || 8);
  };

  // Schedule Task Modal state
  const [schedulingTask, setSchedulingTask] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Date Navigation Helpers
  const goToToday = () => setSelectedDate(getTodayDateString());

  const goToPreviousDay = () => {
    setSelectedDate((prev) => {
      const parts = prev.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      d.setDate(d.getDate() - 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    });
  };

  const goToNextDay = () => {
    setSelectedDate((prev) => {
      const parts = prev.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      d.setDate(d.getDate() + 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    });
  };

  // Modal actions
  const openScheduleModal = (task) => {
    setSchedulingTask(task);
    setIsScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setSchedulingTask(null);
    setIsScheduleModalOpen(false);
  };

  // Save Schedule: updates task with planning fields
  const saveSchedule = (taskId, scheduleData) => {
    const { plannedDate, plannedStartTime, estimatedDuration, planningNotes } = scheduleData;
    updateTask(taskId, {
      plannedDate: plannedDate || selectedDate,
      plannedStartTime: plannedStartTime || '',
      estimatedDuration: Number(estimatedDuration) || 0,
      duration: Number(estimatedDuration) || undefined, // keep existing duration compatible
      planningNotes: planningNotes || '',
    });
    closeScheduleModal();
    showToast('Task schedule updated', 'success');
  };

  // Remove from Plan: clears planning fields without deleting the task
  const removeFromPlan = (taskId) => {
    updateTask(taskId, {
      plannedDate: null,
      plannedStartTime: null,
      planningNotes: null,
    });
    showToast('Task removed from plan', 'info');
  };

  // Carry Forward: moves planned task to today or tomorrow
  const carryForwardTask = (taskId, targetDateStr) => {
    updateTask(taskId, {
      plannedDate: targetDateStr,
    });
    showToast(`Task moved to ${targetDateStr === todayStr ? 'Today' : 'Tomorrow'}`, 'success');
  };

  const value = {
    selectedDate,
    setSelectedDate,
    goToToday,
    goToPreviousDay,
    goToNextDay,
    plannerView,
    setPlannerView,
    sortMode,
    setSortMode,
    workingHours,
    setWorkingHours,
    schedulingTask,
    isScheduleModalOpen,
    openScheduleModal,
    closeScheduleModal,
    saveSchedule,
    removeFromPlan,
    carryForwardTask,
  };

  return (
    <PlannerContext.Provider value={value}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlannerContext() {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlannerContext must be used within a PlannerProvider');
  }
  return context;
}
