import React from 'react';
import { useActivityContext } from '../../context/ActivityContext';
import { useTaskContext } from '../../context/TaskContext';
import { StatCardItem } from '../dashboard/StatCard';
import { formatDuration } from '../../utils/activityUtils';
import { Activity, Clock, CheckCircle2, Flame } from 'lucide-react';

export default function ActivityStats() {
  const { summary } = useActivityContext();
  const { stats } = useTaskContext();

  const formattedTime = formatDuration(summary.todayTotalMinutes);

  const cards = [
    {
      label: "Today's Activities",
      value: String(summary.todayActivities.length),
      caption: 'Logged actions today',
      icon: Activity,
      accentColor: 'bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20',
      badgeText: 'Live',
      badgeColor: 'bg-[#7C3AED]/15 text-[#c4b5fd]',
    },
    {
      label: 'Total Time',
      value: formattedTime,
      caption: 'Tracked focused work',
      icon: Clock,
      accentColor: 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20',
      badgeText: 'Focus',
      badgeColor: 'bg-[#06B6D4]/15 text-[#06B6D4]',
    },
    {
      label: 'Completed Tasks',
      value: String(stats.todayCompleted),
      caption: 'Daily tasks checked off',
      icon: CheckCircle2,
      accentColor: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
      badgeText: `${stats.todayCompleted}/${stats.todayTotal}`,
      badgeColor: 'bg-[#22C55E]/15 text-[#22C55E]',
    },
    {
      label: 'Active Day',
      value: `🔥 ${summary.activeStreak} days`,
      caption: 'Consistent activity streak',
      icon: Flame,
      accentColor: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
      badgeText: 'Streak',
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
