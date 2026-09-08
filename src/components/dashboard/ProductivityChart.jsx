import React, { useState, useMemo } from 'react';
import Card from '../common/Card';
import { useTaskContext } from '../../context/TaskContext';
import { useFocusContext } from '../../context/FocusContext';
import { getOffsetDateString } from '../../utils/taskStorage';
import { BarChart3, Clock, CheckCircle2 } from 'lucide-react';

export default function ProductivityChart() {
  const { tasks } = useTaskContext();
  const { sessions = [] } = useFocusContext();
  const [metric, setMetric] = useState('tasks'); // 'tasks' | 'focus'

  // Build 7-day data
  const chartDays = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const dateStr = getOffsetDateString(-i);
      const dateObj = new Date(dateStr);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

      // Completed tasks on dateStr
      const completedTasksCount = tasks.filter((t) => {
        const compDate = t.completedAt ? t.completedAt.split('T')[0] : '';
        return t.status === 'completed' && compDate === dateStr;
      }).length;

      // Focus minutes on dateStr
      const focusMinutes = sessions
        .filter((s) => {
          const sDate = s.startTime ? s.startTime.split('T')[0] : s.date || '';
          return sDate === dateStr;
        })
        .reduce((acc, s) => acc + (Number(s.duration) || Number(s.durationMinutes) || 0), 0);

      days.push({
        dateStr,
        dayName,
        tasks: completedTasksCount,
        focus: focusMinutes,
      });
    }
    return days;
  }, [tasks, sessions]);

  const maxTasks = Math.max(...chartDays.map((d) => d.tasks), 5);
  const maxFocus = Math.max(...chartDays.map((d) => d.focus), 60);

  return (
    <Card
      title="Productivity Trend"
      subtitle="Last 7 days performance comparison"
      action={
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#171C27] border border-white/[0.08] text-xs">
          <button
            type="button"
            onClick={() => setMetric('tasks')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              metric === 'tasks'
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Tasks</span>
          </button>
          <button
            type="button"
            onClick={() => setMetric('focus')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              metric === 'focus'
                ? 'bg-[#06B6D4] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Focus</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Screen Reader Accessible Summary */}
        <div className="sr-only">
          {chartDays.map((d) => (
            <span key={d.dateStr}>
              {d.dayName}: {metric === 'tasks' ? `${d.tasks} tasks` : `${d.focus} minutes focus`},{' '}
            </span>
          ))}
        </div>

        {/* Bar Chart Visualization */}
        <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2">
          {chartDays.map((d) => {
            const val = metric === 'tasks' ? d.tasks : d.focus;
            const maxVal = metric === 'tasks' ? maxTasks : maxFocus;
            const heightPercent = val > 0 ? Math.max(Math.round((val / maxVal) * 100), 8) : 0;

            return (
              <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-white transition-colors">
                  {metric === 'tasks' ? val : `${val}m`}
                </span>

                <div className="w-full max-w-[36px] bg-[#171C27] rounded-xl h-28 flex items-end p-1 border border-white/[0.04]">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      metric === 'tasks'
                        ? 'bg-gradient-to-t from-[#7C3AED] to-[#A78BFA] group-hover:brightness-125'
                        : 'bg-gradient-to-t from-[#06B6D4] to-[#67E8F9] group-hover:brightness-125'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {d.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
