import React from 'react';
import Card from '../common/Card';
import { useTaskContext } from '../../context/TaskContext';
import { useFocusContext } from '../../context/FocusContext';
import { getProductivityTrends } from '../../utils/dashboardUtils';
import { Sparkles, Calendar, Clock, Tag, Flame, CheckCircle } from 'lucide-react';

export default function ProductivityTrends() {
  const { tasks } = useTaskContext();
  const { focusSessions = [] } = useFocusContext();

  const trends = getProductivityTrends({ tasks, focusSessions });

  // Calculate average task duration
  const completed = tasks.filter((t) => t.status === 'completed');
  const totalMins = completed.reduce((acc, t) => {
    let est = Number(t.estimatedDuration || t.duration) || 0;
    if (t.durationUnit === 'hours') est *= 60;
    return acc + est;
  }, 0);
  const avgTaskDuration = completed.length > 0 ? Math.round(totalMins / completed.length) : 0;

  const insights = [
    {
      id: 'day',
      label: 'Peak Productive Day',
      value: trends.peakDay,
      icon: Calendar,
      color: 'text-[#7C3AED]',
    },
    {
      id: 'focus',
      label: 'Avg Daily Focus',
      value: `${trends.avgDailyFocusMins}m / day`,
      icon: Clock,
      color: 'text-[#06B6D4]',
    },
    {
      id: 'cat',
      label: 'Top Focus Category',
      value: trends.topCategory,
      icon: Tag,
      color: 'text-[#F59E0B]',
    },
    {
      id: 'duration',
      label: 'Avg Task Duration',
      value: `${avgTaskDuration} mins`,
      icon: CheckCircle,
      color: 'text-[#22C55E]',
    },
  ];

  return (
    <Card
      title="Productivity Trends"
      subtitle="Calculated behavioral patterns and peak output times"
      action={<Sparkles className="w-4 h-4 text-[#7C3AED]" />}
    >
      <div className="grid grid-cols-2 gap-3">
        {insights.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-[#171C27] border border-white/[0.04] flex items-center gap-3"
            >
              <div className={`p-2 rounded-lg bg-white/[0.04] ${item.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-slate-400 font-medium block truncate">
                  {item.label}
                </span>
                <span className="text-xs sm:text-sm font-bold text-white block truncate">
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
