import React from 'react';
import Card from '../common/Card';
import { useTaskContext } from '../../context/TaskContext';
import { CheckCircle2, Clock, Sparkles } from 'lucide-react';

export default function ProgressCard() {
  const { stats } = useTaskContext();

  const completed = stats.todayCompleted;
  const total = stats.todayTotal;
  const remaining = stats.todayPending;
  const percentage = stats.todayProductivityRate;

  return (
    <Card
      title="Today's Progress"
      subtitle="Track your daily completion momentum"
      action={
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/20">
          <Sparkles className="w-3 h-3" />
          {percentage >= 50 ? 'On Track' : 'Needs Focus'}
        </span>
      }
      className="flex flex-col justify-between"
    >
      <div className="space-y-5">
        {/* Big percentage & completion ratio */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold tracking-tight text-white flex items-baseline gap-1">
              <span>{percentage}%</span>
            </div>
            <p className="text-sm text-[#94A3B8] mt-1 font-medium">
              <span className="text-white font-semibold">{completed}</span> of{' '}
              <span className="text-white font-semibold">{total}</span> tasks completed
            </p>
          </div>

          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#171C27] border border-white/[0.08] text-xs font-medium text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{remaining} {remaining === 1 ? 'task' : 'tasks'} remaining</span>
            </div>
          </div>
        </div>

        {/* Modern styled progress bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 bg-[#171C27] rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] via-[#9061F9] to-[#06B6D4] transition-all duration-700 ease-out shadow-[0_0_12px_rgba(124,58,237,0.5)]"
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#94A3B8]">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Encouraging message block */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#171C27] border border-white/[0.06]">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#22C55E]/10 text-[#22C55E] shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {percentage === 100
              ? 'Outstanding work! All tasks for today are completed.'
              : percentage >= 50
              ? "You're making good progress. Keep going."
              : 'Start tackling your priority items to build momentum today.'}
          </p>
        </div>
      </div>
    </Card>
  );
}
