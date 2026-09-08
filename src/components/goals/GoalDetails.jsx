import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import MilestoneList from './MilestoneList';
import { useGoalsContext } from '../../context/GoalsContext';
import { useTaskContext } from '../../context/TaskContext';
import { useHabitContext } from '../../context/HabitContext';
import { getGoalDeadlineInfo } from '../../utils/goalUtils';
import {
  Target,
  Calendar,
  Clock,
  ListTodo,
  CheckCircle2,
  Edit2,
  Archive,
  ArchiveRestore,
  Trash2,
  Link2,
  Plus,
  History,
  Flame,
} from 'lucide-react';

export default function GoalDetails() {
  const {
    viewingGoal,
    closeViewGoal,
    openEditGoalModal,
    openDeleteGoalModal,
    openLinkTaskModal,
    completeGoal,
    archiveGoal,
    restoreGoal,
    updateGoalProgress,
  } = useGoalsContext();

  const { tasks, toggleTaskStatus } = useTaskContext();

  const [activeSection, setActiveSection] = useState('overview'); // 'overview' | 'milestones' | 'tasks' | 'activity'

  if (!viewingGoal) return null;

  const deadline = getGoalDeadlineInfo(viewingGoal.targetDate, viewingGoal.status);
  const isCompleted = viewingGoal.status === 'completed';
  const isArchived = viewingGoal.status === 'archived';

  const { habits = [] } = useHabitContext() || {};

  // Find linked tasks from TaskContext
  const linkedTasks = tasks.filter((t) => (viewingGoal.relatedTaskIds || []).includes(t.id));
  const completedTaskCount = linkedTasks.filter((t) => t.status === 'completed').length;
  const linkedHabits = habits.filter((h) => h.goalId === viewingGoal.id && !h.archived);

  return (
    <Modal
      isOpen={Boolean(viewingGoal)}
      onClose={closeViewGoal}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Header Title & Tags */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold text-[#06B6D4] bg-[#06B6D4]/15 border border-[#06B6D4]/30">
              {viewingGoal.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold text-white bg-slate-800 border border-white/[0.08] uppercase">
              {viewingGoal.priority} Priority
            </span>
            {isCompleted && (
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold text-[#22C55E] bg-[#22C55E]/15 border border-[#22C55E]/30">
                Completed
              </span>
            )}
            {isArchived && (
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold text-slate-400 bg-slate-800">
                Archived
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
            {viewingGoal.title}
          </h2>

          {viewingGoal.description && (
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-2 leading-relaxed font-normal">
              {viewingGoal.description}
            </p>
          )}
        </div>

        {/* Progress Bar & Deadline Metrics */}
        <div className="p-4 rounded-xl bg-[#171C27] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
            <span className="text-slate-300">
              Progress ({viewingGoal.progressMode === 'task' ? 'Task Based' : viewingGoal.progressMode === 'milestone' ? 'Milestone Based' : 'Manual'})
            </span>
            <span className="text-white font-bold text-base">{viewingGoal.progress}%</span>
          </div>

          <div className="w-full h-3 bg-[#11151F] rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted
                  ? 'bg-[#22C55E]'
                  : 'bg-gradient-to-r from-[#7C3AED] via-[#9061F9] to-[#06B6D4]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, viewingGoal.progress))}%` }}
            />
          </div>

          {/* Quick Manual Slider if manual mode */}
          {viewingGoal.progressMode === 'manual' && !isCompleted && (
            <div className="pt-1 flex items-center gap-3">
              <span className="text-[11px] text-slate-400">Adjust:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={viewingGoal.progress}
                onChange={(e) => updateGoalProgress(viewingGoal.id, e.target.value)}
                className="flex-1 accent-[#7C3AED] cursor-pointer"
              />
            </div>
          )}

          {/* Deadlines */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06] text-xs text-[#94A3B8]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Target: {viewingGoal.targetDate || 'No date set'}</span>
            </div>
            <div
              className={`font-semibold ${
                deadline.isOverdue ? 'text-[#EF4444]' : deadline.isDueSoon ? 'text-[#F59E0B]' : 'text-slate-300'
              }`}
            >
              {deadline.label}
            </div>
          </div>
        </div>

        {/* Section Tabs: Overview, Milestones, Related Tasks, Activity */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#171C27] border border-white/[0.06] overflow-x-auto">
          {[
            { id: 'overview', label: 'Milestones & Tasks' },
            { id: 'tasks', label: `Linked Tasks (${linkedTasks.length})` },
            { id: 'habits', label: `Related Habits (${linkedHabits.length})` },
            { id: 'activity', label: 'Activity Log' },
          ].map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeSection === sec.id
                  ? 'bg-[#7C3AED] text-white shadow-subtle'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Section Content */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <MilestoneList goal={viewingGoal} />

            {/* Linked Tasks Quick Overview */}
            <div className="pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-[#7C3AED]" />
                  <span>Linked Tasks ({completedTaskCount}/{linkedTasks.length} completed)</span>
                </h4>
                <button
                  type="button"
                  onClick={() => openLinkTaskModal(viewingGoal)}
                  className="text-xs text-[#06B6D4] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Link Tasks</span>
                </button>
              </div>

              {linkedTasks.length === 0 ? (
                <p className="text-xs text-slate-500 py-2 italic">
                  No tasks linked to this goal yet. Connect tasks to automatically track progress.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {linkedTasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#171C27]/50 border border-white/[0.04]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleTaskStatus(t.id)}
                          className="shrink-0"
                        >
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              t.status === 'completed' ? 'text-[#22C55E]' : 'text-slate-500'
                            }`}
                          />
                        </button>
                        <span
                          className={`text-xs truncate ${
                            t.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-200'
                          }`}
                        >
                          {t.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {t.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8]">
                {linkedTasks.length} connected tasks in TaskContext
              </span>
              <Button
                variant="primary"
                size="sm"
                icon={<Link2 className="w-3.5 h-3.5" />}
                onClick={() => openLinkTaskModal(viewingGoal)}
              >
                Manage Linked Tasks
              </Button>
            </div>

            {linkedTasks.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center italic">
                No tasks linked yet. Click "Manage Linked Tasks" to associate tasks with this goal.
              </p>
            ) : (
              <div className="space-y-2">
                {linkedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#171C27] border border-white/[0.06]"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleTaskStatus(task.id)}
                        className="shrink-0"
                      >
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            task.status === 'completed' ? 'text-[#22C55E]' : 'text-slate-500'
                          }`}
                        />
                      </button>
                      <div className="min-w-0">
                        <span
                          className={`text-xs sm:text-sm font-semibold truncate block ${
                            task.status === 'completed' ? 'text-slate-400 line-through' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Due: {task.dueDate || 'None'} • Category: {task.category}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        task.status === 'completed'
                          ? 'bg-[#22C55E]/15 text-[#22C55E]'
                          : 'bg-amber-500/15 text-amber-400'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'habits' && (
          <div className="space-y-4">
            <span className="text-xs text-[#94A3B8]">
              {linkedHabits.length} daily habits connected to this goal
            </span>

            {linkedHabits.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center italic">
                No habits connected to this goal yet. When creating or editing a habit, select this goal to connect consistency tracking.
              </p>
            ) : (
              <div className="space-y-2">
                {linkedHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#171C27] border border-white/[0.06]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                        style={{ backgroundColor: `${habit.color}20`, borderColor: `${habit.color}40`, color: habit.color }}
                      >
                        <Flame className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white truncate block">
                          {habit.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {habit.category} • Target: {habit.targetCount} {habit.unit}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/[0.06] text-[#c4b5fd]">
                      {typeof habit.frequency === 'string' ? habit.frequency : 'custom'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'activity' && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              <span>Goal Timeline History</span>
            </h4>
            {(viewingGoal.activityLog || []).length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center italic">
                No activity logged yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {(viewingGoal.activityLog || []).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-[#171C27]/60 border border-white/[0.04] text-xs"
                  >
                    <p className="text-slate-200 font-medium">{item.message}</p>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      {new Date(item.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            {!isCompleted && (
              <button
                type="button"
                onClick={() => completeGoal(viewingGoal.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#22C55E] hover:bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Complete</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (isArchived) {
                  restoreGoal(viewingGoal.id);
                } else {
                  archiveGoal(viewingGoal.id);
                }
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-[#171C27] hover:bg-[#1f2635] border border-white/[0.08] flex items-center gap-1.5 transition-all"
            >
              {isArchived ? (
                <>
                  <ArchiveRestore className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Restore</span>
                </>
              ) : (
                <>
                  <Archive className="w-3.5 h-3.5 text-slate-400" />
                  <span>Archive</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => openDeleteGoalModal(viewingGoal)}
              className="p-2 rounded-xl text-xs text-[#EF4444] hover:bg-[#EF4444]/15 border border-[#EF4444]/20 transition-all"
              title="Delete goal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="secondary" size="md" onClick={closeViewGoal}>
              Close
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Edit2 className="w-3.5 h-3.5" />}
              onClick={() => {
                const target = viewingGoal;
                closeViewGoal();
                openEditGoalModal(target);
              }}
            >
              Edit Goal
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
