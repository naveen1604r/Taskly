import React, { useState } from 'react';
import CalendarTask from './CalendarTask';
import { getTodayDateString } from '../../utils/taskStorage';

export default function WeekDayColumn({
  day,
  tasks = [],
  hourlySlots = [],
  startHour = 8,
  endHour = 20,
  workStartHour = 9,
  workEndHour = 18,
  currentTimeMinutes = null, // minute of day (e.g. 11:30 -> 690)
  onTaskClick,
  onDropTaskTime,
  onQuickAddSlot,
  onResizeDuration,
}) {
  const [dragOverHour, setDragOverHour] = useState(null);

  const isToday = day.dateStr === getTodayDateString();
  const totalHours = endHour - startHour + 1;

  const handleDragOver = (e, hour) => {
    e.preventDefault();
    setDragOverHour(hour);
  };

  const handleDrop = (e, hour) => {
    e.preventDefault();
    setDragOverHour(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && onDropTaskTime) {
      const timeStr = `${String(hour).padStart(2, '0')}:00`;
      onDropTaskTime(taskId, day.dateStr, timeStr);
    }
  };

  // Calculate current time line top %
  let nowLineTop = null;
  if (isToday && currentTimeMinutes !== null) {
    const startMins = startHour * 60;
    const totalDayMins = totalHours * 60;
    if (currentTimeMinutes >= startMins && currentTimeMinutes <= (endHour + 1) * 60) {
      nowLineTop = ((currentTimeMinutes - startMins) / totalDayMins) * 100;
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-[130px] border-r border-white/[0.04] last:border-r-0 relative">
      {/* Column Header */}
      <div
        className={`p-2.5 text-center border-b border-white/[0.08] sticky top-0 z-10 ${
          isToday ? 'bg-[#7C3AED]/20' : 'bg-[#11151F]'
        }`}
      >
        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
          {day.dayName}
        </span>
        <div className="flex items-center justify-center gap-1 mt-0.5">
          <span
            className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center ${
              isToday ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-slate-200'
            }`}
          >
            {day.dayNumber}
          </span>
        </div>
      </div>

      {/* Hourly Timeline Grid */}
      <div className="relative flex-1" style={{ height: totalHours * 56 }}>
        {/* Hour background slots */}
        {hourlySlots.map((slot) => {
          const isWorkHour = slot.hour >= workStartHour && slot.hour < workEndHour;
          const isSlotDrag = dragOverHour === slot.hour;

          return (
            <div
              key={slot.hour}
              onDragOver={(e) => handleDragOver(e, slot.hour)}
              onDragLeave={() => setDragOverHour(null)}
              onDrop={(e) => handleDrop(e, slot.hour)}
              onClick={() => onQuickAddSlot && onQuickAddSlot(day.dateStr, slot.timeStr)}
              className={`h-14 border-b border-white/[0.04] transition-colors cursor-pointer ${
                isSlotDrag
                  ? 'bg-[#7C3AED]/20 border-[#7C3AED]'
                  : isWorkHour
                  ? 'bg-[#11151F]/60 hover:bg-white/[0.02]'
                  : 'bg-[#0B0E14]/40 hover:bg-white/[0.02]'
              }`}
            />
          );
        })}

        {/* Current Time NOW Line */}
        {nowLineTop !== null && (
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
            style={{ top: `${nowLineTop}%` }}
          >
            <div className="w-2 h-2 rounded-full bg-[#EF4444] -ml-1 shadow-sm" />
            <div className="flex-1 h-[2px] bg-[#EF4444] shadow-glow-sm" />
          </div>
        )}

        {/* Render Scheduled Task Time Blocks */}
        {tasks.map((task) => {
          const startTime = task.plannedStartTime || '09:00';
          const [hStr, mStr] = startTime.split(':');
          const taskStartMins = (parseInt(hStr, 10) || startHour) * 60 + (parseInt(mStr, 10) || 0);
          const duration = Number(task.estimatedDuration || task.duration) || 30;

          const calStartMins = startHour * 60;
          const totalCalMins = totalHours * 60;

          const topPercent = Math.max(0, ((taskStartMins - calStartMins) / totalCalMins) * 100);
          const heightPercent = Math.max(3, (duration / totalCalMins) * 100);

          return (
            <div
              key={task.id}
              className="absolute left-1 right-1 z-10"
              style={{
                top: `${topPercent}%`,
                height: `${heightPercent}%`,
                minHeight: 28,
              }}
            >
              <CalendarTask
                task={task}
                view="week"
                onClick={onTaskClick}
                onResizeDuration={onResizeDuration}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
