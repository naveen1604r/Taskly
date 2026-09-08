import React from 'react';
import Card from '../common/Card';
import { useTaskContext } from '../../context/TaskContext';
import { useFocusContext } from '../../context/FocusContext';
import { useGoalsContext } from '../../context/GoalsContext';
import { calculateProductivityScore, getOverdueTasks } from '../../utils/dashboardUtils';
import { Award, Zap, CheckCircle, Clock, Target, AlertTriangle } from 'lucide-react';

export default function ProductivityScore() {
  const { tasks } = useTaskContext();
  const { dailyStats, totalFocusTimeToday, dailyFocusGoalMinutes } = useFocusContext();
  const { goals } = useGoalsContext();

  const todayFocusMinutes = Math.round((totalFocusTimeToday || dailyStats?.totalDuration || 0) / 60);
  const overdueTasks = getOverdueTasks(tasks);
  const todayTasks = tasks.filter((t) => t.dueDate === new Date().toISOString().split('T')[0]);

  const { score, status, color, breakdown } = calculateProductivityScore({
    todayTasks,
    overdueTasks,
    todayFocusMinutes,
    dailyFocusGoalMinutes: dailyFocusGoalMinutes || 120,
    goals,
  });

  return (
    <Card
      title="Productivity Score"
      subtitle="Calculated daily performance & efficiency score"
      action={
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${color} uppercase tracking-wider`}
        >
          {status}
        </span>
      }
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Big Score Circular Display */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-28 h-28 transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="46"
              className="text-white/[0.06]"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="56"
              cy="56"
              r="46"
              className="text-[#7C3AED] transition-all duration-1000 ease-out"
              strokeWidth="8"
              strokeDasharray={289}
              strokeDashoffset={289 - (289 * score) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white font-mono tracking-tight">
              {score}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">out of 100</span>
          </div>
        </div>

        {/* Score Breakdown Bars */}
        <div className="flex-1 w-full space-y-2.5 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 font-medium mb-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Task Execution</span>
              </span>
              <span className="font-mono">{breakdown.taskPoints} / 35 pts</span>
            </div>
            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#22C55E] rounded-full"
                style={{ width: `${(breakdown.taskPoints / 35) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-medium mb-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Focus Duration</span>
              </span>
              <span className="font-mono">{breakdown.focusPoints} / 25 pts</span>
            </div>
            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#06B6D4] rounded-full"
                style={{ width: `${(breakdown.focusPoints / 25) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-medium mb-1">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Goal Momentum</span>
              </span>
              <span className="font-mono">{breakdown.goalPoints} / 20 pts</span>
            </div>
            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7C3AED] rounded-full"
                style={{ width: `${(breakdown.goalPoints / 20) * 100}%` }}
              />
            </div>
          </div>

          {breakdown.overduePenalty > 0 && (
            <div className="pt-1 flex items-center justify-between text-[11px] text-[#EF4444] font-medium border-t border-white/[0.06]">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Overdue Task Penalty</span>
              </span>
              <span className="font-mono">-{breakdown.overduePenalty} pts</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
