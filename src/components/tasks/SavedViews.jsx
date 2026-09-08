import React, { useState } from 'react';
import { useSearchContext } from '../../context/SearchContext';
import { useTaskContext } from '../../context/TaskContext';
import { Bookmark, Edit2, Trash2, Check, X, Layers } from 'lucide-react';

export default function SavedViews({ className = '' }) {
  const {
    savedViews,
    activeViewId,
    applyView,
    renameView,
    deleteView,
  } = useSearchContext();
  const { showToast } = useTaskContext();

  const [editingId, setEditingId] = useState(null);
  const [renameText, setRenameText] = useState('');

  if (!savedViews || savedViews.length === 0) return null;

  const handleStartRename = (view, e) => {
    e.stopPropagation();
    setEditingId(view.id);
    setRenameText(view.name);
  };

  const handleSaveRename = (viewId, e) => {
    e.stopPropagation();
    if (renameText.trim()) {
      renameView(viewId, renameText.trim());
      showToast('View renamed', 'info');
    }
    setEditingId(null);
  };

  const handleDelete = (viewId, viewName, e) => {
    e.stopPropagation();
    if (window.confirm(`Delete saved view "${viewName}"?`)) {
      deleteView(viewId);
      showToast('View deleted', 'info');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
        <Layers className="w-3.5 h-3.5 text-[#7C3AED]" />
        <span>My Saved Views</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {savedViews.map((view) => {
          const isActive = activeViewId === view.id;
          const isEditing = editingId === view.id;

          if (isEditing) {
            return (
              <div
                key={view.id}
                className="inline-flex items-center gap-1 bg-[#171C27] border border-[#7C3AED] rounded-xl px-2 py-1 text-xs"
              >
                <input
                  type="text"
                  value={renameText}
                  onChange={(e) => setRenameText(e.target.value)}
                  autoFocus
                  className="bg-transparent text-white focus:outline-none w-28 text-xs"
                />
                <button
                  type="button"
                  onClick={(e) => handleSaveRename(view.id, e)}
                  className="text-[#22C55E] hover:text-green-400 p-0.5"
                  title="Save name"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(null);
                  }}
                  className="text-slate-400 hover:text-white p-0.5"
                  title="Cancel"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          }

          return (
            <div
              key={view.id}
              onClick={() => applyView(view.id)}
              className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                isActive
                  ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-[#c4b5fd] shadow-sm'
                  : 'bg-[#171C27] border-white/[0.08] hover:border-white/[0.18] text-slate-300 hover:text-white'
              }`}
            >
              <Bookmark className={`w-3 h-3 ${isActive ? 'text-[#7C3AED]' : 'text-slate-400'}`} />
              <span>{view.name}</span>

              {/* Action Buttons (visible on hover or when active) */}
              <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => handleStartRename(view, e)}
                  className="p-0.5 text-slate-400 hover:text-[#06B6D4] transition-colors"
                  title="Rename view"
                  aria-label={`Rename ${view.name}`}
                >
                  <Edit2 className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(view.id, view.name, e)}
                  className="p-0.5 text-slate-400 hover:text-[#EF4444] transition-colors"
                  title="Delete view"
                  aria-label={`Delete ${view.name}`}
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
