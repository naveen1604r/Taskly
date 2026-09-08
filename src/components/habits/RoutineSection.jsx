import React from 'react';
import { useHabitContext } from '../../context/HabitContext';
import { getTodayDateString } from '../../utils/taskStorage';
import { ROUTINE_GROUPS, isHabitScheduledForDate, getHabitProgressForDate } from '../../utils/habitUtils';
import HabitCard from './HabitCard';
import { Sunrise, Sun, Sunset, Moon, Clock, CheckCircle2 } from 'lucide-react';

const routineIconMap = {
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Clock,
};

export default function RoutineSection({ dateStr = getTodayDateString() }) {
  const { activeHabits, habitLogs, habitOrder, reorderHabits } = useHabitContext();

  const scheduledToday = activeHabits.filter((h) => isHabitScheduledForDate(h, dateStr));

  return (
    <div className="space-y-6 text-xs">
      {ROUTINE_GROUPS.map((group) => {
        const Icon = routineIconMap[group.icon] || Clock;
        const groupHabits = scheduledToday.filter((h) => (h.routineGroup || 'none') === group.id);

        if (groupHabits.length === 0) return null;

        const completedCount = groupHabits.filter(
          (h) => getHabitProgressForDate(h, habitLogs, dateStr).completed
        ).length;

        return (
          <div key={group.id} className="space-y-3">
            {/* Routine Section Header */}
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-white/[0.06] text-slate-300">
                  <Icon className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm tracking-tight">{group.label}</h4>
                  <span className="text-[10px] text-slate-400">{group.timeHint}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">
                  {completedCount} / {groupHabits.length} completed
                </span>
                {completedCount === groupHabits.length && (
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                )}
              </div>
            </div>

            {/* Habit Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {groupHabits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} dateStr={dateStr} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
