import React, { useState } from 'react';
import { usePlannerContext } from '../../context/PlannerContext';
import { formatTimeDisplay } from '../../utils/plannerUtils';
import Button from '../common/Button';
import { AlertTriangle, Clock, ArrowRight, Check } from 'lucide-react';

export default function ConflictWarning({ conflicts, onResolveMove }) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!conflicts || conflicts.conflictPairs.length === 0 || isDismissed) {
    return null;
  }

  return (
    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-in fade-in duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-amber-300">
              Schedule Conflict Detected ({conflicts.conflictPairs.length} {conflicts.conflictPairs.length === 1 ? 'overlap' : 'overlaps'})
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Two or more tasks are scheduled to run at the same time. You can adjust start times or keep both.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          Keep both
        </button>
      </div>

      {/* List Overlapping Pairs */}
      <div className="space-y-2 pt-1">
        {conflicts.conflictPairs.map(({ taskA, taskB }, idx) => (
          <div
            key={`${taskA.id}-${taskB.id}-${idx}`}
            className="p-3 rounded-xl bg-[#171C27] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 text-white font-semibold truncate">
                <span className="text-[#EF4444] font-mono">
                  {formatTimeDisplay(taskA.plannedStartTime || taskA.dueTime)}
                </span>
                <span className="truncate">{taskA.title}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-300 font-semibold truncate">
                <span className="text-[#EF4444] font-mono">
                  {formatTimeDisplay(taskB.plannedStartTime || taskB.dueTime)}
                </span>
                <span className="truncate">{taskB.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onResolveMove(taskB)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-colors flex items-center gap-1"
              >
                <span>Reschedule</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
