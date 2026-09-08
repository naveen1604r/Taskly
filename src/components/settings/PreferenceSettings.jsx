import React from 'react';
import { useSettingsContext } from '../../context/SettingsContext';

export default function PreferenceSettings() {
  const { settings, updateSetting } = useSettingsContext();
  const { startOfWeek, defaultTaskPriority, defaultTaskStatus, confirmBeforeDelete } = settings.preferences;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">General Preferences</h3>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          Configure default behaviors and workflow defaults.
        </p>
      </div>

      <div className="space-y-4">
        {/* Start of Week */}
        <div className="p-4 rounded-xl bg-[#11151F] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h5 className="text-sm font-semibold text-white">Start of the Week</h5>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Determines the starting day on calendar strips and week calculations.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#171C27] border border-white/[0.08] shrink-0">
            {['monday', 'sunday'].map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => updateSetting('preferences', 'startOfWeek', day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  startOfWeek === day
                    ? 'bg-[#7C3AED] text-white shadow-glow-primary'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Default Task Priority */}
        <div className="p-4 rounded-xl bg-[#11151F] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h5 className="text-sm font-semibold text-white">Default Task Priority</h5>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Preselected priority level when creating new tasks.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#171C27] border border-white/[0.08] shrink-0">
            {['low', 'medium', 'high'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => updateSetting('preferences', 'defaultTaskPriority', p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  defaultTaskPriority === p
                    ? 'bg-[#7C3AED] text-white shadow-glow-primary'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Default Task Status */}
        <div className="p-4 rounded-xl bg-[#11151F] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h5 className="text-sm font-semibold text-white">Default Task Status</h5>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Initial status assigned when drafting new tasks.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#171C27] border border-white/[0.08] shrink-0">
            {[
              { id: 'pending', label: 'Pending' },
              { id: 'in_progress', label: 'In Progress' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => updateSetting('preferences', 'defaultTaskStatus', s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  defaultTaskStatus === s.id
                    ? 'bg-[#7C3AED] text-white shadow-glow-primary'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Confirm Before Delete */}
        <div className="p-4 rounded-xl bg-[#11151F] border border-white/[0.06] flex items-center justify-between gap-4">
          <div>
            <h5 className="text-sm font-semibold text-white">Confirm Before Delete</h5>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Show safety confirmation dialogs before deleting tasks, notes, or activities.
            </p>
          </div>

          <button
            type="button"
            onClick={() => updateSetting('preferences', 'confirmBeforeDelete', !confirmBeforeDelete)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              confirmBeforeDelete ? 'bg-[#7C3AED]' : 'bg-slate-700'
            }`}
            role="switch"
            aria-checked={confirmBeforeDelete}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                confirmBeforeDelete ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
