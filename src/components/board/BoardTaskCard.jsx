import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTaskContext } from '../../context/TaskContext';
import { useFocusContext } from '../../context/FocusContext';
import { useBoardContext } from '../../context/BoardContext';
import { useProjectContext } from '../../context/ProjectContext';
import MoveTaskMenu from './MoveTaskMenu';
import { calculateSubtaskProgress } from '../../utils/taskUtils';
import { isTaskOverdue } from '../../utils/filterUtils';
import { isTaskBlocked } from '../../utils/dependencyUtils';
import {
  Clock,
  Play,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ListTodo,
  Tag,
  GripVertical,
  Lock,
  FolderKanban,
} from 'lucide-react';

const priorityColors = {
  high: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/25',
  medium: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25',
  low: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/25',
};

export default function BoardTaskCard({
  task,
  index,
  columnId,
  onDragStart,
  onDragEnter,
}) {
  const navigate = useNavigate();
  const { tasks, toggleTaskStatus, openEditModal, openDeleteModal } = useTaskContext();
  const { startFocus } = useFocusContext();
  const { boardView, moveTaskStatus, draggedTaskId } = useBoardContext();
  const { getProject } = useProjectContext();

  const isCompleted = task.status === 'completed';
  const isOverdue = isTaskOverdue(task);
  const isBlocked = isTaskBlocked(task, tasks);
  const linkedProject = task.projectId ? getProject(task.projectId) : null;
  const subProgress = calculateSubtaskProgress(task);
  const priorityClass = priorityColors[task.priority] || priorityColors.medium;
  const isDragging = draggedTaskId === task.id;

  const estimated = Number(task.estimatedDuration || task.duration) || 30;
  const actual = Number(task.actualDuration) || 0;

  const handleStartFocus = (e) => {
    e.stopPropagation();
    if (task.status === 'pending') {
      moveTaskStatus(task.id, 'in_progress');
    }
    startFocus(task.id);
    navigate(`/focus?task=${task.id}`);
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(task.id, columnId, index);
  };

  const isCompact = boardView === 'compact';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnter={() => onDragEnter && onDragEnter(index)}
      className={`group relative p-3 sm:p-3.5 rounded-2xl border transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${
        isDragging
          ? 'opacity-40 scale-95 border-dashed border-[#7C3AED] bg-[#171C27]/50'
          : isCompleted
          ? 'bg-[#171C27]/60 border-white/[0.04] opacity-80 hover:opacity-100 hover:border-white/[0.14]'
          : isBlocked
          ? 'bg-[#171C27] border-[#F59E0B]/30 hover:border-[#F59E0B]/60 shadow-subtle'
          : isOverdue
          ? 'bg-[#171C27] border-[#EF4444]/30 hover:border-[#EF4444]/60 shadow-subtle'
          : 'bg-[#171C27] border-white/[0.08] hover:border-white/[0.18] shadow-card'
      }`}
    >
      {/* Top row: Status checkbox, Priority, Blocked/Overdue, Actions Menu */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleTaskStatus(task.id);
            }}
            className="text-slate-400 hover:text-white transition-colors focus:outline-none shrink-0"
            aria-label={`Toggle task completion for ${task.title}`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500 hover:text-[#7C3AED]" />
            )}
          </button>

          <span
            className={`px-2 py-0.2 rounded-md font-semibold text-[10px] uppercase border tracking-wider ${priorityClass}`}
          >
            {task.priority}
          </span>

          {isBlocked && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#F59E0B] bg-[#F59E0B]/15 px-1.5 py-0.2 rounded-md border border-[#F59E0B]/30 shrink-0">
              <Lock className="w-2.5 h-2.5" />
              <span>Blocked</span>
            </span>
          )}

          {isOverdue && !isBlocked && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#EF4444] bg-[#EF4444]/15 px-1.5 py-0.2 rounded-md border border-[#EF4444]/30 shrink-0">
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>Overdue</span>
            </span>
          )}

          {linkedProject && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-300 bg-white/[0.04] px-1.5 py-0.2 rounded-md truncate max-w-[100px]">
              <FolderKanban className="w-2.5 h-2.5 text-[#7C3AED]" />
              <span className="truncate">{linkedProject.name}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <MoveTaskMenu
            task={task}
            onOpenDetails={() => navigate(`/tasks/${task.id}`)}
            onEdit={() => openEditModal(task)}
            onDelete={() => openDeleteModal(task)}
          />
        </div>
      </div>

      {/* Title & Preview */}
      <div className="mb-2">
        <Link
          to={`/tasks/${task.id}`}
          onClick={(e) => e.stopPropagation()}
          className={`text-xs sm:text-sm font-bold hover:text-[#c4b5fd] transition-colors line-clamp-2 block ${
            isCompleted ? 'text-slate-400 line-through' : 'text-white'
          }`}
        >
          {task.title}
        </Link>

        {!isCompact && task.description && (
          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
            {task.description}
          </p>
        )}
      </div>

      {/* Subtask progress bar */}
      {subProgress.total > 0 && (
        <div className="space-y-1 mb-2.5 bg-[#11151F]/60 p-2 rounded-xl border border-white/[0.03]">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <ListTodo className="w-3 h-3 text-[#06B6D4]" />
              <span>{subProgress.completed}/{subProgress.total} subtasks</span>
            </span>
            <span className="font-mono text-slate-300">{subProgress.percentage}%</span>
          </div>
          <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full transition-all"
              style={{ width: `${subProgress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom info row: Category/Tags, Duration, Due Date, and Focus Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.04] text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-1.5">
          {task.category && (
            <span className="text-[10px] font-semibold text-slate-300 bg-white/[0.04] px-2 py-0.5 rounded-lg">
              {task.category}
            </span>
          )}

          <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
            <Clock className="w-3 h-3 text-[#06B6D4]" />
            <span>{estimated}m</span>
          </span>

          {task.dueDate && (
            <span className="font-mono text-[10px] text-slate-400">
              {task.dueDate}
            </span>
          )}
        </div>

        {/* Start Focus Launcher */}
        {!isCompleted && (
          <button
            type="button"
            onClick={handleStartFocus}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#7C3AED]/15 hover:bg-[#7C3AED] text-[#c4b5fd] hover:text-white border border-[#7C3AED]/30 transition-all font-semibold text-[11px] shrink-0 shadow-xs"
            title="Start Pomodoro focus"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Focus</span>
          </button>
        )}
      </div>
    </div>
  );
}
