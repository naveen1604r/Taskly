import React, { useState } from 'react';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { useTaskContext } from '../../context/TaskContext';
import { useGoalsContext } from '../../context/GoalsContext';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';

export default function AnalyticsFilters() {
  const {
    analyticsFilters,
    setAnalyticsFilter,
    clearAnalyticsFilters,
    activeFilterCount,
  } = useAnalyticsContext();
  const { tasks } = useTaskContext();
  const { goals } = useGoalsContext();

  const [isOpen, setIsOpen] = useState(false);

  const dynamicCategories = Array.from(
    new Set(tasks.map((t) => t.category).filter(Boolean))
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
          activeFilterCount > 0
            ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-[#c4b5fd]'
            : 'bg-[#11151F] border-white/[0.08] hover:border-white/[0.18] text-slate-300 hover:text-white'
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Filter Report</span>
        {activeFilterCount > 0 && (
          <span className="text-[10px] font-mono font-bold bg-[#7C3AED] text-white px-1.5 py-0.2 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-[#11151F] border border-white/[0.1] rounded-2xl p-4 shadow-2xl z-40 space-y-3 animate-in zoom-in-95 duration-100 text-xs">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <span className="font-bold text-white">Report Filters</span>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAnalyticsFilters}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Category</label>
            <select
              value={analyticsFilters.category}
              onChange={(e) => setAnalyticsFilter('category', e.target.value)}
              className="w-full bg-[#171C27] border border-white/[0.08] text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {dynamicCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Priority</label>
            <select
              value={analyticsFilters.priority}
              onChange={(e) => setAnalyticsFilter('priority', e.target.value)}
              className="w-full bg-[#171C27] border border-white/[0.08] text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Status</label>
            <select
              value={analyticsFilters.status}
              onChange={(e) => setAnalyticsFilter('status', e.target.value)}
              className="w-full bg-[#171C27] border border-white/[0.08] text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Goal */}
          {goals.length > 0 && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Goal</label>
              <select
                value={analyticsFilters.goalId}
                onChange={(e) => setAnalyticsFilter('goalId', e.target.value)}
                className="w-full bg-[#171C27] border border-white/[0.08] text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">All Goals</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-2 border-t border-white/[0.06] flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 rounded-lg bg-[#7C3AED] text-white font-semibold text-xs"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
