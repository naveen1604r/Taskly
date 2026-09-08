import React from 'react';
import { calculateSubtaskProgress } from '../../utils/taskUtils';
import { CheckCircle2, ListTodo, Sparkles } from 'lucide-react';

export default function SubtaskProgress({ task, className = '' }) {
  const { total, completed, remaining, percentage, isAllCompleted } = calculateSubtaskProgress(task);

  if (total === 0) {
    return (
      <div className={`p-4 rounded-2xl bg-[#11151F] border border-white/[0.08] ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-[#7C3AED]" />
            <h3 className="text-sm font-semibold text-white">Task Progress</h3>
          </div>
          <span className="text-xs text-slate-500">No subtasks</span>
        </div>
        <p className="text-xs text-slate-400">
          Add subtasks below to break down this work into trackable steps.
        </p>
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-2xl bg-[#11151F] border border-white/[0.08] shadow-card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-[#7C3AED]" />
          <h3 className="text-sm font-semibold text-white">Task Progress</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-white bg-[#171C27] px-2 py-0.5 rounded-lg border border-white/[0.08]">
            {completed} / {total} completed
          </span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
              isAllCompleted
                ? 'text-[#22C55E] bg-[#22C55E]/15 border-[#22C55E]/30'
                : 'text-[#7C3AED] bg-[#7C3AED]/15 border-[#7C3AED]/30'
            }`}
          >
            {percentage}%
          </span>
        </div>
      </div>

      {/* Animated Accessible Progress Bar */}
      <div
        className="w-full h-2.5 bg-[#171C27] rounded-full overflow-hidden border border-white/[0.06] p-0.5 relative"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`Task completion progress: ${percentage}%`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isAllCompleted
              ? 'bg-gradient-to-r from-[#22C55E] to-[#10B981]'
              : 'bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Completion Banner if all subtasks are finished */}
      {isAllCompleted && (
        <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 shrink-0 text-[#22C55E]" />
          <span>All subtasks completed 🎉</span>
        </div>
      )}

      {/* Stat Breakdown Pills */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/[0.06] text-center">
        <div className="p-2 rounded-xl bg-[#171C27] border border-white/[0.04]">
          <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-medium">Completed</span>
          <span className="text-sm font-bold text-[#22C55E] font-mono">{completed}</span>
        </div>
        <div className="p-2 rounded-xl bg-[#171C27] border border-white/[0.04]">
          <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-medium">Remaining</span>
          <span className="text-sm font-bold text-amber-400 font-mono">{remaining}</span>
        </div>
        <div className="p-2 rounded-xl bg-[#171C27] border border-white/[0.04]">
          <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-medium">Total</span>
          <span className="text-sm font-bold text-white font-mono">{total}</span>
        </div>
      </div>
    </div>
  );
}
