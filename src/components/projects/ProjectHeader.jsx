import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTaskContext } from '../../context/TaskContext';
import { useProjectContext } from '../../context/ProjectContext';
import { useGoalsContext } from '../../context/GoalsContext';
import { getProjectHealth, getProjectTimelineStats, calculateProjectProgress } from '../../utils/projectUtils';
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
  Calendar,
  CheckCircle2,
  Edit,
  Archive,
  RotateCcw,
  Plus,
  Target,
  ArrowLeft,
} from 'lucide-react';
import Button from '../common/Button';

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

export default function ProjectHeader({ project }) {
  const navigate = useNavigate();
  const { tasks, openCreateModal } = useTaskContext();
  const {
    openEditModal,
    archiveProject,
    restoreProject,
    completeProject,
  } = useProjectContext();
  const { goals } = useGoalsContext();

  const [isConfirmCompleteOpen, setIsConfirmCompleteOpen] = useState(false);

  if (!project) return null;

  const stats = calculateProjectProgress(project.id, tasks);
  const health = getProjectHealth(project, tasks);
  const timeline = getProjectTimelineStats(project);
  const IconComp = iconMap[project.icon] || Folder;

  const linkedGoal = goals.find((g) => g.id === project.goalId);
  const isCompleted = project.status === 'completed';
  const isArchived = project.status === 'archived';

  const handleCompleteClick = () => {
    if (stats.completed < stats.total) {
      setIsConfirmCompleteOpen(true);
    } else {
      completeProject(project.id);
    }
  };

  return (
    <div className="space-y-4 border-b border-white/[0.08] pb-6">
      {/* Back button & Category */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>

        {linkedGoal && (
          <Link
            to="/goals"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/25 hover:bg-purple-500/20 transition-colors"
          >
            <Target className="w-3.5 h-3.5 text-purple-400" />
            <span>Goal: {linkedGoal.title}</span>
          </Link>
        )}
      </div>

      {/* Main Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-3xl flex items-center justify-center text-white shrink-0 shadow-glow-primary/30"
            style={{ backgroundColor: `${project.color}25`, color: project.color }}
          >
            <IconComp className="w-7 h-7" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${health.badgeColor}`}
              >
                {health.status}
              </span>

              <span className="text-xs text-slate-400 font-mono">
                {timeline.startDate ? `${timeline.startDate} → ` : ''}
                {timeline.dueDate || 'No deadline'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {project.name}
            </h2>
            {project.description && (
              <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <Button
            variant="primary"
            size="sm"
            onClick={() => openCreateModal({ projectId: project.id })}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Task
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => openEditModal(project)}
            icon={<Edit className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>

          {!isCompleted && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCompleteClick}
              icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />}
            >
              Complete
            </Button>
          )}

          {isArchived ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => restoreProject(project.id)}
              icon={<RotateCcw className="w-3.5 h-3.5 text-cyan-400" />}
            >
              Restore
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => archiveProject(project.id)}
              icon={<Archive className="w-3.5 h-3.5 text-amber-400" />}
            >
              Archive
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Modal for incomplete tasks on project completion (Requirement 33) */}
      {isConfirmCompleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsConfirmCompleteOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#11151F] border border-white/[0.1] rounded-3xl p-6 shadow-2xl space-y-4 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white">Incomplete Tasks Warning</h3>
            <p className="text-slate-300 leading-relaxed">
              <span className="font-bold text-[#F59E0B]">{stats.total - stats.completed} tasks</span> in this project are still incomplete. Do you want to mark the project as completed anyway?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmCompleteOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  completeProject(project.id);
                  setIsConfirmCompleteOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#22C55E] text-black font-bold"
              >
                Complete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
