import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search tasks, notes, goals...',
  autoFocus = true,
  className = '',
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [autoFocus]);

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Global search query"
        className="w-full bg-[#171C27] border border-white/[0.1] focus:border-[#7C3AED] rounded-2xl pl-12 pr-12 py-3.5 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 transition-all shadow-inner"
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors"
          title="Clear search"
          aria-label="Clear search text"
        >
          <X className="w-4 h-4" />
        </button>
      ) : (
        <span className="hidden sm:flex items-center gap-1 absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/[0.08]">
          ESC
        </span>
      )}
    </div>
  );
}
