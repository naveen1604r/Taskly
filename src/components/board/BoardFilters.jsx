import React, { useState } from 'react';
import { useSearchContext } from '../../context/SearchContext';
import TaskFilters from '../tasks/TaskFilters';
import FilterChips from '../tasks/FilterChips';
import { SlidersHorizontal } from 'lucide-react';

export default function BoardFilters() {
  const { activeFilterCount } = useSearchContext();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
          activeFilterCount > 0
            ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-[#c4b5fd]'
            : 'bg-[#11151F] border-white/[0.08] hover:border-white/[0.18] text-slate-300 hover:text-white'
        }`}
        title="Open filters"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="text-[10px] font-mono font-bold bg-[#7C3AED] text-white px-1.5 py-0.2 rounded-full ml-0.5">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Existing TaskFilters modal */}
      <TaskFilters isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
