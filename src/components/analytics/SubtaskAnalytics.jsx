import React from 'react';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { ListTodo, CheckSquare, Clock, CheckCircle2 } from 'lucide-react';

export default function SubtaskAnalytics() {
  const { metrics } = useAnalyticsContext();
  const subtasks = metrics.subtaskStats || { total: 0, completed: 0, remaining: 0, rate: 0 };

  return (
    <Card
      title="Subtask & Checklist Analytics"
      subtitle="Micro-productivity and granular checkpoint completion rates"
      action={
        <span className="text-xs font-mono font-semibold text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/25 px-2.5 py-1 rounded-xl">
          {subtasks.rate}% Completion Rate
        </span>
      }
    >
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Total Subtasks
          </span>
          <span className="text-lg font-bold text-white font-mono">
            {subtasks.total}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Completed
          </span>
          <span className="text-lg font-bold text-[#22C55E] font-mono">
            {subtasks.completed}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Remaining
          </span>
          <span className="text-lg font-bold text-amber-400 font-mono">
            {subtasks.remaining}
          </span>
        </div>
      </div>
    </Card>
  );
}
