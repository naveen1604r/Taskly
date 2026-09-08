import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import RecurrenceSelector from './RecurrenceSelector';
import RecurrencePreview from './RecurrencePreview';
import { useRecurringTaskContext } from '../../context/RecurringTaskContext';
import { useGoalsContext } from '../../context/GoalsContext';
import { useTaskContext } from '../../context/TaskContext';
import { getTodayDateString } from '../../utils/taskStorage';
import { Clock, Calendar, Target, AlertCircle, Check } from 'lucide-react';

const durationPresets = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '1 hour', minutes: 60 },
  { label: '1h 30m', minutes: 90 },
  { label: '2 hours', minutes: 120 },
];

export default function RecurringTaskModal() {
  const { isModalOpen, editingRule, closeModal, addRecurringTask, updateRecurringTask } =
    useRecurringTaskContext();
  const { goals } = useGoalsContext();
  const { categories = ['General', 'Work', 'Personal', 'Study', 'Health', 'Productivity'] } =
    useTaskContext();

  const todayStr = getTodayDateString();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('General');
  const [duration, setDuration] = useState(60);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customDurationInput, setCustomDurationInput] = useState('60');
  const [plannedStartTime, setPlannedStartTime] = useState('08:00');
  const [hasStartTime, setHasStartTime] = useState(true);
  const [goalId, setGoalId] = useState('');
  const [reminder, setReminder] = useState('15m');

  // Recurrence rule
  const [recurrence, setRecurrence] = useState({
    type: 'daily',
    interval: 1,
    daysOfWeek: [1, 3, 5],
    dayOfMonth: 1,
    startDate: todayStr,
    endDate: null,
    customUnit: 'days',
    customInterval: 1,
  });

  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDateValue, setEndDateValue] = useState('');

  // Prefill when editing
  useEffect(() => {
    if (editingRule) {
      setTitle(editingRule.title || '');
      setDescription(editingRule.description || '');
      setPriority(editingRule.priority || 'medium');
      setCategory(editingRule.category || 'General');

      const dur = editingRule.estimatedDuration || 60;
      setDuration(dur);
      const isPreset = durationPresets.some((p) => p.minutes === dur);
      if (isPreset) {
        setIsCustomDuration(false);
      } else {
        setIsCustomDuration(true);
        setCustomDurationInput(String(dur));
      }

      if (editingRule.plannedStartTime) {
        setHasStartTime(true);
        setPlannedStartTime(editingRule.plannedStartTime);
      } else {
        setHasStartTime(false);
      }

      setGoalId(editingRule.goalId || '');
      setReminder(editingRule.reminder || 'none');

      if (editingRule.recurrence) {
        setRecurrence(editingRule.recurrence);
        if (editingRule.recurrence.endDate) {
          setHasEndDate(true);
          setEndDateValue(editingRule.recurrence.endDate);
        } else {
          setHasEndDate(false);
          setEndDateValue('');
        }
      }
    } else {
      // Defaults
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('General');
      setDuration(60);
      setIsCustomDuration(false);
      setHasStartTime(true);
      setPlannedStartTime('08:00');
      setGoalId('');
      setReminder('15m');
      setHasEndDate(false);
      setEndDateValue('');
      setRecurrence({
        type: 'daily',
        interval: 1,
        daysOfWeek: [1, 3, 5],
        dayOfMonth: 1,
        startDate: todayStr,
        endDate: null,
        customUnit: 'days',
        customInterval: 1,
      });
    }
  }, [editingRule, isModalOpen, todayStr]);

  if (!isModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalRecurrence = {
      ...recurrence,
      endDate: hasEndDate && endDateValue ? endDateValue : null,
    };

    const ruleData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      estimatedDuration: duration,
      plannedStartTime: hasStartTime && plannedStartTime ? plannedStartTime : null,
      goalId: goalId || null,
      reminder,
      recurrence: finalRecurrence,
    };

    if (editingRule) {
      updateRecurringTask(editingRule.id, ruleData);
    } else {
      addRecurringTask(ruleData);
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={closeModal}
      title={editingRule ? 'Edit Recurring Task' : 'Create Recurring Task'}
      subtitle="Define an automated routine that generates scheduled tasks"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Task Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
            Task Name <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Morning Study & Reading"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#171C27] text-white placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
            Description <span className="text-[11px] text-slate-500 font-normal lowercase">(optional)</span>
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notes or instructions for this recurring task..."
            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#171C27] text-white placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none resize-none"
          />
        </div>

        {/* Priority & Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Duration Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              Estimated Duration
            </label>
            <span className="text-xs font-bold text-[#06B6D4]">{duration} minutes</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {durationPresets.map((p) => {
              const isSelected = !isCustomDuration && duration === p.minutes;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setDuration(p.minutes);
                    setIsCustomDuration(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#7C3AED] text-white shadow-glow-primary'
                      : 'bg-[#171C27] text-slate-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setIsCustomDuration(true)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                isCustomDuration
                  ? 'bg-[#7C3AED] text-white'
                  : 'bg-[#171C27] text-slate-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              Custom
            </button>
          </div>

          {isCustomDuration && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="5"
                step="5"
                value={customDurationInput}
                onChange={(e) => {
                  setCustomDurationInput(e.target.value);
                  const m = parseInt(e.target.value, 10);
                  if (!isNaN(m) && m > 0) setDuration(m);
                }}
                className="w-28 px-3 py-1.5 text-xs bg-[#171C27] text-white rounded-lg border border-white/[0.1] focus:border-[#7C3AED] focus:outline-none"
              />
              <span className="text-xs text-slate-400">minutes</span>
            </div>
          )}
        </div>

        {/* Start Time (Optional) */}
        <div className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.06] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Daily Planned Start Time</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasStartTime}
                onChange={(e) => setHasStartTime(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7C3AED]" />
            </label>
          </div>

          {hasStartTime ? (
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={plannedStartTime}
                onChange={(e) => setPlannedStartTime(e.target.value)}
                className="px-3 py-1.5 text-xs sm:text-sm bg-[#11151F] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
              />
              <span className="text-xs text-slate-400">Will be scheduled at this time on the planner</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 italic block">
              Generated tasks will be created without a fixed start time.
            </span>
          )}
        </div>

        {/* Recurrence Rule Builder */}
        <div className="pt-2 border-t border-white/[0.06]">
          <RecurrenceSelector value={recurrence} onChange={setRecurrence} />
        </div>

        {/* Start Date & End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={recurrence.startDate || todayStr}
              onChange={(e) => setRecurrence({ ...recurrence, startDate: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              End Date
            </label>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  id="hasEndDateCheck"
                  checked={hasEndDate}
                  onChange={(e) => setHasEndDate(e.target.checked)}
                  className="rounded bg-[#171C27] border-white/20 text-[#7C3AED] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="hasEndDateCheck" className="cursor-pointer">
                  End on specific date
                </label>
              </div>

              {hasEndDate && (
                <input
                  type="date"
                  min={recurrence.startDate || todayStr}
                  value={endDateValue}
                  onChange={(e) => setEndDateValue(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>

        {/* Link to Goal & Reminder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Link to Goal <span className="text-[11px] text-slate-500 font-normal lowercase">(optional)</span>
            </label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
            >
              <option value="">None (Standalone Routine)</option>
              {goals &&
                goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Reminder
            </label>
            <select
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
            >
              <option value="none">No reminder</option>
              <option value="5m">5 minutes before</option>
              <option value="10m">10 minutes before</option>
              <option value="15m">15 minutes before</option>
              <option value="30m">30 minutes before</option>
              <option value="1h">1 hour before</option>
            </select>
          </div>
        </div>

        {/* Live Occurrence Preview */}
        <RecurrencePreview
          recurrence={{
            ...recurrence,
            endDate: hasEndDate ? endDateValue : null,
          }}
          taskTitle={title}
          plannedStartTime={hasStartTime ? plannedStartTime : null}
        />

        {/* Future rule disclaimer */}
        {editingRule && (
          <div className="p-3 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-start gap-2.5 text-xs text-slate-300">
            <AlertCircle className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5" />
            <span>
              Changes apply to future occurrences only. Existing tasks already created will not be modified.
            </span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
          <Button variant="secondary" size="md" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={<Check className="w-4 h-4" />}
          >
            {editingRule ? 'Save Changes' : 'Create Recurring Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
