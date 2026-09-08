import React from 'react';
import { useFocusContext } from '../../context/FocusContext';
import {
  formatDurationMinutes,
  calculateAverageSessionDuration,
  getSessionsForDate,
} from '../../utils/focusUtils';
import { getTodayDateString } from '../../utils/taskStorage';
import { Clock, CheckCircle2, Flame, BarChart2, Layers } from 'lucide-react';

export default function FocusSummary() {
  const { focusSessions, todayFocusMinutes, focusStreak } = useFocusContext();
  const todayStr = getTodayDateString();

  const todaySessions = getSessionsForDate(focusSessions, todayStr);
  const completedSessionsCount = todaySessions.filter(
    (s) => s.sessionType === 'focus' && s.completed
  ).length;

  const uniqueTasksCount = new Set(
    todaySessions.filter((s) => s.sessionType === 'focus' && s.taskId).map((s) => s.taskId)
  ).size;

  const avgSession = calculateAverageSessionDuration(focusSessions);

  const cards = [
    {
      label: "Today's Focus Time",
      value: formatDurationMinutes(todayFocusMinutes),
      sub: `${completedSessionsCount} sessions completed`,
      icon: Clock,
      color: 'text-[#7C3AED] bg-[#7C3AED]/10 border-[#7C3AED]/20',
    },
    {
      label: 'Completed Sessions',
      value: String(completedSessionsCount),
      sub: `${todaySessions.length} total blocks today`,
      icon: CheckCircle2,
      color: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20',
    },
    {
      label: 'Tasks Worked On',
      value: String(uniqueTasksCount),
      sub: uniqueTasksCount === 1 ? '1 deliverable' : `${uniqueTasksCount} deliverables`,
      icon: Layers,
      color: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/20',
    },
    {
      label: 'Current Streak',
      value: `${focusStreak} ${focusStreak === 1 ? 'Day' : 'Days'}`,
      sub: 'Consecutive active focus',
      icon: Flame,
      color: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20',
    },
    {
      label: 'Average Session',
      value: `${avgSession} min`,
      sub: 'Per focus block',
      icon: BarChart2,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="p-3.5 rounded-2xl bg-[#11151F] border border-white/[0.06] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {c.label}
              </span>
              <div className={`p-1.5 rounded-lg border ${c.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="text-lg sm:text-xl font-bold text-white font-mono">{c.value}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{c.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
