import React from 'react';
import { Link } from 'react-router-dom';
import { useHabitContext } from '../../context/HabitContext';
import { getTodayDateString } from '../../utils/taskStorage';
import { isHabitScheduledForDate, getHabitProgressForDate } from '../../utils/habitUtils';
import Card from '../common/Card';
import { Flame, Check, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HabitWidget() {
  const { activeHabits, habitLogs, todaySummary, toggleHabitComplete } = useHabitContext();
  const todayStr = getTodayDateString();

  const scheduledToday = activeHabits.filter((h) => isHabitScheduledForDate(h, todayStr)).slice(0, 4);

  return (
    <Card
      title="Habit Consistency"
      subtitle={`${todaySummary.completedToday} of ${todaySummary.totalScheduled} completed`}
      action={
        <Link
          to="/habits"
          className="text-xs text-[#7C3AED] hover:text-[#c4b5fd] font-semibold transition-colors inline-flex items-center gap-1"
        >
          <span>View Habits</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-3 text-xs">
        {/* Streak & Completion Banner */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#171C27] border border-white/[0.04]">
          <div className="flex items-center gap-1.5 text-orange-400 font-bold">
            <Flame className="w-4 h-4 fill-current" />
            <span>{todaySummary.maxCurrentStreak} day streak</span>
          </div>
          <span className="font-mono text-cyan-400 font-bold">
            {todaySummary.completionRate}% Done
          </span>
        </div>

        {/* Habits List */}
        {scheduledToday.length === 0 ? (
          <div className="py-4 text-center text-slate-500 italic space-y-1">
            <CheckCircle2 className="w-6 h-6 mx-auto opacity-40 text-emerald-400" />
            <p className="text-xs">No habits scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {scheduledToday.map((habit) => {
              const p = getHabitProgressForDate(habit, habitLogs, todayStr);
              return (
                <div
                  key={habit.id}
                  className="p-2.5 rounded-xl bg-[#171C27]/60 border border-white/[0.04] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <span
                      className={`font-semibold truncate block ${
                        p.completed ? 'line-through text-slate-400' : 'text-white'
                      }`}
                    >
                      {habit.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {p.count} / {habit.targetCount} {habit.unit}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleHabitComplete(habit.id, todayStr)}
                    className={`p-1.5 rounded-lg font-bold transition-colors ${
                      p.completed
                        ? 'bg-[#22C55E] text-white'
                        : 'bg-white/[0.06] text-slate-400 hover:text-white hover:bg-[#7C3AED]'
                    }`}
                    title={p.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
