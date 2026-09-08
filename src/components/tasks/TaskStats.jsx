import React from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { StatCardItem } from '../dashboard/StatCard';
import { ListTodo, CheckCircle2, PlayCircle, Clock } from 'lucide-react';

export default function TaskStats() {
  const { stats } = useTaskContext();

  const cards = [
    {
      label: 'Total Tasks',
      value: String(stats.totalTasks),
      caption: 'All created tasks',
      icon: ListTodo,
      accentColor: 'bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20',
      badgeText: 'Active',
      badgeColor: 'bg-[#7C3AED]/15 text-[#c4b5fd]',
    },
    {
      label: 'Completed',
      value: String(stats.completedTasks),
      caption: `${stats.overallProductivityRate}% overall rate`,
      icon: CheckCircle2,
      accentColor: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
      badgeText: 'Done',
      badgeColor: 'bg-[#22C55E]/15 text-[#22C55E]',
    },
    {
      label: 'In Progress',
      value: String(stats.inProgressTasks),
      caption: 'Currently underway',
      icon: PlayCircle,
      accentColor: 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20',
      badgeText: 'Working',
      badgeColor: 'bg-[#06B6D4]/15 text-[#06B6D4]',
    },
    {
      label: 'Pending',
      value: String(stats.pendingTasks),
      caption: 'Awaiting start',
      icon: Clock,
      accentColor: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
      badgeText: 'Queued',
      badgeColor: 'bg-[#F59E0B]/15 text-[#F59E0B]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card) => (
        <StatCardItem key={card.label} {...card} />
      ))}
    </div>
  );
}
