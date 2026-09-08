import React from 'react';
import Card from '../common/Card';
import { useTaskContext } from '../../context/TaskContext';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  TrendingUp
} from 'lucide-react';

export function StatCardItem({ label, value, caption, icon: Icon, accentColor, badgeText, badgeColor }) {
  return (
    <Card hoverable className="relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
          {label}
        </span>
        <div className={`p-2.5 rounded-xl border ${accentColor} transition-transform duration-200 group-hover:scale-110`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-3xl font-bold tracking-tight text-white">
          {value}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          {badgeText && (
            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${badgeColor}`}>
              {badgeText}
            </span>
          )}
          <p className="text-xs text-[#94A3B8] font-normal truncate">
            {caption}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function StatCard() {
  const { stats } = useTaskContext();

  const completionPercent = stats.totalTasks > 0
    ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)
    : '0';

  const statItems = [
    {
      label: "Today's Tasks",
      value: String(stats.todayTotal),
      caption: "+2 from yesterday",
      badgeText: `Today: ${stats.todayTotal}`,
      badgeColor: "bg-[#7C3AED]/15 text-[#c4b5fd]",
      icon: ListTodo,
      accentColor: "bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20",
    },
    {
      label: "Completed",
      value: String(stats.completedTasks),
      caption: `${completionPercent}% completed`,
      badgeText: `${completionPercent}%`,
      badgeColor: "bg-[#22C55E]/15 text-[#22C55E]",
      icon: CheckCircle2,
      accentColor: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
    },
    {
      label: "Pending",
      value: String(stats.pendingTasks),
      caption: stats.pendingTasks > 0 ? "Needs attention" : "All caught up",
      badgeText: `${stats.pendingTasks} left`,
      badgeColor: "bg-[#F59E0B]/15 text-[#F59E0B]",
      icon: Clock,
      accentColor: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
    },
    {
      label: "Productivity",
      value: `${stats.overallProductivityRate}%`,
      caption: "+12% this week",
      badgeText: `${stats.overallProductivityRate}%`,
      badgeColor: "bg-[#06B6D4]/15 text-[#06B6D4]",
      icon: TrendingUp,
      accentColor: "bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {statItems.map((stat) => (
        <StatCardItem key={stat.label} {...stat} />
      ))}
    </div>
  );
}
