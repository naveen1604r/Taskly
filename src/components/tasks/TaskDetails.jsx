import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTaskContext } from '../../context/TaskContext';
import { useGoalsContext } from '../../context/GoalsContext';
import { useFocusContext } from '../../context/FocusContext';
import { usePlannerContext } from '../../context/PlannerContext';
import { useProjectContext } from '../../context/ProjectContext';
import TaskQuickActions from './TaskQuickActions';
import SubtaskProgress from './SubtaskProgress';
import SubtaskList from './SubtaskList';
import TaskActivityTimeline from './TaskActivityTimeline';
import TaskDependencies from './TaskDependencies';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  Target,
  Flame,
  FileText,
  CalendarRange,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  FolderKanban,
} from 'lucide-react';
import Button from '../common/Button';

const priorityConfig = {
  high: {
    label: 'High Priority',
    styles: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/25',
    dot: 'bg-[#EF4444]',
  },
  medium: {
    label: 'Medium Priority',
    styles: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25',
    dot: 'bg-[#F59E0B]',
  },
  low: {
    label: 'Low Priority',
    styles: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/25',
    dot: 'bg-[#22C55E]',
  },
};

const statusConfig = {
  pending: {
    label: 'Pending',
    styles: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  in_progress: {
    label: 'In Progress',
    styles: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/20',
  },
  completed: {
    label: 'Completed',
    styles: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20',
  },
};

export default function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const {
    tasks,
    updateTask,
    updateTaskNotes,
    addTagToTask,
    removeTagFromTask,
    showToast,
  } = useTaskContext();
  const { goals } = useGoalsContext();
  const { focusSessions, startFocus } = useFocusContext();
  const { selectedDate } = usePlannerContext();
  const { projects, getProject } = useProjectContext();

  const task = tasks.find((t) => String(t.id) === String(taskId));
  const linkedProject = task?.projectId ? getProject(task.projectId) : null;

  // Tag input state
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  // Goal assignment picker state
  const [isAssigningGoal, setIsAssigningGoal] = useState(false);

  // Project assignment picker state
  const [isAssigningProject, setIsAssigningProject] = useState(false);

  // Task Notes local state
  const [notesDraft, setNotesDraft] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    if (task) {
      setNotesDraft(task.taskNotes || '');
    }
  }, [task?.id, task?.taskNotes]);

  if (!task) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="p-4 rounded-full bg-white/[0.04] w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Task Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">
          The requested task could not be found or may have been deleted.
        </p>
        <Button variant="primary" onClick={() => navigate('/tasks')} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Tasks
        </Button>
      </div>
    );
  }

  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const statusInfo = statusConfig[task.status] || statusConfig.pending;

  // Linked Goal (Requirement 15)
  const linkedGoal = goals ? goals.find((g) => g.id === task.goalId) : null;

  // Focus Statistics (Requirement 13)
  const taskFocusSessions = Array.isArray(focusSessions)
    ? focusSessions.filter((s) => s.taskId === task.id)
    : [];
  const focusSessionsCount = taskFocusSessions.length;
  const actualDurationMinutes =
    task.actualDuration ||
    taskFocusSessions.reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
  const estimatedDurationMinutes = Number(task.estimatedDuration || task.duration) || 30;

  // Notes Auto-save handler (Requirement 11)
  const handleNotesBlur = () => {
    if (notesDraft !== (task.taskNotes || '')) {
      setIsSavingNotes(true);
      updateTaskNotes(task.id, notesDraft);
      setTimeout(() => {
        setIsSavingNotes(false);
        showToast('Notes saved', 'success');
      }, 300);
    }
  };

  // Tag Management (Requirement 16)
  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTagInput.trim()) {
      addTagToTask(task.id, newTagInput.trim());
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  // Goal assignment
  const handleAssignGoal = (goalId) => {
    updateTask(task.id, { goalId: goalId || null });
    setIsAssigningGoal(false);
    showToast(goalId ? 'Goal linked to task' : 'Goal unlinked', 'info');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumbs & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="p-2 rounded-xl bg-[#171C27] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors border border-white/[0.06]"
            title="Back to Tasks"
            aria-label="Back to tasks list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Link to="/tasks" className="hover:text-white transition-colors">
                Tasks
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-slate-300 truncate max-w-[200px]">
                {task.category || 'General'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5 truncate max-w-xl">
              {task.title}
            </h1>
          </div>
        </div>

        {/* Quick Actions (Requirement 7) */}
        <TaskQuickActions task={task} />
      </div>

      {/* Main Responsive Layout: Desktop 2-column (Left: Info, Right: Subtasks/Progress/Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: Task Information (5 cols) ================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Primary Details */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#11151F] border border-white/[0.08] shadow-card space-y-5">
            {/* Status & Priority Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${statusInfo.styles}`}
              >
                {statusInfo.label}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${priority.styles}`}
              >
                <span className={`w-2 h-2 rounded-full ${priority.dot}`} />
                {priority.label}
              </span>

              {task.category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-[#171C27] border border-white/[0.08] text-slate-300">
                  <Tag className="w-3 h-3 text-[#7C3AED]" />
                  <span>{task.category}</span>
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Description
              </h4>
              {task.description ? (
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-[#171C27] p-3.5 rounded-xl border border-white/[0.04]">
                  {task.description}
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic bg-[#171C27]/40 p-3 rounded-xl border border-white/[0.04]">
                  No description provided for this task.
                </p>
              )}
            </div>

            {/* Schedule & Due Dates (Requirement 5 & 14) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-[#171C27] border border-white/[0.04]">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Due Date</span>
                </div>
                <p className="text-sm font-semibold text-white">
                  {task.dueDate || 'No due date'}
                </p>
                {task.dueTime && (
                  <p className="text-[11px] font-mono text-amber-400/90 mt-0.5">
                    {task.dueTime}
                  </p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-[#171C27] border border-white/[0.04]">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <CalendarRange className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span>Planned Date</span>
                </div>
                <p className="text-sm font-semibold text-white">
                  {task.plannedDate || 'Not planned'}
                </p>
                {task.plannedStartTime && (
                  <p className="text-[11px] font-mono text-cyan-400/90 mt-0.5">
                    {task.plannedStartTime}
                  </p>
                )}
              </div>
            </div>

            {/* Tags Section (Requirement 16) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Tags
                </h4>
                {!isAddingTag && (
                  <button
                    type="button"
                    onClick={() => setIsAddingTag(true)}
                    className="text-xs text-[#7C3AED] hover:text-[#c4b5fd] font-semibold transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Tag</span>
                  </button>
                )}
              </div>

              {isAddingTag && (
                <form onSubmit={handleAddTag} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="tag-name (e.g. urgent)"
                    autoFocus
                    className="flex-1 bg-[#171C27] border border-[#7C3AED]/40 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingTag(false);
                      setNewTagInput('');
                    }}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              <div className="flex flex-wrap items-center gap-1.5">
                {Array.isArray(task.tags) && task.tags.length > 0 ? (
                  task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#171C27] border border-white/[0.08] text-[#c4b5fd]"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTagFromTask(task.id, tag)}
                        className="text-slate-500 hover:text-[#EF4444] transition-colors rounded ml-0.5"
                        title={`Remove tag #${tag}`}
                        aria-label={`Remove tag #${tag}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No tags assigned.</span>
                )}
              </div>
            </div>

            {/* Goal Card (Requirement 15) */}
            <div className="pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Goal Association
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAssigningGoal(!isAssigningGoal)}
                  className="text-xs font-semibold text-[#06B6D4] hover:text-cyan-300 transition-colors"
                >
                  {isAssigningGoal ? 'Close' : linkedGoal ? 'Change Goal' : 'Assign Goal'}
                </button>
              </div>

              {isAssigningGoal && (
                <div className="p-3 mb-2 rounded-xl bg-[#171C27] border border-white/[0.08] space-y-2 animate-in fade-in duration-150">
                  <label className="block text-xs text-slate-300 font-medium">Select Goal</label>
                  <select
                    value={task.goalId || ''}
                    onChange={(e) => handleAssignGoal(e.target.value)}
                    className="w-full bg-[#11151F] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="">-- No Goal Assigned --</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title} ({g.progress || 0}%)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {linkedGoal ? (
                <Link
                  to="/goals"
                  className="flex items-center justify-between p-3 rounded-xl bg-[#171C27] border border-white/[0.06] hover:border-white/[0.16] transition-all group"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-sm font-semibold text-white group-hover:text-[#c4b5fd] transition-colors truncate">
                      {linkedGoal.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-24 h-1.5 bg-[#11151F] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#7C3AED] rounded-full"
                          style={{ width: `${linkedGoal.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {linkedGoal.progress || 0}%
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
                </Link>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#171C27]/40 border border-white/[0.04]">
                  <span className="text-xs text-slate-400">No Goal Assigned</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsAssigningGoal(true)}
                  >
                    Assign Goal
                  </Button>
                </div>
              )}
            </div>

            {/* Project Card (Step 19) */}
            <div className="pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <FolderKanban className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Project
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAssigningProject(!isAssigningProject)}
                  className="text-xs font-semibold text-[#06B6D4] hover:text-cyan-300 transition-colors"
                >
                  {isAssigningProject ? 'Close' : linkedProject ? 'Change' : 'Assign'}
                </button>
              </div>

              {isAssigningProject && (
                <div className="p-3 mb-2 rounded-xl bg-[#171C27] border border-white/[0.08] space-y-2 animate-in fade-in duration-150">
                  <label className="block text-xs text-slate-300 font-medium">Select Project</label>
                  <select
                    value={task.projectId || ''}
                    onChange={(e) => {
                      updateTask(task.id, { projectId: e.target.value || null });
                      setIsAssigningProject(false);
                    }}
                    className="w-full bg-[#11151F] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="">-- No Project (Unassigned) --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {linkedProject ? (
                <Link
                  to={`/projects/${linkedProject.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#171C27] border border-white/[0.06] hover:border-white/[0.16] transition-all group"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-sm font-semibold text-white group-hover:text-[#c4b5fd] transition-colors truncate">
                      {linkedProject.name}
                    </p>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {linkedProject.priority} Priority • {linkedProject.status}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
                </Link>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#171C27]/40 border border-white/[0.04]">
                  <span className="text-xs text-slate-400">Independent Deliverable</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsAssigningProject(true)}
                  >
                    Assign Project
                  </Button>
                </div>
              )}
            </div>

            {/* Task-Specific Notes (Requirement 11) */}
            <div className="pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Task Notes
                  </h4>
                </div>
                {isSavingNotes && (
                  <span className="text-[11px] text-[#22C55E] animate-pulse">Saving...</span>
                )}
              </div>
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                onBlur={handleNotesBlur}
                placeholder="Write specific notes related to this task (e.g. 'Need to finish API integration tomorrow')..."
                rows={3}
                className="w-full bg-[#171C27] border border-white/[0.08] focus:border-[#7C3AED] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 transition-all resize-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Notes automatically save when you click outside or switch tabs.
              </p>
            </div>

            {/* Metadata Timestamps (Requirement 5) */}
            <div className="pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-mono">
              <div>
                <span className="block text-[10px] uppercase text-slate-600">Created</span>
                <span>{task.createdAt ? new Date(task.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-slate-600">Updated</span>
                <span>{task.updatedAt ? new Date(task.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Subtasks, Focus, Planner & Activity (7 cols) ================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Task Dependencies & Critical Path (Step 19) */}
          <TaskDependencies task={task} />

          {/* 2. Subtask Progress Card (Requirement 8) */}
          <SubtaskProgress task={task} />

          {/* 2. Focus & Planner Cards Grid (Requirements 13 & 14) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Focus Integration Card (Requirement 13) */}
            <div className="p-4 rounded-2xl bg-[#11151F] border border-white/[0.08] shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-[#F59E0B]" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Focus Time
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    {focusSessionsCount} {focusSessionsCount === 1 ? 'session' : 'sessions'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-center">
                  <div className="p-2 rounded-xl bg-[#171C27] border border-white/[0.04]">
                    <span className="block text-[10px] text-slate-400 uppercase">Estimated</span>
                    <span className="text-sm font-bold text-white font-mono">{estimatedDurationMinutes}m</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#171C27] border border-white/[0.04]">
                    <span className="block text-[10px] text-slate-400 uppercase">Actual</span>
                    <span className="text-sm font-bold text-[#22C55E] font-mono">{actualDurationMinutes}m</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.04]">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    startFocus(task.id);
                    navigate(`/focus?task=${task.id}`);
                  }}
                  className="w-full justify-center"
                  icon={<Flame className="w-3.5 h-3.5" />}
                >
                  Start Focus
                </Button>
              </div>
            </div>

            {/* Planner Integration Card (Requirement 14) */}
            <div className="p-4 rounded-2xl bg-[#11151F] border border-white/[0.08] shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <CalendarRange className="w-4 h-4 text-[#06B6D4]" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Planner
                    </h4>
                  </div>
                </div>

                <div className="space-y-2 mt-3 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#171C27] border border-white/[0.04]">
                    <span className="text-slate-400">Planned:</span>
                    <span className="font-semibold text-white font-mono">
                      {task.plannedDate || 'Today'}, {task.plannedStartTime || 'No time'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#171C27] border border-white/[0.04]">
                    <span className="text-slate-400">Due:</span>
                    <span className="font-semibold text-amber-300 font-mono">
                      {task.dueDate || 'Today'}, {task.dueTime || 'No time'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.04]">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/planner')}
                  className="w-full justify-center"
                  icon={<CalendarRange className="w-3.5 h-3.5 text-[#06B6D4]" />}
                >
                  Open Planner
                </Button>
              </div>
            </div>
          </div>

          {/* 3. SubtaskList & Checklists Component (Requirements 1, 2, 4, 9, 10, 19, 20, 21) */}
          <SubtaskList task={task} />

          {/* 4. Activity Timeline Component (Requirement 12) */}
          <TaskActivityTimeline task={task} />
        </div>
      </div>
    </div>
  );
}
