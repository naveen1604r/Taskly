import React, { useState, useEffect, useRef, useMemo } from 'react';
import WeekDayColumn from './WeekDayColumn';
import {
  getWeekDays,
  getHourlySlots,
  isTaskVisibleInCalendar,
} from '../../utils/calendarUtils';

export default function WeekView({
  selectedDate,
  tasks = [],
  settings,
  filters,
  searchQuery,
  onTaskClick,
  onDropTaskTime,
  onQuickAddSlot,
  onResizeDuration,
}) {
  const containerRef = useRef(null);

  const weekStartsOn = settings?.weekStartsOn || 'monday';
  const showWeekends = settings?.showWeekends ?? true;
  const showCompleted = settings?.showCompleted ?? true;
  const startHour = settings?.startHour || 8;
  const endHour = settings?.endHour || 20;
  const workStartHour = settings?.workStartHour || 9;
  const workEndHour = settings?.workEndHour || 18;

  const days = useMemo(() => {
    return getWeekDays(selectedDate, weekStartsOn, showWeekends);
  }, [selectedDate, weekStartsOn, showWeekends]);

  const hourlySlots = useMemo(() => {
    return getHourlySlots(startHour, endHour);
  }, [startHour, endHour]);

  // Current time tracker (updates every 60s without causing rerender loops elsewhere)
  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to current time once on mount
  useEffect(() => {
    if (settings?.autoScrollNow && containerRef.current) {
      const nowH = new Date().getHours();
      const scrollH = Math.max(0, nowH - startHour - 1);
      containerRef.current.scrollTop = scrollH * 56;
    }
  }, []);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const map = new Map();
    tasks.forEach((task) => {
      if (!isTaskVisibleInCalendar(task, { ...filters, search: searchQuery, showCompleted })) {
        return;
      }
      const d = task.plannedDate || task.dueDate;
      if (d) {
        if (!map.has(d)) map.set(d, []);
        map.get(d).push(task);
      }
    });
    return map;
  }, [tasks, filters, searchQuery, showCompleted]);

  return (
    <div
      ref={containerRef}
      className="flex rounded-3xl bg-[#11151F] border border-white/[0.08] shadow-card overflow-x-auto overflow-y-auto max-h-[700px] text-xs"
    >
      {/* Time Gutter Column */}
      <div className="w-16 sm:w-20 shrink-0 border-r border-white/[0.06] bg-[#11151F] sticky left-0 z-20">
        {/* Header spacer */}
        <div className="h-[52px] border-b border-white/[0.08] p-2.5 flex items-center justify-center font-bold text-slate-500 text-[10px]">
          TIME
        </div>

        {/* Hour markers */}
        <div className="relative">
          {hourlySlots.map((slot) => (
            <div
              key={slot.hour}
              className="h-14 border-b border-white/[0.04] text-[10px] font-mono text-slate-400 flex items-start justify-end pr-2 pt-1"
            >
              {slot.label}
            </div>
          ))}
        </div>
      </div>

      {/* Week Day Columns */}
      <div className="flex-1 flex min-w-fit">
        {days.map((day) => (
          <WeekDayColumn
            key={day.dateStr}
            day={day}
            tasks={tasksByDate.get(day.dateStr) || []}
            hourlySlots={hourlySlots}
            startHour={startHour}
            endHour={endHour}
            workStartHour={workStartHour}
            workEndHour={workEndHour}
            currentTimeMinutes={currentMinutes}
            onTaskClick={onTaskClick}
            onDropTaskTime={onDropTaskTime}
            onQuickAddSlot={onQuickAddSlot}
            onResizeDuration={onResizeDuration}
          />
        ))}
      </div>
    </div>
  );
}
