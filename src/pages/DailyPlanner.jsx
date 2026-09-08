import React, { useState, useMemo, useRef } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { usePlannerContext } from '../context/PlannerContext';
import { useSettingsContext } from '../context/SettingsContext';
import PlannerHeader from '../components/planner/PlannerHeader';
import PlannerSummary from '../components/planner/PlannerSummary';
import WorkloadIndicator from '../components/planner/WorkloadIndicator';
import NextTask from '../components/planner/NextTask';
import ConflictWarning from '../components/planner/ConflictWarning';
import PlannerTimeline from '../components/planner/PlannerTimeline';
import PlannerTaskList from '../components/planner/PlannerTaskList';
import UnscheduledTasks from '../components/planner/UnscheduledTasks';
import DailySummary from '../components/planner/DailySummary';
import UpcomingWorkload from '../components/planner/UpcomingWorkload';
import ScheduleTaskModal from '../components/planner/ScheduleTaskModal';
import PlannerEmptyState from '../components/planner/PlannerEmptyState';
import {
  getTasksForDate,
  detectTimeConflicts,
  getCurrentAndNextTask,
} from '../utils/plannerUtils';
import { getTodayDateString } from '../utils/taskStorage';
import { Plus, Sparkles, ArrowDown } from 'lucide-react';

export default function DailyPlanner() {
  const { tasks, addTask } = useTaskContext();
  const { selectedDate, plannerView, openScheduleModal } = usePlannerContext();
  const { settings } = useSettingsContext();

  const [quickInput, setQuickInput] = useState('');
  const unscheduledRef = useRef(null);

  const todayStr = getTodayDateString();
  const isToday = selectedDate === todayStr;

  // Filter tasks for the selected date
  const dayTasks = useMemo(() => {
    return getTasksForDate(tasks, selectedDate);
  }, [tasks, selectedDate]);

  // Detect time conflicts among scheduled tasks
  const conflicts = useMemo(() => {
    return detectTimeConflicts(dayTasks);
  }, [dayTasks]);

  // Get active NOW task
  const { currentTask } = useMemo(() => {
    return getCurrentAndNextTask(dayTasks, isToday);
  }, [dayTasks, isToday]);

  // Quick Add input handler
  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    const defaultPriority = settings?.preferences?.defaultTaskPriority || 'medium';
    const defaultStatus = settings?.preferences?.defaultTaskStatus || 'pending';

    addTask({
      title: quickInput.trim(),
      priority: defaultPriority,
      status: defaultStatus,
      plannedDate: selectedDate,
      dueDate: selectedDate,
      duration: 30,
      durationUnit: 'minutes',
      estimatedDuration: 30,
    });

    setQuickInput('');
  };

  const handleScrollToUnscheduled = () => {
    unscheduledRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 sm:space-y-7 pb-14">
      {/* 1. Header with Date Controls & Add Task */}
      <PlannerHeader />

      {/* 2. Quick Add Bar */}
      <form onSubmit={handleQuickAdd} className="relative">
        <input
          type="text"
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          placeholder={`What needs to be done on this date? Type and press Enter...`}
          className="w-full pl-11 pr-24 py-3 text-xs sm:text-sm bg-[#11151F] hover:bg-[#171C27] focus:bg-[#171C27] text-white placeholder-slate-500 rounded-2xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none shadow-subtle transition-all"
        />
        <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <button
          type="submit"
          disabled={!quickInput.trim()}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 disabled:hover:bg-[#7C3AED] text-white transition-all shadow-xs"
        >
          Add to Day
        </button>
      </form>

      {/* 3. Planner Summary (4 dynamic metric cards) */}
      <PlannerSummary />

      {/* 4. Conflict Warning (if overlapping tasks exist) */}
      <ConflictWarning
        conflicts={conflicts}
        onResolveMove={(task) => openScheduleModal(task)}
      />

      {/* 5. Live Next Task & Workload Indicator (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <NextTask />
        <WorkloadIndicator />
      </div>

      {/* 6. Main Split Layout: Scheduled Plan (Left 2 cols) & Unscheduled Tray (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Scheduled Tasks (Timeline or List) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">
              {plannerView === 'timeline' ? "Day's Timeline Schedule" : "Day's Planned Tasks"}
            </h3>
            <span className="text-xs text-slate-400">
              {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'} scheduled
            </span>
          </div>

          {dayTasks.length === 0 ? (
            <PlannerEmptyState onScheduleExisting={handleScrollToUnscheduled} />
          ) : plannerView === 'timeline' ? (
            <PlannerTimeline
              tasks={dayTasks}
              conflicts={conflicts}
              currentTaskId={currentTask?.id}
            />
          ) : (
            <PlannerTaskList
              tasks={dayTasks}
              conflicts={conflicts}
              currentTaskId={currentTask?.id}
            />
          )}
        </div>

        {/* Right: Unscheduled Tasks Tray */}
        <div ref={unscheduledRef} className="lg:col-span-1 sticky top-20">
          <UnscheduledTasks />
        </div>
      </div>

      {/* 7. Upcoming Trajectory & Daily Completion Summary */}
      <UpcomingWorkload />
      <DailySummary />

      {/* Schedule Task Modal */}
      <ScheduleTaskModal />
    </div>
  );
}
