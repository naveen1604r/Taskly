import React from 'react';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { Clock, Flame } from 'lucide-react';

export default function FocusTimeChart() {
  const { metrics } = useAnalyticsContext();
  const dailyData = metrics.dailyData || [];

  const maxFocus = Math.max(...dailyData.map((d) => d.focusMinutes), 120);

  return (
    <Card
      title="Focus Time by Day"
      subtitle="Deep work minutes recorded per day"
      action={
        <span className="text-xs font-mono font-semibold text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/25 px-2.5 py-1 rounded-xl">
          {metrics.focusTimeFormatted} Total
        </span>
      }
    >
      <div className="space-y-4">
        {/* Screen reader summary */}
        <div className="sr-only">
          {dailyData.map((d) => (
            <span key={d.dateStr}>
              {d.dayName}: {d.focusMinutes} focus minutes,{' '}
            </span>
          ))}
        </div>

        {dailyData.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 italic">
            No focus session data for the selected range.
          </div>
        ) : (
          <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2">
            {dailyData.map((d) => {
              const heightPercent = Math.max(Math.round((d.focusMinutes / maxFocus) * 100), 6);

              return (
                <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-2 group min-w-[24px]">
                  <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-white transition-colors">
                    {d.focusMinutes}m
                  </span>

                  <div className="w-full max-w-[36px] bg-[#171C27] rounded-xl h-32 flex items-end p-1 border border-white/[0.04]">
                    <div
                      className="w-full bg-gradient-to-t from-[#06B6D4] to-[#67E8F9] rounded-lg group-hover:brightness-125 transition-all duration-500"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                    {d.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
