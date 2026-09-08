import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { useTaskContext } from '../../context/TaskContext';
import { usePlannerContext } from '../../context/PlannerContext';
import {
  getTasksForDate,
  getCurrentAndNextTask,
  formatTimeDisplay,
  calculateEndTime,
} from '../../utils/plannerUtils';
import { getTodayDateString } from '../../utils/taskStorage';
import { PlayCircle, Clock, Zap, CheckCircle2 } from 'lucide-react';

export default function NextTask() {
  const { tasks, setTaskStatus } = useTaskContext();
  const { selectedDate, openScheduleModal } = usePlannerContext();

  const todayStr = getTodayDateString();
  const isToday = selectedDate === todayStr;

  // Re-evaluate every 30 seconds for live current time transitions
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const dayTasks = getTasksForDate(tasks, selectedDate);
  const { currentTask, nextTask, startsInMinutes } = getCurrentAndNextTask(dayTasks, isToday);

  if (!isToday) {
    return null;
  }

  return (
    <Card className="flex flex-col justify-between">
      {/* Current Task (NOW) */}
      {currentTask ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold text-[#22C55E] bg-[#22C55E]/15 border border-[#22C55E]/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              NOW IN PROGRESS
            </span>

            <span className="text-xs text-[#94A3B8] font-mono">
              {formatTimeDisplay(currentTask.plannedStartTime || currentTask.dueTime)} –{' '}
              {formatTimeDisplay(
                calculateEndTime(
                  currentTask.plannedStartTime || currentTask.dueTime,
                  currentTask.estimatedDuration || currentTask.duration || 60
                )
              )}
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-white tracking-tight truncate">
              {currentTask.title}
            </h4>
            {currentTask.description && (
              <p className="text-xs text-[#94A3B8] line-clamp-1 mt-0.5">
                {currentTask.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400 capitalize">
              {currentTask.priority} Priority • {currentTask.category || 'General'}
            </span>
            <button
              type="button"
              onClick={() => setTaskStatus(currentTask.id, 'completed')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#22C55E] hover:bg-[#16A34A] text-white transition-colors flex items-center gap-1 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Done</span>
            </button>
          </div>
        </div>
      ) : nextTask ? (
        /* Next Up Task */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold text-[#06B6D4] bg-[#06B6D4]/15 border border-[#06B6D4]/30">
              <Clock className="w-3 h-3" />
              NEXT UP
            </span>

            <span className="text-xs text-[#06B6D4] font-semibold">
              Starts in {startsInMinutes} {startsInMinutes === 1 ? 'minute' : 'minutes'}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-base font-bold text-white tracking-tight truncate">
                {nextTask.title}
              </h4>
              <span className="text-xs font-bold text-slate-200 shrink-0 font-mono">
                {formatTimeDisplay(nextTask.plannedStartTime || nextTask.dueTime)}
              </span>
            </div>
            {nextTask.description && (
              <p className="text-xs text-[#94A3B8] line-clamp-1 mt-0.5">
                {nextTask.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400 capitalize">
              {nextTask.priority} Priority • {nextTask.category || 'General'}
            </span>
            <button
              type="button"
              onClick={() => setTaskStatus(nextTask.id, 'in_progress')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-colors flex items-center gap-1 shadow-sm"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Start Now</span>
            </button>
          </div>
        </div>
      ) : (
        /* No upcoming tasks */
        <div className="py-4 text-center text-slate-500 italic text-xs flex flex-col items-center justify-center">
          <Clock className="w-6 h-6 mb-1 text-slate-600 stroke-[1.5]" />
          <span>No upcoming tasks scheduled for today.</span>
        </div>
      )}
    </Card>
  );
}
