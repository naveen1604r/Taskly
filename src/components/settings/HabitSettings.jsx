import React from 'react';
import { useHabitContext } from '../../context/HabitContext';
import Card from '../common/Card';
import Button from '../common/Button';
import { Flame, Clock, Sparkles, Sun, CheckCircle2 } from 'lucide-react';

export default function HabitSettings() {
  const { habitSettings, updateHabitSettings } = useHabitContext();

  const handleRoutineTimeChange = (routineKey, newTime) => {
    updateHabitSettings({
      routineTimes: {
        ...habitSettings.routineTimes,
        [routineKey]: newTime,
      },
    });
  };

  return (
    <div className="space-y-6 text-xs">
      <Card
        title="Habit Tracking & Daily Routines"
        subtitle="Configure default routine periods, frequency, and streak celebration preferences"
        action={<Flame className="w-5 h-5 text-orange-400" />}
      >
        <div className="space-y-6">
          {/* 1. Default Routine Times */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Routine Time Windows</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'morning', label: 'Morning Routine' },
                { id: 'afternoon', label: 'Afternoon Routine' },
                { id: 'evening', label: 'Evening Routine' },
                { id: 'night', label: 'Night Routine' },
              ].map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04] flex items-center justify-between gap-2"
                >
                  <span className="font-semibold text-slate-300">{r.label}</span>
                  <input
                    type="time"
                    value={habitSettings.routineTimes?.[r.id] || '08:00'}
                    onChange={(e) => handleRoutineTimeChange(r.id, e.target.value)}
                    className="bg-[#11151F] border border-white/[0.08] text-white rounded-xl px-2.5 py-1 text-xs focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 2. Default Frequency */}
          <div className="space-y-2 pt-2 border-t border-white/[0.04]">
            <label className="text-[10px] text-slate-400 font-bold uppercase block">
              Default Habit Frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'daily', label: 'Daily' },
                { id: 'weekdays', label: 'Weekdays' },
                { id: 'weekly', label: 'Weekly' },
              ].map((f) => {
                const isSelected = habitSettings.defaultFrequency === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => updateHabitSettings({ defaultFrequency: f.id })}
                    className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-white'
                        : 'bg-[#171C27] border-white/[0.04] text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Toggles */}
          <div className="space-y-3 pt-2 border-t border-white/[0.04]">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#171C27] border border-white/[0.04]">
              <div className="space-y-0.5">
                <span className="font-semibold text-white block">Streak Milestones & Celebrations</span>
                <span className="text-[11px] text-slate-400">
                  Celebrate 7-day, 14-day, 21-day, and 30-day consistency achievements
                </span>
              </div>
              <input
                type="checkbox"
                checked={habitSettings.enableStreakCelebrations}
                onChange={(e) =>
                  updateHabitSettings({ enableStreakCelebrations: e.target.checked })
                }
                className="w-4 h-4 accent-[#7C3AED] rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#171C27] border border-white/[0.04]">
              <div className="space-y-0.5">
                <span className="font-semibold text-white block">Show Habit Count on My Day</span>
                <span className="text-[11px] text-slate-400">
                  Display today's routine progress directly inside the My Day planner
                </span>
              </div>
              <input
                type="checkbox"
                checked={habitSettings.showInMyDay}
                onChange={(e) => updateHabitSettings({ showInMyDay: e.target.checked })}
                className="w-4 h-4 accent-[#7C3AED] rounded"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
