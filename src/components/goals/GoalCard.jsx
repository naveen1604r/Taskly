import React, { useState, useRef, useEffect } from 'react';
import { useGoalsContext } from '../../context/GoalsContext';
import { useTaskContext } from '../../context/TaskContext';
import { getGoalDeadlineInfo } from '../../utils/goalUtils';
import {
  Target,
  Briefcase,
  Compass,
  Award,
  BookOpen,
  CheckCircle2,
  MoreVertical,
  Calendar,
  Clock,
  ListTodo,
  Milestone as MilestoneIcon,
  Archive,
  ArchiveRestore,
  Edit2,
  Trash2,
  Link2,
  ChevronRight
} from 'lucide-react';

const iconMap = {
  Target,
  Briefcase,
  Compass,
  Award,
  BookOpen,
  CheckCircle2,
};

const priorityStyles = {
  high: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/25',
  medium: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25',
  low: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/25',
};

export default function GoalCard({ goal }) {
  const {
    openViewGoal,
    openEditGoalModal,
    openDeleteGoalModal,
    openLinkTaskModal,
    archiveGoal,
    restoreGoal,
    completeGoal,
  } = useGoalsContext();

  const { tasks } = useTaskContext();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const IconComponent = iconMap[goal.icon] || Target;
  const deadlineInfo = getGoalDeadlineInfo(goal.targetDate, goal.status);
  const isCompleted = goal.status === 'completed';
  const isArchived = goal.status === 'archived';

  // Calculate task completion details
  const linkedTasks = tasks.filter((t) => (goal.relatedTaskIds || []).includes(t.id));
  const completedLinkedCount = linkedTasks.filter((t) => t.status === 'completed').length;

  // Milestones count
  const totalMilestones = (goal.milestones || []).length;
  const completedMilestones = (goal.milestones || []).filter((m) => m.completed).length;

  // Format date display
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

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
      onClick={() => openViewGoal(goal)}
      className={`relative flex flex-col justify-between p-5 rounded-2xl bg-[#11151F] border transition-all duration-200 cursor-pointer group hover:shadow-hover ${
        isCompleted
          ? 'border-[#22C55E]/30 shadow-[0_0_12px_rgba(34,197,94,0.06)]'
          : deadlineInfo.isDueSoon
          ? 'border-[#F59E0B]/40 shadow-[0_0_12px_rgba(245,158,11,0.06)]'
          : 'border-white/[0.08] hover:border-white/[0.18]'
      }`}
    >
      <div>
        {/* Card Header: Icon, Category, Title & Menu */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="p-2.5 rounded-xl bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/25 shrink-0 transition-transform group-hover:scale-105">
              <IconComponent className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#06B6D4] block truncate">
                {goal.category}
              </span>
              <h3 className="text-base font-bold text-white tracking-tight leading-snug truncate group-hover:text-[#c4b5fd] transition-colors">
                {goal.title}
              </h3>
            </div>
          </div>

          {/* Three-Dot Menu */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors"
              aria-label="Goal options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-[#171C27] border border-white/[0.12] rounded-xl shadow-hover py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    openViewGoal(goal);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span>View Details</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    openEditGoalModal(goal);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Edit Goal</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    openLinkTaskModal(goal);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
                >
                  <Link2 className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Link Tasks ({linkedTasks.length})</span>
                </button>

                {!isCompleted && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      completeGoal(goal.id);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#22C55E] hover:bg-[#22C55E]/10 transition-colors text-left"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Complete</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    if (isArchived) {
                      restoreGoal(goal.id);
                    } else {
                      archiveGoal(goal.id);
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
                >
                  {isArchived ? (
                    <>
                      <ArchiveRestore className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Restore to Active</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-3.5 h-3.5 text-slate-400" />
                      <span>Archive Goal</span>
                    </>
                  )}
                </button>

                <div className="my-1 border-t border-white/[0.06]" />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    openDeleteGoalModal(goal);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Goal</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description Preview */}
        {goal.description && (
          <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2 mb-4 font-normal">
            {goal.description}
          </p>
        )}

        {/* Progress Bar & Percentage */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">
              {goal.progressMode === 'task'
                ? 'Task Based Progress'
                : goal.progressMode === 'milestone'
                ? 'Milestone Progress'
                : 'Overall Progress'}
            </span>
            <span className="text-white font-bold">{goal.progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-[#171C27] rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted
                  ? 'bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                  : 'bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] shadow-[0_0_8px_rgba(124,58,237,0.4)]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }}
            />
          </div>
        </div>

        {/* Supporting metrics pills: Tasks & Milestones */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#94A3B8] mb-4">
          {linkedTasks.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#171C27] border border-white/[0.08] text-slate-300">
              <ListTodo className="w-3 h-3 text-[#7C3AED]" />
              <span>
                {completedLinkedCount} of {linkedTasks.length} tasks completed
              </span>
            </span>
          )}

          {totalMilestones > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#171C27] border border-white/[0.08] text-slate-300">
              <MilestoneIcon className="w-3 h-3 text-[#06B6D4]" />
              <span>
                {completedMilestones} of {totalMilestones} milestones
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Deadline & Priority */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{formatDateDisplay(goal.targetDate)}</span>
          <span
            className={`text-[11px] font-medium ml-1 ${
              deadlineInfo.isOverdue
                ? 'text-[#EF4444]'
                : deadlineInfo.isDueSoon
                ? 'text-[#F59E0B]'
                : 'text-[#94A3B8]'
            }`}
          >
            ({deadlineInfo.label})
          </span>
        </div>

        <span
          className={`px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase border ${
            priorityStyles[goal.priority] || priorityStyles.medium
          }`}
        >
          {goal.priority}
        </span>
      </div>
    </div>
  );
}
