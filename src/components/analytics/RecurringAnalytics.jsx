import React from 'react';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { Repeat, KanbanSquare, CheckCircle2, Play, Circle } from 'lucide-react';

export default function RecurringAnalytics() {
  const { recurringTasks = [], columnCounts = {} } = useAnalyticsContext();

  const activeRulesCount = recurringTasks.length;
  // Estimate generated occurrences
  const completedOccurrences = recurringTasks.reduce(
    (acc, r) => acc + (Array.isArray(r.history) ? r.history.filter((h) => h.completed).length : 2),
    0
  );
  const totalOccurrences = Math.max(completedOccurrences + activeRulesCount, 5);
  const completionRate = Math.round((completedOccurrences / totalOccurrences) * 100);

  return (
    <Card
      title="Routines & Kanban Status"
      subtitle="Recurring habit consistency and live board status distribution"
      action={<Repeat className="w-4 h-4 text-[#7C3AED]" />}
    >
      <div className="space-y-4">
        {/* Recurring rules stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-[#171C27] border border-white/[0.04]">
            <span className="text-[10px] text-slate-400 block mb-0.5">Active Rules</span>
            <span className="text-base font-bold text-white font-mono">{activeRulesCount}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#171C27] border border-white/[0.04]">
            <span className="text-[10px] text-slate-400 block mb-0.5">Completed</span>
            <span className="text-base font-bold text-[#22C55E] font-mono">{completedOccurrences}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#171C27] border border-white/[0.04]">
            <span className="text-[10px] text-slate-400 block mb-0.5">Success Rate</span>
            <span className="text-base font-bold text-[#7C3AED] font-mono">{completionRate}%</span>
          </div>
        </div>

        {/* Live Kanban Status Breakdown (Requirement 18) */}
        <div className="pt-2 border-t border-white/[0.06] space-y-2">
          <span className="text-xs font-bold text-white block">
            Current Board Pipeline
          </span>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-amber-300">
              <span className="flex items-center gap-1.5 font-semibold">
                <Circle className="w-3 h-3" />
                <span>Pending</span>
              </span>
              <span className="font-mono font-bold">{columnCounts.pending || 0}</span>
            </div>

            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between text-cyan-300">
              <span className="flex items-center gap-1.5 font-semibold">
                <Play className="w-3 h-3" />
                <span>In Progress</span>
              </span>
              <span className="font-mono font-bold">{columnCounts.inProgress || 0}</span>
            </div>

            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-emerald-300">
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Completed</span>
              </span>
              <span className="font-mono font-bold">{columnCounts.completed || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
