import React from 'react';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { Hourglass, Clock, TrendingUp, TrendingDown, Target } from 'lucide-react';

export default function TimeAccuracy() {
  const { metrics } = useAnalyticsContext();
  const {
    totalEstimatedMins = 0,
    totalActualMins = 0,
    timeDifferenceMins = 0,
    estAccuracy = 90,
    categoryStats = [],
  } = metrics;

  const estH = Math.floor(totalEstimatedMins / 60);
  const estM = totalEstimatedMins % 60;
  const actH = Math.floor(totalActualMins / 60);
  const actM = totalActualMins % 60;

  const diffAbs = Math.abs(timeDifferenceMins);
  const diffH = Math.floor(diffAbs / 60);
  const diffM = diffAbs % 60;
  const isOver = timeDifferenceMins > 0;
  const isUnder = timeDifferenceMins < 0;

  const formattedDiff = `${isOver ? '+' : isUnder ? '-' : ''}${
    diffH > 0 ? `${diffH}h ${diffM}m` : `${diffM}m`
  }`;

  let verdict = 'Your time estimates align closely with execution.';
  if (timeDifferenceMins > 60) {
    verdict = 'Tasks are generally taking more time than estimated.';
  } else if (timeDifferenceMins < -45) {
    verdict = 'Tasks are generally taking less time than estimated.';
  }

  return (
    <Card
      title="Estimated vs Actual Duration"
      subtitle="Time prediction accuracy across completed deliverables"
      action={
        <span className="text-xs font-mono font-semibold text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/25 px-2.5 py-1 rounded-xl">
          {estAccuracy}% Accuracy
        </span>
      }
    >
      <div className="space-y-4">
        {/* 1. Metric Summary Cards */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Estimated Total
            </span>
            <span className="text-base sm:text-lg font-bold text-white font-mono">
              {estH}h {estM}m
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Actual Tracked
            </span>
            <span className="text-base sm:text-lg font-bold text-[#06B6D4] font-mono">
              {actH}h {actM}m
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Net Variance
            </span>
            <span
              className={`text-base sm:text-lg font-bold font-mono ${
                isOver ? 'text-[#F59E0B]' : isUnder ? 'text-[#22C55E]' : 'text-slate-300'
              }`}
            >
              {formattedDiff}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06] text-center font-medium">
          {verdict}
        </p>

        {/* 2. Category Time Accuracy (Requirement 10) */}
        <div className="pt-2 border-t border-white/[0.06] space-y-2.5">
          <span className="text-xs font-bold text-white block">
            Estimate Accuracy by Category
          </span>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {categoryStats.map((c) => {
              const cEstH = Math.floor(c.estimatedMins / 60);
              const cEstM = c.estimatedMins % 60;
              const cActH = Math.floor(c.actualMins / 60);
              const cActM = c.actualMins % 60;

              return (
                <div
                  key={c.category}
                  className="p-2.5 rounded-xl bg-[#171C27] border border-white/[0.03] flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-white">{c.category}</span>
                  <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                    <span>Est: {cEstH}h {cEstM}m</span>
                    <span className="text-[#06B6D4]">Act: {cActH}h {cActM}m</span>
                    <span className="text-white font-bold">({c.accuracyRate}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
