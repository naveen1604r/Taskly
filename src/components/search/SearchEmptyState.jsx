import React from 'react';
import { Search, SearchX } from 'lucide-react';
import RecentSearches from './RecentSearches';

export default function SearchEmptyState({
  query,
  recentSearches,
  onSelectRecentSearch,
  onRemoveRecentSearch,
  onClearHistory,
}) {
  // If user entered a query but no results were found
  if (query && query.trim()) {
    return (
      <div className="py-12 text-center max-w-sm mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-slate-500">
          <SearchX className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">No results found</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            No tasks, subtasks, notes, or goals match <strong className="text-slate-200">"{query}"</strong>.
          </p>
        </div>
      </div>
    );
  }

  // Initial prompt when search input is empty
  return (
    <div className="space-y-6 py-4">
      <div className="text-center py-6 border-b border-white/[0.06]">
        <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/15 border border-[#7C3AED]/25 flex items-center justify-center mx-auto text-[#7C3AED] mb-3">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">Search Taskly</h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Find tasks, subtasks, notes, goals, tags, and categories instantly.
        </p>
      </div>

      {/* Show recent searches below */}
      <RecentSearches
        searches={recentSearches}
        onSelectSearch={onSelectRecentSearch}
        onRemoveSearch={onRemoveRecentSearch}
        onClearHistory={onClearHistory}
      />
    </div>
  );
}
