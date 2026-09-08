import React, { useState } from 'react';
import { useInboxContext } from '../../context/InboxContext';
import { useTaskContext } from '../../context/TaskContext';
import { useNotesContext } from '../../context/NotesContext';
import { useNotificationsContext } from '../../context/NotificationsContext';
import { useProjectContext } from '../../context/ProjectContext';
import { useGoalsContext } from '../../context/GoalsContext';
import { useHabitContext } from '../../context/HabitContext';
import { getTodayDateString } from '../../utils/taskStorage';
import Button from '../common/Button';
import {
  CheckSquare,
  FileText,
  Clock,
  Bell,
  Archive,
  Trash2,
  X,
  Sparkles,
  FolderKanban,
  Target,
  ArrowRight,
  Flame,
} from 'lucide-react';

export default function InboxProcessModal() {
  const { itemToProcess, closeProcessModal, markAsProcessed, archiveInboxItem, deleteInboxItem } =
    useInboxContext();
  const { addTask, openCreateModal, showToast } = useTaskContext();
  const { addNote } = useNotesContext();
  const { openCreateReminderModal } = useNotificationsContext();
  const { projects } = useProjectContext();
  const { goals } = useGoalsContext();
  const { addHabit } = useHabitContext() || {};

  const [activeAction, setActiveAction] = useState('task'); // 'task' | 'note' | 'schedule' | 'reminder' | 'habit'
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [scheduleDate, setScheduleDate] = useState(getTodayDateString());
  const [scheduleTime, setScheduleTime] = useState('09:00');

  if (!itemToProcess) return null;

  // Action 1: Convert to Task
  const handleConvertToTask = () => {
    const createdTask = addTask({
      title: itemToProcess.title,
      description: itemToProcess.description || '',
      priority: itemToProcess.priority || 'medium',
      category: itemToProcess.category || 'General',
      tags: itemToProcess.tags || [],
      estimatedDuration: itemToProcess.estimatedDuration || 30,
      projectId: selectedProjectId || null,
      goalId: selectedGoalId || null,
    });

    markAsProcessed(itemToProcess.id, createdTask?.id || null);
    if (showToast) showToast(`Converted "${itemToProcess.title}" to Task`, 'success');
    closeProcessModal();
  };

  // Action 2: Convert to Note
  const handleConvertToNote = () => {
    const createdNote = addNote({
      title: itemToProcess.title,
      content: itemToProcess.description || '',
      tags: itemToProcess.tags || [],
      category: itemToProcess.category || 'General',
    });

    markAsProcessed(itemToProcess.id, null, createdNote?.id || null);
    if (showToast) showToast(`Converted "${itemToProcess.title}" to Note`, 'success');
    closeProcessModal();
  };

  // Action 3: Schedule Directly
  const handleScheduleTask = () => {
    const createdTask = addTask({
      title: itemToProcess.title,
      description: itemToProcess.description || '',
      priority: itemToProcess.priority || 'medium',
      category: itemToProcess.category || 'General',
      tags: itemToProcess.tags || [],
      estimatedDuration: itemToProcess.estimatedDuration || 30,
      plannedDate: scheduleDate,
      plannedStartTime: scheduleTime,
      projectId: selectedProjectId || null,
      goalId: selectedGoalId || null,
    });

    markAsProcessed(itemToProcess.id, createdTask?.id || null);
    if (showToast) showToast(`Scheduled "${itemToProcess.title}" for ${scheduleDate}`, 'success');
    closeProcessModal();
  };

  // Action 4: Set Reminder
  const handleSetReminder = () => {
    openCreateReminderModal({
      title: itemToProcess.title,
      message: itemToProcess.description || '',
      date: scheduleDate,
      time: scheduleTime,
      priority: itemToProcess.priority || 'normal',
    });
    markAsProcessed(itemToProcess.id);
    closeProcessModal();
  };

  // Action 5: Convert to Habit (Requirement 31)
  const handleConvertToHabit = () => {
    if (addHabit) {
      addHabit({
        name: itemToProcess.title,
        description: itemToProcess.description || '',
        category: itemToProcess.category || 'Health',
        routineGroup: 'morning',
        targetCount: 1,
        unit: 'session',
        frequency: 'daily',
        projectId: selectedProjectId || null,
        goalId: selectedGoalId || null,
      });
    }
    markAsProcessed(itemToProcess.id);
    if (showToast) showToast(`Created habit from "${itemToProcess.title}"!`, 'success');
    closeProcessModal();
  };

  // Action 6: Archive
  const handleArchive = () => {
    archiveInboxItem(itemToProcess.id);
    closeProcessModal();
  };

  // Action 7: Delete
  const handleDelete = () => {
    deleteInboxItem(itemToProcess.id);
    closeProcessModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={closeProcessModal}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg bg-[#11151F] border border-white/[0.1] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Process Inbox Item</h3>
              <p className="text-xs text-slate-400">Decide how to organize and execute this item</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeProcessModal}
            className="p-1 rounded-xl text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Preview Card */}
        <div className="p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.04] space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-white text-sm">{itemToProcess.title}</span>
            <span className="px-2 py-0.2 rounded-md bg-white/[0.06] text-slate-300 font-mono text-[10px] uppercase">
              {itemToProcess.type}
            </span>
          </div>
          {itemToProcess.description && (
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {itemToProcess.description}
            </p>
          )}
        </div>

        {/* Action Strategy Tabs */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-bold uppercase block">
            Choose Organization Action
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {[
              { id: 'task', label: 'Create Task', icon: CheckSquare },
              { id: 'habit', label: 'Create Habit', icon: Flame },
              { id: 'schedule', label: 'Schedule', icon: Clock },
              { id: 'note', label: 'Save Note', icon: FileText },
              { id: 'reminder', label: 'Set Reminder', icon: Bell },
            ].map((act) => {
              const Icon = act.icon;
              const isSelected = activeAction === act.id;
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => setActiveAction(act.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                    isSelected
                      ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-white font-bold'
                      : 'bg-[#171C27]/60 border-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#7C3AED]" />
                  <span className="text-[11px]">{act.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Specific Configuration Form per Action */}
        {(activeAction === 'task' || activeAction === 'schedule' || activeAction === 'habit') && (
          <div className="p-3.5 rounded-2xl bg-[#171C27]/60 border border-white/[0.04] space-y-3 animate-in fade-in duration-100">
            {activeAction === 'schedule' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                    Planned Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-[#11151F] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-[#11151F] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Project & Goal Linking (Requirements 13 & 14) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                  Assign Project
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-[#11151F] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                >
                  <option value="">No Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                  Link Goal
                </label>
                <select
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  className="w-full bg-[#11151F] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                >
                  <option value="">No Goal</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleArchive}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Archive Item"
            >
              <Archive className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 rounded-xl text-slate-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
              title="Delete Item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={closeProcessModal}>
              Cancel
            </Button>

            {activeAction === 'task' && (
              <Button variant="primary" size="sm" onClick={handleConvertToTask}>
                Create Task
              </Button>
            )}

            {activeAction === 'habit' && (
              <Button variant="primary" size="sm" onClick={handleConvertToHabit}>
                Create Habit
              </Button>
            )}

            {activeAction === 'schedule' && (
              <Button variant="primary" size="sm" onClick={handleScheduleTask}>
                Schedule & Organize
              </Button>
            )}

            {activeAction === 'note' && (
              <Button variant="primary" size="sm" onClick={handleConvertToNote}>
                Save as Note
              </Button>
            )}

            {activeAction === 'reminder' && (
              <Button variant="primary" size="sm" onClick={handleSetReminder}>
                Configure Reminder
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
