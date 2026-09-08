import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { useTaskContext } from '../../context/TaskContext';
import { useFocusContext } from '../../context/FocusContext';
import { getTodayPriorities } from '../../utils/dashboardUtils';
import { calculateSubtaskProgress } from '../../utils/taskUtils';
import {
  Flame,
  CheckCircle2,
  Circle,
  Play,
  Clock,
  ListTodo,
  ArrowRight,
  Plus,
} from 'lucide-react';

const priorityColors = {
  high: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/25',
  medium: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25',
  low: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/25',
};

export default function TodaysPriorities() {
  const navigate = useNavigate();
  const { tasks, toggleTaskStatus, openCreateModal } = useTaskContext();
  const { startFocus } = useFocusContext();

  const priorities = getTodayPriorities(tasks, 5);

  const handleStartFocus = (taskId, e) => {
    e.stopPropagation();
    startFocus(taskId);
    navigate(`/focus?task=${taskId}`);
  };

  return (
    <Card
      title="Today's Priorities"
      subtitle="High-impact tasks scheduled for execution"
      action={
        <Link
          to="/tasks"
          className="text-xs font-semibold text-[#7C3AED] hover:text-[#c4b5fd] transition-colors flex items-center gap-1"
        >
          <span>View all tasks</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      {priorities.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-white/[0.08] rounded-2xl">
          <Flame className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">No high-priority tasks pending</p>
          <p className="text-xs text-slate-400 mt-0.5 mb-3">All top priority deliverables are completed.</p>
          <Button variant="secondary" size="sm" onClick={openCreateModal} icon={<Plus className="w-3.5 h-3.5" />}>
            Create Priority Task
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {priorities.map((task) => {
            const isCompleted = task.status === 'completed';
            const subProgress = calculateSubtaskProgress(task);
            const priorityClass = priorityColors[task.priority] || priorityColors.medium;
            const estimated = Number(task.estimatedDuration || task.duration) || 30;

            return (
              <div
                key={task.id}
                className="group flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-[#171C27] hover:bg-[#1f2635] border border-white/[0.06] hover:border-[#7C3AED]/40 transition-all"
              >
                {/* Left: Checkbox & Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleTaskStatus(task.id)}
                    className="shrink-0 text-slate-400 hover:text-white transition-colors focus:outline-none"
                    aria-label={`Mark task ${task.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 hover:text-[#7C3AED]" />
                    )}
                  </button>

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

                      {task.dueTime && (
                        <span>Due {task.dueTime}</span>
                      )}

                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-[#06B6D4]" />
                        <span>{estimated}m</span>
                      </span>

                      {subProgress.total > 0 && (
                        <span className="flex items-center gap-1 text-[#06B6D4] font-medium border-l border-white/[0.08] pl-2">
                          <ListTodo className="w-3 h-3" />
                          <span>
                            {subProgress.completed}/{subProgress.total} subtasks
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Start Focus Button */}
                <button
                  type="button"
                  onClick={(e) => handleStartFocus(task.id, e)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#7C3AED]/15 hover:bg-[#7C3AED] text-[#c4b5fd] hover:text-white border border-[#7C3AED]/30 transition-all flex items-center gap-1.5 text-xs font-semibold shrink-0 shadow-xs"
                  title="Start Pomodoro focus on this task"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Focus</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
