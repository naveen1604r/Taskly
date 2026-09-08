import React from 'react';
import { Search, LayoutList, CheckSquare, ArrowUpDown, X } from 'lucide-react';

export default function TaskChecklistFilters({
  searchQuery,
  onSearchChange,
  filterTab,
  onFilterTabChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  counts = { all: 0, completed: 0, remaining: 0 },
}) {
  return (
    <div className="space-y-3 mb-4">
      {/* Top Bar: Search + View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search subtasks..."
            className="w-full bg-[#171C27] border border-white/[0.08] focus:border-[#7C3AED]/50 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-0.5 rounded"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Toggle: List View vs Compact Checklist */}
        <div className="inline-flex items-center p-1 rounded-xl bg-[#171C27] border border-white/[0.08] shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-[#7C3AED] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="List view with full controls"
            aria-label="Switch to list view"
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('compact')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'compact'
                ? 'bg-[#7C3AED] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Compact checklist view"
            aria-label="Switch to compact checklist view"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Checklist</span>
          </button>
        </div>
      </div>

      {/* Bottom Bar: Status Filter Tabs & Sort Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => onFilterTabChange('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterTab === 'all'
                ? 'bg-[#7C3AED]/20 text-[#c4b5fd] border border-[#7C3AED]/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <span>All</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.08]">
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFilterTabChange('remaining')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterTab === 'remaining'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <span>Remaining</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.08]">
              {counts.remaining}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFilterTabChange('completed')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterTab === 'completed'
                ? 'bg-[#22C55E]/15 text-[#86efac] border border-[#22C55E]/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <span>Completed</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.08]">
              {counts.completed}
            </span>
          </button>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <ArrowUpDown className="w-3 h-3 text-slate-500" />
          <span className="hidden xs:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="bg-[#171C27] border border-white/[0.08] text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none cursor-pointer hover:border-white/[0.18] transition-colors"
          >
            <option value="manual">Manual order</option>
            <option value="priority">Priority (High to Low)</option>
            <option value="status">Completed status</option>
            <option value="date">Created date</option>
          </select>
        </div>
      </div>
    </div>
  );
}
