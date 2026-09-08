import React from 'react';
import PlannerTask from './PlannerTask';
import { parseTimeToMinutes, formatTimeDisplay, minutesToTime24 } from '../../utils/plannerUtils';
import { Plus, Clock } from 'lucide-react';

export default function PlannerTimeline({ tasks, conflicts, currentTaskId }) {
  // Sort tasks by start time
  const sortedTasks = [...tasks].sort((a, b) => {
    const timeA = parseTimeToMinutes(a.plannedStartTime || a.dueTime) ?? 9999;
    const timeB = parseTimeToMinutes(b.plannedStartTime || b.dueTime) ?? 9999;
    return timeA - timeB;
  });

  return (
    <div className="space-y-4">
      <div className="relative pl-6 sm:pl-8 border-l border-white/[0.08] space-y-4 my-2">
        {sortedTasks.map((task) => {
          const isConflicting = conflicts?.conflictIds?.has(task.id);
          const isCurrentNow = task.id === currentTaskId;
          const startTime = task.plannedStartTime || task.dueTime;

          return (
            <div key={task.id} className="relative group">
              {/* Timeline Marker Dot */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-4 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  isCurrentNow
                    ? 'bg-[#22C55E] border-white ring-4 ring-[#22C55E]/25'
                    : isConflicting
                    ? 'bg-amber-400 border-[#11151F]'
                    : task.status === 'completed'
                    ? 'bg-[#22C55E] border-[#11151F]'
                    : 'bg-[#7C3AED] border-[#11151F]'
                }`}
              />

              <PlannerTask
                task={task}
                isConflicting={isConflicting}
                isCurrentNow={isCurrentNow}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
