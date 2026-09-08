import React from 'react';
import { useSearchContext } from '../../context/SearchContext';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const sortOptions = [
  { id: 'recently_updated', label: 'Recently Updated' },
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'due_date', label: 'Due Date' },
  { id: 'priority', label: 'Priority' },
  { id: 'estimated_duration', label: 'Estimated Duration' },
  { id: 'actual_duration', label: 'Actual Duration' },
  { id: 'alphabetical', label: 'Alphabetical' },
  { id: 'completion_status', label: 'Completion Status' },
];

export default function TaskSort({ className = '' }) {
  const {
    sortBy,
    sortDirection,
    setSorting,
    toggleSortDirection,
  } = useSearchContext();

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Sort By Selector */}
      <div className="relative flex items-center">
        <ArrowUpDown className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <select
          value={sortBy}
          onChange={(e) => setSorting(e.target.value)}
          className="pl-8 pr-7 py-1.5 text-xs bg-[#171C27] hover:bg-[#1f2635] text-slate-200 hover:text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none transition-colors appearance-none cursor-pointer font-medium"
          aria-label="Sort tasks by"
        >
          {sortOptions.map((opt) => (
            <option key={opt.id} value={opt.id} className="bg-[#171C27] text-white">
              Sort: {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Ascending / Descending Direction Toggle Button */}
      <button
        type="button"
        onClick={toggleSortDirection}
        className="p-1.5 rounded-xl bg-[#171C27] hover:bg-[#1f2635] border border-white/[0.08] hover:border-white/[0.18] text-slate-300 hover:text-white transition-colors"
        title={sortDirection === 'asc' ? 'Ascending (A→Z, Soonest→Latest, Low→High)' : 'Descending (Z→A, Latest→Soonest, High→Low)'}
        aria-label={`Toggle sort direction. Currently ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
      >
        {sortDirection === 'asc' ? (
          <ArrowUp className="w-3.5 h-3.5 text-[#22C55E]" />
        ) : (
          <ArrowDown className="w-3.5 h-3.5 text-[#7C3AED]" />
        )}
      </button>
    </div>
  );
}
