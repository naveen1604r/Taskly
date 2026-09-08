import React from 'react';
import { useSearchContext } from '../../context/SearchContext';
import { X, Trash2 } from 'lucide-react';

export default function FilterChips({ className = '' }) {
  const {
    activeFilters,
    removeFilter,
    clearFilters,
    activeFilterCount,
  } = useSearchContext();

  if (activeFilterCount === 0) return null;

  const chips = [];

  if (activeFilters.status !== 'all') {
    chips.push({
      key: 'status',
      label: `Status: ${activeFilters.status.replace('_', ' ')}`,
      onRemove: () => removeFilter('status'),
      color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    });
  }

  if (activeFilters.priority !== 'all') {
    chips.push({
      key: 'priority',
      label: `Priority: ${activeFilters.priority}`,
      onRemove: () => removeFilter('priority'),
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    });
  }

  if (activeFilters.category !== 'all') {
    chips.push({
      key: 'category',
      label: `Category: ${activeFilters.category}`,
      onRemove: () => removeFilter('category'),
      color: 'border-[#7C3AED]/30 bg-[#7C3AED]/10 text-[#c4b5fd]',
    });
  }

  if (Array.isArray(activeFilters.tags) && activeFilters.tags.length > 0) {
    activeFilters.tags.forEach((tag) => {
      chips.push({
        key: `tag-${tag}`,
        label: `#${tag}`,
        onRemove: () => {
          removeFilter('tags');
        },
        color: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
      });
    });
  }

  if (activeFilters.date !== 'all') {
    chips.push({
      key: 'date',
      label: `Due: ${activeFilters.date.replace('_', ' ')}`,
      onRemove: () => removeFilter('date'),
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    });
  }

  if (activeFilters.duration !== 'all') {
    chips.push({
      key: 'duration',
      label: `Duration: ${activeFilters.duration}`,
      onRemove: () => removeFilter('duration'),
      color: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
    });
  }

  if (activeFilters.goalId !== 'all') {
    chips.push({
      key: 'goalId',
      label: 'Goal Filtered',
      onRemove: () => removeFilter('goalId'),
      color: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
    });
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 pt-2 animate-in fade-in duration-150 ${className}`}>
      <span className="text-xs text-slate-400 font-medium mr-1">Active filters:</span>

      {chips.map((chip) => (
        <span
          key={chip.key}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${chip.color} transition-all`}
        >
          <span className="capitalize">{chip.label}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="hover:opacity-75 focus:outline-none p-0.5 rounded"
            title={`Remove ${chip.label}`}
            aria-label={`Remove filter ${chip.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={clearFilters}
        className="text-xs text-slate-400 hover:text-white underline transition-colors ml-1 font-medium"
      >
        Clear All
      </button>
    </div>
  );
}
