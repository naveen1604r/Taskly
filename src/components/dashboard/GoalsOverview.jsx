import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { useGoalsContext } from '../../context/GoalsContext';
import { Target, ArrowRight, Calendar, CheckSquare, Plus } from 'lucide-react';

export default function GoalsOverview() {
  const navigate = useNavigate();
  const { goals, openCreateModal } = useGoalsContext();

  const activeGoals = goals.slice(0, 4);

  return (
    <Card
      title="Goals Overview"
      subtitle="Strategic milestones and project completion"
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
        <div className="py-8 text-center border border-dashed border-white/[0.08] rounded-2xl">
          <Target className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">No active goals found</p>
          <p className="text-xs text-slate-400 mt-0.5 mb-3">Set strategic goals to align your daily tasks.</p>
          <Button variant="secondary" size="sm" onClick={openCreateModal || (() => navigate('/goals'))} icon={<Plus className="w-3.5 h-3.5" />}>
            Create Goal
          </Button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {activeGoals.map((goal) => {
            const progress = Number(goal.progress) || 0;
            const completedCount = Number(goal.completedTasksCount) || 0;
            const totalTasks = Number(goal.totalTasksCount) || 0;

            return (
              <div
                key={goal.id}
                className="p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.06] hover:border-white/[0.14] transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white truncate">
                    {goal.title}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#22C55E]">
                    {progress}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-[#11151F] rounded-full overflow-hidden border border-white/[0.04]">
                  <div
                    className="h-full bg-gradient-to-r from-[#7C3AED] to-[#22C55E] rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-3 h-3 text-[#7C3AED]" />
                    <span>Tasks: {completedCount} / {totalTasks}</span>
                  </span>

                  {goal.targetDate && (
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-[#F59E0B]" />
                      <span>{goal.targetDate}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
