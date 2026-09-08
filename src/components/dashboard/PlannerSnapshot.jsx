import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { useTaskContext } from '../../context/TaskContext';
import { usePlannerContext } from '../../context/PlannerContext';
import { getTodayDateString } from '../../utils/taskStorage';
import { getTasksForDate } from '../../utils/plannerUtils';
import { Calendar, Clock, ArrowRight, CheckCircle2, Circle } from 'lucide-react';

export default function PlannerSnapshot() {
  const navigate = useNavigate();
  const { tasks } = useTaskContext();
  const { selectedDate } = usePlannerContext();

  const todayStr = getTodayDateString();
  const plannedTasks = getTasksForDate(tasks, selectedDate || todayStr);

  return (
    <Card
      title="Planner Snapshot"
      subtitle="Today's chronological timeline commitments"
      action={
        <Link
          to="/planner"
          className="text-xs font-semibold text-[#7C3AED] hover:text-[#c4b5fd] transition-colors flex items-center gap-1"
        >
          <span>Open Planner</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      {plannedTasks.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs italic">
          No tasks time-blocked for today. Open the planner to schedule your hours.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {plannedTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const timeLabel = task.plannedStartTime || task.dueTime || 'All Day';

            return (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#171C27] hover:bg-[#1f2635] border border-white/[0.06] transition-all text-xs"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-0.5 rounded-md border border-[#06B6D4]/20 shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{timeLabel}</span>
                  </div>

                  <Link
                    to={`/tasks/${task.id}`}
                    className={`font-semibold hover:text-[#c4b5fd] transition-colors truncate ${
                      isCompleted ? 'text-slate-400 line-through' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </Link>
                </div>

                <span className="capitalize text-[10px] text-slate-400 shrink-0 font-medium">
                  {task.priority}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
