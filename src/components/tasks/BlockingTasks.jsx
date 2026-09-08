import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock, Clock } from 'lucide-react';

export default function BlockingTasks({ dependentTasks = [] }) {
  if (dependentTasks.length === 0) return null;

  return (
    <div className="space-y-2 p-3.5 rounded-2xl bg-[#11151F] border border-white/[0.06] text-xs">
      <div className="flex items-center gap-2 text-amber-400 font-bold">
        <Lock className="w-4 h-4" />
        <span>
          {dependentTasks.length} {dependentTasks.length === 1 ? 'task is' : 'tasks are'} waiting for this deliverable
        </span>
      </div>
      <p className="text-[11px] text-slate-400">
        Completing this task will unblock the following downstream items:
      </p>

      <div className="space-y-1.5 pt-1">
        {dependentTasks.map((dep) => (
          <Link
            key={dep.id}
            to={`/tasks/${dep.id}`}
            className="flex items-center justify-between p-2 rounded-xl bg-[#171C27] hover:bg-[#1f2635] border border-white/[0.04] text-slate-300 hover:text-white transition-colors"
          >
            <span className="font-semibold truncate">{dep.title}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-2" />
          </Link>
        ))}
      </div>
    </div>
  );
}
