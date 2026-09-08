import React from 'react';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { useFocusContext } from '../../context/FocusContext';
import { Flame, Trophy, Calendar, Check, X } from 'lucide-react';

export default function FocusStreak() {
  const { metrics } = useAnalyticsContext();
  const { focusStreak = 0, focusSettings = {} } = useFocusContext();
  const dailyFocusGoalMinutes = focusSettings.dailyFocusGoal || 120;
  const currentStreak = typeof focusStreak === 'number' ? focusStreak : (focusStreak?.currentStreak || 0);
  const longestStreak = typeof focusStreak === 'object' && focusStreak?.longestStreak ? focusStreak.longestStreak : currentStreak;
  const { insights = {}, dailyData = [] } = metrics;

  return (
    <Card
      title="Focus Streak & Goal Success"
      subtitle="Consistency and adherence to daily deep work targets"
      action={
        <span className="text-xs font-mono font-semibold text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/25 px-2.5 py-1 rounded-xl">
          {insights.goalSuccessRate || 0}% Target Met
        </span>
      }
    >
      <div className="space-y-4">
        {/* Streak numbers row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04] flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#F59E0B]/15 text-[#F59E0B] shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block">
                Current Streak
              </span>
              <span className="text-lg font-bold text-white font-mono">
                {currentStreak} days
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04] flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#7C3AED]/15 text-[#7C3AED] shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block">
                Longest Streak
              </span>
              <span className="text-lg font-bold text-white font-mono">
                {longestStreak} days
              </span>
            </div>
          </div>
        </div>

        {/* Daily Goal Performance Day by Day (Requirement 14) */}
        <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Daily Target ({dailyFocusGoalMinutes}m/day)</span>
            <span className="font-mono text-[11px] text-slate-400">
              {insights.goalMetDaysCount || 0} / {insights.totalDays || 7} days achieved
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 pt-1 text-center">
            {dailyData.map((d) => (
              <div
                key={d.dateStr}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                  d.isGoalMet
                    ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
                    : 'bg-white/[0.02] border-white/[0.04] text-slate-500'
                }`}
              >
                <span className="text-[10px] font-bold uppercase">{d.dayName}</span>
                {d.isGoalMet ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <X className="w-3.5 h-3.5 opacity-50" />
                )}
                <span className="text-[9px] font-mono">{d.focusMinutes}m</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
