import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useNotificationsContext } from '../../context/NotificationsContext';
import { useTaskContext } from '../../context/TaskContext';
import { useProjectContext } from '../../context/ProjectContext';
import { useGoalsContext } from '../../context/GoalsContext';
import { getTodayDateString } from '../../utils/taskStorage';
import { isDateTimeDue, getUpcomingReminderOccurrences } from '../../utils/notificationUtils';
import {
  Bell,
  Check,
  Plus,
  AlertTriangle,
  AlertCircle,
  Calendar,
  Clock,
  Repeat,
  FolderKanban,
  Target,
  ListTodo,
} from 'lucide-react';

export default function ReminderModal() {
  const {
    isReminderModalOpen,
    closeReminderModal,
    editingReminder,
    addReminder,
    updateReminder,
  } = useNotificationsContext();
  const { tasks } = useTaskContext();
  const { projects } = useProjectContext();
  const { goals } = useGoalsContext();

  const isEdit = Boolean(editingReminder && editingReminder.id);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState('09:00');
  const [repeat, setRepeat] = useState('none');
  const [priority, setPriority] = useState('normal');
  const [relatedTaskId, setRelatedTaskId] = useState('');
  const [relatedProjectId, setRelatedProjectId] = useState('');
  const [relatedGoalId, setRelatedGoalId] = useState('');

  const [errors, setErrors] = useState({});
  const [isPastWarning, setIsPastWarning] = useState(false);

  useEffect(() => {
    if (editingReminder) {
      setTitle(editingReminder.title || '');
      setMessage(editingReminder.message || editingReminder.description || '');
      setDate(editingReminder.date || getTodayDateString());
      setTime(editingReminder.time || '09:00');
      setRepeat(editingReminder.repeat || 'none');
      setPriority(editingReminder.priority || 'normal');
      setRelatedTaskId(editingReminder.relatedTaskId || editingReminder.taskId || '');
      setRelatedProjectId(editingReminder.relatedProjectId || editingReminder.projectId || '');
      setRelatedGoalId(editingReminder.relatedGoalId || editingReminder.goalId || '');
    } else {
      setTitle('');
      setMessage('');
      setDate(getTodayDateString());
      setTime('09:00');
      setRepeat('none');
      setPriority('normal');
      setRelatedTaskId('');
      setRelatedProjectId('');
      setRelatedGoalId('');
    }
    setErrors({});
  }, [editingReminder, isReminderModalOpen]);

  // Past check
  useEffect(() => {
    if (date && time && repeat === 'none') {
      setIsPastWarning(isDateTimeDue(date, time));
    } else {
      setIsPastWarning(false);
    }
  }, [date, time, repeat]);

  // Recurrence Preview (up to 5 occurrences)
  const occurrencePreview = useMemo(() => {
    if (repeat === 'none') return [];
    return getUpcomingReminderOccurrences(date, time, repeat, 5);
  }, [date, time, repeat]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Reminder title is required.';
    }
    if (!date) {
      newErrors.date = 'Date is required.';
    }
    if (!time) {
      newErrors.time = 'Time is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      title: title.trim(),
      message: message.trim(),
      date,
      time,
      repeat,
      priority,
      relatedTaskId: relatedTaskId || null,
      relatedProjectId: relatedProjectId || null,
      relatedGoalId: relatedGoalId || null,
    };

    if (isEdit) {
      updateReminder(editingReminder.id, payload);
    } else {
      addReminder(payload);
    }
  };

  return (
    <Modal
      isOpen={isReminderModalOpen}
      onClose={closeReminderModal}
      title={isEdit ? 'Edit Smart Reminder' : 'Create Smart Reminder'}
      subtitle="Schedule timely in-app reminders with recurrence rules and entity linking."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Past Warning */}
        {isPastWarning && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>The selected time is in the past and will trigger right away.</span>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1">
            Reminder Title <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Follow up on Project deliverables"
            className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]"
            autoFocus
          />
          {errors.title && <p className="text-[#EF4444] text-[10px] mt-1">{errors.title}</p>}
        </div>

        {/* Message */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Note / Message (Optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add context or notes..."
            rows={2}
            className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED] resize-none"
          />
        </div>

        {/* Date, Time & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
            >
              <option value="low">Low Priority</option>
              <option value="normal">Normal</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Recurrence Rule */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Repeat Schedule</label>
          <select
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none"
          >
            <option value="none">Does not repeat (One-time)</option>
            <option value="daily">Every day (Daily)</option>
            <option value="weekdays">Every weekday (Mon - Fri)</option>
            <option value="weekly">Every week (Weekly)</option>
            <option value="monthly">Every month (Monthly)</option>
          </select>
        </div>

        {/* Upcoming Occurrences Preview (Requirement 16) */}
        {occurrencePreview.length > 0 && (
          <div className="p-3 rounded-2xl bg-[#171C27]/60 border border-white/[0.04] space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Upcoming Occurrences Preview
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {occurrencePreview.map((occ, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-[#11151F] text-[11px] font-mono text-slate-300 border border-white/[0.03]"
                >
                  <span>{occ.formatted}</span>
                  <span className="text-[#06B6D4]">{occ.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Entity Linking (Tasks / Projects / Goals) */}
        <div className="space-y-2 pt-2 border-t border-white/[0.06]">
          <span className="text-slate-300 font-semibold block">Link Deliverable (Optional)</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Task</label>
              <select
                value={relatedTaskId}
                onChange={(e) => setRelatedTaskId(e.target.value)}
                className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-2 py-1.5 text-white focus:outline-none"
              >
                <option value="">No task linked</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Project</label>
              <select
                value={relatedProjectId}
                onChange={(e) => setRelatedProjectId(e.target.value)}
                className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-2 py-1.5 text-white focus:outline-none"
              >
                <option value="">No project linked</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Goal</label>
              <select
                value={relatedGoalId}
                onChange={(e) => setRelatedGoalId(e.target.value)}
                className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-2 py-1.5 text-white focus:outline-none"
              >
                <option value="">No goal linked</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
          <Button variant="ghost" size="sm" type="button" onClick={closeReminderModal}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            {isEdit ? 'Save Changes' : 'Create Reminder'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
