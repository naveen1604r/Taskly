import React from 'react';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { TrendingUp, TrendingDown, Award, Layers, Sparkles } from 'lucide-react';

export default function ProductivityTrend() {
  const { metrics } = useAnalyticsContext();
  const {
    taskTrendPercent = 0,
    focusTrendPercent = 0,
    productivityScore = 85,
    scoreStatus = 'Good',
    scoreFactors = {},
    dailyData = [],
  } = metrics;

  const isTaskImproving = taskTrendPercent >= 0;
  const isFocusImproving = focusTrendPercent >= 0;

  return (
    <Card
      title="Productivity Score & Velocity"
      subtitle="Historical momentum and transparent weighted score factors"
      action={<Sparkles className="w-4 h-4 text-[#7C3AED]" />}
    >
      <div className="space-y-4">
        {/* Top summary row: Task trend & Focus trend */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04] space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">
              Task Velocity
            </span>
            <div className="flex items-center gap-2">
              {isTaskImproving ? (
                <TrendingUp className="w-4 h-4 text-[#22C55E]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#EF4444]" />
              )}
              <span
                className={`text-base font-bold font-mono ${
                  isTaskImproving ? 'text-[#22C55E]' : 'text-[#EF4444]'
                }`}
              >
                {isTaskImproving ? '+' : ''}{taskTrendPercent}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {isTaskImproving ? 'Output is accelerating' : 'Output dipped from last period'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04] space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">
              Focus Duration
            </span>
            <div className="flex items-center gap-2">
              {isFocusImproving ? (
                <TrendingUp className="w-4 h-4 text-[#06B6D4]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#EF4444]" />
              )}
              <span
                className={`text-base font-bold font-mono ${
                  isFocusImproving ? 'text-[#06B6D4]' : 'text-[#EF4444]'
                }`}
              >
                {isFocusImproving ? '+' : ''}{focusTrendPercent}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {isFocusImproving ? 'Deep work increased' : 'Less focus time tracked'}
            </p>
          </div>
        </div>

        {/* Daily Productivity Score History Sparkline (Requirement 21) */}
        <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Daily Score History</span>
            <span className="font-mono text-[11px] text-slate-400">Score Range (0–100)</span>
          </div>

          <div className="h-24 flex items-end justify-between gap-1.5 pt-2">
            {dailyData.map((d) => {
              const height = Math.max(Math.round((d.productivityScore / 100) * 80), 8);
              return (
                <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[9px] font-mono font-bold text-slate-400 group-hover:text-white">
                    {d.productivityScore}
                  </span>
                  <div className="w-full max-w-[20px] bg-white/[0.04] rounded-md h-16 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-[#7C3AED] to-[#06B6D4] rounded-md transition-all duration-300"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 uppercase">{d.dayName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transparent Score Breakdown (Requirement 22) */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-bold text-white block">
            Productivity Formula Breakdown (Current Score: {productivityScore}/100)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-[#171C27] border border-white/[0.03]">
              <span className="text-[10px] text-slate-400 block">Tasks (35 pts)</span>
              <span className="font-mono font-bold text-white">{scoreFactors.taskCompletion || 0} pts</span>
            </div>

            <div className="p-2 rounded-xl bg-[#171C27] border border-white/[0.03]">
              <span className="text-[10px] text-slate-400 block">Focus (25 pts)</span>
              <span className="font-mono font-bold text-[#06B6D4]">{scoreFactors.focusTime || 0} pts</span>
            </div>

            <div className="p-2 rounded-xl bg-[#171C27] border border-white/[0.03]">
              <span className="text-[10px] text-slate-400 block">Overdue Ctrl (15 pts)</span>
              <span className="font-mono font-bold text-[#22C55E]">{scoreFactors.overdueControl || 0} pts</span>
            </div>

            <div className="p-2 rounded-xl bg-[#171C27] border border-white/[0.03]">
              <span className="text-[10px] text-slate-400 block">Planned (15 pts)</span>
              <span className="font-mono font-bold text-white">{scoreFactors.plannedExecution || 0} pts</span>
            </div>

            <div className="p-2 rounded-xl bg-[#171C27] border border-white/[0.03]">
              <span className="text-[10px] text-slate-400 block">Goals (10 pts)</span>
              <span className="font-mono font-bold text-purple-400">{scoreFactors.goalProgress || 0} pts</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
