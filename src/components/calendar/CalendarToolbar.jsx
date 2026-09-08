import React, { useState } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import {
  Search,
  Filter,
  Inbox,
  Sliders,
  Plus,
  X,
  CheckCircle2,
} from 'lucide-react';
import Button from '../common/Button';

export default function CalendarToolbar({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
  unscheduledCount = 0,
  onToggleUnscheduled,
  onOpenSettings,
  onOpenCreateModal,
}) {
  const { projects } = useProjectContext();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const hasActiveFilters =
    filters.priority !== 'all' ||
    filters.projectId !== 'all' ||
    filters.status !== 'all' ||
    Boolean(searchQuery.trim());

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      {/* Search & Filter Toggles */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search calendar..."
            className="w-full bg-[#11151F] border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Trigger */}
        <button
          type="button"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className={`px-3 py-1.5 rounded-xl border font-semibold transition-all flex items-center gap-1.5 ${
            isFiltersOpen || hasActiveFilters
              ? 'bg-[#7C3AED]/15 border-[#7C3AED] text-[#c4b5fd]'
              : 'bg-[#11151F] border-white/[0.08] text-slate-400 hover:text-white'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
          )}
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-slate-400 hover:text-white text-[11px] underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 self-start md:self-auto">
        {/* Unscheduled Drawer Trigger */}
        <button
          type="button"
          onClick={onToggleUnscheduled}
          className="px-3 py-1.5 rounded-xl bg-[#11151F] hover:bg-[#171C27] border border-white/[0.08] text-slate-300 font-semibold transition-colors flex items-center gap-1.5"
        >
          <Inbox className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span>Unscheduled</span>
          {unscheduledCount > 0 && (
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-[#06B6D4]/20 text-[#06B6D4] font-bold">
              {unscheduledCount}
            </span>
          )}
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 rounded-xl bg-[#11151F] hover:bg-[#171C27] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
          title="Calendar Settings"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Primary Add Task Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => onOpenCreateModal()}
          icon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
          className="shadow-glow-primary"
        >
          Add Task
        </Button>
      </div>

      {/* Expanded Filter Drawer */}
      {isFiltersOpen && (
        <div className="w-full p-3.5 rounded-2xl bg-[#11151F] border border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-100">
          {/* Priority */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-semibold uppercase">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => onFilterChange('priority', e.target.value)}
              className="w-full bg-[#171C27] border border-white/[0.08] text-white rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Project */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-semibold uppercase">Project</label>
            <select
              value={filters.projectId}
              onChange={(e) => onFilterChange('projectId', e.target.value)}
              className="w-full bg-[#171C27] border border-white/[0.08] text-white rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-semibold uppercase">Status</label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="w-full bg-[#171C27] border border-white/[0.08] text-white rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
