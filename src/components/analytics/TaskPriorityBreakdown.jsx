import React from 'react';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

export default function TaskPriorityBreakdown() {
  const { metrics } = useAnalyticsContext();

  const priorityMap = metrics.priorityMap || { high: 0, medium: 0, low: 0 };
  const total = (priorityMap.high || 0) + (priorityMap.medium || 0) + (priorityMap.low || 0);

  const priorities = [
    { label: 'High', count: priorityMap.high || 0, color: 'bg-[#EF4444]', textColor: 'text-[#EF4444]', icon: ShieldAlert },
    { label: 'Medium', count: priorityMap.medium || 0, color: 'bg-[#F59E0B]', textColor: 'text-[#F59E0B]', icon: Shield },
    { label: 'Low', count: priorityMap.low || 0, color: 'bg-[#22C55E]', textColor: 'text-[#22C55E]', icon: ShieldCheck },
  ];

  return (
    <Card
      title="Tasks by Priority"
      subtitle="Distribution of urgency and focus levels"
      className="flex flex-col justify-between"
    >
      {total === 0 ? (
        <div className="py-10 text-center text-slate-500 italic text-xs">
          No tasks recorded in this period.
        </div>
      ) : (
        <div className="space-y-3.5">
          {priorities.map((p) => {
            const Icon = p.icon;
            const percent = total > 0 ? Math.round((p.count / total) * 100) : 0;

            return (
              <div key={p.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Icon className={`w-3.5 h-3.5 ${p.textColor}`} />
                    <span>{p.label} Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-normal">({percent}%)</span>
                    <span className="text-white font-bold">{p.count}</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-[#171C27] rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${p.color}`}
                    style={{ width: `${Math.min(100, Math.max(p.count > 0 ? 5 : 0, percent))}%` }}
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
