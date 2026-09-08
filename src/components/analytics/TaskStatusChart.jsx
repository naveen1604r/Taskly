import React from 'react';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { PieChart, CheckCircle2, Play, Circle, AlertTriangle } from 'lucide-react';

export default function TaskStatusChart() {
  const { metrics } = useAnalyticsContext();

  const total = metrics.totalTasks || 1;
  const completedPct = Math.round(((metrics.completedTasksCount || 0) / total) * 100);
  const inProgressPct = Math.round(((metrics.inProgressTasksCount || 0) / total) * 100);
  const pendingPct = Math.round(((metrics.pendingTasksCount || 0) / total) * 100);
  const overduePct = Math.round(((metrics.overdueTasksCount || 0) / total) * 100);

  const segments = [
    {
      id: 'completed',
      label: 'Completed',
      count: metrics.completedTasksCount,
      percent: completedPct,
      color: 'bg-[#22C55E]',
      textColor: 'text-[#22C55E]',
      icon: CheckCircle2,
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      count: metrics.inProgressTasksCount,
      percent: inProgressPct,
      color: 'bg-[#06B6D4]',
      textColor: 'text-[#06B6D4]',
      icon: Play,
    },
    {
      id: 'pending',
      label: 'Pending',
      count: metrics.pendingTasksCount,
      percent: pendingPct,
      color: 'bg-[#F59E0B]',
      textColor: 'text-[#F59E0B]',
      icon: Circle,
    },
    {
      id: 'overdue',
      label: 'Overdue',
      count: metrics.overdueTasksCount,
      percent: overduePct,
      color: 'bg-[#EF4444]',
      textColor: 'text-[#EF4444]',
      icon: AlertTriangle,
    },
  ];

  return (
    <Card
      title="Task Status Breakdown"
      subtitle="Deliverables distribution by operational lifecycle stage"
      action={<PieChart className="w-4 h-4 text-[#7C3AED]" />}
    >
      <div className="space-y-4">
        {/* Segmented Multi-Color Progress Bar */}
        <div className="w-full h-3.5 bg-[#171C27] rounded-full overflow-hidden flex border border-white/[0.06]">
          {segments.map((seg) => (
            <div
              key={seg.id}
              className={`${seg.color} transition-all duration-500`}
              style={{ width: `${Math.max(seg.percent, 0)}%` }}
              title={`${seg.label}: ${seg.count} (${seg.percent}%)`}
            />
          ))}
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          {segments.map((seg) => {
            const Icon = seg.icon;
            return (
              <div
                key={seg.id}
                className="p-2.5 rounded-xl bg-[#171C27] border border-white/[0.04] flex items-center justify-between"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={`w-3.5 h-3.5 ${seg.textColor} shrink-0`} />
                  <span className="text-xs text-slate-300 font-medium truncate">{seg.label}</span>
                </div>
                <div className="text-right shrink-0 font-mono">
                  <span className="text-xs font-bold text-white block">{seg.count}</span>
                  <span className="text-[10px] text-slate-400">{seg.percent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
