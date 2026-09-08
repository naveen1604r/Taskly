import { Link } from 'react-router-dom';
import { useTaskContext } from '../../context/TaskContext';
import { useGoalsContext } from '../../context/GoalsContext';
import { usePlannerContext } from '../../context/PlannerContext';
import { useFocusContext } from '../../context/FocusContext';
import {
  formatTimeDisplay,
  calculateEndTime,
  formatDurationDisplay,
} from '../../utils/plannerUtils';
import { getTodayDateString, getOffsetDateString } from '../../utils/taskStorage';
import { calculateSubtaskProgress } from '../../utils/taskUtils';
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  Clock,
  Target,
  AlertTriangle,
  Calendar,
  MoreHorizontal,
  FileText,
  ArrowRight,
  XCircle,
  Flame,
  ListTodo,
} from 'lucide-react';

export default function PlannerTask({ task, isConflicting, isCurrentNow }) {
  const { toggleTaskStatus, setTaskStatus } = useTaskContext();
  const { goals } = useGoalsContext();
  const { openScheduleModal, removeFromPlan, carryForwardTask, selectedDate } = usePlannerContext();
  const { currentTaskId, timerStatus } = useFocusContext();

  const isFocusedNow = currentTaskId === task.id && timerStatus === 'running';

  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';

  const startTime = task.plannedStartTime || task.dueTime || '';
  const duration = task.estimatedDuration || task.duration || 0;
  const endTime = startTime && duration ? calculateEndTime(startTime, duration) : '';

  const linkedGoal = goals ? goals.find((g) => g.id === task.goalId) : null;
  const todayStr = getTodayDateString();
  const tomorrowStr = getOffsetDateString(1);

  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-200 ${
        isConflicting
          ? 'border-amber-500/50 bg-amber-500/5'
          : isCurrentNow
          ? 'border-[#22C55E]/50 bg-[#22C55E]/5 ring-1 ring-[#22C55E]/30'
          : isCompleted
          ? 'border-white/[0.04] bg-[#11151F]/60 opacity-75'
          : 'border-white/[0.08] bg-[#11151F] hover:border-white/[0.16]'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Side: Time, Checkbox, Title & Metadata */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Completion Toggle Button */}
          <button
            type="button"
            onClick={() => toggleTaskStatus(task.id)}
            className="mt-0.5 shrink-0 text-slate-400 hover:text-white transition-colors focus:outline-none"
            title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
            ) : (
              <Circle className="w-5 h-5 text-[#94A3B8] hover:text-white" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            {/* Top row: Time range, NOW badge, Conflict badge */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {startTime ? (
                <span className="text-xs font-mono font-bold text-white bg-[#171C27] px-2 py-0.5 rounded-md border border-white/[0.08]">
                  {formatTimeDisplay(startTime)}
                  {endTime && ` – ${formatTimeDisplay(endTime)}`}
                </span>
              ) : (
                <span className="text-xs text-slate-500 italic">No start time</span>
              )}

              {isCurrentNow && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/15 border border-[#22C55E]/30 px-2 py-0.2 rounded-full animate-pulse">
                  ● NOW
                </span>
              )}

              {isFocusedNow && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#7C3AED] bg-[#7C3AED]/15 border border-[#7C3AED]/30 px-2 py-0.2 rounded-full animate-pulse">
                  <Flame className="w-2.5 h-2.5" />
                  FOCUSED NOW
                </span>
              )}

              {isConflicting && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.2 rounded-full">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  Overlap
                </span>
              )}
            </div>

            {/* Title */}
            <Link
              to={`/tasks/${task.id}`}
              className={`text-sm font-bold tracking-tight truncate hover:text-[#c4b5fd] transition-colors block ${
                isCompleted ? 'text-slate-400 line-through' : 'text-white'
              }`}
            >
              {task.title}
            </Link>

            {/* Optional Planning Note */}
            {task.planningNotes && (
              <p className="text-xs text-[#06B6D4] bg-[#06B6D4]/5 border-l-2 border-[#06B6D4] px-2 py-1 rounded-r-md mt-1 italic line-clamp-1">
                "{task.planningNotes}"
              </p>
            )}

            {/* Metadata Pills: Priority, Duration, Subtasks, Goal, Category */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-[#94A3B8]">
              {/* Priority */}
              <span className="capitalize font-semibold text-slate-300">
                {task.priority} Priority
              </span>

              {/* Subtask completion (Requirement 28) */}
              {(() => {
                const subProgress = calculateSubtaskProgress(task);
                if (subProgress.total === 0) return null;
                return (
                  <span className="inline-flex items-center gap-1 text-[#c4b5fd] bg-[#7C3AED]/15 border border-[#7C3AED]/30 px-2 py-0.5 rounded-md font-semibold font-mono">
                    <ListTodo className="w-3 h-3 text-[#7C3AED]" />
                    <span>{subProgress.completed}/{subProgress.total} subtasks completed</span>
                  </span>
                );
              })()}

              {/* Estimated Duration */}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#06B6D4]" />
                <span>Est: {formatDurationDisplay(duration)}</span>
              </span>

              {/* Actual Duration */}
              {task.actualDuration > 0 && (
                <span className="flex items-center gap-1 text-[#22C55E] font-medium">
                  <Flame className="w-3 h-3 text-[#22C55E]" />
                  <span>Actual: {task.actualDuration}m</span>
                </span>
              )}

              {/* Linked Goal */}
              {linkedGoal && (
                <span className="flex items-center gap-1 text-[#F59E0B]">
                  <Target className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">{linkedGoal.title}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Task Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04] w-full sm:w-auto justify-end">
          {/* Start Focus Link */}
          {!isCompleted && (
            <Link
              to={`/focus?task=${task.id}`}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#c4b5fd] hover:text-white bg-[#7C3AED]/15 hover:bg-[#7C3AED]/30 border border-[#7C3AED]/30 transition-all flex items-center gap-1"
              title="Start focus session"
            >
              <Flame className="w-3 h-3 text-[#7C3AED]" />
              <span>Focus</span>
            </Link>
          )}
          {/* Start / Complete */}
          {!isCompleted && !isInProgress && (
            <button
              type="button"
              onClick={() => setTaskStatus(task.id, 'in_progress')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-[#171C27] hover:bg-[#1f2635] border border-white/[0.06] transition-colors"
              title="Start task"
            >
              Start
            </button>
          )}

          {/* Reschedule */}
          <button
            type="button"
            onClick={() => openScheduleModal(task)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#06B6D4] hover:bg-[#06B6D4]/10 border border-[#06B6D4]/20 transition-colors"
            title="Reschedule task"
          >
            Reschedule
          </button>

          {/* Carry Forward to Tomorrow (if on today or past date) */}
          {selectedDate <= todayStr && (
            <button
              type="button"
              onClick={() => carryForwardTask(task.id, tomorrowStr)}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
              title="Move to Tomorrow"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Remove from Plan */}
          <button
            type="button"
            onClick={() => removeFromPlan(task.id)}
            className="p-1 text-slate-500 hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
            title="Remove from plan (keeps task in task list)"
          >
            <XCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
