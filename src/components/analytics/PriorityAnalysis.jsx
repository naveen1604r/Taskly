import React from 'react';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

export default function PriorityAnalysis() {
  const { metrics } = useAnalyticsContext();
  const priorityStats = metrics.priorityStats || {
    high: { total: 0, completed: 0, rate: 0 },
    medium: { total: 0, completed: 0, rate: 0 },
    low: { total: 0, completed: 0, rate: 0 },
  };

  const rows = [
    {
      id: 'high',
      label: 'High Priority',
      data: priorityStats.high,
      color: 'bg-[#EF4444]',
      textColor: 'text-[#EF4444]',
      icon: ShieldAlert,
    },
    {
      id: 'medium',
      label: 'Medium Priority',
      data: priorityStats.medium,
      color: 'bg-[#F59E0B]',
      textColor: 'text-[#F59E0B]',
      icon: Shield,
    },
    {
      id: 'low',
      label: 'Low Priority',
      data: priorityStats.low,
      color: 'bg-[#22C55E]',
      textColor: 'text-[#22C55E]',
      icon: ShieldCheck,
    },
  ];

  return (
    <Card
      title="Priority Performance"
      subtitle="Execution velocity segmented by priority tier"
    >
      <div className="space-y-3.5">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${row.textColor}`} />
                  <span className="font-semibold text-white">{row.label}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                  <span>{row.data.completed} / {row.data.total} completed</span>
                  <span className="font-bold text-white">({row.data.rate}%)</span>
                </div>
              </div>

              <div className="w-full h-2 bg-[#171C27] rounded-full overflow-hidden border border-white/[0.04]">
                <div
                  className={`h-full ${row.color} rounded-full transition-all duration-500`}
                  style={{ width: `${row.data.rate}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
