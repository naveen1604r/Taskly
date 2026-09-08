import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { useFocusContext } from '../../context/FocusContext';
import { formatDurationMinutes, formatFocusTime } from '../../utils/focusUtils';
import { Flame, ArrowRight, Play, CheckCircle2, Pause } from 'lucide-react';

export default function FocusSummaryCard() {
  const {
    todayFocusMinutes,
    focusSettings,
    focusSessions,
    timerStatus,
    remainingSeconds,
    selectedTask,
  } = useFocusContext();

  const goal = focusSettings.dailyFocusGoal || 120;
  const percentage = Math.min(100, Math.round((todayFocusMinutes / goal) * 100));
  const isReached = todayFocusMinutes >= goal;
  const isPaused = timerStatus === 'paused';

  const todaySessionsCount = focusSessions.filter((s) => s.sessionType === 'focus' && s.completed).length;

  return (
    <Card
      title="Focus Today"
      subtitle={`${formatDurationMinutes(todayFocusMinutes)} focused • ${todaySessionsCount} sessions`}
      action={
        <Link
          to="/focus"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] hover:text-[#c4b5fd] transition-colors"
        >
          <span>Open Focus</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
      className="flex flex-col justify-between border-white/[0.08]"
    >
      <div className="space-y-3.5">
        {/* Paused Session Quick Prompt */}
        {isPaused && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-2 text-xs">
            <div className="min-w-0">
              <span className="text-amber-400 font-bold block truncate">
                Paused: {selectedTask?.title || 'Active Session'}
              </span>
              <span className="text-slate-400 text-[11px] font-mono">
                {formatFocusTime(remainingSeconds)} remaining
              </span>
            </div>
            <Link
              to="/focus"
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors shrink-0 flex items-center gap-1"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Resume</span>
            </Link>
          </div>
        )}

        {/* Goal Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">
              Daily Target ({goal}m)
            </span>
            <span
              className={`font-bold font-mono ${
                isReached ? 'text-[#22C55E]' : 'text-[#7C3AED]'
              }`}
            >
              {percentage}%
            </span>
          </div>

          <div className="w-full h-2 bg-[#171C27] rounded-full overflow-hidden p-0.5 border border-white/[0.04]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isReached
                  ? 'bg-[#22C55E]'
                  : 'bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Bottom Metrics */}
        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Current Focus: <strong className="text-white">{formatDurationMinutes(todayFocusMinutes)}</strong>
          </span>
          <Link
            to="/focus"
            className="text-xs font-semibold text-[#7C3AED] hover:underline flex items-center gap-1"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Start Session</span>
          </Link>
        </div>
      </div>
    </Card>
  );
}
