import React from 'react';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { Calendar } from 'lucide-react';

const rangeOptions = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last_7_days', label: 'Last 7 Days' },
  { id: 'last_14_days', label: 'Last 14 Days' },
  { id: 'last_30_days', label: 'Last 30 Days' },
  { id: 'this_week', label: 'This Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'custom', label: 'Custom Range' },
];

export default function DateRangeSelector() {
  const {
    selectedRange,
    setSelectedRange,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
  } = useAnalyticsContext();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex items-center">
        <Calendar className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <select
          value={selectedRange}
          onChange={(e) => setSelectedRange(e.target.value)}
          className="pl-8 pr-8 py-2 text-xs bg-[#11151F] hover:bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none transition-colors appearance-none cursor-pointer font-medium shadow-xs"
          aria-label="Select analytics date range"
        >
          {rangeOptions.map((opt) => (
            <option key={opt.id} value={opt.id} className="bg-[#171C27] text-white">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {selectedRange === 'custom' && (
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#11151F] border border-white/[0.08] text-xs">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="bg-[#171C27] border border-white/[0.06] rounded-lg px-2 py-1 text-white text-xs"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="bg-[#171C27] border border-white/[0.06] rounded-lg px-2 py-1 text-white text-xs"
          />
        </div>
      )}
    </div>
  );
}
