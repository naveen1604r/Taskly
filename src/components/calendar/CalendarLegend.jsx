import React from 'react';
import {
  CheckCircle2,
  Lock,
  Repeat,
  AlertTriangle,
} from 'lucide-react';

export default function CalendarLegend() {
  const items = [
    { label: 'High Priority', dot: 'bg-[#EF4444]' },
    { label: 'Medium Priority', dot: 'bg-[#F59E0B]' },
    { label: 'Low Priority', dot: 'bg-[#22C55E]' },
    { label: 'Completed', icon: CheckCircle2, color: 'text-[#22C55E]' },
    { label: 'Blocked', icon: Lock, color: 'text-[#F59E0B]' },
    { label: 'Recurring', icon: Repeat, color: 'text-purple-400' },
    { label: 'Overdue', icon: AlertTriangle, color: 'text-[#EF4444]' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 p-3 rounded-2xl bg-[#11151F] border border-white/[0.06] text-[11px] text-slate-400">
      <span className="font-bold text-slate-300 text-[10px] uppercase tracking-wider mr-1">
        Legend:
      </span>
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="flex items-center gap-1.5">
            {item.dot ? (
              <span className={`w-2 h-2 rounded-full ${item.dot}`} />
            ) : (
              <Icon className={`w-3.5 h-3.5 ${item.color}`} />
            )}
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
