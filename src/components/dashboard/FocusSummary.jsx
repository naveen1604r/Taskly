import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { useFocusContext } from '../../context/FocusContext';
import { Clock, Flame, Play, Target, CheckCircle2 } from 'lucide-react';

export default function FocusSummary() {
  const navigate = useNavigate();
  const {
    dailyStats,
    totalFocusTimeToday,
    dailyFocusGoalMinutes = 120,
    streak = 4,
    currentSession,
  } = useFocusContext();

  const totalMinutes = Math.round((totalFocusTimeToday || dailyStats?.totalDuration || 0) / 60);
  const goalMinutes = dailyFocusGoalMinutes || 120;
  const progressPercent = Math.min(Math.round((totalMinutes / goalMinutes) * 100), 100);

  const totalH = Math.floor(totalMinutes / 60);
  const totalM = totalMinutes % 60;
  const goalH = Math.floor(goalMinutes / 60);
  const goalM = goalMinutes % 60;

  const formattedTotal = totalH > 0 ? `${totalH}h ${totalM}m` : `${totalM}m`;
  const formattedGoal = goalH > 0 ? (goalM > 0 ? `${goalH}h ${goalM}m` : `${goalH}h`) : `${goalM}m`;

  const sessionsCount = dailyStats?.sessionsCount || 0;

  return (
    <Card
      title="Focus Today"
      subtitle="Pomodoro deep work & goal tracking"
      action={
        <div className="flex items-center gap-1 text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-xl border border-[#F59E0B]/20">
          <Flame className="w-3.5 h-3.5 fill-current" />
          <span>{streak} day streak</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Main Stat & Target */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {formattedTotal}
            </span>
            <span className="text-xs text-slate-400 font-medium ml-1.5 font-mono">
              / {formattedGoal} target
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-0.5 rounded-lg border border-[#06B6D4]/20">
            {progressPercent}% Met
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#22C55E] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Bottom stats & Launch Button */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>{sessionsCount} completed {sessionsCount === 1 ? 'session' : 'sessions'}</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/focus')}
            icon={<Play className="w-3 h-3 fill-current text-[#7C3AED]" />}
          >
            {currentSession ? 'Resume Focus' : 'Continue Focus'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
