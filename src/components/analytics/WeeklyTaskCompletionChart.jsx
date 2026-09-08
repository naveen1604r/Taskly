import React from 'react';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { CheckCircle2, Calendar } from 'lucide-react';

export default function WeeklyTaskCompletionChart() {
  const { metrics } = useAnalyticsContext();

  const dailyData = metrics.dailyData || [];
  const maxTasks = Math.max(1, ...dailyData.map((d) => d.tasksDone));
  const hasCompleted = dailyData.some((d) => d.tasksDone > 0);

  return (
    <Card
      title="Tasks Completed by Day"
      subtitle={`${metrics.tasksCompleted} tasks completed in selected timeframe`}
      className="flex flex-col justify-between"
    >
      {!hasCompleted ? (
        <div className="py-12 text-center text-slate-500 italic text-xs">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-600 stroke-[1.5]" />
          No completed tasks in this period.
        </div>
      ) : (
        <div className="space-y-3">
          {dailyData.map((d) => {
            const widthPercent = Math.min(100, Math.round((d.tasksDone / maxTasks) * 100));

            return (
              <div key={d.date} className="flex items-center gap-3 text-xs">
                {/* Day label */}
                <span className="w-14 text-slate-400 font-medium shrink-0">
                  {d.weekday} {d.shortLabel.split(' ')[1]}
                </span>

                {/* Progress bar */}
                <div className="flex-1 h-3 bg-[#171C27] rounded-full overflow-hidden p-0.5 border border-white/[0.04]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      d.tasksDone > 0 ? 'bg-[#22C55E]' : 'bg-transparent'
                    }`}
                    style={{ width: `${Math.max(d.tasksDone > 0 ? 8 : 0, widthPercent)}%` }}
                  />
                </div>

                {/* Count */}
                <span className="w-6 text-right font-bold text-white shrink-0">
                  {d.tasksDone}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
