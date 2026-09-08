import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { useTaskContext } from '../../context/TaskContext';
import { getOverdueTasks } from '../../utils/dashboardUtils';
import { getTodayDateString } from '../../utils/taskStorage';
import {
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const priorityColors = {
  high: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/25',
  medium: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25',
  low: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/25',
};

export default function OverdueTasks() {
  const navigate = useNavigate();
  const { tasks, toggleTaskStatus, updateTask, openEditModal } = useTaskContext();

  const overdueList = getOverdueTasks(tasks);

  const handleRescheduleToToday = (taskId, e) => {
    e.stopPropagation();
    const todayStr = getTodayDateString();
    updateTask(taskId, {
      dueDate: todayStr,
      plannedDate: todayStr,
    });
  };

  return (
    <Card
      title="Overdue Tasks"
      subtitle="Deliverables that have passed their target deadline"
      action={
        overdueList.length > 0 ? (
          <span className="text-xs font-bold text-[#EF4444] bg-[#EF4444]/15 px-2.5 py-1 rounded-xl border border-[#EF4444]/30">
            {overdueList.length} Overdue
          </span>
        ) : null
      }
    >
      {overdueList.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-[#22C55E]/20 bg-[#22C55E]/5 rounded-2xl">
          <Sparkles className="w-8 h-8 text-[#22C55E] mx-auto mb-2" />
          <p className="text-sm font-bold text-white">You're all caught up 🎉</p>
          <p className="text-xs text-slate-400 mt-0.5">Zero overdue deliverables in your queue.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {overdueList.map((task) => {
            const priorityClass = priorityColors[task.priority] || priorityColors.medium;

            return (
              <div
                key={task.id}
                className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-[#171C27] hover:bg-[#1f2635] border border-[#EF4444]/20 hover:border-[#EF4444]/40 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/tasks/${task.id}`}
                    className="text-xs sm:text-sm font-bold text-white hover:text-[#c4b5fd] transition-colors truncate block"
                  >
                    {task.title}
                  </Link>

                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span
                      className={`px-1.5 py-0.2 rounded-md font-semibold text-[10px] uppercase border ${priorityClass}`}
                    >
                      {task.priority}
                    </span>

                    <span className="text-[#EF4444] font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{task.overdueText}</span>
                    </span>

                    <span className="text-slate-500 font-mono">({task.dueDate})</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleRescheduleToToday(task.id, e)}
                    className="px-2 py-1 rounded-lg text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-colors"
                    title="Reschedule to Today"
                  >
                    Today
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleTaskStatus(task.id)}
                    className="p-1.5 rounded-lg bg-[#22C55E]/15 hover:bg-[#22C55E] text-[#22C55E] hover:text-white transition-colors"
                    title="Mark as completed"
                    aria-label={`Complete ${task.title}`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
