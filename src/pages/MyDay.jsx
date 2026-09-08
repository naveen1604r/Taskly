import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import { useFocusContext } from '../context/FocusContext';
import { usePlannerContext } from '../context/PlannerContext';
import { useInboxContext } from '../context/InboxContext';
import { useProjectContext } from '../context/ProjectContext';
import {
  getMyDayTaskSections,
  calculateMyDayWorkload,
  getMyDayGreeting,
} from '../../src/utils/myDayUtils';
import { getTodayDateString } from '../utils/taskStorage';
import { isTaskBlocked } from '../utils/dependencyUtils';

import DailyPlanAssistant from '../components/myday/DailyPlanAssistant';
import NeedsAttention from '../components/myday/NeedsAttention';
import TomorrowPreview from '../components/myday/TomorrowPreview';
import TodayHabitsSection from '../components/myday/TodayHabitsSection';
import QuickCaptureModal from '../components/inbox/QuickCaptureModal';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

import {
  Sun,
  Zap,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Lock,
  Play,
  PlayCircle,
  Repeat,
  AlertTriangle,
  FolderKanban,
  ArrowRight,
  Plus,
  Check,
  ChevronRight,
} from 'lucide-react';

export default function MyDay() {
  const navigate = useNavigate();
  const { tasks, toggleTaskStatus, updateTask, openCreateModal } = useTaskContext();
  const { dailyStats, totalFocusTimeToday, dailyFocusGoalMinutes = 120, startFocus, isTimerRunning, currentTaskId } =
    useFocusContext();
  const { getProject } = useProjectContext();
  const { openQuickCapture } = useInboxContext();

  const [isPlanAssistantOpen, setIsPlanAssistantOpen] = useState(false);

  const todayStr = getTodayDateString();
  const todayDateObj = new Date();
  const formattedTodayDate = todayDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Task Sections
  const sections = useMemo(() => getMyDayTaskSections(tasks), [tasks]);
  const allTodayTasks = [...sections.scheduled, ...sections.unscheduled];

  // Workload Status
  const workload = useMemo(() => calculateMyDayWorkload(allTodayTasks), [allTodayTasks]);

  // Greeting
  const greeting = useMemo(
    () =>
      getMyDayGreeting({
        totalToday: sections.totalTodayActive,
        completedCount: sections.completedToday.length,
        overdueCount: sections.overdue.length,
        workload: workload.status,
      }),
    [sections.totalTodayActive, sections.completedToday.length, sections.overdue.length, workload.status]
  );

  // Focus Minutes
  const todayFocusMinutes = Math.round(
    (totalFocusTimeToday || dailyStats?.totalDuration || 0) / 60
  );

  // Next Task
  const nextTask = useMemo(() => {
    return sections.scheduled.find((t) => t.status !== 'completed') || sections.unscheduled[0] || null;
  }, [sections.scheduled, sections.unscheduled]);

  // Quick Action: Move Overdue to Today
  const handleMoveToToday = (taskId) => {
    updateTask(taskId, { plannedDate: todayStr });
  };

  const handleStartTaskFocus = (taskId) => {
    startFocus(taskId);
    navigate(`/focus?task=${taskId}`);
  };

  return (
    <div className="space-y-6 sm:space-y-7 pb-20 animate-in fade-in duration-200">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c4b5fd] bg-[#7C3AED]/15 px-3 py-1 rounded-full border border-[#7C3AED]/25">
              <Sun className="w-3.5 h-3.5 text-[#7C3AED]" />
              {formattedTodayDate}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {greeting.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 max-w-xl">
            {greeting.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsPlanAssistantOpen(true)}
            icon={<Sparkles className="w-4 h-4 text-[#7C3AED]" />}
          >
            Plan My Day
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={openQuickCapture}
            icon={<Zap className="w-4 h-4 fill-current" />}
            className="shadow-glow-primary"
          >
            Quick Capture (Q)
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-[#11151F] border border-white/[0.06] space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Today's Tasks
          </span>
          <span className="text-xl font-black text-white font-mono">
            {sections.totalTodayActive + sections.completedToday.length}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#11151F] border border-white/[0.06] space-y-1">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
            Completed
          </span>
          <span className="text-xl font-black text-emerald-400 font-mono">
            {sections.completedToday.length}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#11151F] border border-white/[0.06] space-y-1">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
            Remaining
          </span>
          <span className="text-xl font-black text-amber-400 font-mono">
            {sections.totalTodayActive}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#11151F] border border-white/[0.06] space-y-1">
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
            Focus Time
          </span>
          <span className="text-xl font-black text-cyan-400 font-mono">
            {todayFocusMinutes}m
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#11151F] border border-white/[0.06] space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Daily Workload
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border inline-block ${workload.color}`}>
            {workload.status} ({workload.formattedWorkload})
          </span>
        </div>
      </div>

      {/* 3. Main Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Next Task, Task Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Task Card (Requirement 20) */}
          {nextTask && (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#7C3AED]/20 to-[#06B6D4]/10 border border-[#7C3AED]/30 shadow-glow-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.2 rounded-md bg-[#7C3AED] text-white font-bold text-[10px] uppercase">
                    Up Next
                  </span>
                  {nextTask.plannedStartTime && (
                    <span className="font-mono text-cyan-300 font-bold text-[11px]">
                      {nextTask.plannedStartTime}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-white truncate">{nextTask.title}</h3>
                <p className="text-slate-300 text-[11px] line-clamp-1">
                  {nextTask.description || `Estimated duration: ${nextTask.estimatedDuration || 30} minutes`}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStartTaskFocus(nextTask.id)}
                  icon={<Play className="w-3.5 h-3.5 fill-current" />}
                >
                  Start Focus
                </Button>
                <Link
                  to={`/tasks/${nextTask.id}`}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-semibold transition-colors"
                >
                  Details
                </Link>
              </div>
            </div>
          )}

          {/* Overdue Section */}
          {sections.overdue.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Overdue Backlog ({sections.overdue.length})</span>
                </h3>
              </div>

              <div className="space-y-2">
                {sections.overdue.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-2xl bg-[#171C27] border border-rose-500/25 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleTaskStatus(task.id)}
                        className="text-slate-400 hover:text-white shrink-0"
                      >
                        <Circle className="w-4 h-4 text-slate-500" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-white truncate block">{task.title}</span>
                        <span className="text-[10px] text-rose-400 font-mono">
                          Was due: {task.plannedDate || task.dueDate}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleMoveToToday(task.id)}
                      className="px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-[11px] shrink-0"
                    >
                      Move to Today
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Today's Habits Consistency Section */}
          <TodayHabitsSection />

          {/* Scheduled Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#06B6D4]" />
                <span>Scheduled Timeline ({sections.scheduled.length})</span>
              </h3>
              <Link to="/planner" className="text-xs text-[#7C3AED] hover:underline">
                Open Planner
              </Link>
            </div>

            {sections.scheduled.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#11151F]/40 border border-dashed border-white/[0.06] text-center text-slate-500 text-xs">
                No tasks with assigned start times for today.
              </div>
            ) : (
              <div className="space-y-2">
                {sections.scheduled.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.06] hover:border-white/[0.12] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleTaskStatus(task.id)}
                        className="text-slate-400 hover:text-white shrink-0"
                      >
                        <Circle className="w-4 h-4 text-slate-500 hover:text-[#7C3AED]" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-white truncate block">{task.title}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span className="text-cyan-400 font-bold">{task.plannedStartTime}</span>
                          <span>•</span>
                          <span>{task.estimatedDuration || 30}m</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartTaskFocus(task.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#7C3AED] hover:bg-[#7C3AED]/10 transition-colors"
                      title="Start Focus Session"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Unscheduled Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#7C3AED]" />
                <span>Unscheduled Deliverables ({sections.unscheduled.length})</span>
              </h3>
            </div>

            {sections.unscheduled.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#11151F]/40 border border-dashed border-white/[0.06] text-center text-slate-500 text-xs">
                All of today's tasks have assigned time blocks.
              </div>
            ) : (
              <div className="space-y-2">
                {sections.unscheduled.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.06] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleTaskStatus(task.id)}
                        className="text-slate-400 hover:text-white shrink-0"
                      >
                        <Circle className="w-4 h-4 text-slate-500 hover:text-[#7C3AED]" />
                      </button>
                      <span className="font-bold text-white truncate">{task.title}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartTaskFocus(task.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
                        title="Focus"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        to="/planner"
                        className="px-2.5 py-1 rounded-xl bg-[#7C3AED]/15 hover:bg-[#7C3AED] text-[#c4b5fd] hover:text-white font-semibold text-[11px] transition-colors"
                      >
                        Schedule
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Completed Section */}
          {sections.completedToday.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Completed Today ({sections.completedToday.length})</span>
              </h3>

              <div className="space-y-2 opacity-75">
                {sections.completedToday.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-2xl bg-[#11151F] border border-white/[0.04] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="line-through text-slate-400 truncate">{task.title}</span>
                    </div>
                    {task.completedAt && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right 1 Col: Focus Summary, Needs Attention, Tomorrow Snapshot */}
        <div className="lg:col-span-1 space-y-6">
          {/* Today Focus Goal Card */}
          <Card
            title="Today's Focus Time"
            subtitle={`${todayFocusMinutes}m of ${dailyFocusGoalMinutes}m goal`}
            action={
              <Link
                to="/focus"
                className="text-xs text-[#7C3AED] hover:text-[#c4b5fd] font-semibold transition-colors"
              >
                Focus Mode
              </Link>
            }
          >
            <div className="space-y-3 text-xs">
              <div className="w-full bg-[#171C27] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((todayFocusMinutes / dailyFocusGoalMinutes) * 100))}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Progress</span>
                <span className="font-mono font-bold text-white">
                  {Math.round((todayFocusMinutes / dailyFocusGoalMinutes) * 100)}%
                </span>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/focus')}
                className="w-full justify-center"
                icon={<Play className="w-3.5 h-3.5 fill-current" />}
              >
                {isTimerRunning ? 'Continue Active Timer' : 'Launch Focus Timer'}
              </Button>
            </div>
          </Card>

          {/* Needs Attention Risks */}
          <NeedsAttention
            overdueTasks={sections.overdue}
            todayTasks={allTodayTasks}
          />

          {/* Tomorrow Preview */}
          <TomorrowPreview />
        </div>
      </div>

      {/* Plan My Day Modal Assistant */}
      <DailyPlanAssistant
        isOpen={isPlanAssistantOpen}
        onClose={() => setIsPlanAssistantOpen(false)}
        tasks={tasks}
        workload={workload}
      />

      {/* Global Quick Capture Modal */}
      <QuickCaptureModal />
    </div>
  );
}
