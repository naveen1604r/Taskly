import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { useTaskContext } from '../../context/TaskContext';
import { calculateSubtaskProgress } from '../../utils/taskUtils';
import { Clock, CheckCircle2, Circle, Plus, ListTodo } from 'lucide-react';

const priorityStyles = {
  high: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20',
  medium: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20',
  low: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/20',
};

export default function ScheduleCard() {
  const { stats, toggleTaskStatus, openCreateModal } = useTaskContext();
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('time');

  // Filter and sort today's tasks
  const scheduleTasks = React.useMemo(() => {
    let list = [...stats.todayTasksList];

    if (statusFilter !== 'all') {
      list = list.filter((t) => t.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((t) => t.title?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      if (sortBy === 'priority') {
        const pWeights = { high: 3, medium: 2, low: 1 };
        return (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
      }
      if (sortBy === 'duration') {
        return (Number(b.duration) || 0) - (Number(a.duration) || 0);
      }
      // default: 'time'
      const timeA = a.dueTime || '99:99';
      const timeB = b.dueTime || '99:99';
      return timeA.localeCompare(timeB);
    });

    return list;
  }, [stats.todayTasksList, search, statusFilter, sortBy]);

  return (
    <Card
      title="Today's Schedule"
      subtitle="Structured timeline for today's commitments"
      action={
        <span className="text-xs font-semibold text-[#94A3B8] bg-[#171C27] px-2.5 py-1 rounded-lg border border-white/[0.08]">
          {scheduleTasks.length} {scheduleTasks.length === 1 ? 'Event' : 'Events'}
        </span>
      }
    >
      {/* Search & Mini Filter Controls (Requirement 30) */}
      <div className="flex items-center gap-2 mb-3 text-xs">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter today's tasks..."
          className="flex-1 bg-[#171C27] border border-white/[0.08] focus:border-[#7C3AED] rounded-lg px-2.5 py-1 text-white placeholder-slate-500 focus:outline-none text-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#171C27] border border-white/[0.08] text-slate-300 rounded-lg px-2 py-1 focus:outline-none text-xs"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-[#171C27] border border-white/[0.08] text-slate-300 rounded-lg px-2 py-1 focus:outline-none text-xs"
        >
          <option value="time">Time</option>
          <option value="priority">Priority</option>
          <option value="duration">Duration</option>
        </select>
      </div>

      {scheduleTasks.length === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/[0.06] rounded-xl">
          <Clock className="w-8 h-8 text-slate-500 mb-2" />
          <p className="text-sm font-semibold text-white">No tasks scheduled for today</p>
          <p className="text-xs text-[#94A3B8] mt-0.5 mb-3">Add a task with today's date to build your schedule.</p>
          <Button variant="secondary" size="sm" onClick={openCreateModal} icon={<Plus className="w-3.5 h-3.5" />}>
            Schedule Task
          </Button>
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {scheduleTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const priorityKey = task.priority || 'medium';
            const subProgress = calculateSubtaskProgress(task);

            // Format time display
            let timeFormatted = 'No time set';
            if (task.dueTime) {
              const [h, m] = task.dueTime.split(':');
              const hour = parseInt(h, 10);
              const ampm = hour >= 12 ? 'PM' : 'AM';
              const formattedHour = hour % 12 || 12;
              timeFormatted = `${formattedHour}:${m} ${ampm}`;
            }

            return (
              <div
                key={task.id}
                className={`
                  group flex items-center justify-between p-3 sm:p-3.5 rounded-xl border transition-all duration-200
                  ${isCompleted
                    ? 'bg-[#171C27]/40 border-white/[0.04] opacity-80'
                    : 'bg-[#171C27] border-white/[0.08] hover:border-white/[0.18]'
                  }
                `}
              >
                {/* Left: Status Checkbox & Task Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleTaskStatus(task.id)}
                    className="shrink-0 text-slate-400 hover:text-white transition-colors focus:outline-none"
                    aria-label={isCompleted ? 'Mark pending' : 'Mark complete'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#94A3B8] group-hover:text-white" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/tasks/${task.id}`}
                      className={`text-sm font-semibold truncate hover:text-[#c4b5fd] transition-colors block ${
                        isCompleted ? 'text-slate-400 line-through' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-[#94A3B8]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{timeFormatted}</span>
                      </span>
                      {task.category && (
                        <span className="hidden xs:inline text-[11px] text-slate-400 border-l border-white/[0.1] pl-2">
                          {task.category}
                        </span>
                      )}
                    </div>

                    {/* Subtask progress card indicator (Requirement 26) */}
                    {subProgress.total > 0 && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="w-16 sm:w-20 h-1 bg-[#11151F] rounded-full overflow-hidden border border-white/[0.06]">
                          <div
                            className={`h-full rounded-full ${
                              subProgress.isAllCompleted ? 'bg-[#22C55E]' : 'bg-[#7C3AED]'
                            }`}
                            style={{ width: `${subProgress.percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {subProgress.completed}/{subProgress.total} completed ({subProgress.percentage}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Priority Indicator */}
                <div className="shrink-0 ml-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                      priorityStyles[priorityKey] || priorityStyles.medium
                    }`}
                  >
                    {task.priority ? `${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority` : 'Medium Priority'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
