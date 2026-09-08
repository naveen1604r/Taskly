import React from 'react';
import { useSettingsContext } from '../../context/SettingsContext';

export default function CalendarSettings() {
  const { settings, updateSetting } = useSettingsContext();
  const { weekStartsOn, showWeekends } = settings.calendar;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">Calendar Settings</h3>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          Customize calendar matrix display and weekend scheduling visibility.
        </p>
      </div>

      <div className="space-y-4">
        {/* Week Starts On */}
        <div className="p-4 rounded-xl bg-[#11151F] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h5 className="text-sm font-semibold text-white">Week Starts On</h5>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Select which day opens the calendar week columns.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#171C27] border border-white/[0.08] shrink-0">
            {['monday', 'sunday'].map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => updateSetting('calendar', 'weekStartsOn', day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  weekStartsOn === day
                    ? 'bg-[#7C3AED] text-white shadow-glow-primary'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Show Weekends */}
        <div className="p-4 rounded-xl bg-[#11151F] border border-white/[0.06] flex items-center justify-between gap-4">
          <div>
            <h5 className="text-sm font-semibold text-white">Show Weekends</h5>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Display Saturday and Sunday columns on the calendar. When disabled, weekend items remain safely stored.
            </p>
          </div>

          <button
            type="button"
            onClick={() => updateSetting('calendar', 'showWeekends', !showWeekends)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              showWeekends ? 'bg-[#7C3AED]' : 'bg-slate-700'
            }`}
            role="switch"
            aria-checked={showWeekends}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                showWeekends ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
