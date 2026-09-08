import React, { useState } from 'react';
import { useHabitContext } from '../../context/HabitContext';
import { getTodayDateString } from '../../utils/taskStorage';
import { getHabitCalendarData, parseDateKey } from '../../utils/habitUtils';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Check,
  Circle,
  Clock,
  Plus,
  Minus,
} from 'lucide-react';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HabitCalendar({ selectedHabitId = null }) {
  const { activeHabits, habitLogs, setHabitProgress } = useHabitContext();

  const todayStr = getTodayDateString();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [activeHabitId, setActiveHabitId] = useState(() => selectedHabitId || activeHabits[0]?.id || null);
  const [inspectedDay, setInspectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  const currentHabit = activeHabits.find((h) => h.id === activeHabitId) || activeHabits[0];

  const days = getHabitCalendarData(currentHabit, habitLogs, year, monthIndex);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, monthIndex - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, monthIndex + 1, 1));
  };

  const handleGoToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-[#11151F] border border-white/[0.08] space-y-4 text-xs">
      {/* Top Header & Habit Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-[#7C3AED]" />
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Habit Calendar Heatmap</h3>
            <p className="text-xs text-slate-400">Monthly consistency grid and daily breakdown</p>
          </div>
        </div>

        {/* Habit Selector Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={currentHabit?.id || ''}
            onChange={(e) => setActiveHabitId(e.target.value)}
            className="bg-[#171C27] border border-white/[0.08] text-white rounded-xl px-3 py-1.5 focus:outline-none max-w-[200px] truncate"
          >
            {activeHabits.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          {/* Month Navigation */}
          <div className="flex items-center gap-1 bg-[#171C27] border border-white/[0.08] rounded-xl p-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleGoToday}
              className="px-2 py-0.5 rounded-lg text-slate-300 hover:text-white font-semibold text-[11px]"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-bold text-sm text-white">{monthName}</span>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-white/10" />
            <span>Off</span>
          </div>
        </div>
      </div>

      {/* Weekdays Bar */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-slate-400 font-bold text-[10px] uppercase">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, idx) => {
          let cellStyle = 'bg-white/[0.02] text-slate-500 border-white/[0.03]';

          if (day.isCurrentMonth) {
            if (day.isScheduled) {
              if (day.completed) {
                cellStyle = 'bg-[#22C55E]/15 text-emerald-400 border-emerald-500/40 font-bold shadow-[0_0_8px_rgba(34,197,94,0.15)]';
              } else if (day.partial) {
                cellStyle = 'bg-[#F59E0B]/15 text-amber-400 border-amber-500/40 font-bold';
              } else if (day.missed) {
                cellStyle = 'bg-[#EF4444]/10 text-rose-400 border-rose-500/30';
              } else {
                cellStyle = 'bg-[#171C27] text-slate-300 border-white/[0.06] hover:border-white/[0.16]';
              }
            } else {
              cellStyle = 'bg-[#11151F]/60 text-slate-600 border-white/[0.02]';
            }
          }

          const isSelected = inspectedDay?.dateStr === day.dateStr;

          return (
            <button
              key={`${day.dateStr}-${idx}`}
              type="button"
              onClick={() => setInspectedDay(day)}
              className={`p-2 rounded-2xl border transition-all text-center flex flex-col items-center justify-between min-h-[52px] group relative ${cellStyle} ${
                day.isToday ? 'ring-2 ring-[#7C3AED]' : ''
              } ${isSelected ? 'ring-2 ring-white' : ''}`}
            >
              <span className={`text-[11px] font-mono ${day.isToday ? 'font-black text-white' : ''}`}>
                {day.dayNum}
              </span>

              {day.isScheduled && (
                <div className="mt-1">
                  {day.completed ? (
                    <Check className="w-3.5 h-3.5 text-[#22C55E] stroke-[3]" />
                  ) : day.partial ? (
                    <span className="text-[10px] font-mono text-amber-400">
                      {day.count}
                    </span>
                  ) : day.missed ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] block" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 block" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Day Inspection Drawer / Info Box */}
      {inspectedDay && currentHabit && (
        <div className="p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-100">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{inspectedDay.dateStr}</span>
              {inspectedDay.isToday && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#7C3AED] text-white text-[9px] font-bold">
                  TODAY
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {inspectedDay.isScheduled
                ? `Target: ${currentHabit.targetCount} ${currentHabit.unit}. Logged: ${inspectedDay.count} ${currentHabit.unit}`
                : 'Not scheduled on this day.'}
            </p>
          </div>

          {inspectedDay.isScheduled && !inspectedDay.isFuture && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setHabitProgress(currentHabit.id, Math.max(0, inspectedDay.count - 1), inspectedDay.dateStr)
                }
                className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300"
                title="Decrease"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span className="font-mono font-bold text-white px-2">
                {inspectedDay.count} / {currentHabit.targetCount}
              </span>

              <button
                type="button"
                onClick={() =>
                  setHabitProgress(currentHabit.id, Math.min(currentHabit.targetCount, inspectedDay.count + 1), inspectedDay.dateStr)
                }
                className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300"
                title="Increase"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setHabitProgress(
                    currentHabit.id,
                    inspectedDay.completed ? 0 : currentHabit.targetCount,
                    inspectedDay.dateStr
                  )
                }
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  inspectedDay.completed ? 'bg-[#22C55E] text-white' : 'bg-[#7C3AED] text-white'
                }`}
              >
                {inspectedDay.completed ? 'Mark Incomplete' : 'Mark Completed'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
