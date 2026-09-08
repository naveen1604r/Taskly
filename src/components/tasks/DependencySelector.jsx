import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { getAvailableDependencies, wouldCreateDependencyCycle } from '../../utils/dependencyUtils';
import { Search, Plus, X, AlertCircle, Link2, Check } from 'lucide-react';
import Button from '../common/Button';

export default function DependencySelector({
  taskId,
  currentDependencyIds = [],
  onAddDependency,
  isOpen,
  onClose,
}) {
  const { tasks } = useTaskContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [cycleError, setCycleError] = useState('');

  if (!isOpen) return null;

  const availableTasks = getAvailableDependencies(
    taskId,
    tasks,
    currentDependencyIds,
    searchQuery
  );

  const handleSelectTask = (depTaskId) => {
    if (wouldCreateDependencyCycle(taskId, depTaskId, tasks)) {
      setCycleError('Cannot add this task: it would create a circular dependency loop.');
      return;
    }
    setCycleError('');
    onAddDependency(depTaskId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg bg-[#11151F] border border-white/[0.1] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-150 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-[#7C3AED]" />
            <div>
              <h3 className="text-base font-bold text-white">Add Task Dependency</h3>
              <p className="text-xs text-slate-400">Select prerequisite deliverables that must be finished first</p>
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

        {/* Circular Dependency Warning Alert (Requirement 13) */}
        {cycleError && (
          <div className="p-3 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{cycleError}</span>
          </div>
        )}

        {/* Search input */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCycleError('');
            }}
            placeholder="Search available tasks by title or category..."
            className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]"
          />
        </div>

        {/* Available Tasks List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {availableTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 italic">
              No eligible prerequisite tasks found.
            </div>
          ) : (
            availableTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#171C27] hover:bg-[#1f2635] border border-white/[0.04] hover:border-white/[0.14] transition-all"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-white block truncate">{t.title}</span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span className="capitalize">{t.priority || 'medium'}</span>
                    <span>•</span>
                    <span>{t.category || 'General'}</span>
                    <span>•</span>
                    <span
                      className={`capitalize ${
                        t.status === 'completed'
                          ? 'text-[#22C55E]'
                          : t.status === 'in_progress'
                          ? 'text-[#06B6D4]'
                          : 'text-amber-400'
                      }`}
                    >
                      {t.status || 'Pending'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTask(t.id)}
                  className="px-3 py-1.5 rounded-xl bg-[#7C3AED]/15 hover:bg-[#7C3AED] text-[#c4b5fd] hover:text-white border border-[#7C3AED]/30 font-semibold transition-colors flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Link</span>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-white/[0.08] flex justify-end shrink-0">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
