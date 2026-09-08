import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTaskContext } from '../../context/TaskContext';
import { useFocusContext } from '../../context/FocusContext';
import { useProjectContext } from '../../context/ProjectContext';
import { isTaskBlocked, getBlockingTasks } from '../../utils/dependencyUtils';
import { calculateSubtaskProgress } from '../../utils/taskUtils';
import { calculateTaskEndTime } from '../../utils/calendarUtils';
import {
  X,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Play,
  Edit,
  ExternalLink,
  Lock,
  Repeat,
  AlertTriangle,
  FolderKanban,
  Target,
  ListTodo,
} from 'lucide-react';
import Button from '../common/Button';

const priorityColors = {
  high: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/25',
  medium: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25',
  low: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/25',
};

export default function CalendarTaskPopover({ task, isOpen, onClose }) {
  const navigate = useNavigate();
  const { tasks, toggleTaskStatus, openEditModal, updateTask } = useTaskContext();
  const { startFocus } = useFocusContext();
  const { getProject } = useProjectContext();

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(task?.plannedDate || task?.dueDate || '');
  const [newTime, setNewTime] = useState(task?.plannedStartTime || '09:00');

  if (!isOpen || !task) return null;

  const isCompleted = task.status === 'completed';
  const isBlocked = isTaskBlocked(task, tasks);
  const blockers = getBlockingTasks(task, tasks);
  const subProgress = calculateSubtaskProgress(task);
  const linkedProject = task.projectId ? getProject(task.projectId) : null;
  const duration = Number(task.estimatedDuration || task.duration) || 30;
  const endTime = calculateTaskEndTime(task.plannedStartTime || '09:00', duration);

  const handleStartFocus = () => {
    startFocus(task.id);
    navigate(`/focus?task=${task.id}`);
  };

  const handleSaveReschedule = () => {
    updateTask(task.id, {
      plannedDate: newDate,
      plannedStartTime: newTime,
    });
    setIsRescheduling(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md bg-[#11151F] border border-white/[0.1] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => toggleTaskStatus(task.id)}
              className="text-slate-400 hover:text-white transition-colors shrink-0"
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
              ) : (
                <Circle className="w-5 h-5 text-slate-500 hover:text-[#7C3AED]" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <h3
                className={`text-base font-bold truncate ${
                  isCompleted ? 'line-through text-slate-400' : 'text-white'
                }`}
              >
                {task.title}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                <span
                  className={`px-2 py-0.2 rounded-md font-semibold uppercase border ${
                    priorityColors[task.priority] || priorityColors.medium
                  }`}
                >
                  {task.priority}
                </span>

                {isBlocked && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#F59E0B] bg-[#F59E0B]/15 px-2 py-0.2 rounded-md border border-[#F59E0B]/30">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Blocked ({blockers.length})</span>
                  </span>
                )}

                {task.recurringId && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-300 bg-purple-500/15 px-2 py-0.2 rounded-md border border-purple-500/30">
                    <Repeat className="w-2.5 h-2.5" />
                    <span>Recurring</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.06]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Grid */}
        <div className="space-y-2.5">
          {task.description && (
            <p className="text-slate-300 leading-relaxed bg-[#171C27]/50 p-2.5 rounded-xl border border-white/[0.04]">
              {task.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-[#171C27] border border-white/[0.04] space-y-0.5">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Schedule</span>
              <div className="flex items-center gap-1 text-white font-mono">
                <Calendar className="w-3 h-3 text-[#06B6D4]" />
                <span>{task.plannedDate || task.dueDate || 'Unscheduled'}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#171C27] border border-white/[0.04] space-y-0.5">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Time Slot</span>
              <div className="flex items-center gap-1 text-white font-mono">
                <Clock className="w-3 h-3 text-[#7C3AED]" />
                <span>
                  {task.plannedStartTime
                    ? `${task.plannedStartTime} - ${endTime} (${duration}m)`
                    : `${duration}m`}
                </span>
              </div>
            </div>
          </div>

          {/* Project & Goal Link */}
          <div className="flex flex-wrap items-center gap-2">
            {linkedProject && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#171C27] border border-white/[0.06] text-slate-300">
                <FolderKanban className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span className="font-semibold">{linkedProject.name}</span>
              </div>
            )}
            {subProgress.total > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#171C27] border border-white/[0.06] text-[#06B6D4]">
                <ListTodo className="w-3.5 h-3.5" />
                <span className="font-semibold">
                  {subProgress.completed}/{subProgress.total} subtasks
                </span>
              </div>
            )}
          </div>

          {/* Quick Reschedule Drawer */}
          {isRescheduling && (
            <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.08] space-y-2 animate-in fade-in duration-150">
              <span className="font-bold text-white block">Reschedule Deliverable</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-[#11151F] border border-white/[0.08] rounded-lg px-2 py-1 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block">Start Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-[#11151F] border border-white/[0.08] rounded-lg px-2 py-1 text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsRescheduling(false)}
                  className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveReschedule}
                  className="px-3 py-1 rounded-lg bg-[#7C3AED] text-white font-bold"
                >
                  Save Schedule
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/[0.08]">
          <div className="flex items-center gap-1.5">
            {!isCompleted && (
              <button
                type="button"
                onClick={handleStartFocus}
                className="px-3 py-1.5 rounded-xl bg-[#7C3AED]/20 hover:bg-[#7C3AED] text-[#c4b5fd] hover:text-white border border-[#7C3AED]/30 font-semibold transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Focus</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                openEditModal(task);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Edit Task"
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsRescheduling(!isRescheduling)}
              className="px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-1 font-semibold"
            >
              <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Reschedule</span>
            </button>
          </div>

          <Link
            to={`/tasks/${task.id}`}
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold transition-colors flex items-center gap-1.5"
          >
            <span>Full Details</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
