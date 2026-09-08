import React from 'react';
import Card from '../common/Card';
import { useFocusContext } from '../../context/FocusContext';
import { Flame, Clock, Coffee, Bell, Volume2, Sparkles } from 'lucide-react';

export default function FocusSettings() {
  const { focusSettings, updateSettings } = useFocusContext();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-[#7C3AED]" />
          <span>Focus & Pomodoro Settings</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize your Pomodoro focus blocks, break intervals, audio cues, and daily target.
        </p>
      </div>

      <Card className="space-y-5 border-white/[0.08]">
        {/* Interval Durations */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            Interval Durations
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Focus Duration */}
            <div className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.06] space-y-1.5">
              <label className="text-xs font-semibold text-white block">Focus Duration</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={focusSettings.focusDuration || 25}
                  onChange={(e) =>
                    updateSettings({ focusDuration: Math.max(5, parseInt(e.target.value, 10) || 25) })
                  }
                  className="w-20 px-2.5 py-1 text-sm bg-[#11151F] text-white font-bold rounded-lg border border-white/[0.1] focus:border-[#7C3AED] focus:outline-none"
                />
                <span className="text-xs text-slate-400">minutes</span>
              </div>
            </div>

            {/* Short Break Duration */}
            <div className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.06] space-y-1.5">
              <label className="text-xs font-semibold text-white block">Short Break</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={focusSettings.shortBreakDuration || 5}
                  onChange={(e) =>
                    updateSettings({ shortBreakDuration: Math.max(1, parseInt(e.target.value, 10) || 5) })
                  }
                  className="w-20 px-2.5 py-1 text-sm bg-[#11151F] text-white font-bold rounded-lg border border-white/[0.1] focus:border-[#7C3AED] focus:outline-none"
                />
                <span className="text-xs text-slate-400">minutes</span>
              </div>
            </div>

            {/* Long Break Duration */}
            <div className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.06] space-y-1.5">
              <label className="text-xs font-semibold text-white block">Long Break</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={focusSettings.longBreakDuration || 15}
                  onChange={(e) =>
                    updateSettings({ longBreakDuration: Math.max(5, parseInt(e.target.value, 10) || 15) })
                  }
                  className="w-20 px-2.5 py-1 text-sm bg-[#11151F] text-white font-bold rounded-lg border border-white/[0.1] focus:border-[#7C3AED] focus:outline-none"
                />
                <span className="text-xs text-slate-400">minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pomodoro Cycle Rules */}
        <div className="space-y-4 pt-4 border-t border-white/[0.06]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            Pomodoro Cycle & Targets
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sessions before Long Break */}
            <div className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.06] space-y-1.5">
              <label className="text-xs font-semibold text-white block">Sessions Before Long Break</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={focusSettings.sessionsBeforeLongBreak || 4}
                  onChange={(e) =>
                    updateSettings({ sessionsBeforeLongBreak: Math.max(1, parseInt(e.target.value, 10) || 4) })
                  }
                  className="w-20 px-2.5 py-1 text-sm bg-[#11151F] text-white font-bold rounded-lg border border-white/[0.1] focus:border-[#7C3AED] focus:outline-none"
                />
                <span className="text-xs text-slate-400">focus blocks</span>
              </div>
            </div>

            {/* Daily Focus Goal */}
            <div className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.06] space-y-1.5">
              <label className="text-xs font-semibold text-white block">Daily Focus Target</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="15"
                  max="720"
                  step="15"
                  value={focusSettings.dailyFocusGoal || 120}
                  onChange={(e) =>
                    updateSettings({ dailyFocusGoal: Math.max(15, parseInt(e.target.value, 10) || 120) })
                  }
                  className="w-24 px-2.5 py-1 text-sm bg-[#11151F] text-white font-bold rounded-lg border border-white/[0.1] focus:border-[#7C3AED] focus:outline-none"
                />
                <span className="text-xs text-slate-400">minutes / day</span>
              </div>
            </div>
          </div>
        </div>

        {/* Automation & Audio Preferences */}
        <div className="space-y-3 pt-4 border-t border-white/[0.06]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            Automation & Audio
          </h4>

          {/* Auto Start Break Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#171C27] border border-white/[0.04]">
            <div>
              <span className="text-xs font-semibold text-white block">Auto-Start Break</span>
              <span className="text-[11px] text-slate-400">
                Automatically begin break countdown when a focus block completes
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={focusSettings.autoStartBreak}
                onChange={(e) => updateSettings({ autoStartBreak: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7C3AED]" />
            </label>
          </div>

          {/* Auto Start Focus Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#171C27] border border-white/[0.04]">
            <div>
              <span className="text-xs font-semibold text-white block">Auto-Start Next Focus</span>
              <span className="text-[11px] text-slate-400">
                Automatically begin the next focus session when a break finishes
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={focusSettings.autoStartFocus}
                onChange={(e) => updateSettings({ autoStartFocus: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7C3AED]" />
            </label>
          </div>

          {/* Timer Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#171C27] border border-white/[0.04]">
            <div>
              <span className="text-xs font-semibold text-white block">Timer Completion Chime</span>
              <span className="text-[11px] text-slate-400">
                Play gentle chime when focus or break sessions conclude
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={focusSettings.timerSound}
                onChange={(e) => updateSettings({ timerSound: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7C3AED]" />
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
}
