import React from 'react';
import { useHabitContext } from '../../context/HabitContext';
import { CheckCircle2, Flame, Trophy, Percent, Clock, Target } from 'lucide-react';

export default function HabitSummary() {
  const { todaySummary } = useHabitContext();

  const cards = [
    {
      label: "Today's Habits",
      value: todaySummary.totalScheduled,
      icon: Target,
      color: 'text-white',
      badge: 'Scheduled',
    },
    {
      label: 'Completed',
      value: todaySummary.completedToday,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      badge: 'Done',
    },
    {
      label: 'Remaining',
      value: todaySummary.remaining,
      icon: Clock,
      color: 'text-amber-400',
      badge: 'Pending',
    },
    {
      label: 'Current Streak',
      value: `${todaySummary.maxCurrentStreak}d`,
      icon: Flame,
      color: 'text-orange-400',
      badge: 'Active',
    },
    {
      label: 'Best Streak',
      value: `${todaySummary.maxBestStreak}d`,
      icon: Trophy,
      color: 'text-yellow-400',
      badge: 'Record',
    },
    {
      label: 'Completion Rate',
      value: `${todaySummary.completionRate}%`,
      icon: Percent,
      color: 'text-[#06B6D4]',
      badge: 'Today',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="p-3.5 rounded-2xl bg-[#11151F] border border-white/[0.06] flex flex-col justify-between space-y-2 hover:border-white/[0.12] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                {c.label}
              </span>
              <Icon className={`w-3.5 h-3.5 ${c.color}`} />
            </div>

            <div className="flex items-baseline justify-between">
              <span className={`text-xl font-black font-mono tracking-tight ${c.color}`}>
                {c.value}
              </span>
              <span className="text-[9px] font-semibold text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded">
                {c.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
