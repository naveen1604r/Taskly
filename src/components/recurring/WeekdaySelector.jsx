import React from 'react';

const weekdays = [
  { index: 1, short: 'Mon', full: 'Monday' },
  { index: 2, short: 'Tue', full: 'Tuesday' },
  { index: 3, short: 'Wed', full: 'Wednesday' },
  { index: 4, short: 'Thu', full: 'Thursday' },
  { index: 5, short: 'Fri', full: 'Friday' },
  { index: 6, short: 'Sat', full: 'Saturday' },
  { index: 0, short: 'Sun', full: 'Sunday' },
];

export default function WeekdaySelector({ selectedDays = [], onChange }) {
  const toggleDay = (dayIndex) => {
    if (selectedDays.includes(dayIndex)) {
      onChange(selectedDays.filter((d) => d !== dayIndex));
    } else {
      onChange([...selectedDays, dayIndex].sort());
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <label className="font-semibold uppercase tracking-wider text-[#94A3B8]">
          Repeat on Days
        </label>
        <span className="text-[11px] text-slate-400">
          {selectedDays.length === 0 ? 'Select at least 1 day' : `${selectedDays.length} days selected`}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {weekdays.map((w) => {
          const isSelected = selectedDays.includes(w.index);
          return (
            <button
              key={w.short}
              type="button"
              onClick={() => toggleDay(w.index)}
              className={`py-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                isSelected
                  ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-glow-primary'
                  : 'bg-[#171C27] text-slate-400 hover:text-white border-white/[0.06] hover:border-white/[0.14]'
              }`}
              title={w.full}
              aria-pressed={isSelected}
            >
              {w.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}
