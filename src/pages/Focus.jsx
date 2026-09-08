import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import CircularTimer from '../components/focus/CircularTimer';
import FocusControls from '../components/focus/FocusControls';
import FocusSummary from '../components/focus/FocusSummary';
import DailyFocusGoal from '../components/focus/DailyFocusGoal';
import FocusSessionList from '../components/focus/FocusSessionList';
import FocusTaskSelector from '../components/focus/FocusTaskSelector';
import StopFocusModal from '../components/focus/StopFocusModal';
import FocusCompleteModal from '../components/focus/FocusCompleteModal';
import { useFocusContext } from '../context/FocusContext';
import { useTaskContext } from '../context/TaskContext';
import { formatFocusTime, formatDurationMinutes } from '../utils/focusUtils';
import {
  Flame,
  Clock,
  Tag,
  Target,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function Focus() {
  const [searchParams, setSearchParams] = useSearchParams();
  const taskIdParam = searchParams.get('task');

  const {
    currentTaskId,
    setCurrentTaskId,
    selectedTask,
    timerMode,
    timerStatus,
    remainingSeconds,
    currentModeTotalSeconds,
    currentSessionNumber,
    focusSettings,
    resumeFocus,
    resetFocus,
    setIsTaskSelectorOpen,
  } = useFocusContext();

  const { tasks } = useTaskContext();

  // Pick up task from query parameter if supplied
  useEffect(() => {
    if (taskIdParam && (!currentTaskId || currentTaskId !== taskIdParam)) {
      const exists = tasks.find((t) => t.id === taskIdParam);
      if (exists) {
        setCurrentTaskId(taskIdParam);
      }
    }
  }, [taskIdParam, tasks, currentTaskId, setCurrentTaskId]);

  const estimated = Number(selectedTask?.estimatedDuration || selectedTask?.duration) || 60;
  const actual = Number(selectedTask?.actualDuration) || 0;
  const remainingEst = Math.max(0, estimated - actual);

  return (
    <div className="space-y-6 sm:space-y-7 pb-14">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Focus Mode
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-[#7C3AED] bg-[#7C3AED]/10 border border-[#7C3AED]/20">
              <Flame className="w-3 h-3" />
              Pomodoro
            </span>
          </div>
          <p className="text-sm text-[#94A3B8] mt-1">
            Distraction-free focus sessions with automated Pomodoro cycles and time tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsTaskSelectorOpen(true)}
          >
            {selectedTask ? 'Switch Task' : 'Select Task'}
          </Button>
        </div>
      </div>

      {/* 2. Paused Session Notice Banner (Requirement 29) */}
      {timerStatus === 'paused' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-300">
                Paused Focus Session
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Task: <strong className="text-white">{selectedTask?.title || 'General Focus'}</strong> •{' '}
                <span className="font-mono">{formatFocusTime(remainingSeconds)}</span> remaining
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button variant="secondary" size="sm" onClick={resetFocus}>
              Discard
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={resumeFocus}
              icon={<Play className="w-3.5 h-3.5 fill-current" />}
            >
              Resume
            </Button>
          </div>
        </div>
      )}

      {/* 3. Main Split View: Current Task Info (Left) & Circular Timer Engine (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Task Context & Deliverable Details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-white/[0.08] relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Target Deliverable
                </span>
                <button
                  type="button"
                  onClick={() => setIsTaskSelectorOpen(true)}
                  className="text-xs text-[#7C3AED] hover:underline font-semibold"
                >
                  Change
                </button>
              </div>

              {selectedTask ? (
                <div className="space-y-3.5">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#7C3AED]/15 text-[#c4b5fd] border border-[#7C3AED]/30">
                        {selectedTask.priority} Priority
                      </span>
                      <span className="text-xs text-slate-400">
                        {selectedTask.category || 'General'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {selectedTask.title}
                    </h3>

                    {selectedTask.description && (
                      <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 leading-relaxed">
                        {selectedTask.description}
                      </p>
                    )}
                  </div>

                  {/* Time Comparison: Estimated vs Actual */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#171C27] border border-white/[0.04] text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-medium">Estimated</span>
                      <span className="text-sm font-bold text-[#06B6D4] font-mono mt-0.5 block">
                        {estimated}m
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-medium">Actual</span>
                      <span className="text-sm font-bold text-[#22C55E] font-mono mt-0.5 block">
                        {actual}m
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-medium">Remaining</span>
                      <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 block">
                        {remainingEst}m
                      </span>
                    </div>
                  </div>

                  {/* Schedule Details */}
                  {(selectedTask.plannedStartTime || selectedTask.dueDate) && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                      {selectedTask.plannedStartTime && (
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
                          <span>Planned: {selectedTask.plannedStartTime}</span>
                        </span>
                      )}
                      {selectedTask.dueDate && (
                        <span className="flex items-center gap-1">
                          <span>Due: {selectedTask.dueDate}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 italic text-xs space-y-3">
                  <p>No specific task selected. Focusing on open deep work.</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsTaskSelectorOpen(true)}
                  >
                    Select Task from Backlog
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Daily Focus Goal widget */}
          <DailyFocusGoal />
        </div>

        {/* Right Column: Pomodoro Circular Timer & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-white/[0.08] flex flex-col items-center justify-center py-6 sm:py-8 shadow-card">
            <CircularTimer
              remainingSeconds={remainingSeconds}
              currentModeTotalSeconds={currentModeTotalSeconds}
              timerMode={timerMode}
              timerStatus={timerStatus}
              currentSessionNumber={currentSessionNumber}
              sessionsBeforeLongBreak={focusSettings.sessionsBeforeLongBreak || 4}
            />

            {/* Controls */}
            <FocusControls />
          </Card>
        </div>
      </div>

      {/* 4. Productivity Summary & Today's Sessions */}
      <FocusSummary />
      <FocusSessionList />

      {/* Modals */}
      <FocusTaskSelector />
      <StopFocusModal />
      <FocusCompleteModal />
    </div>
  );
}
