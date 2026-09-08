import React from 'react';
import { useBoardContext } from '../../context/BoardContext';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const sortOptions = [
  { id: 'manual', label: 'Manual Order' },
  { id: 'priority', label: 'Priority' },
  { id: 'due_date', label: 'Due Date' },
  { id: 'recently_updated', label: 'Recently Updated' },
  { id: 'newest', label: 'Created Date' },
  { id: 'estimated_duration', label: 'Estimated Duration' },
  { id: 'alphabetical', label: 'Alphabetical' },
];

export default function BoardSort() {
  const {
    boardSortBy,
    setBoardSortBy,
    boardSortDirection,
    setBoardSortDirection,
  } = useBoardContext();

  const toggleDirection = () => {
    setBoardSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative flex items-center">
        <ArrowUpDown className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <select
          value={boardSortBy}
          onChange={(e) => setBoardSortBy(e.target.value)}
          className="pl-8 pr-7 py-1.5 text-xs bg-[#11151F] hover:bg-[#171C27] text-slate-200 hover:text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none transition-colors appearance-none cursor-pointer font-medium"
          aria-label="Sort Kanban board tasks"
        >
          {sortOptions.map((opt) => (
            <option key={opt.id} value={opt.id} className="bg-[#171C27] text-white">
              Sort: {opt.label}
            </option>
          ))}
        </select>
      </div>

      {boardSortBy !== 'manual' && (
        <button
          type="button"
          onClick={toggleDirection}
          className="p-1.5 rounded-xl bg-[#11151F] hover:bg-[#171C27] border border-white/[0.08] text-slate-300 hover:text-white transition-colors"
          title={boardSortDirection === 'asc' ? 'Ascending' : 'Descending'}
          aria-label={`Toggle sort direction. Currently ${boardSortDirection}`}
        >
          {boardSortDirection === 'asc' ? (
            <ArrowUp className="w-3.5 h-3.5 text-[#22C55E]" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 text-[#7C3AED]" />
          )}
        </button>
      )}
    </div>
  );
}
