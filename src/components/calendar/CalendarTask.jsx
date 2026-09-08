import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { useProjectContext } from '../../context/ProjectContext';
import { isTaskBlocked } from '../../utils/dependencyUtils';
import { isTaskOverdue } from '../../utils/filterUtils';
import { calculateTaskEndTime } from '../../utils/calendarUtils';
import {
  CheckCircle2,
  Lock,
  Repeat,
  AlertTriangle,
  FolderKanban,
  Clock,
} from 'lucide-react';

const priorityColors = {
  high: { border: 'border-[#EF4444]', dot: 'bg-[#EF4444]', bg: 'bg-[#EF4444]/10' },
  medium: { border: 'border-[#F59E0B]', dot: 'bg-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
  low: { border: 'border-[#22C55E]', dot: 'bg-[#22C55E]', bg: 'bg-[#22C55E]/10' },
};

export default function CalendarTask({
  task,
  view = 'month', // 'month' | 'week' | 'day' | 'agenda'
  onClick,
  onResizeDuration,
}) {
  const { tasks } = useTaskContext();
  const { getProject } = useProjectContext();

  const [isResizing, setIsResizing] = useState(false);

  const isCompleted = task.status === 'completed';
  const isBlocked = isTaskBlocked(task, tasks);
  const isOverdue = isTaskOverdue(task);
  const linkedProject = task.projectId ? getProject(task.projectId) : null;
  const pConfig = priorityColors[task.priority] || priorityColors.medium;
  const duration = Number(task.estimatedDuration || task.duration) || 30;

  const handleDragStart = (e) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.setData('application/json', JSON.stringify({ taskId: task.id }));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Month View Chip
  if (view === 'month') {
    return (
      <div
        draggable
        onDragStart={handleDragStart}
        onClick={(e) => {
          e.stopPropagation();
          onClick && onClick(task);
        }}
        className={`group px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center justify-between gap-1.5 transition-all cursor-pointer select-none border ${
          isCompleted
            ? 'bg-[#171C27]/60 border-white/[0.04] text-slate-500 opacity-70 line-through'
            : isBlocked
            ? 'bg-[#171C27] border-[#F59E0B]/40 text-amber-300 hover:border-[#F59E0B]'
            : isOverdue
            ? 'bg-[#171C27] border-[#EF4444]/40 text-rose-300 hover:border-[#EF4444]'
            : 'bg-[#171C27] border-white/[0.08] text-white hover:border-[#7C3AED] hover:bg-[#1f2635]'
        }`}
        style={{
          borderLeftColor: linkedProject?.color || undefined,
          borderLeftWidth: linkedProject ? 3 : 1,
        }}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${pConfig.dot}`} />
          <span className="truncate">{task.title}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isBlocked && <Lock className="w-2.5 h-2.5 text-[#F59E0B]" />}
          {task.recurringId && <Repeat className="w-2.5 h-2.5 text-purple-400" />}
          {isOverdue && !isBlocked && !isCompleted && (
            <AlertTriangle className="w-2.5 h-2.5 text-[#EF4444]" />
          )}
        </div>
      </div>
    );
  }

  // Week / Day View Block
  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={(e) => {
        e.stopPropagation();
        onClick && onClick(task);
      }}
      className={`group relative p-2 rounded-xl text-xs flex flex-col justify-between transition-all cursor-pointer select-none border shadow-xs h-full ${
        isCompleted
          ? 'bg-[#171C27]/70 border-white/[0.04] text-slate-400 opacity-80'
          : isBlocked
          ? 'bg-[#171C27] border-[#F59E0B]/40 text-white hover:border-[#F59E0B]'
          : isOverdue
          ? 'bg-[#171C27] border-[#EF4444]/40 text-white hover:border-[#EF4444]'
          : 'bg-[#171C27] border-white/[0.1] text-white hover:border-[#7C3AED] hover:bg-[#1f2635]'
      }`}
      style={{
        borderLeftColor: linkedProject?.color || '#7C3AED',
        borderLeftWidth: 3,
      }}
    >
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <div className="flex items-center gap-1 min-w-0">
            {isCompleted ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
            ) : (
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${pConfig.dot}`} />
            )}
            <span
              className={`font-bold text-[11px] sm:text-xs truncate ${
                isCompleted ? 'line-through text-slate-400' : 'text-white'
              }`}
            >
              {task.title}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isBlocked && <Lock className="w-3 h-3 text-[#F59E0B]" />}
            {task.recurringId && <Repeat className="w-3 h-3 text-purple-400" />}
          </div>
        </div>

        {task.plannedStartTime && (
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
            <Clock className="w-2.5 h-2.5 text-[#06B6D4]" />
            <span>
              {task.plannedStartTime} - {calculateTaskEndTime(task.plannedStartTime, duration)}
            </span>
          </div>
        )}

        {linkedProject && (
          <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-1 truncate">
            <FolderKanban className="w-2.5 h-2.5 text-[#7C3AED]" />
            <span className="truncate">{linkedProject.name}</span>
          </div>
        )}
      </div>

      {/* Bottom Resize Handle */}
      {onResizeDuration && (
        <div
          title="Drag to resize duration (+30m)"
          onClick={(e) => {
            e.stopPropagation();
            onResizeDuration(task.id, duration + 30);
          }}
          className="w-full h-2 rounded-b cursor-s-resize hover:bg-[#7C3AED]/40 flex items-center justify-center transition-colors -mb-1"
        >
          <div className="w-6 h-0.5 bg-white/20 rounded-full" />
        </div>
      )}
    </div>
  );
}
