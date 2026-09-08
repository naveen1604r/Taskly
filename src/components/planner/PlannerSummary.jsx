import React from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { usePlannerContext } from '../../context/PlannerContext';
import { getTasksForDate, calculateDailyWorkload } from '../../utils/plannerUtils';
import { StatCardItem } from '../dashboard/StatCard';
import { CheckSquare, CheckCircle2, Clock, Hourglass } from 'lucide-react';

export default function PlannerSummary() {
  const { tasks } = useTaskContext();
  const { selectedDate, workingHours } = usePlannerContext();

  const dayTasks = getTasksForDate(tasks, selectedDate);
  const total = dayTasks.length;
  const completed = dayTasks.filter((t) => t.status === 'completed').length;
  const remaining = total - completed;

  const workload = calculateDailyWorkload(dayTasks, workingHours);

  const cards = [
    {
      label: "Today's Tasks",
      value: String(total),
      caption: 'Scheduled for this date',
      icon: CheckSquare,
      accentColor: 'bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20',
      badgeText: `${total} planned`,
      badgeColor: 'bg-[#7C3AED]/15 text-[#c4b5fd]',
    },
    {
      label: 'Completed',
      value: String(completed),
      caption: total > 0 ? `${Math.round((completed / total) * 100)}% finished` : 'No tasks',
      icon: CheckCircle2,
      accentColor: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
      badgeText: 'Done',
      badgeColor: 'bg-[#22C55E]/15 text-[#22C55E]',
    },
    {
      label: 'Remaining',
      value: String(remaining),
      caption: `${workload.remainingFormatted} left to execute`,
      icon: Hourglass,
      accentColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      badgeText: `${remaining} active`,
      badgeColor: 'bg-amber-500/15 text-amber-400',
    },
    {
      label: 'Estimated Time',
      value: workload.plannedFormatted,
      caption: `${workload.tasksWithDuration} of ${total} tasks have durations`,
      icon: Clock,
      accentColor: 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20',
      badgeText: `${workload.workloadPercentage}% of day`,
      badgeColor: 'bg-[#06B6D4]/15 text-[#06B6D4]',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((c) => (
        <StatCardItem key={c.label} {...c} />
      ))}
    </div>
  );
}
