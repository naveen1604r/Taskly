import React from 'react';
import { History, X, Trash2 } from 'lucide-react';

export default function RecentSearches({
  searches = [],
  onSelectSearch,
  onRemoveSearch,
  onClearHistory,
}) {
  if (!searches || searches.length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <History className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>Recent Searches</span>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          className="text-xs text-slate-500 hover:text-[#EF4444] transition-colors flex items-center gap-1 font-medium"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {searches.map((item) => (
          <div
            key={item}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#171C27] hover:bg-[#1f2635] border border-white/[0.08] hover:border-white/[0.18] transition-all text-xs text-slate-200"
          >
            <button
              type="button"
              onClick={() => onSelectSearch(item)}
              className="hover:text-white transition-colors"
            >
              {item}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveSearch(item);
              }}
              className="text-slate-500 hover:text-[#EF4444] transition-colors p-0.5 rounded ml-0.5"
              title={`Remove "${item}" from history`}
              aria-label={`Remove "${item}" from history`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
