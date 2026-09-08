import React from 'react';
import { useHabitContext } from '../../context/HabitContext';
import Card from '../common/Card';
import {
  Flame,
  Trophy,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Percent,
  Calendar,
  Layers,
} from 'lucide-react';

export default function HabitAnalytics() {
  const {
    activeHabits,
    habitLogs,
    todaySummary,
    weeklyStats,
    categoryStats,
    performanceStats,
  } = useHabitContext();

  return (
    <div className="space-y-6 text-xs">
      <Card
        title="Habit Analytics & Consistency"
        subtitle="Historical completion trends, category breakdown, and performance benchmarks"
        action={<Flame className="w-4 h-4 text-orange-400" />}
      >
        <div className="space-y-6">
          {/* 1. Top Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.04] space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Weekly Completion
              </span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {weeklyStats.overallRate}%
              </span>
              <span className="text-[10px] text-slate-500 block">
                {weeklyStats.totalCompleted} / {weeklyStats.totalScheduled} logged
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.04] space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Today's Rate
              </span>
              <span className="text-xl font-black text-cyan-400 font-mono">
                {todaySummary.completionRate}%
              </span>
              <span className="text-[10px] text-slate-500 block">
                {todaySummary.completedToday} of {todaySummary.totalScheduled} done
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.04] space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Current Best Streak
              </span>
              <span className="text-xl font-black text-orange-400 font-mono">
                {todaySummary.maxCurrentStreak}d
              </span>
              <span className="text-[10px] text-slate-500 block">
                All-time best: {todaySummary.maxBestStreak}d
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.04] space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Active Habits
              </span>
              <span className="text-xl font-black text-white font-mono">
                {activeHabits.length}
              </span>
              <span className="text-[10px] text-slate-500 block">Under active tracking</span>
            </div>
          </div>

          {/* 2. 7-Day Velocity Bar Chart */}
          <div className="space-y-2">
            <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Past 7 Days Consistency</span>
            </h5>

            <div className="p-4 rounded-2xl bg-[#171C27] border border-white/[0.04]">
              <div className="grid grid-cols-7 gap-2 items-end h-28 pt-4">
                {weeklyStats.days.map((day) => (
                  <div key={day.dateStr} className="flex flex-col items-center gap-1 h-full justify-end">
                    <span className="text-[9px] font-mono text-slate-400 font-bold">
                      {day.rate}%
                    </span>
                    <div className="w-full bg-[#11151F] rounded-t-lg h-16 flex items-end overflow-hidden p-0.5">
                      <div
                        className="w-full rounded bg-gradient-to-t from-[#7C3AED] to-[#06B6D4] transition-all duration-300"
                        style={{ height: day.rate > 0 ? `${Math.max(8, day.rate)}%` : '0%' }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {day.dayName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Category Breakdown & Top Habits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Breakdown */}
            <div className="space-y-2">
              <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Habit Categories (30-Day Avg)</span>
              </h5>

              <div className="p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.04] space-y-2.5">
                {categoryStats.length === 0 ? (
                  <p className="text-slate-500 italic py-2">No category logs recorded yet.</p>
                ) : (
                  categoryStats.map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-300">{cat.category}</span>
                        <span className="font-mono text-cyan-400 font-bold">{cat.averageRate}%</span>
                      </div>
                      <div className="w-full bg-[#11151F] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#06B6D4] h-full rounded-full transition-all"
                          style={{ width: `${cat.averageRate}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Performance: Top & Attention */}
            <div className="space-y-2">
              <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <span>Consistency Highlights</span>
              </h5>

              <div className="p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.04] space-y-2.5">
                {performanceStats.topHabits.map((h, i) => (
                  <div key={h.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-4 h-4 rounded-full bg-[#7C3AED]/20 text-[#c4b5fd] font-bold text-[10px] flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-white truncate">{h.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-orange-400 font-mono font-bold">
                        🔥 {h.streak}d
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {h.rate}%
                      </span>
                    </div>
                  </div>
                ))}

                {performanceStats.needsAttention.length > 0 && (
                  <div className="pt-2 border-t border-white/[0.04]">
                    <span className="text-[10px] text-amber-400 font-bold uppercase block mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Needs Attention (&lt;60%)</span>
                    </span>
                    {performanceStats.needsAttention.map((h) => (
                      <div key={h.id} className="flex items-center justify-between text-[11px] py-0.5">
                        <span className="text-slate-400 truncate">{h.name}</span>
                        <span className="font-mono text-amber-400 font-bold">{h.rate}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
