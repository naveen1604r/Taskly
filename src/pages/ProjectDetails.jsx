import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjectContext } from '../context/ProjectContext';
import ProjectHeader from '../components/projects/ProjectHeader';
import ProjectStats from '../components/projects/ProjectStats';
import ProjectTaskList from '../components/projects/ProjectTaskList';
import ProjectDependencyGraph from '../components/projects/ProjectDependencyGraph';
import ProjectModal from '../components/projects/ProjectModal';
import { useHabitContext } from '../context/HabitContext';
import { FolderKanban, ArrowLeft, Flame } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function ProjectDetails() {
  const { projectId } = useParams();
  const {
    getProject,
    isCreateModalOpen,
    editingProject,
    closeCreateModal,
  } = useProjectContext();

  const project = getProject(projectId);

  if (!project) {
    return (
      <div className="py-20 text-center space-y-4">
        <FolderKanban className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-lg font-bold text-white">Project Not Found</h3>
        <p className="text-xs text-slate-400">
          The requested project might have been deleted or archived.
        </p>
        <Link to="/projects">
          <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const { habits = [] } = useHabitContext() || {};
  const linkedHabits = habits.filter((h) => h.projectId === projectId && !h.archived);

  return (
    <div className="space-y-6 sm:space-y-7 pb-16 animate-in fade-in duration-200">
      {/* 1. Project Header & Milestone Overview */}
      <ProjectHeader project={project} />

      {/* 2. Key Statistics & Health Cards */}
      <ProjectStats project={project} />

      {/* 3. Visual Dependency Critical Path Graph */}
      <ProjectDependencyGraph project={project} />

      {/* 4. Task Management by Status */}
      <ProjectTaskList project={project} />

      {/* 5. Connected Habits */}
      {linkedHabits.length > 0 && (
        <Card
          title={`Related Habits (${linkedHabits.length})`}
          subtitle="Daily routines and consistency targets linked to this project"
          action={<Flame className="w-4 h-4 text-orange-400" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {linkedHabits.map((habit) => (
              <div
                key={habit.id}
                className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{ backgroundColor: `${habit.color}20`, borderColor: `${habit.color}40`, color: habit.color }}
                  >
                    <Flame className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <Link
                      to={`/habits/${habit.id}`}
                      className="font-bold text-white hover:text-[#c4b5fd] truncate block"
                    >
                      {habit.name}
                    </Link>
                    <span className="text-[10px] text-slate-400">
                      Target: {habit.targetCount} {habit.unit} • {habit.category}
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-lg bg-white/[0.06] text-slate-300 font-mono text-[10px] capitalize">
                  {typeof habit.frequency === 'string' ? habit.frequency : 'custom'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Edit Project Modal */}
      <ProjectModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        editingProject={editingProject}
      />
    </div>
  );
}
