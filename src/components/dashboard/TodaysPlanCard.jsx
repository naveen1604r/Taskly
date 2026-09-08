import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { useTaskContext } from '../../context/TaskContext';
import { getTasksForDate, formatTimeDisplay } from '../../utils/plannerUtils';
import { getTodayDateString } from '../../utils/taskStorage';
import { CalendarRange, ArrowRight, CheckCircle2, Circle, Clock } from 'lucide-react';

export default function TodaysPlanCard() {
  const { tasks, toggleTaskStatus } = useTaskContext();
  const todayStr = getTodayDateString();

  const dayTasks = getTasksForDate(tasks, todayStr);
  const total = dayTasks.length;
  const completed = dayTasks.filter((t) => t.status === 'completed').length;
  const remaining = total - completed;

  return (
    <Card
      title="Today's Plan"
      subtitle="Time-blocked daily schedule"
      action={
        <Link
          to="/planner"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#06B6D4] hover:text-cyan-300 transition-colors"
        >
          <span>View Planner</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
      className="flex flex-col justify-between"
    >
      {dayTasks.length === 0 ? (
        <div className="py-6 text-center text-slate-500 italic text-xs">
          <CalendarRange className="w-6 h-6 mx-auto mb-1.5 text-slate-600 stroke-[1.5]" />
          No tasks planned for today.
          <div className="mt-2">
            <Link
              to="/planner"
              className="text-xs font-semibold text-[#7C3AED] hover:underline"
            >
              + Plan your day
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
            {dayTasks.slice(0, 4).map((task) => {
              const isDone = task.status === 'completed';
              const time = task.plannedStartTime || task.dueTime;

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-[#171C27] border border-white/[0.04]"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleTaskStatus(task.id)}
                      className="text-slate-400 hover:text-white transition-colors shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#94A3B8]" />
                      )}
                    </button>
                    <span
                      className={`text-xs font-medium truncate ${
                        isDone ? 'text-slate-400 line-through' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  {time && (
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {formatTimeDisplay(time)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs text-slate-400">
            <span>
              <strong className="text-white">{remaining}</strong> {remaining === 1 ? 'task' : 'tasks'} remaining
            </span>
            <Link
              to="/planner"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Manage schedule →
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}
