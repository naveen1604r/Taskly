import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { useRecurringTaskContext } from '../../context/RecurringTaskContext';
import { Repeat, CheckCircle2, Circle, ArrowRight } from 'lucide-react';

export default function RoutineSnapshot() {
  const {
    recurringTasks = [],
    toggleInstanceCompletion,
    todayInstances = [],
  } = useRecurringTaskContext();

  const routines = todayInstances.length > 0 ? todayInstances : recurringTasks.slice(0, 4);
  const completedCount = routines.filter((r) => r.isCompleted || r.completed).length;
  const totalCount = routines.length;

  return (
    <Card
      title="Today's Routine"
      subtitle="Recurring habits and operational checklists"
      action={
        <Link
          to="/recurring"
          className="text-xs font-semibold text-[#7C3AED] hover:text-[#c4b5fd] transition-colors flex items-center gap-1"
        >
          <span>View Routines</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      {totalCount === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 italic">
          No recurring routines scheduled for today.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-white/[0.04]">
            <span>Habits Progress</span>
            <span className="font-mono font-bold text-white">
              {completedCount} / {totalCount} completed
            </span>
          </div>

          <div className="space-y-2">
            {routines.map((item) => {
              const isDone = Boolean(item.isCompleted || item.completed);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#171C27] hover:bg-[#1f2635] border border-white/[0.06] transition-all text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() =>
                        toggleInstanceCompletion ? toggleInstanceCompletion(item.id) : null
                      }
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-500 hover:text-[#7C3AED]" />
                      )}
                    </button>
                    <span
                      className={`truncate font-medium ${
                        isDone ? 'text-slate-400 line-through' : 'text-white'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>

                  <span className="text-[10px] text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-0.5 rounded-md border border-[#7C3AED]/20 font-semibold uppercase shrink-0">
                    {item.frequency || 'Daily'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
