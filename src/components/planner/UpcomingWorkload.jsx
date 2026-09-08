import React from 'react';
import Card from '../common/Card';
import { useTaskContext } from '../../context/TaskContext';
import { usePlannerContext } from '../../context/PlannerContext';
import { getUpcomingWorkload, getTasksForDate, calculateDailyWorkload } from '../../utils/plannerUtils';
import { getTodayDateString, getOffsetDateString } from '../../utils/taskStorage';
import { Calendar, ArrowRight, Clock } from 'lucide-react';

export default function UpcomingWorkload() {
  const { tasks } = useTaskContext();
  const { setSelectedDate, workingHours } = usePlannerContext();

  const todayStr = getTodayDateString();
  const tomorrowStr = getOffsetDateString(1);

  // Tomorrow stats
  const tomorrowTasks = getTasksForDate(tasks, tomorrowStr);
  const tomorrowWorkload = calculateDailyWorkload(tomorrowTasks, workingHours);

  // 4-day upcoming trajectory
  const upcomingDays = getUpcomingWorkload(tasks, todayStr, 4);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* 1. Tomorrow Preview Card */}
      <Card
        title="Tomorrow's Preview"
        subtitle={`${tomorrowTasks.length} planned tasks • ${tomorrowWorkload.plannedFormatted} estimated`}
        action={
          <button
            type="button"
            onClick={() => setSelectedDate(tomorrowStr)}
            className="text-xs font-semibold text-[#06B6D4] hover:underline flex items-center gap-1"
          >
            <span>View Tomorrow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
        className="flex flex-col justify-between"
      >
        <div className="space-y-3 py-1">
          {tomorrowTasks.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No tasks planned for tomorrow yet.</p>
          ) : (
            <div className="space-y-2">
              {tomorrowTasks.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#171C27] border border-white/[0.04]"
                >
                  <span className="text-white font-medium truncate">{t.title}</span>
                  <span className="text-[#94A3B8] text-[11px] shrink-0 font-mono">
                    {t.plannedStartTime || 'Anytime'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 2. Upcoming Workload Trajectory */}
      <Card
        title="Upcoming Workload Trajectory"
        subtitle="Forward look at upcoming focus commitments"
        className="flex flex-col justify-between"
      >
        <div className="space-y-2.5 py-1">
          {upcomingDays.map((day) => {
            const percent = Math.min(100, Math.round((day.totalMinutes / (workingHours * 60)) * 100));

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelectedDate(day.date)}
                className="w-full text-left p-2 rounded-xl hover:bg-white/[0.04] transition-colors space-y-1 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white group-hover:text-[#06B6D4] transition-colors">
                    {day.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-normal">({day.taskCount} tasks)</span>
                    <span className="font-bold text-slate-200 font-mono">{day.formattedTime}</span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-[#171C27] rounded-full overflow-hidden p-0.5 border border-white/[0.04]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]"
                    style={{ width: `${Math.max(day.totalMinutes > 0 ? 6 : 0, percent)}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
