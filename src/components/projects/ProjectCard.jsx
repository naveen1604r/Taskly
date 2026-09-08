import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTaskContext } from '../../context/TaskContext';
import { useProjectContext } from '../../context/ProjectContext';
import { calculateProjectProgress, getProjectHealth, getProjectTimelineStats } from '../../utils/projectUtils';
import {
  Folder,
  Globe,
  Smartphone,
  Palette,
  Briefcase,
  Code2,
  Rocket,
  Sparkles,
  Layers,
  MoreHorizontal,
  Calendar,
  CheckCircle2,
  Lock,
  ArrowRight,
  Archive,
  RotateCcw,
  Trash2,
  Edit,
} from 'lucide-react';

const iconMap = {
  Folder,
  Globe,
  Smartphone,
  Palette,
  Briefcase,
  Code2,
  Rocket,
  Sparkles,
  Layers,
};

const priorityBadges = {
  high: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/25',
  medium: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25',
  low: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/25',
};

export default function ProjectCard({ project }) {
  const navigate = useNavigate();
  const { tasks } = useTaskContext();
  const {
    openEditModal,
    deleteProject,
    archiveProject,
    restoreProject,
    completeProject,
  } = useProjectContext();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const stats = calculateProjectProgress(project.id, tasks);
  const health = getProjectHealth(project, tasks);
  const timeline = getProjectTimelineStats(project);

  const IconComp = iconMap[project.icon] || Folder;
  const isArchived = project.status === 'archived';
  const isCompleted = project.status === 'completed';

  const handleDelete = () => {
    deleteProject(project.id);
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div
        className="group relative p-4 sm:p-5 rounded-3xl bg-[#11151F] border border-white/[0.08] hover:border-white/[0.18] shadow-card transition-all flex flex-col justify-between space-y-4"
        style={{ borderTopColor: project.color, borderTopWidth: 3 }}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
              style={{ backgroundColor: `${project.color}25`, color: project.color }}
            >
              <IconComp className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <Link
                to={`/projects/${project.id}`}
                className="text-sm sm:text-base font-bold text-white hover:text-[#c4b5fd] transition-colors truncate block"
              >
                {project.name}
              </Link>
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px]">
                <span
                  className={`px-2 py-0.2 rounded-md font-semibold uppercase border ${
                    priorityBadges[project.priority] || priorityBadges.medium
                  }`}
                >
                  {project.priority}
                </span>

                <span
                  className={`px-2 py-0.2 rounded-md font-semibold border ${health.badgeColor}`}
                >
                  {health.status}
                </span>
              </div>
            </div>
          </div>

          {/* Three-dot menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-44 bg-[#171C27] border border-white/[0.1] rounded-2xl p-1 shadow-2xl z-30 text-xs space-y-0.5 animate-in zoom-in-95 duration-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="w-full px-2.5 py-1.5 rounded-xl text-left text-slate-300 hover:text-white hover:bg-white/[0.06] flex items-center gap-2"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Open Project</span>
                </button>

                <button
                  type="button"
                  onClick={() => openEditModal(project)}
                  className="w-full px-2.5 py-1.5 rounded-xl text-left text-slate-300 hover:text-white hover:bg-white/[0.06] flex items-center gap-2"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                {!isCompleted && (
                  <button
                    type="button"
                    onClick={() => completeProject(project.id)}
                    className="w-full px-2.5 py-1.5 rounded-xl text-left text-[#22C55E] hover:bg-[#22C55E]/10 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete</span>
                  </button>
                )}

                {isArchived ? (
                  <button
                    type="button"
                    onClick={() => restoreProject(project.id)}
                    className="w-full px-2.5 py-1.5 rounded-xl text-left text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => archiveProject(project.id)}
                    className="w-full px-2.5 py-1.5 rounded-xl text-left text-amber-400 hover:bg-amber-500/10 flex items-center gap-2"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full px-2.5 py-1.5 rounded-xl text-left text-[#EF4444] hover:bg-[#EF4444]/10 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description Preview */}
        {project.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Progress bar */}
        <div className="space-y-1.5 bg-[#171C27]/50 p-3 rounded-2xl border border-white/[0.03]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Progress</span>
            <span className="font-mono font-bold text-white">
              {stats.completed} / {stats.total} Tasks ({stats.percentage}%)
            </span>
          </div>
          <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${stats.percentage}%`,
                backgroundColor: project.color,
              }}
            />
          </div>
        </div>

        {/* Footer: Timeline & Blocked count */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span className={timeline.isOverdue ? 'text-[#EF4444] font-bold' : ''}>
              {timeline.label}
            </span>
          </div>

          {stats.blocked > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-md border border-[#F59E0B]/20">
              <Lock className="w-3 h-3" />
              <span>{stats.blocked} blocked</span>
            </span>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal (Requirement 31) */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#11151F] border border-white/[0.1] rounded-3xl p-6 shadow-2xl space-y-4 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white">Delete Project?</h3>
            <p className="text-slate-300 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-white">"{project.name}"</span>?
            </p>
            <div className="p-3 rounded-2xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 text-[#06B6D4]">
              Tasks inside this project will <strong>NOT</strong> be deleted. They will simply become unassigned.
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-xl bg-[#EF4444] text-white font-bold"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
