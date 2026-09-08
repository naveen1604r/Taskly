import React, { useState, useEffect, useRef, useMemo } from 'react';
import WeekDayColumn from './WeekDayColumn';
import {
  getHourlySlots,
  parseDateKey,
  isTaskVisibleInCalendar,
} from '../../utils/calendarUtils';
import { getTodayDateString } from '../../utils/taskStorage';

export default function DayView({
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

  const showCompleted = settings?.showCompleted ?? true;
  const startHour = settings?.startHour || 8;
  const endHour = settings?.endHour || 20;
  const workStartHour = settings?.workStartHour || 9;
  const workEndHour = settings?.workEndHour || 18;

  const dateObj = useMemo(() => parseDateKey(selectedDate), [selectedDate]);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const dayData = {
    dateStr: selectedDate,
    dayName,
    dayNumber: dateObj.getDate(),
    isToday: selectedDate === getTodayDateString(),
  };

  const hourlySlots = useMemo(() => {
    return getHourlySlots(startHour, endHour);
  }, [startHour, endHour]);

  // Current minute tracker
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

  // Filter tasks for this single day
  const dayTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (!isTaskVisibleInCalendar(task, { ...filters, search: searchQuery, showCompleted })) {
        return false;
      }
      return (task.plannedDate || task.dueDate) === selectedDate;
    });
  }, [tasks, selectedDate, filters, searchQuery, showCompleted]);

  return (
    <div className="space-y-3">
      {/* Day Title Summary */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#11151F] border border-white/[0.08]">
        <div>
          <h3 className="text-base font-bold text-white">{dayName}</h3>
          <p className="text-xs text-slate-400">{monthDay}</p>
        </div>
        <span className="font-mono text-xs text-[#06B6D4] bg-[#06B6D4]/10 px-3 py-1 rounded-xl border border-[#06B6D4]/20">
          {dayTasks.length} {dayTasks.length === 1 ? 'task scheduled' : 'tasks scheduled'}
        </span>
      </div>

      {/* Hourly Grid View */}
      <div
        ref={containerRef}
        className="flex rounded-3xl bg-[#11151F] border border-white/[0.08] shadow-card overflow-y-auto max-h-[700px] text-xs"
      >
        {/* Time Gutter Column */}
        <div className="w-20 shrink-0 border-r border-white/[0.06] bg-[#11151F] sticky left-0 z-20">
          <div className="h-[49px] border-b border-white/[0.08] p-2.5 flex items-center justify-center font-bold text-slate-500 text-[10px]">
            TIME
          </div>
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

        {/* Single Day Column */}
        <div className="flex-1 min-w-[280px]">
          <WeekDayColumn
            day={dayData}
            tasks={dayTasks}
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
        </div>
      </div>
    </div>
  );
}
