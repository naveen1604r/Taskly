import React from 'react';
import { useHabitContext } from '../../context/HabitContext';
import { Sparkles, Trophy, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

export default function WeeklyHabitReview() {
  const { weeklyStats, performanceStats } = useHabitContext();

  const consistentHabit = performanceStats.topHabits[0];
  const attentionHabit = performanceStats.needsAttention[0];

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#7C3AED]/15 via-[#11151F] to-[#06B6D4]/15 border border-white/[0.08] space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-[#7C3AED]/20 text-[#c4b5fd]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Weekly Habit Review</h4>
            <p className="text-[11px] text-slate-400">Past 7 days consistency analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.06] border border-white/[0.04] text-emerald-400 font-bold font-mono">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{weeklyStats.overallRate}% Completion</span>
        </div>
      </div>

      {/* Message summary */}
      <p className="text-slate-300 text-[12px] leading-relaxed">
        You completed <span className="font-bold text-white">{weeklyStats.totalCompleted}</span> of your{' '}
        <span className="font-bold text-white">{weeklyStats.totalScheduled}</span> scheduled habits this week ({weeklyStats.overallRate}%).
        {weeklyStats.overallRate >= 80
          ? ' Phenomenal discipline! Your daily consistency is building unstoppable momentum.'
          : weeklyStats.overallRate >= 50
          ? ' Steady progress. Focus on locking in your morning routines to elevate completion.'
          : ' A fresh week ahead. Start small and build momentum one habit at a time.'}
      </p>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {consistentHabit && (
          <div className="p-3 rounded-2xl bg-[#171C27] border border-emerald-500/20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Most Consistent
                </span>
                <span className="font-bold text-white truncate block">{consistentHabit.name}</span>
              </div>
            </div>
            <span className="font-mono font-bold text-emerald-400 text-xs shrink-0">
              {consistentHabit.rate}%
            </span>
          </div>
        )}

        {attentionHabit && (
          <div className="p-3 rounded-2xl bg-[#171C27] border border-amber-500/20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Needs Attention
                </span>
                <span className="font-bold text-white truncate block">{attentionHabit.name}</span>
              </div>
            </div>
            <span className="font-mono font-bold text-amber-400 text-xs shrink-0">
              {attentionHabit.rate}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
