import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, AlertTriangle, Trash2, ArrowRight } from 'lucide-react';

export default function DependencyList({ dependencies = [], onRemoveDependency }) {
  if (dependencies.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-slate-400 italic bg-white/[0.02] rounded-2xl border border-white/[0.04]">
        No prerequisite dependencies assigned.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {dependencies.map((dep) => {
        const isCompleted = dep.status === 'completed';

        return (
          <div
            key={dep.id}
            className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all text-xs ${
              isCompleted
                ? 'bg-[#171C27]/50 border-white/[0.04] text-slate-400'
                : dep.isOverdue
                ? 'bg-[#171C27] border-[#EF4444]/30'
                : 'bg-[#171C27] border-white/[0.08]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
              ) : dep.isOverdue ? (
                <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-amber-400 shrink-0" />
              )}

              <div className="min-w-0 flex-1">
                {dep.isMissing ? (
                  <span className="text-slate-500 italic">Deleted Dependency</span>
                ) : (
                  <Link
                    to={`/tasks/${dep.id}`}
                    className={`font-semibold hover:text-[#c4b5fd] transition-colors truncate block ${
                      isCompleted ? 'line-through text-slate-400' : 'text-white'
                    }`}
                  >
                    {dep.title}
                  </Link>
                )}
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                  <span className="capitalize">{dep.priority || 'medium'}</span>
                  {dep.dueDate && (
                    <>
                      <span>•</span>
                      <span>Due: {dep.dueDate}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {onRemoveDependency && (
              <button
                type="button"
                onClick={() => onRemoveDependency(dep.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors shrink-0"
                title="Remove dependency"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
