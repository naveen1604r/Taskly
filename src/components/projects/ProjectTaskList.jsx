import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTaskContext } from '../../context/TaskContext';
import { useFocusContext } from '../../context/FocusContext';
import { isTaskBlocked, getBlockingTasks } from '../../utils/dependencyUtils';
import { calculateSubtaskProgress } from '../../utils/taskUtils';
import { isTaskOverdue } from '../../utils/filterUtils';
import BlockedCompletionModal from '../tasks/BlockedCompletionModal';
import {
  CheckCircle2,
  Circle,
  Play,
  Lock,
  AlertTriangle,
  Clock,
  ListTodo,
  Plus,
  Trash2,
  ExternalLink,
  Edit,
} from 'lucide-react';
import Button from '../common/Button';

export default function ProjectTaskList({ project }) {
  const navigate = useNavigate();
  const { tasks, toggleTaskStatus, updateTask, openEditModal, openCreateModal } = useTaskContext();
  const { startFocus } = useFocusContext();

  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pending' | 'in_progress' | 'completed' | 'blocked'
  const [blockedTaskAttempt, setBlockedTaskAttempt] = useState(null);

  const projectTasks = useMemo(() => {
    return tasks.filter((t) => t.projectId === project.id);
  }, [tasks, project.id]);

  const filteredTasks = useMemo(() => {
    switch (filterTab) {
      case 'pending':
        return projectTasks.filter((t) => t.status === 'pending' || !t.status);
      case 'in_progress':
        return projectTasks.filter((t) => t.status === 'in_progress');
      case 'completed':
        return projectTasks.filter((t) => t.status === 'completed');
      case 'blocked':
        return projectTasks.filter((t) => isTaskBlocked(t, tasks));
      default:
        return projectTasks;
    }
  }, [projectTasks, filterTab, tasks]);

  const handleTaskToggle = (task) => {
    if (task.status !== 'completed' && isTaskBlocked(task, tasks)) {
      const blockers = getBlockingTasks(task, tasks);
      setBlockedTaskAttempt({ task, blockersCount: blockers.length });
    } else {
      toggleTaskStatus(task.id);
    }
  };

  const handleRemoveFromProject = (taskId) => {
    updateTask(taskId, { projectId: null });
  };

  const handleStartFocus = (taskId) => {
    startFocus(taskId);
    navigate(`/focus?task=${taskId}`);
  };

  const tabs = [
    { id: 'all', label: 'All Tasks', count: projectTasks.length },
    { id: 'pending', label: 'Pending', count: projectTasks.filter((t) => t.status === 'pending' || !t.status).length },
    { id: 'in_progress', label: 'In Progress', count: projectTasks.filter((t) => t.status === 'in_progress').length },
    { id: 'completed', label: 'Completed', count: projectTasks.filter((t) => t.status === 'completed').length },
    { id: 'blocked', label: 'Blocked', count: projectTasks.filter((t) => isTaskBlocked(t, tasks)).length },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Switcher & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-[#11151F] rounded-2xl border border-white/[0.08] overflow-x-auto text-xs">
          {tabs.map((tab) => {
            const isSelected = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#7C3AED] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-white/20' : 'bg-white/[0.06]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => openCreateModal({ projectId: project.id })}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Task
        </Button>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 italic bg-[#11151F]/40 rounded-3xl border border-white/[0.04]">
          No tasks found in this section.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isBlocked = isTaskBlocked(task, tasks);
            const isOverdue = isTaskOverdue(task);
            const subProgress = calculateSubtaskProgress(task);
            const blockingTasks = getBlockingTasks(task, tasks);

            return (
              <div
                key={task.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all text-xs ${
                  isCompleted
                    ? 'bg-[#11151F]/50 border-white/[0.04] opacity-80'
                    : isBlocked
                    ? 'bg-[#11151F] border-[#F59E0B]/30'
                    : 'bg-[#11151F] border-white/[0.08] hover:border-white/[0.16]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => handleTaskToggle(task)}
                    className="text-slate-400 hover:text-white transition-colors shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                    ) : isBlocked ? (
                      <Circle className="w-5 h-5 text-[#F59E0B]" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 hover:text-[#7C3AED]" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/tasks/${task.id}`}
                        className={`font-bold hover:text-[#c4b5fd] transition-colors truncate ${
                          isCompleted ? 'text-slate-400 line-through' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </Link>

                      {isBlocked && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#F59E0B] bg-[#F59E0B]/15 px-2 py-0.2 rounded-md border border-[#F59E0B]/30 shrink-0">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Blocked ({blockingTasks.length})</span>
                        </span>
                      )}

                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#EF4444] bg-[#EF4444]/15 px-2 py-0.2 rounded-md border border-[#EF4444]/30 shrink-0">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Overdue</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="capitalize font-semibold">{task.priority || 'medium'}</span>
                      {task.dueDate && (
                        <>
                          <span>•</span>
                          <span>Due: {task.dueDate}</span>
                        </>
                      )}
                      {subProgress.total > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-[#06B6D4]">
                            {subProgress.completed}/{subProgress.total} subtasks
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => handleStartFocus(task.id)}
                      className="px-2.5 py-1 rounded-xl bg-[#7C3AED]/15 hover:bg-[#7C3AED] text-[#c4b5fd] hover:text-white border border-[#7C3AED]/30 font-semibold transition-colors flex items-center gap-1 text-[11px]"
                      title="Start Focus"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Focus</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => openEditModal(task)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                    title="Edit task"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveFromProject(task.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                    title="Remove from project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Blocked Task Completion Confirmation Modal */}
      {blockedTaskAttempt && (
        <BlockedCompletionModal
          isOpen={true}
          onClose={() => setBlockedTaskAttempt(null)}
          onConfirm={() => toggleTaskStatus(blockedTaskAttempt.task.id)}
          blockingTasksCount={blockedTaskAttempt.blockersCount}
          taskTitle={blockedTaskAttempt.task.title}
        />
      )}
    </div>
  );
}
