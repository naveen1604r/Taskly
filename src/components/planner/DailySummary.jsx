import React from 'react';
import Card from '../common/Card';
import { useTaskContext } from '../../context/TaskContext';
import { usePlannerContext } from '../../context/PlannerContext';
import { getTasksForDate, calculateDailyWorkload } from '../../utils/plannerUtils';
import { CheckCircle2, Clock, Hourglass, Calendar } from 'lucide-react';

export default function DailySummary() {
  const { tasks } = useTaskContext();
  const { selectedDate, workingHours } = usePlannerContext();

  const dayTasks = getTasksForDate(tasks, selectedDate);
  const total = dayTasks.length;
  const completed = dayTasks.filter((t) => t.status === 'completed').length;
  const workload = calculateDailyWorkload(dayTasks, workingHours);

  return (
    <Card
      title="Daily Completion Summary"
      subtitle="Execution progress for the selected day"
      className="flex flex-col justify-between"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1">
        <div className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.06]">
          <span className="text-[11px] text-[#94A3B8] font-medium block">Tasks Completed</span>
          <span className="text-xl font-bold text-white mt-1 block">
            {completed} <span className="text-sm font-normal text-slate-500">/ {total}</span>
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.06]">
          <span className="text-[11px] text-[#94A3B8] font-medium block">Planned Time</span>
          <span className="text-xl font-bold text-[#06B6D4] mt-1 block">
            {workload.plannedFormatted}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.06]">
          <span className="text-[11px] text-[#94A3B8] font-medium block">Completed Time</span>
          <span className="text-xl font-bold text-[#22C55E] mt-1 block">
            {workload.completedFormatted}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.06]">
          <span className="text-[11px] text-[#94A3B8] font-medium block">Remaining Time</span>
          <span className="text-xl font-bold text-amber-400 mt-1 block">
            {workload.remainingFormatted}
          </span>
        </div>
      </div>
    </Card>
  );
}
