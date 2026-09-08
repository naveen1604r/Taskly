import React, { useState } from 'react';
import { useInboxContext } from '../../context/InboxContext';
import { CheckCheck, Archive, Trash2, X, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';

export default function BulkActionBar({ selectedIds = [], onClearSelection }) {
  const { bulkArchive, bulkDelete, bulkMarkProcessed } = useInboxContext();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  if (selectedIds.length === 0) return null;

  const handleArchive = () => {
    bulkArchive(selectedIds);
    onClearSelection();
  };

  const handleMarkProcessed = () => {
    bulkMarkProcessed(selectedIds);
    onClearSelection();
  };

  const handleDelete = () => {
    bulkDelete(selectedIds);
    setIsDeleteConfirmOpen(false);
    onClearSelection();
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#11151F] border border-white/[0.12] rounded-3xl p-3 sm:px-5 sm:py-3 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-150 text-xs">
        <div className="flex items-center gap-2 border-r border-white/[0.08] pr-3">
          <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white font-bold flex items-center justify-center text-[10px]">
            {selectedIds.length}
          </span>
          <span className="font-bold text-white hidden sm:inline">Selected</span>
        </div>

        <button
          type="button"
          onClick={handleMarkProcessed}
          className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 hover:text-white font-semibold transition-colors flex items-center gap-1.5"
        >
          <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Mark Processed</span>
        </button>

        <button
          type="button"
          onClick={handleArchive}
          className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 hover:text-white font-semibold transition-colors flex items-center gap-1.5"
        >
          <Archive className="w-3.5 h-3.5 text-amber-400" />
          <span>Archive</span>
        </button>

        <button
          type="button"
          onClick={() => setIsDeleteConfirmOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-[#EF4444]/15 hover:bg-[#EF4444] text-[#EF4444] hover:text-white border border-[#EF4444]/30 font-semibold transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>

        <button
          type="button"
          onClick={onClearSelection}
          className="p-1 rounded-xl text-slate-400 hover:text-white transition-colors ml-1"
          title="Clear Selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsDeleteConfirmOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#11151F] border border-white/[0.1] rounded-3xl p-6 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 text-[#EF4444]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-white">Delete Selected Items?</h3>
            </div>
            <p className="text-slate-300">
              Are you sure you want to permanently delete {selectedIds.length} inbox items? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
              <Button variant="ghost" size="sm" onClick={() => setIsDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-[#EF4444] hover:bg-[#dc2626] text-white font-bold"
              >
                Yes, Delete Items
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
