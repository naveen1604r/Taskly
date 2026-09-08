import React from 'react';
import { HABIT_CATEGORIES } from '../../utils/habitUtils';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export default function HabitFilters({
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
  counts = {},
}) {
  const statusTabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'active', label: 'Active', count: counts.active },
    { id: 'completed_today', label: 'Completed Today', count: counts.completedToday },
    { id: 'incomplete_today', label: 'Incomplete Today', count: counts.incompleteToday },
    { id: 'archived', label: 'Archived', count: counts.archived },
  ];

  return (
    <div className="space-y-3 text-xs">
      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#11151F] border border-white/[0.08] rounded-2xl w-fit">
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#7C3AED] text-white shadow-glow-primary'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Secondary Row: Search, Category, Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search habits by name, category..."
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

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-[#11151F] border border-white/[0.08] text-white rounded-xl px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {HABIT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-[#11151F] border border-white/[0.08] text-white rounded-xl px-2.5 py-1.5 focus:outline-none"
          >
            <option value="custom">Custom Order</option>
            <option value="name">Name (A-Z)</option>
            <option value="streak">Current Streak</option>
            <option value="rate">Completion Rate</option>
            <option value="created">Created Date</option>
          </select>
        </div>
      </div>
    </div>
  );
}
