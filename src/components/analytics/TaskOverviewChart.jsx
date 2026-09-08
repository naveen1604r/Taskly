import React from 'react';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { CheckCircle2, Clock, AlertCircle, PlayCircle, CheckSquare } from 'lucide-react';

export default function TaskOverviewChart() {
  const { metrics } = useAnalyticsContext();

  const total = metrics.totalTasks || 0;

  const statuses = [
    {
      label: 'Completed',
      count: metrics.tasksCompleted,
      color: 'bg-[#22C55E]',
      textColor: 'text-[#22C55E]',
      icon: CheckCircle2,
    },
    {
      label: 'In Progress',
      count: metrics.inProgressTasksCount,
      color: 'bg-[#06B6D4]',
      textColor: 'text-[#06B6D4]',
      icon: PlayCircle,
    },
    {
      label: 'Pending',
      count: metrics.pendingTasksCount,
      color: 'bg-amber-400',
      textColor: 'text-amber-400',
      icon: Clock,
    },
    {
      label: 'Overdue',
      count: metrics.overdueTasksCount,
      color: 'bg-[#EF4444]',
      textColor: 'text-[#EF4444]',
      icon: AlertCircle,
    },
  ];

  return (
    <Card
      title="Task Status Overview"
      subtitle={`${total} total tasks in selected timeframe`}
      className="flex flex-col justify-between"
    >
      {total === 0 ? (
        <div className="py-12 text-center text-slate-500 italic text-xs">
          <CheckSquare className="w-8 h-8 mx-auto mb-2 text-slate-600 stroke-[1.5]" />
          No tasks found in this period.
        </div>
      ) : (
        <div className="space-y-4">
          {statuses.map((item) => {
            const Icon = item.icon;
            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;

            return (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <Icon className={`w-3.5 h-3.5 ${item.textColor}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-normal">({percentage}%)</span>
                    <span className="text-white font-bold">{item.count}</span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-[#171C27] rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                    style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
