import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, Tag, X } from 'lucide-react';

export const noteCategories = [
  'General',
  'Coding',
  'Study',
  'UI/UX',
  'Work',
  'Ideas',
  'Interview',
  'Personal',
  'Other',
];

export default function NotesFilters({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  tagFilter,
  setTagFilter,
  sortBy,
  setSortBy,
  availableCategories,
  availableTags,
}) {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    categoryFilter !== 'all' ||
    tagFilter !== 'all' ||
    sortBy !== 'recently_updated';

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setTagFilter('all');
    setSortBy('recently_updated');
  };

  const allCategories = Array.from(
    new Set([...noteCategories, ...(availableCategories || [])])
  );

  return (
    <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-[#11151F] border border-white/[0.08] shadow-subtle">
      {/* Top Row: Search & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title, content, category, or #tag..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-[#171C27] hover:bg-[#1f2635] focus:bg-[#171C27] text-white placeholder-[#94A3B8]/70 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center">
            <ArrowUpDown className="absolute left-3 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-8 pr-8 py-2.5 text-xs sm:text-sm bg-[#171C27] hover:bg-[#1f2635] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="recently_updated" className="bg-[#171C27] text-white">Sort: Recently Updated</option>
              <option value="recently_created" className="bg-[#171C27] text-white">Sort: Recently Created</option>
              <option value="oldest" className="bg-[#171C27] text-white">Sort: Oldest</option>
              <option value="title_asc" className="bg-[#171C27] text-white">Sort: Title A–Z</option>
              <option value="title_desc" className="bg-[#171C27] text-white">Sort: Title Z–A</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-3 py-2.5 text-xs font-medium text-[#c4b5fd] hover:text-white bg-[#7C3AED]/15 hover:bg-[#7C3AED]/25 rounded-xl border border-[#7C3AED]/30 transition-all flex items-center gap-1.5 shrink-0"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Row: Category & Tags */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#94A3B8] pr-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>Filter:</span>
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-[#171C27] hover:bg-[#1f2635] text-slate-200 rounded-lg border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none transition-colors cursor-pointer"
        >
          <option value="all" className="bg-[#171C27] text-white">Category: All</option>
          {allCategories.map((cat) => (
            <option key={cat} value={cat} className="bg-[#171C27] text-white">
              {cat}
            </option>
          ))}
        </select>

        {/* Tag Filter */}
        {availableTags && availableTags.length > 0 && (
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#171C27] hover:bg-[#1f2635] text-slate-200 rounded-lg border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none transition-colors cursor-pointer max-w-[170px] truncate"
          >
            <option value="all" className="bg-[#171C27] text-white">Tag: All Tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag} className="bg-[#171C27] text-white">
                #{tag}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
