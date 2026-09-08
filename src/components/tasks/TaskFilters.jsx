import React, { useState } from 'react';
import { useSearchContext } from '../../context/SearchContext';
import { useTaskContext } from '../../context/TaskContext';
import { useGoalsContext } from '../../context/GoalsContext';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Calendar,
  Clock,
  Target,
  Tag,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import Button from '../common/Button';

export const predefinedCategories = [
  'Coding',
  'Study',
  'UI/UX',
  'Work',
  'Personal',
  'Meeting',
  'Other',
];

export default function TaskFilters({ isOpen, onClose }) {
  const {
    activeFilters,
    setFilter,
    clearFilters,
    activeFilterCount,
  } = useSearchContext();
  const { tasks } = useTaskContext();
  const { goals } = useGoalsContext();

  // Extract all categories and tags dynamically present in tasks
  const dynamicCategories = Array.from(
    new Set(tasks.map((t) => t.category).filter(Boolean))
  );
  const dynamicTags = Array.from(
    new Set(tasks.flatMap((t) => (Array.isArray(t.tags) ? t.tags : [])).filter(Boolean))
  );

  const [customStart, setCustomStart] = useState(activeFilters.customRange?.start || '');
  const [customEnd, setCustomEnd] = useState(activeFilters.customRange?.end || '');

  if (!isOpen) return null;

  const handleCustomDateSubmit = (e) => {
    e.preventDefault();
    setFilter('date', 'custom');
    setFilter('customRange', { start: customStart, end: customEnd });
  };

  const handleTagToggle = (tag) => {
    const currentTags = Array.isArray(activeFilters.tags) ? activeFilters.tags : [];
    if (currentTags.includes(tag)) {
      setFilter('tags', currentTags.filter((t) => t !== tag));
    } else {
      setFilter('tags', [...currentTags, tag]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="advanced-filters-title"
    >
      <div
        className="w-full sm:max-w-xl max-h-[85vh] bg-[#11151F] border-t sm:border border-white/[0.1] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col space-y-5 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#7C3AED]" />
            <h3 id="advanced-filters-title" className="text-base font-bold text-white">
              Advanced Task Filters
            </h3>
            {activeFilterCount > 0 && (
              <span className="text-xs font-mono font-semibold text-[#c4b5fd] bg-[#7C3AED]/20 px-2 py-0.5 rounded-full">
                {activeFilterCount} active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 mr-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Filters Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5 text-xs">
          {/* 1. Status Filter (with Overdue) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Status
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending' },
                { id: 'in_progress', label: 'In Progress' },
                { id: 'completed', label: 'Completed' },
                { id: 'overdue', label: 'Overdue ⚠️' },
              ].map((opt) => {
                const isSelected = activeFilters.status === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFilter('status', opt.id)}
                    className={`px-2.5 py-1.5 rounded-xl font-medium border text-center transition-all ${
                      isSelected
                        ? opt.id === 'overdue'
                          ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444]'
                          : 'bg-[#7C3AED]/20 border-[#7C3AED] text-white'
                        : 'bg-[#171C27] border-white/[0.06] text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Priority Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'high', label: 'High', color: 'border-[#EF4444]/40 text-[#EF4444]' },
                { id: 'medium', label: 'Medium', color: 'border-[#F59E0B]/40 text-[#F59E0B]' },
                { id: 'low', label: 'Low', color: 'border-[#22C55E]/40 text-[#22C55E]' },
              ].map((opt) => {
                const isSelected = activeFilters.priority === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFilter('priority', opt.id)}
                    className={`px-2.5 py-1.5 rounded-xl font-medium border text-center transition-all ${
                      isSelected
                        ? `bg-white/[0.08] ${opt.color || 'border-[#7C3AED] text-white'}`
                        : 'bg-[#171C27] border-white/[0.06] text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Due Date Range Preset */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Date Range</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'all', label: 'All Dates' },
                { id: 'today', label: 'Today' },
                { id: 'tomorrow', label: 'Tomorrow' },
                { id: 'this_week', label: 'This Week' },
                { id: 'next_week', label: 'Next Week' },
                { id: 'this_month', label: 'This Month' },
                { id: 'custom', label: 'Custom Range' },
              ].map((opt) => {
                const isSelected = activeFilters.date === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFilter('date', opt.id)}
                    className={`px-2.5 py-1.5 rounded-xl font-medium border text-center transition-all ${
                      isSelected
                        ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-white'
                        : 'bg-[#171C27] border-white/[0.06] text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Date Range Inputs */}
            {activeFilters.date === 'custom' && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#171C27] border border-white/[0.08] mt-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-[#11151F] border border-white/[0.1] rounded-lg px-2 py-1 text-white text-xs flex-1"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-[#11151F] border border-white/[0.1] rounded-lg px-2 py-1 text-white text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={handleCustomDateSubmit}
                  className="px-2.5 py-1 rounded-lg bg-[#7C3AED] text-white font-semibold text-xs"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* 4. Estimated Duration */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Estimated Duration</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: '<15m', label: '< 15m' },
                { id: '15-30m', label: '15–30m' },
                { id: '30-60m', label: '30–60m' },
                { id: '1-2h', label: '1–2h' },
                { id: '2h+', label: '2h+' },
              ].map((opt) => {
                const isSelected = activeFilters.duration === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFilter('duration', opt.id)}
                    className={`px-2 py-1.5 rounded-xl font-medium border text-center transition-all ${
                      isSelected
                        ? 'bg-[#06B6D4]/20 border-[#06B6D4] text-cyan-300'
                        : 'bg-[#171C27] border-white/[0.06] text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Category Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Category
            </label>
            <select
              value={activeFilters.category}
              onChange={(e) => setFilter('category', e.target.value)}
              className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="all">All Categories</option>
              {dynamicCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Tags Filter */}
          {dynamicTags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Tags</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {dynamicTags.map((t) => {
                  const isSelected = (activeFilters.tags || []).includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTagToggle(t)}
                      className={`px-2.5 py-1 rounded-xl font-medium border transition-all text-xs ${
                        isSelected
                          ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-[#c4b5fd]'
                          : 'bg-[#171C27] border-white/[0.06] text-slate-400 hover:text-white'
                      }`}
                    >
                      #{t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7. Goal Filter */}
          {goals && goals.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <Target className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Linked Goal</span>
              </div>
              <select
                value={activeFilters.goalId}
                onChange={(e) => setFilter('goalId', e.target.value)}
                className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="all">All Goals</option>
                <option value="no_goal">No Goal Assigned</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3 shrink-0">
          <Button variant="secondary" size="sm" onClick={clearFilters}>
            Clear All Filters
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
