import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../common/Button';

export default function BlockedCompletionModal({
  isOpen,
  onClose,
  onConfirm,
  blockingTasksCount = 1,
  taskTitle = 'this task',
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md bg-[#11151F] border border-white/[0.1] rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">This Task is Blocked</h3>
              <p className="text-xs text-slate-400">Incomplete dependency warning</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <span className="font-semibold text-white">"{taskTitle}"</span> depends on{' '}
          <span className="font-bold text-[#F59E0B]">
            {blockingTasksCount} incomplete {blockingTasksCount === 1 ? 'task' : 'tasks'}
          </span>
          . Are you sure you want to mark it as completed anyway?
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-[#F59E0B] hover:bg-[#d97706] text-black font-bold"
          >
            Complete Anyway
          </Button>
        </div>
      </div>
    </div>
  );
}
