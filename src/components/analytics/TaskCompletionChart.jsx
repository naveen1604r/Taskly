import React from 'react';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { BarChart3, LineChart, CheckCircle2 } from 'lucide-react';

export default function TaskCompletionChart() {
  const { metrics, chartType, setChartType } = useAnalyticsContext();
  const dailyData = metrics.dailyData || [];

  const maxTasks = Math.max(...dailyData.map((d) => d.completedTasks), 5);

  return (
    <Card
      title="Task Completion Velocity"
      subtitle="Deliverables completed across the selected timeframe"
      action={
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#171C27] border border-white/[0.08] text-xs">
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-lg transition-all ${
              chartType === 'bar' ? 'bg-[#7C3AED] text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Bar chart view"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setChartType('line')}
            className={`p-1.5 rounded-lg transition-all ${
              chartType === 'line' ? 'bg-[#7C3AED] text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Line chart view"
          >
            <LineChart className="w-3.5 h-3.5" />
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Screen Reader Accessible Summary */}
        <div className="sr-only">
          {dailyData.map((d) => (
            <span key={d.dateStr}>
              {d.dayName} ({d.dateStr}): {d.completedTasks} completed tasks,{' '}
            </span>
          ))}
        </div>

        {dailyData.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 italic">
            No task completion data for the selected range.
          </div>
        ) : chartType === 'bar' ? (
          /* Bar Chart Visualization */
          <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2">
            {dailyData.map((d) => {
              const heightPercent = Math.max(Math.round((d.completedTasks / maxTasks) * 100), 6);

              return (
                <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-2 group min-w-[24px]">
                  <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-white transition-colors">
                    {d.completedTasks}
                  </span>

                  <div className="w-full max-w-[36px] bg-[#171C27] rounded-xl h-32 flex items-end p-1 border border-white/[0.04]">
                    <div
                      className="w-full bg-gradient-to-t from-[#7C3AED] to-[#A78BFA] rounded-lg group-hover:brightness-125 transition-all duration-500"
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
        ) : (
          /* Line / Step Area Visualization */
          <div className="h-48 flex flex-col justify-end pt-4 px-2">
            <div className="relative h-32 w-full flex items-end border-b border-white/[0.08] pb-1">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* SVG Area path */}
                {dailyData.length > 1 && (
                  <>
                    <polyline
                      fill="none"
                      stroke="#7C3AED"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={dailyData
                        .map((d, i) => {
                          const x = (i / (dailyData.length - 1)) * 100;
                          const y = 100 - (d.completedTasks / maxTasks) * 90;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />
                  </>
                )}
              </svg>
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-semibold uppercase mt-2 px-1">
              {dailyData.map((d) => (
                <span key={d.dateStr}>{d.dayName}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
