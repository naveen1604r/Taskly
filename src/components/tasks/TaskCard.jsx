import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTaskContext } from '../../context/TaskContext';
import { useGoalsContext } from '../../context/GoalsContext';
import { useSettingsContext } from '../../context/SettingsContext';
import { useTemplateContext } from '../../context/TemplateContext';
import { useRecurringTaskContext } from '../../context/RecurringTaskContext';
import { getTodayDateString } from '../../utils/taskStorage';
import { calculateSubtaskProgress } from '../../utils/taskUtils';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Tag,
  Target,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronDown,
  Repeat,
  Layers,
  FastForward,
  Flame,
  ListTodo,
  ExternalLink,
} from 'lucide-react';

const priorityConfig = {
  high: {
    label: 'HIGH',
    styles: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/25',
    dot: 'bg-[#EF4444]',
  },
  medium: {
    label: 'MEDIUM',
    styles: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25',
    dot: 'bg-[#F59E0B]',
  },
  low: {
    label: 'LOW',
    styles: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/25',
    dot: 'bg-[#22C55E]',
  },
};

const statusConfig = {
  pending: {
    label: 'Pending',
    styles: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  in_progress: {
    label: 'In Progress',
    styles: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/20',
  },
  completed: {
    label: 'Completed',
    styles: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20',
  },
};

export default function TaskCard({ task }) {
  const { toggleTaskStatus, setTaskStatus, openEditModal, openDeleteModal } = useTaskContext();
  const { goals } = useGoalsContext();
  const { settings } = useSettingsContext();
  const { createTemplateFromTask } = useTemplateContext();
  const { skipOccurrence } = useRecurringTaskContext();
  const showTaskDescriptions = settings?.tasks?.showTaskDescriptions ?? true;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const linkedGoal = goals ? goals.find((g) => g.id === task.goalId) : null;

  const isCompleted = task.status === 'completed';
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const statusInfo = statusConfig[task.status] || statusConfig.pending;

  // Format date presentation
  const today = getTodayDateString();
  let dateDisplay = task.dueDate;
  if (task.dueDate === today) {
    dateDisplay = 'Today';
  } else if (task.dueDate) {
    try {
      const parts = task.dueDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        dateDisplay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch {
      dateDisplay = task.dueDate;
    }
  }

  // Format time presentation
  let timeDisplay = '';
  if (task.dueTime) {
    const [h, m] = task.dueTime.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    timeDisplay = `${formattedHour}:${m} ${ampm}`;
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <div
      className={`
        relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 group
        ${isCompleted
          ? 'bg-[#11151F]/60 border-white/[0.04] opacity-80'
          : 'bg-[#11151F] border-white/[0.08] hover:border-white/[0.16] shadow-card hover:shadow-hover'
        }
      `}
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        {/* Left: Checkbox & Main Info */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Custom Animated Checkbox */}
          <button
            type="button"
            onClick={() => toggleTaskStatus(task.id)}
            className="mt-0.5 shrink-0 rounded-lg p-0.5 text-slate-400 hover:text-white transition-colors focus:outline-none"
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-[#22C55E] transition-transform scale-105" />
            ) : (
              <Circle className="w-5 h-5 text-[#94A3B8] hover:text-white transition-colors" />
            )}
          </button>

          {/* Title & Description */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Link
                to={`/tasks/${task.id}`}
                className={`text-base font-semibold tracking-tight transition-colors hover:text-[#c4b5fd] ${
                  isCompleted ? 'text-slate-400 line-through' : 'text-white'
                }`}
              >
                {task.title}
              </Link>

              {task.recurringTaskId && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-[#7C3AED] bg-[#7C3AED]/15 border border-[#7C3AED]/25"
                  title="Generated from recurring routine"
                >
                  <Repeat className="w-2.5 h-2.5" />
                  <span>Routine</span>
                </span>
              )}
            </div>

            {showTaskDescriptions && task.description && (
              <p
                className={`text-xs sm:text-sm mt-1 leading-relaxed line-clamp-2 ${
                  isCompleted ? 'text-slate-500' : 'text-[#94A3B8]'
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Subtask Progress Bar (Section 26) */}
            {(() => {
              const subProgress = calculateSubtaskProgress(task);
              if (subProgress.total === 0) return null;
              return (
                <div className="mt-2.5 flex items-center gap-2.5">
                  <div className="w-24 sm:w-32 h-1.5 bg-[#171C27] rounded-full overflow-hidden border border-white/[0.08]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        subProgress.isAllCompleted ? 'bg-[#22C55E]' : 'bg-[#7C3AED]'
                      }`}
                      style={{ width: `${subProgress.percentage}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 font-medium">
                    {subProgress.completed}/{subProgress.total} subtasks ({subProgress.percentage}%)
                  </span>
                </div>
              );
            })()}

            {/* Metadata Pills: Category, Duration, Date, Time */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-[#94A3B8]">
              {/* Category */}
              {task.category && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#171C27] border border-white/[0.08] text-slate-300 font-medium">
                  <Tag className="w-3 h-3 text-[#7C3AED]" />
                  <span>{task.category}</span>
                </span>
              )}

              {/* Duration */}
              {task.duration && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#171C27] border border-white/[0.08] text-slate-300">
                  <Clock className="w-3 h-3 text-[#06B6D4]" />
                  <span>
                    {task.duration} {task.durationUnit || 'mins'}
                  </span>
                </span>
              )}

              {/* Due Date & Time */}
              {task.dueDate && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#171C27] border border-white/[0.08] text-slate-300">
                  <Calendar className="w-3 h-3 text-[#F59E0B]" />
                  <span>
                    {dateDisplay}
                    {timeDisplay ? ` • ${timeDisplay}` : ''}
                  </span>
                </span>
              )}

              {/* Actual Focus Duration */}
              {task.actualDuration > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]">
                  <Flame className="w-3 h-3 text-[#22C55E]" />
                  <span>Actual: {task.actualDuration}m</span>
                </span>
              )}

              {/* Linked Goal */}
              {linkedGoal && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#c4b5fd] font-medium">
                  <Target className="w-3 h-3 text-[#7C3AED]" />
                  <span className="max-w-[140px] truncate">{linkedGoal.title}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Priority, Status Selector, & Menu Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Priority Badge */}
          <span
            className={`hidden xs:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wider border ${priority.styles}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
            {priority.label}
          </span>

          {/* Interactive Status Selector */}
          <div className="relative">
            <select
              value={task.status}
              onChange={(e) => setTaskStatus(task.id, e.target.value)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border appearance-none pr-6 cursor-pointer bg-[#171C27] focus:outline-none transition-colors ${statusInfo.styles}`}
            >
              <option value="pending" className="bg-[#171C27] text-white">Pending</option>
              <option value="in_progress" className="bg-[#171C27] text-white">In Progress</option>
              <option value="completed" className="bg-[#171C27] text-white">Completed</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Three-Dot Actions Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors focus:outline-none"
              aria-label="More actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-40 bg-[#171C27] border border-white/[0.12] rounded-xl shadow-hover py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                <Link
                  to={`/tasks/${task.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-white hover:text-[#c4b5fd] hover:bg-[#7C3AED]/20 transition-colors text-left"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>View Details</span>
                </Link>
                <Link
                  to={`/focus?task=${task.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#c4b5fd] hover:text-white hover:bg-[#7C3AED]/20 transition-colors text-left"
                >
                  <Flame className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Start Focus</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openEditModal(task);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    const name = window.prompt('Enter template name:', task.title);
                    if (name && name.trim()) {
                      createTemplateFromTask(task, name.trim());
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
                >
                  <Layers className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Save as Template</span>
                </button>
                {task.recurringTaskId && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      const dateStr = task.plannedDate || task.dueDate || task.occurrenceDate;
                      if (dateStr) {
                        skipOccurrence(task.recurringTaskId, dateStr);
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-amber-400 hover:bg-amber-500/10 transition-colors text-left"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    <span>Skip Occurrence</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openDeleteModal(task);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
