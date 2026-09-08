import React from 'react';
import { Link } from 'react-router-dom';
import { useHabitContext } from '../../context/HabitContext';
import { getTodayDateString } from '../../utils/taskStorage';
import { isHabitScheduledForDate, getHabitProgressForDate } from '../../utils/habitUtils';
import { Flame, Check, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function TodayHabitsSection() {
  const { activeHabits, habitLogs, todaySummary, toggleHabitComplete } = useHabitContext();
  const todayStr = getTodayDateString();

  const scheduledToday = activeHabits.filter((h) => isHabitScheduledForDate(h, todayStr));

  if (scheduledToday.length === 0) return null;

  return (
    <section className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400 fill-current" />
          <span>
            Today's Habits ({todaySummary.completedToday} / {todaySummary.totalScheduled})
          </span>
        </h3>
        <Link
          to="/habits"
          className="text-xs text-[#7C3AED] hover:text-[#c4b5fd] font-semibold transition-colors inline-flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {scheduledToday.map((habit) => {
          const p = getHabitProgressForDate(habit, habitLogs, todayStr);
          return (
            <div
              key={habit.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                p.completed
                  ? 'bg-[#171C27] border-emerald-500/25'
                  : 'bg-[#171C27]/60 border-white/[0.04] hover:border-white/[0.1]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => toggleHabitComplete(habit.id, todayStr)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                    p.completed
                      ? 'bg-[#22C55E] text-white shadow-sm'
                      : 'bg-white/[0.06] text-slate-400 hover:text-white hover:bg-[#7C3AED]'
                  }`}
                  aria-label={`Toggle ${habit.name}`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                <div className="min-w-0 flex-1">
                  <span
                    className={`font-semibold truncate block ${
                      p.completed ? 'line-through text-slate-400' : 'text-white'
                    }`}
                  >
                    {habit.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                    <span>
                      {p.count} / {habit.targetCount} {habit.unit}
                    </span>
                    {habit.routineGroup && habit.routineGroup !== 'none' && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{habit.routineGroup}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
