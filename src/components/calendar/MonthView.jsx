import React, { useMemo } from 'react';
import MonthDayCell from './MonthDayCell';
import { getMonthGrid, parseDateKey, isTaskVisibleInCalendar } from '../../utils/calendarUtils';

const weekDayHeadersMonday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weekDayHeadersSunday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MonthView({
  currentYear,
  currentMonth,
  tasks = [],
  settings,
  filters,
  searchQuery,
  onTaskClick,
  onDropTask,
  onQuickAdd,
}) {
  const weekStartsOn = settings?.weekStartsOn || 'monday';
  const showWeekends = settings?.showWeekends ?? true;
  const showCompleted = settings?.showCompleted ?? true;

  const weekdayHeaders = useMemo(() => {
    let headers = weekStartsOn === 'sunday' ? weekDayHeadersSunday : weekDayHeadersMonday;
    if (!showWeekends) {
      headers = headers.filter((h) => h !== 'Sat' && h !== 'Sun');
    }
    return headers;
  }, [weekStartsOn, showWeekends]);

  const gridCells = useMemo(() => {
    return getMonthGrid(currentYear, currentMonth, weekStartsOn, showWeekends);
  }, [currentYear, currentMonth, weekStartsOn, showWeekends]);

  // Group tasks by date string
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
    <div className="space-y-2">
      {/* Weekday Column Headers */}
      <div
        className="grid gap-2 text-center text-xs font-bold text-slate-400 py-1"
        style={{
          gridTemplateColumns: `repeat(${weekdayHeaders.length}, minmax(0, 1fr))`,
        }}
      >
        {weekdayHeaders.map((dayName) => (
          <div key={dayName} className="uppercase tracking-wider">
            {dayName}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${weekdayHeaders.length}, minmax(0, 1fr))`,
        }}
      >
        {gridCells.map((cell, index) => (
          <MonthDayCell
            key={`${cell.dateStr}-${index}`}
            cell={cell}
            tasks={tasksByDate.get(cell.dateStr) || []}
            onTaskClick={onTaskClick}
            onDropTask={onDropTask}
            onQuickAdd={onQuickAdd}
          />
        ))}
      </div>
    </div>
  );
}
