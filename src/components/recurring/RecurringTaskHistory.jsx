import React from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { useRecurringTaskContext } from '../../context/RecurringTaskContext';
import { calculateRuleStats, parseLocalDate } from '../../utils/recurrenceUtils';
import { CheckCircle2, Circle, Clock, FastForward } from 'lucide-react';

export default function RecurringTaskHistory({ rule }) {
  const { tasks, toggleTaskStatus } = useTaskContext();
  const { openSkipConfirm } = useRecurringTaskContext();

  const stats = calculateRuleStats(rule, tasks);

  const formatDate = (dateStr) => {
    const p = parseLocalDate(dateStr);
    if (!p) return dateStr;
    const d = new Date(p.year, p.month - 1, p.day);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-3 pt-2">
      {/* Completion Rate Header */}
      <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
        <span className="text-slate-400 font-medium">Recent Occurrences ({stats.totalOccurrences})</span>
        <span className="font-semibold text-white">
          {stats.completionRate !== null ? (
            <span className="text-[#22C55E]">
              {stats.completionRate}% completion rate ({stats.completedOccurrences}/{stats.totalOccurrences})
            </span>
          ) : (
            <span className="text-slate-500">—</span>
          )}
        </span>
      </div>

      {stats.linkedTasks.length === 0 ? (
        <p className="text-xs text-slate-500 italic py-2">
          No generated task instances recorded yet.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {stats.linkedTasks.slice(0, 10).map((t) => {
            const isDone = t.status === 'completed';
            const dateStr = t.plannedDate || t.dueDate || t.occurrenceDate;

            return (
              <div
                key={t.id}
                className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#171C27] border border-white/[0.04]"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleTaskStatus(t.id)}
                    className="text-slate-400 hover:text-white transition-colors shrink-0"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 hover:text-white" />
                    )}
                  </button>

                  <span className="font-mono text-slate-300 shrink-0 font-medium">
                    {formatDate(dateStr)}
                  </span>

                  <span
                    className={`truncate font-medium ${
                      isDone ? 'text-slate-400 line-through' : 'text-white'
                    }`}
                  >
                    {t.title}
                  </span>
                </div>

                {!isDone && dateStr && (
                  <button
                    type="button"
                    onClick={() => openSkipConfirm(rule, dateStr)}
                    className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1 shrink-0 ml-2"
                    title="Skip this occurrence"
                  >
                    <FastForward className="w-3 h-3" />
                    <span>Skip</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
