import React from 'react';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { StatCardItem } from '../dashboard/StatCard';
import { CheckCircle2, Percent, Clock, Activity, Trophy, FileText } from 'lucide-react';

export default function AnalyticsStats() {
  const { metrics, dateRange } = useAnalyticsContext();

  const cards = [
    {
      label: 'Tasks Completed',
      value: String(metrics.tasksCompleted),
      caption: `In ${dateRange.label.toLowerCase()}`,
      icon: CheckCircle2,
      accentColor: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
      badgeText: `${metrics.totalTasks} total`,
      badgeColor: 'bg-[#22C55E]/15 text-[#22C55E]',
    },
    {
      label: 'Completion Rate',
      value: metrics.completionRate !== null ? `${metrics.completionRate}%` : '—',
      caption: metrics.totalTasks > 0 ? `${metrics.tasksCompleted} of ${metrics.totalTasks} tasks` : 'No tasks recorded',
      icon: Percent,
      accentColor: 'bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20',
      badgeText: metrics.completionRate !== null ? `${metrics.completionRate}%` : 'N/A',
      badgeColor: 'bg-[#7C3AED]/15 text-[#c4b5fd]',
    },
    {
      label: 'Focus Time',
      value: metrics.focusTimeFormatted,
      caption: `Avg ${metrics.averageDailyFocusTime}/day`,
      icon: Clock,
      accentColor: 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20',
      badgeText: 'Tracked',
      badgeColor: 'bg-[#06B6D4]/15 text-[#06B6D4]',
    },
    {
      label: 'Activities',
      value: String(metrics.activitiesCount),
      caption: 'Tracked focus sessions',
      icon: Activity,
      accentColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      badgeText: 'Logged',
      badgeColor: 'bg-emerald-500/15 text-emerald-400',
    },
    {
      label: 'Goals Completed',
      value: String(metrics.goalsCompleted),
      caption: `${metrics.activeGoalsCount} active in flight`,
      icon: Trophy,
      accentColor: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
      badgeText: `${metrics.averageGoalProgress}% avg`,
      badgeColor: 'bg-[#F59E0B]/15 text-[#F59E0B]',
    },
    {
      label: 'Notes Created',
      value: String(metrics.notesCreated),
      caption: `${metrics.totalNotesCount} total notebook entries`,
      icon: FileText,
      accentColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      badgeText: `${metrics.pinnedNotesCount} pinned`,
      badgeColor: 'bg-indigo-500/15 text-indigo-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <StatCardItem key={card.label} {...card} />
      ))}
    </div>
  );
}
