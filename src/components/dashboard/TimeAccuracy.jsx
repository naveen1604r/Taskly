import React from 'react';
import Card from '../common/Card';
import { useTaskContext } from '../../context/TaskContext';
import { Clock, Hourglass, TrendingUp, TrendingDown } from 'lucide-react';

export default function TimeAccuracy() {
  const { tasks } = useTaskContext();

  // Aggregate estimated minutes vs actual minutes for completed tasks
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  let totalEstimatedMins = 0;
  let totalActualMins = 0;

  completedTasks.forEach((t) => {
    let est = Number(t.estimatedDuration || t.duration) || 30;
    if (t.durationUnit === 'hours') est *= 60;
    totalEstimatedMins += est;
    totalActualMins += Number(t.actualDuration) || est;
  });

  const diffMins = totalActualMins - totalEstimatedMins;
  const isOver = diffMins > 0;
  const isUnder = diffMins < 0;

  const estH = Math.floor(totalEstimatedMins / 60);
  const estM = totalEstimatedMins % 60;
  const actH = Math.floor(totalActualMins / 60);
  const actM = totalActualMins % 60;

  const diffAbs = Math.abs(diffMins);
  const diffH = Math.floor(diffAbs / 60);
  const diffM = diffAbs % 60;
  const formattedDiff = `${isOver ? '+' : isUnder ? '-' : ''}${
    diffH > 0 ? `${diffH}h ${diffM}m` : `${diffM}m`
  }`;

  let feedback = 'No completed tasks to compare yet.';
  if (completedTasks.length > 0) {
    feedback = 'Your time estimates align closely with actual work!';
    if (diffMins > 60) {
      feedback = "You're spending moderately more time than originally estimated.";
    } else if (diffMins > 15) {
      feedback = "You're spending slightly more time than estimated.";
    } else if (diffMins < -30) {
      feedback = 'You are finishing tasks noticeably faster than estimated.';
    }
  }

  return (
    <Card
      title="Time Accuracy"
      subtitle="Estimated time vs actual tracked execution"
      action={<Hourglass className="w-4 h-4 text-[#06B6D4]" />}
    >
      <div className="space-y-3.5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-[#171C27] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Estimated
            </span>
            <span className="text-sm sm:text-base font-bold text-white font-mono">
              {estH}h {estM}m
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#171C27] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Actual
            </span>
            <span className="text-sm sm:text-base font-bold text-[#06B6D4] font-mono">
              {actH}h {actM}m
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#171C27] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Variance
            </span>
            <span
              className={`text-sm sm:text-base font-bold font-mono ${
                isOver ? 'text-[#F59E0B]' : isUnder ? 'text-[#22C55E]' : 'text-slate-300'
              }`}
            >
              {formattedDiff}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06] text-center font-medium">
          {feedback}
        </p>
      </div>
    </Card>
  );
}
