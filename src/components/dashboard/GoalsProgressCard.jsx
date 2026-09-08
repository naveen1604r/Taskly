import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { useGoalsContext } from '../../context/GoalsContext';
import { Target, ArrowRight, TrendingUp } from 'lucide-react';

export default function GoalsProgressCard() {
  const { stats, openViewGoal } = useGoalsContext();

  const topActiveGoals = (stats.activeGoals || []).slice(0, 3);

  return (
    <Card
      title="Goals Progress"
      subtitle={`${stats.activeGoalsCount} active goals • ${stats.averageProgress}% avg progress`}
      action={
        <Link
          to="/goals"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] hover:text-[#c4b5fd] transition-colors"
        >
          <span>View all goals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
      className="flex flex-col justify-between"
    >
      {topActiveGoals.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <Target className="w-8 h-8 text-slate-500 mb-2" />
          <p className="text-sm font-semibold text-white">No active goals</p>
          <p className="text-xs text-[#94A3B8] mt-0.5 mb-3">Set objectives and monitor milestone velocity.</p>
          <Link
            to="/goals"
            className="text-xs font-semibold text-[#06B6D4] hover:underline"
          >
            Create first goal →
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {topActiveGoals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => openViewGoal(goal)}
              className="p-3 rounded-xl bg-[#171C27] border border-white/[0.06] hover:border-white/[0.14] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-white group-hover:text-[#c4b5fd] transition-colors truncate max-w-[200px]">
                  {goal.title}
                </span>
                <span className="text-[#06B6D4] font-bold shrink-0">{goal.progress}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-[#11151F] rounded-full overflow-hidden p-0.5 border border-white/[0.04]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] transition-all duration-500 shadow-[0_0_6px_rgba(124,58,237,0.4)]"
                  style={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }}
                />
              </div>
            </div>
          ))}

          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Overall: <strong className="text-white">{stats.averageProgress}%</strong> completed</span>
            </span>
            <Link
              to="/goals"
              className="text-[#06B6D4] hover:underline font-semibold"
            >
              Track goals →
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}
