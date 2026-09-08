import React from 'react';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { Target, CheckSquare, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GoalAnalytics() {
  const { metrics } = useAnalyticsContext();
  const activeGoals = metrics.activeGoals || [];

  return (
    <Card
      title="Strategic Goal Progression"
      subtitle="Milestone velocity and linked task completion status"
      action={
        <Link
          to="/goals"
          className="text-xs font-semibold text-[#7C3AED] hover:text-[#c4b5fd] transition-colors flex items-center gap-1"
        >
          <span>All Goals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      {activeGoals.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 italic">
          No active goals configured.
        </div>
      ) : (
        <div className="space-y-3">
          {activeGoals.map((g) => (
            <div
              key={g.id}
              className="p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.04] space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white truncate">{g.title}</span>
                <span className="font-mono font-bold text-[#22C55E]">{g.progress}%</span>
              </div>

              <div className="w-full h-1.5 bg-[#11151F] rounded-full overflow-hidden border border-white/[0.04]">
                <div
                  className="h-full bg-gradient-to-r from-[#7C3AED] to-[#22C55E] rounded-full transition-all duration-500"
                  style={{ width: `${g.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <CheckSquare className="w-3 h-3 text-[#7C3AED]" />
                  <span>{g.completedTasks} / {g.totalTasks} tasks ({g.remainingTasks} remaining)</span>
                </span>

                {g.targetDate && (
                  <span className="flex items-center gap-1 font-mono text-slate-400">
                    <Calendar className="w-3 h-3 text-[#F59E0B]" />
                    <span>Target: {g.targetDate}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
