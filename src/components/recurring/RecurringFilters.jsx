import React from 'react';
import { Search, Filter, Sparkles } from 'lucide-react';

export default function RecurringFilters({
  filter,
  setFilter,
  search,
  setSearch,
  sort,
  setSort,
  onApplyPreset,
}) {
  const tabs = [
    { id: 'all', label: 'All Routines' },
    { id: 'active', label: 'Active' },
    { id: 'paused', label: 'Paused' },
    { id: 'ended', label: 'Ended' },
  ];

  const presets = [
    {
      title: 'Daily Study Block',
      category: 'Study',
      priority: 'high',
      estimatedDuration: 60,
      plannedStartTime: '08:00',
      recurrence: { type: 'daily', interval: 1, startDate: null, endDate: null },
    },
    {
      title: 'Morning Routine & Planning',
      category: 'Personal',
      priority: 'medium',
      estimatedDuration: 30,
      plannedStartTime: '07:30',
      recurrence: { type: 'daily', interval: 1, startDate: null, endDate: null },
    },
    {
      title: 'Workout (Mon/Wed/Fri)',
      category: 'Health',
      priority: 'medium',
      estimatedDuration: 45,
      plannedStartTime: '07:00',
      recurrence: { type: 'weekly', interval: 1, daysOfWeek: [1, 3, 5], startDate: null, endDate: null },
    },
    {
      title: 'Weekly Systems Review',
      category: 'Work',
      priority: 'medium',
      estimatedDuration: 45,
      plannedStartTime: '17:00',
      recurrence: { type: 'weekly', interval: 1, daysOfWeek: [0], startDate: null, endDate: null },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Quick Routine Presets */}
      <div className="p-3.5 rounded-2xl bg-[#11151F] border border-white/[0.06] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>Quick Routine Presets</span>
          </span>
          <span className="text-[11px] text-slate-500">Click to customize and save</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.title}
              type="button"
              onClick={() => onApplyPreset(p)}
              className="px-3 py-1.5 rounded-xl bg-[#171C27] hover:bg-[#7C3AED]/20 text-xs font-semibold text-slate-300 hover:text-white border border-white/[0.06] hover:border-[#7C3AED]/30 transition-all"
            >
              + {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs, Search & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#11151F] border border-white/[0.08] rounded-xl self-start sm:self-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === t.id
                  ? 'bg-[#7C3AED] text-white shadow-glow-primary'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search routines..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#11151F] text-white placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#11151F] text-slate-300 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none cursor-pointer"
          >
            <option value="next">Sort by: Next Date</option>
            <option value="name">Sort by: Name</option>
            <option value="created">Sort by: Created</option>
          </select>
        </div>
      </div>
    </div>
  );
}
