import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchContext } from '../../context/SearchContext';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';
import SearchEmptyState from './SearchEmptyState';
import { Sparkles, Command } from 'lucide-react';

export default function GlobalSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  } = useSearchContext();

  useEffect(() => {
    if (initialQ && initialQ !== searchQuery) {
      setSearchQuery(initialQ);
    }
  }, [initialQ]);

  // Keep URL param synchronized with search query
  const handleQueryChange = (val) => {
    setSearchQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const handleSelectResult = () => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim());
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Page Title & Tagline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#c4b5fd] bg-[#7C3AED]/15 px-2 py-0.5 rounded-md border border-[#7C3AED]/25">
              <Sparkles className="w-3 h-3 text-[#7C3AED]" />
              Smart Search
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Universal Discovery
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Search simultaneously across tasks, subtasks, notes, goals, and tags.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-[#11151F] border border-white/[0.08] px-3 py-1.5 rounded-xl">
          <span>Shortcut:</span>
          <kbd className="px-2 py-0.5 rounded bg-[#171C27] text-white border border-white/[0.1] font-mono text-[11px]">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Prominent Search Bar */}
      <SearchInput
        value={searchQuery}
        onChange={handleQueryChange}
        onClear={() => handleQueryChange('')}
        placeholder="Search tasks, notes, goals..."
      />

      {/* Search Content */}
      <div className="pt-2">
        {searchResults.totalCount > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
              <span>
                Found <strong className="text-white">{searchResults.totalCount}</strong> matching items
              </span>
              <span>Sorted by relevance</span>
            </div>
            <SearchResults
              results={searchResults}
              query={searchQuery}
              onSelect={handleSelectResult}
            />
          </div>
        ) : (
          <SearchEmptyState
            query={searchQuery}
            recentSearches={recentSearches}
            onSelectRecentSearch={(q) => handleQueryChange(q)}
            onRemoveRecentSearch={removeRecentSearch}
            onClearHistory={clearRecentSearches}
          />
        )}
      </div>
    </div>
  );
}
