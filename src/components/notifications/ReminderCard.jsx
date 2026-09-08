import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../../context/TaskContext';
import { useProjectContext } from '../../context/ProjectContext';
import { useGoalsContext } from '../../context/GoalsContext';
import { useNotificationsContext } from '../../context/NotificationsContext';
import { isDateTimeDue } from '../../utils/notificationUtils';
import SnoozeMenu from './SnoozeMenu';
import {
  Bell,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Repeat,
  AlertTriangle,
  FolderKanban,
  Target,
  Edit,
  Trash2,
  Play,
  Pause,
  Moon,
} from 'lucide-react';

const priorityBadges = {
  urgent: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/25',
  high: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25',
  normal: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/25',
  low: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/25',
};

export default function ReminderCard({ reminder }) {
  const navigate = useNavigate();
  const { tasks, toggleTaskStatus } = useTaskContext();
  const { getProject } = useProjectContext();
  const { goals } = useGoalsContext();
  const {
    toggleReminder,
    deleteReminder,
    openEditReminderModal,
    snoozeReminder,
  } = useNotificationsContext();

  const [isSnoozeOpen, setIsSnoozeOpen] = useState(false);

  const isOverdue = reminder.enabled && !reminder.triggered && isDateTimeDue(reminder.date, reminder.time);
  const isSnoozed = Boolean(reminder.snoozedUntil && new Date(reminder.snoozedUntil) > new Date());

  const linkedTask = reminder.relatedTaskId ? tasks.find((t) => t.id === reminder.relatedTaskId) : null;
  const linkedProject = reminder.relatedProjectId ? getProject(reminder.relatedProjectId) : null;
  const linkedGoal = reminder.relatedGoalId ? goals.find((g) => g.id === reminder.relatedGoalId) : null;

  const handleComplete = () => {
    if (linkedTask) {
      toggleTaskStatus(linkedTask.id);
    } else {
      toggleReminder(reminder.id);
    }
  };

  return (
    <>
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border transition-all text-xs space-y-2.5 ${
          !reminder.enabled
            ? 'bg-[#11151F]/40 border-white/[0.03] opacity-60'
            : isOverdue
            ? 'bg-[#171C27] border-[#EF4444]/30 hover:border-[#EF4444]/60'
            : isSnoozed
            ? 'bg-[#171C27] border-[#06B6D4]/30 hover:border-[#06B6D4]/60'
            : 'bg-[#171C27] border-white/[0.08] hover:border-white/[0.16]'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={handleComplete}
              className="mt-0.5 text-slate-400 hover:text-white transition-colors shrink-0"
              title="Complete Deliverable"
            >
              {linkedTask?.status === 'completed' ? (
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              ) : (
                <Circle className="w-4 h-4 text-slate-500 hover:text-[#7C3AED]" />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`font-bold truncate ${
                    linkedTask?.status === 'completed' || !reminder.enabled
                      ? 'line-through text-slate-400'
                      : 'text-white'
                  }`}
                >
                  {reminder.title}
                </span>

                <span
                  className={`px-2 py-0.2 rounded-md font-semibold text-[10px] uppercase border ${
                    priorityBadges[reminder.priority] || priorityBadges.normal
                  }`}
                >
                  {reminder.priority}
                </span>

                {reminder.repeat !== 'none' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-300 bg-purple-500/15 px-2 py-0.2 rounded-md border border-purple-500/30">
                    <Repeat className="w-2.5 h-2.5" />
                    <span className="capitalize">{reminder.repeat}</span>
                  </span>
                )}

                {isSnoozed && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#06B6D4] bg-[#06B6D4]/15 px-2 py-0.2 rounded-md border border-[#06B6D4]/30">
                    <Moon className="w-2.5 h-2.5" />
                    <span>Snoozed</span>
                  </span>
                )}

                {isOverdue && !isSnoozed && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#EF4444] bg-[#EF4444]/15 px-2 py-0.2 rounded-md border border-[#EF4444]/30">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>Overdue</span>
                  </span>
                )}
              </div>

              {reminder.message && (
                <p className="text-slate-400 text-[11px] mt-1 leading-normal line-clamp-2">
                  {reminder.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Timestamps & Entity Links */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.04] text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 font-mono text-slate-300">
              <Calendar className="w-3 h-3 text-[#7C3AED]" />
              <span>{reminder.date}</span>
            </div>

            <div className="flex items-center gap-1 font-mono text-slate-300">
              <Clock className="w-3 h-3 text-[#06B6D4]" />
              <span>{reminder.time}</span>
            </div>

            {linkedProject && (
              <div className="flex items-center gap-1 text-[#7C3AED]">
                <FolderKanban className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{linkedProject.name}</span>
              </div>
            )}

            {linkedGoal && (
              <div className="flex items-center gap-1 text-[#22C55E]">
                <Target className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{linkedGoal.title}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsSnoozeOpen(true)}
              className="px-2 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-1"
              title="Snooze Reminder"
            >
              <Moon className="w-3 h-3" />
              <span>Snooze</span>
            </button>

            <button
              type="button"
              onClick={() => toggleReminder(reminder.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title={reminder.enabled ? 'Pause Reminder' : 'Resume Reminder'}
            >
              {reminder.enabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#22C55E]" />}
            </button>

            <button
              type="button"
              onClick={() => openEditReminderModal(reminder)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Edit Reminder"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => deleteReminder(reminder.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
              title="Delete Reminder"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Snooze Modal */}
      <SnoozeMenu
        isOpen={isSnoozeOpen}
        onClose={() => setIsSnoozeOpen(false)}
        onSnooze={(option, customDate, customTime) =>
          snoozeReminder(reminder.id, option, customDate, customTime)
        }
      />
    </>
  );
}
