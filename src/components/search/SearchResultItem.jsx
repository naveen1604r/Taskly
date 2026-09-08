import React from 'react';
import { useNavigate } from 'react-router-dom';
import { highlightMatch } from '../../utils/searchUtils';
import { useNotesContext } from '../../context/NotesContext';
import {
  CheckSquare,
  ListTodo,
  FileText,
  Target,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  Circle,
  FolderKanban,
  Flame,
} from 'lucide-react';

const priorityBadges = {
  high: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/25',
  medium: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25',
  low: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/25',
};

export default function SearchResultItem({
  type, // 'task' | 'subtask' | 'note' | 'goal'
  item,
  query,
  onSelect,
}) {
  const navigate = useNavigate();
  const { openViewModal } = useNotesContext();

  const handleClick = () => {
    if (onSelect) onSelect();

    switch (type) {
      case 'task':
        navigate(`/tasks/${item.id}`);
        break;

      case 'subtask':
        navigate(`/tasks/${item.parentTask.id}`);
        break;

      case 'note':
        if (openViewModal) {
          openViewModal(item);
        } else {
          navigate('/notes');
        }
        break;

      case 'goal':
        navigate('/goals');
        break;

      case 'habit':
        navigate(`/habits/${item.id}`);
        break;

      default:
        break;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // Task Item
  if (type === 'task') {
    const isCompleted = item.status === 'completed';
    const priorityClass = priorityBadges[item.priority] || priorityBadges.medium;

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="group flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-[#171C27] hover:bg-[#1f2635] border border-white/[0.06] hover:border-[#7C3AED]/40 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-lg bg-[#7C3AED]/15 text-[#7C3AED] shrink-0">
            <CheckSquare className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-semibold truncate ${
                  isCompleted ? 'text-slate-400 line-through' : 'text-white'
                }`}
              >
                {highlightMatch(item.title, query)}
              </span>
            </div>

            {item.description && (
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {highlightMatch(item.description, query)}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-400">
              <span
                className={`px-2 py-0.2 rounded-md font-semibold border text-[10px] uppercase ${priorityClass}`}
              >
                {item.priority}
              </span>
              <span className="capitalize">{item.status?.replace('_', ' ')}</span>
              {item.dueDate && (
                <span className="flex items-center gap-1 font-mono text-slate-400 border-l border-white/[0.08] pl-2">
                  <Calendar className="w-3 h-3 text-[#F59E0B]" />
                  <span>{item.dueDate}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
      </div>
    );
  }

  // Subtask Item
  if (type === 'subtask') {
    const { subtask, parentTask } = item;
    const isCompleted = Boolean(subtask.completed);

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="group flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-[#171C27] hover:bg-[#1f2635] border border-white/[0.06] hover:border-[#06B6D4]/40 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4]"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-lg bg-[#06B6D4]/15 text-[#06B6D4] shrink-0">
            <ListTodo className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
              <span
                className={`text-sm font-semibold truncate ${
                  isCompleted ? 'text-slate-400 line-through' : 'text-white'
                }`}
              >
                {highlightMatch(subtask.title, query)}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-1">
              Part of main task:{' '}
              <strong className="text-slate-200">
                {highlightMatch(parentTask.title, query)}
              </strong>
            </p>
          </div>
        </div>

        <span className="text-xs text-[#06B6D4] font-medium hidden sm:inline-flex items-center gap-1 shrink-0">
          <span>View Task</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    );
  }

  // Note Item
  if (type === 'note') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="group flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-[#171C27] hover:bg-[#1f2635] border border-white/[0.06] hover:border-amber-500/40 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-sm font-semibold text-white truncate block">
              {highlightMatch(item.title, query)}
            </span>
            {item.preview && (
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {highlightMatch(item.preview, query)}
              </p>
            )}
            {item.category && (
              <span className="inline-block mt-1 text-[10px] text-amber-300 font-medium bg-amber-500/10 px-2 py-0.2 rounded border border-amber-500/20">
                {item.category}
              </span>
            )}
          </div>
        </div>

        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
      </div>
    );
  }

  // Goal Item
  if (type === 'goal') {
    const progress = Number(item.progress) || 0;

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="group flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-[#171C27] hover:bg-[#1f2635] border border-white/[0.06] hover:border-[#22C55E]/40 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-lg bg-[#22C55E]/15 text-[#22C55E] shrink-0">
            <Target className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-sm font-semibold text-white truncate block">
              {highlightMatch(item.title, query)}
            </span>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-24 h-1.5 bg-[#11151F] rounded-full overflow-hidden border border-white/[0.08]">
                <div
                  className="h-full bg-gradient-to-r from-[#22C55E] to-[#10B981] rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-white">{progress}%</span>
              {item.category && (
                <span className="text-[10px] text-slate-400 border-l border-white/[0.08] pl-2">
                  {item.category}
                </span>
              )}
            </div>
          </div>
        </div>

        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
      </div>
    );
  }

  // Project Item (Step 19)
  if (type === 'project') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (onSelect) onSelect();
          navigate(`/projects/${item.id}`);
        }}
        onKeyDown={handleKeyDown}
        className="group flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-[#171C27] hover:bg-[#1f2635] border border-white/[0.06] hover:border-[#7C3AED]/40 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="p-2 rounded-lg text-white shrink-0"
            style={{ backgroundColor: `${item.color || '#7C3AED'}25`, color: item.color || '#7C3AED' }}
          >
            <FolderKanban className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-sm font-semibold text-white truncate block">
              {highlightMatch(item.name, query)}
            </span>
            {item.description && (
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {highlightMatch(item.description, query)}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
              <span className="capitalize">{item.priority} priority</span>
              <span>•</span>
              <span className="capitalize">{item.status}</span>
            </div>
          </div>
        </div>

        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
      </div>
    );
  }

  // Habit Item (Step 24)
  if (type === 'habit') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (onSelect) onSelect();
          navigate(`/habits/${item.id}`);
        }}
        onKeyDown={handleKeyDown}
        className="group flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-[#171C27] hover:bg-[#1f2635] border border-white/[0.06] hover:border-[#7C3AED]/40 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="p-2 rounded-lg text-white shrink-0"
            style={{ backgroundColor: `${item.color || '#7C3AED'}25`, color: item.color || '#7C3AED' }}
          >
            <Flame className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-sm font-semibold text-white truncate block">
              {highlightMatch(item.name, query)}
            </span>
            {item.description && (
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {highlightMatch(item.description, query)}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
              <span className="text-[#c4b5fd] font-semibold">{item.category}</span>
              <span>•</span>
              <span className="capitalize">{item.routineGroup || 'Routine'}</span>
              <span>•</span>
              <span>Target: {item.targetCount} {item.unit}</span>
            </div>
          </div>
        </div>

        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
      </div>
    );
  }

  return null;
}
