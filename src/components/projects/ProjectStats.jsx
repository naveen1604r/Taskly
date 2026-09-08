import React from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { calculateProjectProgress } from '../../utils/projectUtils';
import {
  CheckCircle2,
  Play,
  Circle,
  Lock,
  AlertTriangle,
  Clock,
  Hourglass,
  Percent,
} from 'lucide-react';

export default function ProjectStats({ project }) {
  const { tasks } = useTaskContext();
  const stats = calculateProjectProgress(project.id, tasks);

  const estH = Math.floor(stats.estimatedMins / 60);
  const estM = stats.estimatedMins % 60;
  const actH = Math.floor(stats.actualMins / 60);
  const actM = stats.actualMins % 60;

  const cards = [
    {
      label: 'Progress',
      value: `${stats.percentage}%`,
      sub: `${stats.completed}/${stats.total} finished`,
      color: 'text-[#22C55E]',
      bg: 'bg-[#22C55E]/10 border-[#22C55E]/20',
      icon: Percent,
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      sub: 'active deliverables',
      color: 'text-[#06B6D4]',
      bg: 'bg-[#06B6D4]/10 border-[#06B6D4]/20',
      icon: Play,
    },
    {
      label: 'Pending',
      value: stats.pending,
      sub: 'waiting in queue',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      icon: Circle,
    },
    {
      label: 'Blocked',
      value: stats.blocked,
      sub: 'dependent tasks',
      color: 'text-[#F59E0B]',
      bg: 'bg-[#F59E0B]/10 border-[#F59E0B]/20',
      icon: Lock,
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      sub: 'missed target date',
      color: 'text-[#EF4444]',
      bg: 'bg-[#EF4444]/10 border-[#EF4444]/20',
      icon: AlertTriangle,
    },
    {
      label: 'Tracked Time',
      value: `${actH}h ${actM}m`,
      sub: `est: ${estH}h ${estM}m`,
      color: 'text-[#7C3AED]',
      bg: 'bg-[#7C3AED]/10 border-[#7C3AED]/20',
      icon: Clock,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="p-3.5 rounded-2xl bg-[#11151F] border border-white/[0.08] shadow-card flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400">{c.label}</span>
              <div className={`p-1 rounded-lg border ${c.bg} ${c.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold text-white font-mono">{c.value}</span>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{c.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
