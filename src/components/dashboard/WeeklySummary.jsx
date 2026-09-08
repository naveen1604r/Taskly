import React from 'react';
import Card from '../common/Card';
import { useTaskContext } from '../../context/TaskContext';
import { useFocusContext } from '../../context/FocusContext';
import { useGoalsContext } from '../../context/GoalsContext';
import { getWeeklySummary } from '../../utils/dashboardUtils';
import { CheckCircle2, Clock, Flame, ListTodo, Target, Layers } from 'lucide-react';

export default function WeeklySummary() {
  const { tasks } = useTaskContext();
  const { sessions = [] } = useFocusContext();
  const { goals = [] } = useGoalsContext();

  const summary = getWeeklySummary({ tasks, focusSessions: sessions, goals });

  const metrics = [
    {
      id: 'tasks',
      label: 'Tasks Completed',
      value: summary.tasksCompletedCount,
      icon: CheckCircle2,
      color: 'text-[#22C55E]',
      bg: 'bg-[#22C55E]/10 border-[#22C55E]/20',
    },
    {
      id: 'focus',
      label: 'Focus Time',
      value: summary.focusTimeFormatted,
      icon: Clock,
      color: 'text-[#06B6D4]',
      bg: 'bg-[#06B6D4]/10 border-[#06B6D4]/20',
    },
    {
      id: 'sessions',
      label: 'Focus Sessions',
      value: summary.focusSessionsCount,
      icon: Flame,
      color: 'text-[#F59E0B]',
      bg: 'bg-[#F59E0B]/10 border-[#F59E0B]/20',
    },
    {
      id: 'subtasks',
      label: 'Subtasks Finished',
      value: summary.subtasksCompletedCount,
      icon: ListTodo,
      color: 'text-[#7C3AED]',
      bg: 'bg-[#7C3AED]/10 border-[#7C3AED]/20',
    },
  ];

  return (
    <Card
      title="This Week"
      subtitle="Cumulative milestones achieved this current week"
      action={<Layers className="w-4 h-4 text-[#7C3AED]" />}
    >
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              className="p-3 sm:p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.06] hover:border-white/[0.14] transition-all flex items-center gap-3"
            >
              <div className={`p-2 rounded-xl border shrink-0 ${m.bg} ${m.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-base sm:text-lg font-bold text-white font-mono block">
                  {m.value}
                </span>
                <span className="text-[11px] text-slate-400 font-medium truncate block">
                  {m.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
