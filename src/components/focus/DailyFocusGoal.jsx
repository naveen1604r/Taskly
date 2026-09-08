import React, { useState } from 'react';
import Card from '../common/Card';
import { useFocusContext } from '../../context/FocusContext';
import { formatDurationMinutes } from '../../utils/focusUtils';
import { Target, CheckCircle2, Settings2 } from 'lucide-react';

export default function DailyFocusGoal() {
  const { todayFocusMinutes, focusSettings, updateSettings } = useFocusContext();
  const [isEditing, setIsEditing] = useState(false);

  const goal = focusSettings.dailyFocusGoal || 120;
  const percentage = Math.min(100, Math.round((todayFocusMinutes / goal) * 100));
  const isReached = todayFocusMinutes >= goal;
  const remaining = Math.max(0, goal - todayFocusMinutes);

  const goalPresets = [30, 60, 90, 120, 180];

  return (
    <Card className="flex flex-col justify-between border-white/[0.08]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">Daily Focus Goal</h4>
              <p className="text-xs text-slate-400">
                {todayFocusMinutes} / {goal} min planned target
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Configure daily focus goal"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        {/* Inline Goal Selector */}
        {isEditing && (
          <div className="p-3 rounded-xl bg-[#171C27] border border-white/[0.08] space-y-2 animate-in fade-in duration-150">
            <span className="text-xs font-semibold text-white block">Set Daily Target</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {goalPresets.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    updateSettings({ dailyFocusGoal: mins });
                    setIsEditing(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    goal === mins
                      ? 'bg-[#7C3AED] text-white'
                      : 'bg-[#11151F] text-slate-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">
              {isReached ? 'Goal Achieved!' : `${formatDurationMinutes(remaining)} remaining`}
            </span>
            <span
              className={`font-bold font-mono ${
                isReached ? 'text-[#22C55E]' : 'text-[#7C3AED]'
              }`}
            >
              {percentage}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-[#171C27] rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isReached
                  ? 'bg-[#22C55E]'
                  : 'bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {isReached && (
          <div className="p-2.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center gap-2 text-xs text-[#22C55E] font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Daily focus goal completed 🎉 Great discipline today!</span>
          </div>
        )}
      </div>
    </Card>
  );
}
