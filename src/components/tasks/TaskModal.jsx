import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useTaskContext } from '../../context/TaskContext';
import { useGoalsContext } from '../../context/GoalsContext';
import { useSettingsContext } from '../../context/SettingsContext';
import { getTodayDateString } from '../../utils/taskStorage';
import { predefinedCategories } from './TaskFilters';
import { Plus, Check, AlertCircle } from 'lucide-react';

export default function TaskModal() {
  const { isTaskModalOpen, closeTaskModal, editingTask, addTask, updateTask } = useTaskContext();
  const { goals } = useGoalsContext();
  const { settings } = useSettingsContext();

  const isEdit = Boolean(editingTask);

  const defaultPriority = settings?.preferences?.defaultTaskPriority || 'medium';
  const defaultStatus = settings?.preferences?.defaultTaskStatus || 'pending';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(defaultPriority);
  const [category, setCategory] = useState('Personal');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [duration, setDuration] = useState(30);
  const [durationUnit, setDurationUnit] = useState('minutes');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState('');
  const [status, setStatus] = useState('pending');
  const [goalId, setGoalId] = useState('');
  const [reminder, setReminder] = useState('none');
  const [customReminderDate, setCustomReminderDate] = useState(getTodayDateString());
  const [customReminderTime, setCustomReminderTime] = useState('09:00');

  const [errors, setErrors] = useState({});

  // Sync state when editingTask or open status changes
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority || 'medium');

      const isKnown = predefinedCategories.includes(editingTask.category);
      if (isKnown) {
        setCategory(editingTask.category);
        setIsCustomCategory(false);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setIsCustomCategory(true);
        setCustomCategory(editingTask.category || '');
      }

      setDuration(editingTask.duration || 30);
      setDurationUnit(editingTask.durationUnit || 'minutes');
      setDueDate(editingTask.dueDate || getTodayDateString());
      setDueTime(editingTask.dueTime || '');
      setStatus(editingTask.status || 'pending');
      setGoalId(editingTask.goalId || '');
      setReminder(editingTask.reminder || 'none');
      setCustomReminderDate(editingTask.customReminderDate || getTodayDateString());
      setCustomReminderTime(editingTask.customReminderTime || '09:00');
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setPriority(defaultPriority);
      setCategory('Personal');
      setIsCustomCategory(false);
      setCustomCategory('');
      setDuration(30);
      setDurationUnit('minutes');
      setDueDate(getTodayDateString());
      setDueTime('');
      setStatus(defaultStatus);
      setGoalId('');
      setReminder('none');
      setCustomReminderDate(getTodayDateString());
      setCustomReminderTime('09:00');
    }
    setErrors({});
  }, [editingTask, isTaskModalOpen, defaultPriority, defaultStatus]);

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    if (val === 'custom_entry') {
      setIsCustomCategory(true);
    } else {
      setIsCustomCategory(false);
      setCategory(val);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Task name is required.';
    }
    if (!dueDate) {
      newErrors.dueDate = 'Due date is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const resolvedCategory = isCustomCategory
      ? customCategory.trim() || 'General'
      : category;

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      category: resolvedCategory,
      duration: Number(duration) > 0 ? Number(duration) : 30,
      durationUnit,
      dueDate,
      dueTime,
      status,
      goalId: goalId || null,
      reminder,
      customReminderDate: reminder === 'custom' ? customReminderDate : null,
      customReminderTime: reminder === 'custom' ? customReminderTime : null,
    };

    if (isEdit) {
      updateTask(editingTask.id, taskPayload);
    } else {
      addTask(taskPayload);
    }
  };

  return (
    <Modal
      isOpen={isTaskModalOpen}
      onClose={closeTaskModal}
      title={isEdit ? 'Edit Task' : 'Create New Task'}
      subtitle={isEdit ? 'Modify your task details and parameters.' : 'Add a task and keep your day organized.'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Task Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
            Task Name <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
            }}
            placeholder="Enter task name"
            autoFocus
            className={`w-full px-3.5 py-2.5 text-sm bg-[#171C27] text-white placeholder-slate-500 rounded-xl border transition-all focus:outline-none ${
              errors.title
                ? 'border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]'
                : 'border-white/[0.08] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]'
            }`}
          />
          {errors.title && (
            <p className="flex items-center gap-1 text-xs text-[#EF4444] mt-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.title}</span>
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
            Description <span className="text-[11px] text-slate-500 font-normal lowercase">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your task..."
            rows={3}
            className="w-full px-3.5 py-2.5 text-sm bg-[#171C27] text-white placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Priority Segmented Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
            Priority
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'low', label: 'Low', color: 'border-[#22C55E]/40 text-[#22C55E] bg-[#22C55E]/10' },
              { id: 'medium', label: 'Medium', color: 'border-[#F59E0B]/40 text-[#F59E0B] bg-[#F59E0B]/10' },
              { id: 'high', label: 'High', color: 'border-[#EF4444]/40 text-[#EF4444] bg-[#EF4444]/10' },
            ].map((p) => {
              const isSelected = priority === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? `${p.color} ring-1 ring-white/20 shadow-subtle`
                      : 'bg-[#171C27] border-white/[0.08] text-slate-400 hover:text-white hover:bg-[#1f2635]'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category & Custom Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Category
            </label>
            <select
              value={isCustomCategory ? 'custom_entry' : category}
              onChange={handleCategoryChange}
              className="w-full px-3.5 py-2.5 text-sm bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] focus:outline-none transition-all cursor-pointer"
            >
              {predefinedCategories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#171C27] text-white">
                  {cat}
                </option>
              ))}
              <option value="custom_entry" className="bg-[#171C27] text-[#06B6D4]">
                + Custom Category...
              </option>
            </select>
          </div>

          {/* Custom Category Input if selected */}
          {isCustomCategory && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                Custom Name
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Design, Research"
                className="w-full px-3.5 py-2.5 text-sm bg-[#171C27] text-white placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
              />
            </div>
          )}

          {/* Estimated Duration */}
          <div className={isCustomCategory ? 'sm:col-span-2' : ''}>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Estimated Duration
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="999"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-24 px-3 py-2.5 text-sm bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
              />
              <select
                value={durationUnit}
                onChange={(e) => setDurationUnit(e.target.value)}
                className="flex-1 px-3 py-2.5 text-sm bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none cursor-pointer"
              >
                <option value="minutes" className="bg-[#171C27] text-white">Minutes</option>
                <option value="hours" className="bg-[#171C27] text-white">Hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Due Date, Due Time, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Due Date <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: null }));
              }}
              className={`w-full px-3 py-2 text-xs sm:text-sm bg-[#171C27] text-white rounded-xl border transition-all focus:outline-none ${
                errors.dueDate ? 'border-[#EF4444]' : 'border-white/[0.08] focus:border-[#7C3AED]'
              }`}
            />
            {errors.dueDate && (
              <p className="text-[11px] text-[#EF4444] mt-1">{errors.dueDate}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Due Time <span className="text-[10px] text-slate-500 lowercase">(optional)</span>
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none cursor-pointer"
            >
              <option value="pending" className="bg-[#171C27] text-white">Pending</option>
              <option value="in_progress" className="bg-[#171C27] text-white">In Progress</option>
              <option value="completed" className="bg-[#171C27] text-white">Completed</option>
            </select>
          </div>
        </div>

        {/* Optional Connected Goal */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
            Goal <span className="text-[11px] text-slate-500 font-normal lowercase">(optional)</span>
          </label>
          <select
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-[#171C27] text-slate-400">No Goal</option>
            {(goals || []).filter((g) => g.status === 'active').map((g) => (
              <option key={g.id} value={g.id} className="bg-[#171C27] text-white">
                {g.title}
              </option>
            ))}
          </select>
        </div>

        {/* Reminder Configuration */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1">
            Reminder
          </label>
          <select
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none cursor-pointer"
          >
            <option value="none" className="bg-[#171C27] text-slate-400">No reminder</option>
            <option value="at_due_time" className="bg-[#171C27] text-white">At due time</option>
            <option value="5_mins_before" className="bg-[#171C27] text-white">5 minutes before</option>
            <option value="15_mins_before" className="bg-[#171C27] text-white">15 minutes before</option>
            <option value="30_mins_before" className="bg-[#171C27] text-white">30 minutes before</option>
            <option value="1_hour_before" className="bg-[#171C27] text-white">1 hour before</option>
            <option value="1_day_before" className="bg-[#171C27] text-white">1 day before</option>
            <option value="custom" className="bg-[#171C27] text-[#06B6D4]">+ Custom date/time...</option>
          </select>

          {reminder === 'custom' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <input
                type="date"
                value={customReminderDate}
                onChange={(e) => setCustomReminderDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
              />
              <input
                type="time"
                value={customReminderTime}
                onChange={(e) => setCustomReminderTime(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
          <Button variant="secondary" size="md" onClick={closeTaskModal}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={isEdit ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
          >
            {isEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
