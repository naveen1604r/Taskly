import React from 'react';
import WeekdaySelector from './WeekdaySelector';
import { getHumanRecurrenceSummary } from '../../utils/recurrenceUtils';
import { Calendar, Repeat, Info } from 'lucide-react';

const recurrenceTypes = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekdays', label: 'Weekdays' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'custom', label: 'Custom' },
];

export default function RecurrenceSelector({ value, onChange }) {
  const {
    type = 'daily',
    interval = 1,
    daysOfWeek = [1],
    dayOfMonth = 1,
    customUnit = 'days',
    customInterval = 1,
  } = value || {};

  const handleTypeChange = (newType) => {
    let updated = { ...value, type: newType };
    if (newType === 'weekly' && (!value.daysOfWeek || value.daysOfWeek.length === 0)) {
      updated.daysOfWeek = [1, 3, 5]; // default Mon/Wed/Fri
    }
    if (newType === 'monthly' && !value.dayOfMonth) {
      updated.dayOfMonth = 1;
    }
    onChange(updated);
  };

  const humanSummary = getHumanRecurrenceSummary(value);

  return (
    <div className="space-y-4">
      {/* Recurrence Type Tabs */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
          Recurrence Pattern
        </label>
        <div className="grid grid-cols-5 gap-1.5 p-1 rounded-xl bg-[#171C27] border border-white/[0.06]">
          {recurrenceTypes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTypeChange(t.id)}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                type === t.id
                  ? 'bg-[#7C3AED] text-white shadow-glow-primary'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Type Specific Fields */}
      {type === 'daily' && (
        <div className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.06] space-y-2">
          <div className="flex items-center gap-2 text-xs text-white">
            <span>Repeat every</span>
            <input
              type="number"
              min="1"
              max="365"
              value={interval || 1}
              onChange={(e) =>
                onChange({ ...value, interval: Math.max(1, parseInt(e.target.value, 10) || 1) })
              }
              className="w-16 px-2.5 py-1 text-center bg-[#11151F] text-white font-bold rounded-lg border border-white/[0.1] focus:border-[#7C3AED] focus:outline-none"
            />
            <span>day(s)</span>
          </div>
        </div>
      )}

      {type === 'weekdays' && (
        <div className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.06] flex items-start gap-2.5 text-xs text-slate-300">
          <Info className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block font-semibold mb-0.5">Monday through Friday</strong>
            Occurrences will be created every weekday. Saturdays and Sundays are excluded.
          </div>
        </div>
      )}

      {type === 'weekly' && (
        <div className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.06] space-y-3">
          <div className="flex items-center gap-2 text-xs text-white pb-2 border-b border-white/[0.04]">
            <span>Every</span>
            <input
              type="number"
              min="1"
              max="52"
              value={interval || 1}
              onChange={(e) =>
                onChange({ ...value, interval: Math.max(1, parseInt(e.target.value, 10) || 1) })
              }
              className="w-16 px-2.5 py-1 text-center bg-[#11151F] text-white font-bold rounded-lg border border-white/[0.1] focus:border-[#7C3AED] focus:outline-none"
            />
            <span>week(s) on:</span>
          </div>

          <WeekdaySelector
            selectedDays={daysOfWeek}
            onChange={(days) => onChange({ ...value, daysOfWeek: days })}
          />
        </div>
      )}

      {type === 'monthly' && (
        <div className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.06] space-y-3">
          <div className="flex items-center gap-2 text-xs text-white">
            <span>Repeat on day</span>
            <input
              type="number"
              min="1"
              max="31"
              value={dayOfMonth || 1}
              onChange={(e) => {
                const num = Math.min(31, Math.max(1, parseInt(e.target.value, 10) || 1));
                onChange({ ...value, dayOfMonth: num });
              }}
              className="w-16 px-2.5 py-1 text-center bg-[#11151F] text-white font-bold rounded-lg border border-white/[0.1] focus:border-[#7C3AED] focus:outline-none"
            />
            <span>of every month</span>
          </div>

          <div className="flex items-start gap-2 text-[11px] text-[#94A3B8] bg-[#11151F] p-2 rounded-lg border border-white/[0.04]">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Months with fewer days (e.g. February having 28/29 days or 30-day months when day 31 is chosen) will be skipped safely without creating invalid dates.
            </span>
          </div>
        </div>
      )}

      {type === 'custom' && (
        <div className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.06] space-y-2">
          <div className="flex items-center gap-2 text-xs text-white">
            <span>Repeat every</span>
            <input
              type="number"
              min="1"
              max="365"
              value={customInterval || 1}
              onChange={(e) =>
                onChange({ ...value, customInterval: Math.max(1, parseInt(e.target.value, 10) || 1) })
              }
              className="w-16 px-2.5 py-1 text-center bg-[#11151F] text-white font-bold rounded-lg border border-white/[0.1] focus:border-[#7C3AED] focus:outline-none"
            />
            <select
              value={customUnit || 'days'}
              onChange={(e) => onChange({ ...value, customUnit: e.target.value })}
              className="px-2.5 py-1 bg-[#11151F] text-white rounded-lg border border-white/[0.1] focus:border-[#7C3AED] focus:outline-none text-xs"
            >
              <option value="days">day(s)</option>
              <option value="weeks">week(s)</option>
              <option value="months">month(s)</option>
            </select>
          </div>
        </div>
      )}

      {/* Human Readable Summary Pill */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-xs text-[#c4b5fd]">
        <Repeat className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
        <span className="font-medium">{humanSummary}</span>
      </div>
    </div>
  );
}
