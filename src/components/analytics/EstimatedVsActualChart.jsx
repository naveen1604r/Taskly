import React from 'react';
import Card from '../common/Card';
import { useTaskContext } from '../../context/TaskContext';
import { useFocusContext } from '../../context/FocusContext';
import {
  calculateEstimatedVsActual,
  getMostFocusedTask,
  getMostProductiveDay,
  formatDurationMinutes,
} from '../../utils/focusUtils';
import { Clock, Flame, ArrowUpRight, ArrowDownRight, Award, Calendar } from 'lucide-react';

export default function EstimatedVsActualChart() {
  const { tasks } = useTaskContext();
  const { focusSessions } = useFocusContext();

  const { comparedTasks, totalEstimated, totalActual, efficiency } =
    calculateEstimatedVsActual(tasks);
  const mostFocused = getMostFocusedTask(focusSessions, tasks);
  const productiveDay = getMostProductiveDay(focusSessions);

  return (
    <Card
      title="Estimated vs Actual Duration"
      subtitle="Planning accuracy, session efficiency, and deep work benchmarks"
      className="space-y-4 border-white/[0.08]"
    >
      {/* Overview Stat Blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[#171C27] border border-white/[0.04] text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Estimated</span>
          <span className="text-base sm:text-lg font-bold text-[#06B6D4] font-mono mt-0.5 block">
            {formatDurationMinutes(totalEstimated)}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#171C27] border border-white/[0.04] text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Actual</span>
          <span className="text-base sm:text-lg font-bold text-[#22C55E] font-mono mt-0.5 block">
            {formatDurationMinutes(totalActual)}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#171C27] border border-white/[0.04] text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Planning Efficiency</span>
          <span className="text-base sm:text-lg font-bold text-[#7C3AED] font-mono mt-0.5 block">
            {efficiency}%
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#171C27] border border-white/[0.04] text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Best Day</span>
          <span className="text-base sm:text-lg font-bold text-[#F59E0B] mt-0.5 block truncate">
            {productiveDay.dayName || 'None'}
          </span>
        </div>
      </div>

      {/* Task Comparison List */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
          Deliverables Analyzed
        </h4>

        {comparedTasks.length === 0 ? (
          <div className="py-6 text-center text-slate-500 italic text-xs">
            No task duration data available for comparison yet.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {comparedTasks.slice(0, 6).map((t) => (
              <div
                key={t.id}
                className="p-2.5 rounded-xl bg-[#171C27] border border-white/[0.04] flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-white truncate block">{t.title}</span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>Est: {t.estimated}m</span>
                    <span>•</span>
                    <span className="text-[#22C55E]">Actual: {t.actual}m</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                      t.diff > 0
                        ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/25'
                        : t.diff < 0
                        ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/25'
                        : 'bg-white/5 text-slate-300'
                    }`}
                  >
                    {t.diff > 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : t.diff < 0 ? (
                      <ArrowDownRight className="w-3 h-3" />
                    ) : null}
                    <span>{t.diffFormatted}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Focused Task Highlight */}
      {mostFocused && (
        <div className="p-3 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Award className="w-4 h-4 text-[#7C3AED] shrink-0" />
            <div className="truncate">
              <span className="text-slate-400">Most Focused Deliverable: </span>
              <strong className="text-white">{mostFocused.taskTitle}</strong>
            </div>
          </div>
          <span className="font-mono font-bold text-[#c4b5fd] shrink-0">
            {formatDurationMinutes(mostFocused.focusMinutes)}
          </span>
        </div>
      )}
    </Card>
  );
}
