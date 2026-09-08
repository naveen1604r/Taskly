import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  HelpCircle,
} from 'lucide-react';
import Button from '../common/Button';

export default function CalendarHeader({
  viewTitle,
  currentView,
  selectedDate,
  onPrev,
  onNext,
  onToday,
  onDateChange,
  onViewChange,
}) {
  const views = [
    { id: 'month', label: 'Month' },
    { id: 'week', label: 'Week' },
    { id: 'day', label: 'Day' },
    { id: 'agenda', label: 'Agenda' },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/[0.08] pb-5">
      {/* Title & Navigation Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/25">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {viewTitle}
          </h2>
        </div>

        {/* Prev / Today / Next */}
        <div className="flex items-center gap-1 bg-[#11151F] border border-white/[0.08] p-1 rounded-2xl">
          <button
            type="button"
            onClick={onPrev}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Previous (Arrow Left)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToday}
            className="px-3 py-1 rounded-xl text-xs font-bold text-white hover:bg-white/[0.06] transition-colors"
          >
            Today
          </button>

          <button
            type="button"
            onClick={onNext}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Next (Arrow Right)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Date Jump Input */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => e.target.value && onDateChange(e.target.value)}
          className="bg-[#11151F] border border-white/[0.08] rounded-xl px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-[#7C3AED]"
          title="Jump to date"
        />
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#11151F] rounded-2xl border border-white/[0.08] text-xs self-start md:self-auto">
        {views.map((v) => {
          const isActive = currentView === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onViewChange(v.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                isActive
                  ? 'bg-[#7C3AED] text-white shadow-glow-primary'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {v.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
