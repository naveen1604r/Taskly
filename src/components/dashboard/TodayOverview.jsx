import React from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { useFocusContext } from '../../context/FocusContext';
import { getTodaySummary } from '../../utils/dashboardUtils';
import { CheckCircle2, Circle, Clock, Flame, ListTodo, TrendingUp } from 'lucide-react';

export default function TodayOverview() {
  const { tasks } = useTaskContext();
  const { dailyStats, totalFocusTimeToday } = useFocusContext();

  const todayFocusMinutes = Math.round((totalFocusTimeToday || dailyStats?.totalDuration || 0) / 60);

  const {
    total,
    completed,
    remaining,
    percentage,
    focusTimeFormatted,
  } = getTodaySummary({ tasks, todayFocusMinutes });

  const metrics = [
    {
      id: 'total',
      label: "Today's Tasks",
      value: total,
      subtext: `${remaining} pending`,
      icon: ListTodo,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      id: 'completed',
      label: 'Completed',
      value: completed,
      subtext: `${percentage}% completed`,
      icon: CheckCircle2,
      color: 'text-[#22C55E]',
      bg: 'bg-[#22C55E]/10 border-[#22C55E]/20',
    },
    {
      id: 'remaining',
      label: 'Remaining',
      value: remaining,
      subtext: remaining === 0 ? 'All done 🎉' : 'Needs attention',
      icon: Circle,
      color: 'text-[#F59E0B]',
      bg: 'bg-[#F59E0B]/10 border-[#F59E0B]/20',
    },
    {
      id: 'focus',
      label: 'Focus Time',
      value: focusTimeFormatted,
      subtext: `${dailyStats?.sessionsCount || 0} sessions today`,
      icon: Clock,
      color: 'text-[#06B6D4]',
      bg: 'bg-[#06B6D4]/10 border-[#06B6D4]/20',
    },
    {
      id: 'productivity',
      label: 'Productivity',
      value: `${percentage}%`,
      subtext: percentage >= 75 ? 'Optimal pace 🔥' : 'In progress',
      icon: TrendingUp,
      color: 'text-[#7C3AED]',
      bg: 'bg-[#7C3AED]/10 border-[#7C3AED]/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.id}
            className="p-3.5 sm:p-4 rounded-2xl bg-[#11151F] border border-white/[0.08] shadow-card hover:border-white/[0.16] transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-400 truncate">
                {m.label}
              </span>
              <div className={`p-1.5 rounded-xl border ${m.bg} ${m.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
                {m.value}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{m.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
