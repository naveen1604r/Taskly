import React from 'react';
import { X, Sliders, Check } from 'lucide-react';
import Button from '../common/Button';

export default function CalendarSettings({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) {
  if (!isOpen) return null;

  const handleChange = (key, val) => {
    onUpdateSettings({ ...settings, [key]: val });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md bg-[#11151F] border border-white/[0.1] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#7C3AED]/15 text-[#7C3AED]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Calendar Settings</h3>
              <p className="text-xs text-slate-400">Configure scheduling and view preferences</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3.5">
          {/* Default View */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Default View</label>
            <select
              value={settings.view || 'month'}
              onChange={(e) => handleChange('view', e.target.value)}
              className="w-full bg-[#171C27] border border-white/[0.08] text-white rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="month">Month View</option>
              <option value="week">Week View</option>
              <option value="day">Day View</option>
              <option value="agenda">Agenda View</option>
            </select>
          </div>

          {/* Week Starts On */}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Week Starts On</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleChange('weekStartsOn', 'monday')}
                className={`p-2 rounded-xl border font-semibold transition-all ${
                  settings.weekStartsOn === 'monday'
                    ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-white'
                    : 'bg-[#171C27] border-white/[0.04] text-slate-400 hover:text-white'
                }`}
              >
                Monday
              </button>
              <button
                type="button"
                onClick={() => handleChange('weekStartsOn', 'sunday')}
                className={`p-2 rounded-xl border font-semibold transition-all ${
                  settings.weekStartsOn === 'sunday'
                    ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-white'
                    : 'bg-[#171C27] border-white/[0.04] text-slate-400 hover:text-white'
                }`}
              >
                Sunday
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-1 border-t border-white/[0.04]">
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#171C27] border border-white/[0.04] cursor-pointer">
              <span className="text-slate-300 font-medium">Show Weekends</span>
              <input
                type="checkbox"
                checked={settings.showWeekends ?? true}
                onChange={(e) => handleChange('showWeekends', e.target.checked)}
                className="w-4 h-4 accent-[#7C3AED] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#171C27] border border-white/[0.04] cursor-pointer">
              <span className="text-slate-300 font-medium">Show Completed Tasks</span>
              <input
                type="checkbox"
                checked={settings.showCompleted ?? true}
                onChange={(e) => handleChange('showCompleted', e.target.checked)}
                className="w-4 h-4 accent-[#7C3AED] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#171C27] border border-white/[0.04] cursor-pointer">
              <span className="text-slate-300 font-medium">Auto-scroll to Current Time</span>
              <input
                type="checkbox"
                checked={settings.autoScrollNow ?? true}
                onChange={(e) => handleChange('autoScrollNow', e.target.checked)}
                className="w-4 h-4 accent-[#7C3AED] rounded"
              />
            </label>
          </div>

          {/* Working Hours */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.04]">
            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase font-semibold">Work Start</label>
              <select
                value={settings.workStartHour || 9}
                onChange={(e) => handleChange('workStartHour', parseInt(e.target.value, 10))}
                className="w-full bg-[#171C27] border border-white/[0.08] text-white rounded-xl px-2.5 py-1.5 focus:outline-none"
              >
                {[7, 8, 9, 10].map((h) => (
                  <option key={h} value={h}>
                    {h}:00 AM
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase font-semibold">Work End</label>
              <select
                value={settings.workEndHour || 18}
                onChange={(e) => handleChange('workEndHour', parseInt(e.target.value, 10))}
                className="w-full bg-[#171C27] border border-white/[0.08] text-white rounded-xl px-2.5 py-1.5 focus:outline-none"
              >
                {[17, 18, 19, 20, 21].map((h) => (
                  <option key={h} value={h}>
                    {h % 12 === 0 ? 12 : h % 12}:00 PM
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
