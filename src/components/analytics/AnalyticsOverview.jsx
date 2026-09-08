import React from 'react';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import {
  CheckCircle2,
  Clock,
  Flame,
  Percent,
  Hourglass,
  Award,
  TrendingUp,
} from 'lucide-react';

export default function AnalyticsOverview() {
  const { metrics, dateRange } = useAnalyticsContext();

  const cards = [
    {
      id: 'tasks',
      label: 'Tasks Completed',
      value: metrics.completedTasksCount,
      subtext: `out of ${metrics.totalTasks} in period`,
      icon: CheckCircle2,
      color: 'text-[#22C55E]',
      bg: 'bg-[#22C55E]/10 border-[#22C55E]/20',
    },
    {
      id: 'focusTime',
      label: 'Focus Time',
      value: metrics.focusTimeFormatted,
      subtext: `${metrics.focusSessionsCount} sessions completed`,
      icon: Clock,
      color: 'text-[#06B6D4]',
      bg: 'bg-[#06B6D4]/10 border-[#06B6D4]/20',
    },
    {
      id: 'completionRate',
      label: 'Completion Rate',
      value: `${metrics.completionRate}%`,
      subtext: `${metrics.pendingTasksCount} tasks pending`,
      icon: Percent,
      color: 'text-[#7C3AED]',
      bg: 'bg-[#7C3AED]/10 border-[#7C3AED]/20',
    },
    {
      id: 'avgDuration',
      label: 'Average Task Time',
      value: `${metrics.avgTaskDuration} min`,
      subtext: 'average actual duration',
      icon: Hourglass,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'productivityScore',
      label: 'Productivity Score',
      value: `${metrics.productivityScore} / 100`,
      subtext: `Status: ${metrics.scoreStatus}`,
      icon: Award,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      id: 'momentum',
      label: 'Task Velocity',
      value: `${metrics.taskTrendPercent >= 0 ? '+' : ''}${metrics.taskTrendPercent}%`,
      subtext: 'vs prior equivalent period',
      icon: TrendingUp,
      color: metrics.taskTrendPercent >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]',
      bg: metrics.taskTrendPercent >= 0 ? 'bg-[#22C55E]/10 border-[#22C55E]/20' : 'bg-[#EF4444]/10 border-[#EF4444]/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            className="p-3.5 sm:p-4 rounded-2xl bg-[#11151F] border border-white/[0.08] shadow-card hover:border-white/[0.16] transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold text-slate-400 truncate">
                {c.label}
              </span>
              <div className={`p-1.5 rounded-xl border ${c.bg} ${c.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
                {c.value}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">{c.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
