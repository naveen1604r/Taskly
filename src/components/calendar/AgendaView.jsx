import React, { useMemo } from 'react';
import { getAgendaGroups, isTaskVisibleInCalendar } from '../../utils/calendarUtils';
import { useTaskContext } from '../../context/TaskContext';
import { useProjectContext } from '../../context/ProjectContext';
import { isTaskBlocked } from '../../utils/dependencyUtils';
import { isTaskOverdue } from '../../utils/filterUtils';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Lock,
  Repeat,
  FolderKanban,
  AlertTriangle,
} from 'lucide-react';

const priorityColors = {
  high: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/25',
  medium: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25',
  low: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/25',
};

export default function AgendaView({
  tasks = [],
  settings,
  filters,
  searchQuery,
  onTaskClick,
}) {
  const { tasks: allTasks, toggleTaskStatus } = useTaskContext();
  const { getProject } = useProjectContext();
  const showCompleted = settings?.showCompleted ?? true;

  const visibleTasks = useMemo(() => {
    return tasks.filter((t) =>
      isTaskVisibleInCalendar(t, { ...filters, search: searchQuery, showCompleted })
    );
  }, [tasks, filters, searchQuery, showCompleted]);

  const groups = useMemo(() => {
    return getAgendaGroups(visibleTasks);
  }, [visibleTasks]);

  const renderTaskRow = (task) => {
    const isCompleted = task.status === 'completed';
    const isBlocked = isTaskBlocked(task, allTasks);
    const isOverdue = isTaskOverdue(task);
    const linkedProject = task.projectId ? getProject(task.projectId) : null;
    const duration = Number(task.estimatedDuration || task.duration) || 30;

    return (
      <div
        key={task.id}
        onClick={() => onTaskClick && onTaskClick(task)}
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all text-xs cursor-pointer ${
          isCompleted
            ? 'bg-[#11151F]/60 border-white/[0.04] opacity-80'
            : isBlocked
            ? 'bg-[#171C27] border-[#F59E0B]/30 hover:border-[#F59E0B]/60'
            : isOverdue
            ? 'bg-[#171C27] border-[#EF4444]/30 hover:border-[#EF4444]/60'
            : 'bg-[#171C27] border-white/[0.08] hover:border-white/[0.18]'
        }`}
        style={{
          borderLeftColor: linkedProject?.color || undefined,
          borderLeftWidth: linkedProject ? 3 : 1,
        }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleTaskStatus(task.id);
            }}
            className="text-slate-400 hover:text-white transition-colors shrink-0"
          >
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500 hover:text-[#7C3AED]" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`font-bold hover:text-[#c4b5fd] transition-colors truncate ${
                  isCompleted ? 'text-slate-400 line-through' : 'text-white'
                }`}
              >
                {task.title}
              </span>

              <span
                className={`px-2 py-0.2 rounded-md font-semibold text-[10px] uppercase border ${
                  priorityColors[task.priority] || priorityColors.medium
                }`}
              >
                {task.priority}
              </span>

              {isBlocked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#F59E0B] bg-[#F59E0B]/15 px-2 py-0.2 rounded-md border border-[#F59E0B]/30">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Blocked</span>
                </span>
              )}

              {task.recurringId && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-300 bg-purple-500/15 px-2 py-0.2 rounded-md border border-purple-500/30">
                  <Repeat className="w-2.5 h-2.5" />
                  <span>Recurring</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
              <div className="flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-[#06B6D4]" />
                <span>
                  {task.plannedStartTime ? `${task.plannedStartTime} (${duration}m)` : `${duration}m`}
                </span>
              </div>

              {task.plannedDate && (
                <>
                  <span>•</span>
                  <span>{task.plannedDate}</span>
                </>
              )}

              {linkedProject && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <FolderKanban className="w-3 h-3 text-[#7C3AED]" />
                    <span>{linkedProject.name}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const activeGroupKeys = ['today', 'tomorrow', 'thisWeek', 'later'].filter(
    (k) => groups[k]?.tasks.length > 0
  );

  if (activeGroupKeys.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-white/[0.08] rounded-3xl bg-[#11151F]/40 space-y-2">
        <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
        <p className="text-sm font-semibold text-white">No upcoming scheduled tasks</p>
        <p className="text-xs text-slate-400">
          Your agenda is clear for the selected filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeGroupKeys.map((key) => {
        const group = groups[key];
        return (
          <section key={key} className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#c4b5fd] flex items-center gap-2">
                <span>{group.label}</span>
                {group.date && (
                  <span className="text-[10px] text-slate-500 font-mono font-normal">
                    • {group.date}
                  </span>
                )}
              </h4>
              <span className="text-[10px] font-mono text-slate-400 bg-[#171C27] px-2 py-0.5 rounded-md border border-white/[0.04]">
                {group.tasks.length}
              </span>
            </div>

            <div className="space-y-2">
              {group.tasks.map((task) => renderTaskRow(task))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
