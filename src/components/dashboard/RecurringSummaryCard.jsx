import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { useRecurringTaskContext } from '../../context/RecurringTaskContext';
import { getHumanRecurrenceSummary, getNextOccurrence } from '../../utils/recurrenceUtils';
import { getTodayDateString } from '../../utils/taskStorage';
import { Repeat, ArrowRight, Clock, Plus } from 'lucide-react';

export default function RecurringSummaryCard() {
  const { recurringTasks, openCreateModal } = useRecurringTaskContext();
  const todayStr = getTodayDateString();

  const activeRules = recurringTasks.filter(
    (r) => r.enabled && (!r.recurrence?.endDate || r.recurrence.endDate >= todayStr)
  );

  const formatNext = (nextDate) => {
    if (!nextDate) return 'No date';
    if (nextDate === todayStr) return 'Today';
    const tomorrowStr = new Date();
    tomorrowStr.setDate(tomorrowStr.getDate() + 1);
    const y = tomorrowStr.getFullYear();
    const m = String(tomorrowStr.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrowStr.getDate()).padStart(2, '0');
    if (nextDate === `${y}-${m}-${d}`) return 'Tomorrow';
    return nextDate.substring(5); // MM-DD
  };

  return (
    <Card
      title="Routines & Habits"
      subtitle={`${activeRules.length} active recurring rules`}
      action={
        <Link
          to="/recurring"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] hover:text-[#c4b5fd] transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
      className="flex flex-col justify-between"
    >
      {activeRules.length === 0 ? (
        <div className="py-6 text-center text-slate-500 italic text-xs">
          <Repeat className="w-6 h-6 mx-auto mb-1.5 text-slate-600 stroke-[1.5]" />
          No active recurring routines.
          <div className="mt-2">
            <button
              type="button"
              onClick={openCreateModal}
              className="text-xs font-semibold text-[#7C3AED] hover:underline"
            >
              + Create Routine
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {activeRules.slice(0, 3).map((rule) => {
            const nextDate = getNextOccurrence(rule, todayStr);
            const summary = getHumanRecurrenceSummary(rule.recurrence);

            return (
              <div
                key={rule.id}
                className="p-2.5 rounded-xl bg-[#171C27] border border-white/[0.04] hover:border-white/[0.1] transition-all flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">
                      {rule.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="truncate">{summary}</span>
                    {rule.plannedStartTime && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[#94A3B8]">{rule.plannedStartTime}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#7C3AED]/15 text-[#c4b5fd] border border-[#7C3AED]/25 font-mono">
                    Next: {formatNext(nextDate)}
                  </span>
                </div>
              </div>
            );
          })}

          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs text-slate-400">
            <span>
              <strong className="text-white">{activeRules.length}</strong> routines automated
            </span>
            <Link
              to="/recurring"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Manage routines →
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}
