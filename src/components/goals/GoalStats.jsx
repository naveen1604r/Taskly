import React from 'react';
import { useGoalsContext } from '../../context/GoalsContext';
import { StatCardItem } from '../dashboard/StatCard';
import { Target, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

export default function GoalStats() {
  const { stats } = useGoalsContext();

  const cards = [
    {
      label: 'Active Goals',
      value: String(stats.activeGoalsCount),
      caption: 'In-flight milestones',
      icon: Target,
      accentColor: 'bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20',
      badgeText: 'Active',
      badgeColor: 'bg-[#7C3AED]/15 text-[#c4b5fd]',
    },
    {
      label: 'Completed',
      value: String(stats.completedGoalsCount),
      caption: 'Objectives achieved',
      icon: CheckCircle2,
      accentColor: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
      badgeText: 'Done',
      badgeColor: 'bg-[#22C55E]/15 text-[#22C55E]',
    },
    {
      label: 'Due Soon',
      value: String(stats.dueSoonGoalsCount),
      caption: 'Target within 7 days',
      icon: Clock,
      accentColor: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
      badgeText: stats.dueSoonGoalsCount > 0 ? 'Urgent' : 'On Track',
      badgeColor: stats.dueSoonGoalsCount > 0 ? 'bg-[#F59E0B]/15 text-[#F59E0B]' : 'bg-slate-800 text-slate-400',
    },
    {
      label: 'Average Progress',
      value: `${stats.averageProgress}%`,
      caption: 'Across active goals',
      icon: TrendingUp,
      accentColor: 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20',
      badgeText: `${stats.averageProgress}%`,
      badgeColor: 'bg-[#06B6D4]/15 text-[#06B6D4]',
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
