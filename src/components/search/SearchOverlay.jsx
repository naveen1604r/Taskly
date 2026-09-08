import React from 'react';
import { useSearchContext } from '../../context/SearchContext';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';
import SearchEmptyState from './SearchEmptyState';
import { X, Command } from 'lucide-react';

export default function SearchOverlay() {
  const {
    isSearchOpen,
    closeSearch,
    searchQuery,
    setSearchQuery,
    searchResults,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  } = useSearchContext();

  if (!isSearchOpen) return null;

  const handleSelectResult = () => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim());
    }
    closeSearch();
  };

  const handleSelectRecentSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
      onClick={closeSearch}
      role="dialog"
      aria-modal="true"
      aria-labelledby="global-search-modal-title"
    >
      <div
        className="w-full sm:max-w-2xl md:max-w-3xl min-h-screen sm:min-h-0 sm:max-h-[85vh] bg-[#11151F] sm:border border-white/[0.1] sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#c4b5fd] bg-[#7C3AED]/15 px-2.5 py-1 rounded-lg border border-[#7C3AED]/30">
              <Command className="w-3 h-3 text-[#7C3AED]" />
              <span>K</span>
            </span>
            <h2 id="global-search-modal-title" className="text-sm font-semibold text-white">
              Global Search
            </h2>
          </div>

          <button
            type="button"
            onClick={closeSearch}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            aria-label="Close search overlay"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search tasks, notes, goals..."
        />

        {/* Scrollable Results Area */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4 max-h-[60vh]">
          {searchResults.totalCount > 0 ? (
            <SearchResults
              results={searchResults}
              query={searchQuery}
              onSelect={handleSelectResult}
            />
          ) : (
            <SearchEmptyState
              query={searchQuery}
              recentSearches={recentSearches}
              onSelectRecentSearch={handleSelectRecentSearch}
              onRemoveRecentSearch={removeRecentSearch}
              onClearHistory={clearRecentSearches}
            />
          )}
        </div>

        {/* Footer info bar */}
        <div className="pt-3 mt-3 border-t border-white/[0.06] hidden sm:flex items-center justify-between text-xs text-slate-500">
          <span>Navigate with mouse or keyboard • Enter to select</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
