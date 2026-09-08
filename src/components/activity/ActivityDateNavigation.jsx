import React, { useState } from 'react';
import { useActivityContext } from '../../context/ActivityContext';
import { getTodayDateString } from '../../utils/taskStorage';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function ActivityDateNavigation() {
  const {
    selectedDate,
    setSelectedDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    summary,
  } = useActivityContext();

  const [calendarOpen, setCalendarOpen] = useState(false);
  const today = getTodayDateString();
  const isToday = selectedDate === today;

  // Format selected date nicely e.g. "Tuesday, September 1, 2026"
  const formattedDate = (() => {
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      // fallback
    }
    return selectedDate;
  })();

  // Generate 7 days strip around selected date for instant tapping
  const getDayStrip = () => {
    const list = [];
    const base = new Date(selectedDate);
    for (let offset = -3; offset <= 3; offset++) {
      const d = new Date(base);
      d.setDate(d.getDate() + offset);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const hasActivity = summary.datesWithActivities.has(dateStr);
      list.push({
        dateStr,
        dayName,
        dayNum,
        hasActivity,
        isSelected: dateStr === selectedDate,
        isToday: dateStr === today,
      });
    }
    return list;
  };

  const dayStrip = getDayStrip();

  return (
    <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-[#11151F] border border-white/[0.08] shadow-subtle">
      {/* Top row: Date Banner & Navigator Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={goToPreviousDay}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl border border-white/[0.08] transition-all flex items-center gap-1 text-xs font-medium"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Previous Day</span>
          </button>

          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-white px-1">
              {formattedDate}
            </h3>
            {isToday && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#7C3AED]/15 text-[#c4b5fd] border border-[#7C3AED]/30">
                Today
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={goToNextDay}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl border border-white/[0.08] transition-all flex items-center gap-1 text-xs font-medium"
            title="Next Day"
          >
            <span className="hidden xs:inline">Next Day</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right side: Native Date picker + Today shortcut button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!isToday && (
            <button
              type="button"
              onClick={goToToday}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#171C27] hover:bg-[#1f2635] rounded-xl border border-white/[0.08] transition-all"
            >
              Back to Today
            </button>
          )}

          {/* Quick date picker */}
          <div className="relative flex items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) setSelectedDate(e.target.value);
              }}
              className="px-3 py-1.5 text-xs font-medium bg-[#171C27] hover:bg-[#1f2635] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none transition-colors cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Interactive Compact Date Strip with Activity Dots */}
      <div className="pt-3 border-t border-white/[0.06] overflow-x-auto">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 min-w-[320px]">
          {dayStrip.map((item) => (
            <button
              key={item.dateStr}
              type="button"
              onClick={() => setSelectedDate(item.dateStr)}
              className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all relative ${
                item.isSelected
                  ? 'bg-[#7C3AED] text-white shadow-glow-primary'
                  : 'bg-[#171C27] text-slate-400 hover:text-white hover:bg-[#1f2635] border border-white/[0.06]'
              }`}
            >
              <span className="text-[10px] uppercase font-semibold tracking-wider">
                {item.dayName}
              </span>
              <span className={`text-sm sm:text-base font-bold mt-0.5 ${item.isSelected ? 'text-white' : 'text-slate-200'}`}>
                {item.dayNum}
              </span>

              {/* Activity indicator dot • */}
              <div className="h-2 flex items-center justify-center mt-0.5">
                {item.hasActivity ? (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.isSelected ? 'bg-white' : 'bg-[#06B6D4]'
                    }`}
                    title="Has logged activities"
                  />
                ) : (
                  <span className="w-1.5 h-1.5 opacity-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
