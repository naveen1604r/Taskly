import React, { useState, useMemo } from 'react';
import { useProjectContext } from '../context/ProjectContext';
import { useTaskContext } from '../context/TaskContext';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectModal from '../components/projects/ProjectModal';
import { calculateProjectProgress } from '../utils/projectUtils';
import {
  FolderKanban,
  Plus,
  Search,
  Layers,
  CheckCircle2,
  Archive,
  Sparkles,
} from 'lucide-react';
import Button from '../components/common/Button';

export default function Projects() {
  const { projects, isCreateModalOpen, editingProject, openCreateModal, closeCreateModal } =
    useProjectContext();
  const { tasks } = useTaskContext();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed' | 'archived' | 'all'
  const [searchQuery, setSearchQuery] = useState('');

  // Overview stats
  const totalProjects = projects.length;
  const activeCount = projects.filter((p) => p.status === 'active').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const archivedCount = projects.filter((p) => p.status === 'archived').length;

  // Filtered list
  const filteredProjects = useMemo(() => {
    let list = projects;

    if (activeTab === 'active') list = list.filter((p) => p.status === 'active');
    else if (activeTab === 'completed') list = list.filter((p) => p.status === 'completed');
    else if (activeTab === 'archived') list = list.filter((p) => p.status === 'archived');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [projects, activeTab, searchQuery]);

  // Overall Project Progress
  const totalProjectTasks = tasks.filter((t) => Boolean(t.projectId)).length;
  const completedProjectTasks = tasks.filter(
    (t) => Boolean(t.projectId) && t.status === 'completed'
  ).length;
  const overallProgress =
    totalProjectTasks > 0 ? Math.round((completedProjectTasks / totalProjectTasks) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-7 pb-16 animate-in fade-in duration-200">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#c4b5fd] bg-[#7C3AED]/15 px-2.5 py-0.5 rounded-md border border-[#7C3AED]/25">
              <FolderKanban className="w-3.5 h-3.5 text-[#7C3AED]" />
              Strategic Initiatives
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Projects & Workflows
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Group deliverables into strategic initiatives, manage dependencies, and monitor health.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openCreateModal}
          icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          className="shadow-glow-primary self-start sm:self-auto"
        >
          New Project
        </Button>
      </div>

      {/* 2. Overview Metric Snapshot */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#11151F] border border-white/[0.08] shadow-card space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04]">
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Total Projects</span>
            <span className="text-xl sm:text-2xl font-bold text-white font-mono">{totalProjects}</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04]">
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Active</span>
            <span className="text-xl sm:text-2xl font-bold text-[#06B6D4] font-mono">{activeCount}</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04]">
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Completed</span>
            <span className="text-xl sm:text-2xl font-bold text-[#22C55E] font-mono">{completedCount}</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04]">
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Archived</span>
            <span className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">{archivedCount}</span>
          </div>
        </div>

        {/* Overall Project Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Overall Projects Delivery Rate</span>
            <span className="font-mono font-bold text-white">
              {completedProjectTasks} / {totalProjectTasks} Tasks ({overallProgress}%)
            </span>
          </div>
          <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#22C55E] rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Search & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-[#11151F] rounded-2xl border border-white/[0.08] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'active'
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active ({activeCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'completed'
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed ({completedCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('archived')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'archived'
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Archived ({archivedCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({totalProjects})
          </button>
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-[#11151F] border border-white/[0.08] rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]"
          />
        </div>
      </div>

      {/* 4. Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-white/[0.08] rounded-3xl bg-[#11151F]/40 space-y-3">
          <FolderKanban className="w-10 h-10 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-white">No projects found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'No projects match your search criteria.'
              : 'Create a project to bundle tasks into milestones and track delivery health.'}
          </p>
          <Button variant="primary" size="sm" onClick={openCreateModal} icon={<Plus className="w-3.5 h-3.5" />}>
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Project Create/Edit Modal */}
      <ProjectModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        editingProject={editingProject}
      />
    </div>
  );
}
