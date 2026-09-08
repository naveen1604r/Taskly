import React, { useState, useEffect, useRef } from 'react';
import { useSearchContext } from '../../context/SearchContext';
import { useTaskContext } from '../../context/TaskContext';
import { Bookmark, X, Check } from 'lucide-react';
import Button from '../common/Button';

export default function SaveViewModal({ isOpen, onClose }) {
  const { saveView, activeFilterCount, activeFilters, sortBy, sortDirection } = useSearchContext();
  const { showToast } = useTaskContext();
  const [viewName, setViewName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setViewName('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!viewName.trim()) {
      setError('Please provide a name for this saved view.');
      return;
    }

    saveView(viewName.trim());
    showToast('View saved successfully.', 'success');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-view-title"
    >
      <div
        className="w-full max-w-md bg-[#11151F] border border-white/[0.1] rounded-2xl p-5 sm:p-6 shadow-hover space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#7C3AED]" />
            <h3 id="save-view-title" className="text-base font-semibold text-white">
              Save this view
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              View Name <span className="text-[#EF4444]">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={viewName}
              onChange={(e) => {
                setViewName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. High Priority Sprint"
              className="w-full bg-[#171C27] border border-white/[0.1] focus:border-[#7C3AED] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 transition-all"
            />
            {error && <p className="text-xs text-[#EF4444] mt-1">{error}</p>}
          </div>

          <div className="p-3 rounded-xl bg-[#171C27]/50 border border-white/[0.04] text-xs space-y-1.5 text-slate-400">
            <div className="flex justify-between">
              <span>Active filters:</span>
              <span className="font-semibold text-white">{activeFilterCount} active</span>
            </div>
            <div className="flex justify-between">
              <span>Sorting:</span>
              <span className="font-semibold text-white capitalize">{sortBy.replace('_', ' ')} ({sortDirection})</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.08]">
            <Button variant="secondary" size="sm" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save View
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
