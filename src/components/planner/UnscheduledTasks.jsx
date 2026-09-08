import React from 'react';
import Card from '../common/Card';
import { useTaskContext } from '../../context/TaskContext';
import { usePlannerContext } from '../../context/PlannerContext';
import { getUnscheduledTasks, formatDurationDisplay } from '../../utils/plannerUtils';
import { CalendarPlus, CheckCircle2, Clock } from 'lucide-react';

export default function UnscheduledTasks() {
  const { tasks } = useTaskContext();
  const { openScheduleModal } = usePlannerContext();

  const unscheduled = getUnscheduledTasks(tasks);

  return (
    <Card
      title="Unscheduled Tasks"
      subtitle={`${unscheduled.length} active tasks waiting for time blocks`}
      className="flex flex-col justify-between"
    >
      {unscheduled.length === 0 ? (
        <div className="py-8 text-center text-slate-500 italic text-xs flex flex-col items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#22C55E] mb-2 stroke-[1.75]" />
          <h4 className="text-sm font-bold text-white">All tasks are planned</h4>
          <p className="text-xs text-[#94A3B8] mt-0.5">Nice. Every relevant task has a plan.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {unscheduled.map((task) => (
            <div
              key={task.id}
              className="p-3 rounded-xl bg-[#171C27] border border-white/[0.06] hover:border-white/[0.14] transition-all flex items-center justify-between gap-3 group"
            >
              <div className="min-w-0 flex-1">
                <h5 className="text-xs font-bold text-white truncate">{task.title}</h5>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-[#94A3B8]">
                  <span className="capitalize text-slate-300 font-medium">
                    {task.priority} Priority
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#06B6D4]" />
                    <span>{formatDurationDisplay(task.estimatedDuration || task.duration)}</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openScheduleModal(task)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-colors flex items-center gap-1 shrink-0"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Schedule</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
