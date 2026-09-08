import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import { useProjectContext } from '../../context/ProjectContext';
import { useTaskContext } from '../../context/TaskContext';
import { calculateProjectProgress, getProjectHealth } from '../../utils/projectUtils';
import { FolderKanban, ArrowRight, Plus } from 'lucide-react';
import Button from '../common/Button';

export default function ActiveProjects() {
  const navigate = useNavigate();
  const { getActiveProjects, openCreateModal } = useProjectContext();
  const { tasks } = useTaskContext();

  const activeProjects = getActiveProjects().slice(0, 4);

  return (
    <Card
      title="Active Projects"
      subtitle="Strategic initiatives and cross-deliverable milestones"
      action={
        <Link
          to="/projects"
          className="text-xs font-semibold text-[#7C3AED] hover:text-[#c4b5fd] transition-colors flex items-center gap-1"
        >
          <span>View All Projects</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      {activeProjects.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-white/[0.08] rounded-2xl space-y-2">
          <FolderKanban className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-white">No active projects</p>
          <p className="text-xs text-slate-400">Create a project to bundle tasks into milestones.</p>
          <Button variant="secondary" size="sm" onClick={openCreateModal} icon={<Plus className="w-3.5 h-3.5" />}>
            Create Project
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {activeProjects.map((project) => {
            const stats = calculateProjectProgress(project.id, tasks);
            const health = getProjectHealth(project, tasks);

            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="block p-3.5 rounded-2xl bg-[#171C27] hover:bg-[#1f2635] border border-white/[0.04] hover:border-white/[0.14] transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: project.color || '#7C3AED' }}
                    />
                    <span className="font-bold text-white group-hover:text-[#c4b5fd] transition-colors truncate">
                      {project.name}
                    </span>
                  </div>

                  <span className={`px-2 py-0.2 rounded-md font-semibold text-[10px] border ${health.badgeColor}`}>
                    {health.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-[#11151F] rounded-full overflow-hidden border border-white/[0.04]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.percentage}%`,
                      backgroundColor: project.color || '#7C3AED',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>{stats.completed} / {stats.total} tasks</span>
                  <span className="font-mono font-bold text-white">{stats.percentage}%</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
