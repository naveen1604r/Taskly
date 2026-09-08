import React, { useState, useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useSearchContext } from '../context/SearchContext';
import { useSettingsContext } from '../context/SettingsContext';
import TaskStats from '../components/tasks/TaskStats';
import TaskCard from '../components/tasks/TaskCard';
import TaskFilters from '../components/tasks/TaskFilters';
import FilterChips from '../components/tasks/FilterChips';
import TaskSort from '../components/tasks/TaskSort';
import SavedViews from '../components/tasks/SavedViews';
import SaveViewModal from '../components/tasks/SaveViewModal';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Bookmark,
  X,
  SearchX,
  CheckSquare,
  Sparkles,
} from 'lucide-react';

export default function Tasks() {
  const { tasks, openCreateModal } = useTaskContext();
  const {
    filteredAndSortedTasks,
    activeFilterCount,
    clearFilters,
  } = useSearchContext();
  const { settings } = useSettingsContext();

  const showCompletedTasks = settings?.tasks?.showCompletedTasks ?? true;

  // Local in-page task search input
  const [taskSearchQuery, setTaskSearchQuery] = useState('');

  // Modal states for Filter Drawer & Save View
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSaveViewModalOpen, setIsSaveViewModalOpen] = useState(false);

  // Combine context filters with local taskSearchQuery
  const displayTasks = useMemo(() => {
    let result = [...filteredAndSortedTasks];

    // Filter out completed tasks if user settings disable them and no status filter is explicitly selected
    if (!showCompletedTasks) {
      result = result.filter((t) => t.status !== 'completed');
    }

    // Apply in-page search query (Requirement 14 & 19)
    if (taskSearchQuery.trim()) {
      const q = taskSearchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          (Array.isArray(t.tags) && t.tags.some((tg) => tg.toLowerCase().includes(q))) ||
          (Array.isArray(t.subtasks) && t.subtasks.some((st) => st.title?.toLowerCase().includes(q)))
      );
    }

    return result;
  }, [filteredAndSortedTasks, taskSearchQuery, showCompletedTasks]);

  const totalTasksCount = tasks.length;
  const matchingCount = displayTasks.length;
  const isFilteringActive = activeFilterCount > 0 || taskSearchQuery.trim() !== '';

  return (
    <div className="space-y-6 sm:space-y-7 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Tasks
          </h2>
          <p className="text-sm text-[#94A3B8] mt-1">
            Manage your workflow, track subtasks, and achieve milestones.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={openCreateModal}
          icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          className="shadow-glow-primary self-start sm:self-auto"
        >
          Add Task
        </Button>
      </div>

      {/* 1. Dynamic Task Statistics */}
      <TaskStats />

      {/* 2. Saved Views Bar (Requirements 15, 16, 18) */}
      <SavedViews />

      {/* 3. Modern Task List Control Bar (Requirement 19 & 20) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#11151F] border border-white/[0.08] shadow-card space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Task Title & Real-time Result Count (Requirement 20) */}
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-white tracking-tight">My Tasks</h3>
            <span
              className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-[#171C27] text-slate-300 border border-white/[0.08]"
              aria-live="polite"
            >
              {isFilteringActive
                ? `Showing ${matchingCount} of ${totalTasksCount} tasks`
                : `${totalTasksCount} ${totalTasksCount === 1 ? 'task' : 'tasks'}`}
            </span>
          </div>

          {/* Right: Search, Filter, Sort, Save View Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Instant Task Search (Requirement 14) */}
            <div className="relative flex-1 sm:w-56 lg:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={taskSearchQuery}
                onChange={(e) => setTaskSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full bg-[#171C27] border border-white/[0.08] focus:border-[#7C3AED] rounded-xl pl-9 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#7C3AED]/30 transition-all"
              />
              {taskSearchQuery && (
                <button
                  type="button"
                  onClick={() => setTaskSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Panel Trigger (Requirement 10) */}
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                activeFilterCount > 0
                  ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-[#c4b5fd]'
                  : 'bg-[#171C27] border-white/[0.08] hover:border-white/[0.18] text-slate-300 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="text-[10px] font-mono font-bold bg-[#7C3AED] text-white px-1.5 py-0.2 rounded-full ml-0.5">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Save Current View (Requirement 17) */}
            <button
              type="button"
              onClick={() => setIsSaveViewModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#171C27] border border-white/[0.08] hover:border-white/[0.18] text-slate-300 hover:text-white transition-all"
              title="Save current filters as a view"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span className="hidden xs:inline">Save View</span>
            </button>

            {/* Sorting & Direction (Requirements 12 & 13) */}
            <TaskSort />
          </div>
        </div>

        {/* 4. Active Filter Chips (Requirement 11) */}
        <FilterChips />
      </div>

      {/* 5. Tasks List View */}
      {totalTasksCount === 0 ? (
        <Card className="py-16 text-center border-dashed">
          <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center mx-auto text-[#7C3AED] mb-4">
            <CheckSquare className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Tasks Yet</h3>
          <p className="text-sm text-[#94A3B8] max-w-sm mx-auto mb-6">
            Get started by adding your first task. Organize with subtasks, dates, and priorities.
          </p>
          <Button variant="primary" size="md" onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
            Create First Task
          </Button>
        </Card>
      ) : displayTasks.length === 0 ? (
        <Card className="py-14 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-slate-500 mb-3">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">No Matching Tasks</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-4">
            No tasks match your active filters or search query. Try resetting your filters to see more.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setTaskSearchQuery('');
                clearFilters();
              }}
            >
              Reset All Filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* Advanced Filter Drawer / Modal */}
      <TaskFilters
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />

      {/* Save View Modal */}
      <SaveViewModal
        isOpen={isSaveViewModalOpen}
        onClose={() => setIsSaveViewModalOpen(false)}
      />
    </div>
  );
}
