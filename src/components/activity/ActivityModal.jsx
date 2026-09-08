import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useActivityContext } from '../../context/ActivityContext';
import { useTaskContext } from '../../context/TaskContext';
import { activityCategories } from './ActivityFilters';
import { calculateDurationFromTimes, formatDuration } from '../../utils/activityUtils';
import { Plus, Check, AlertCircle, Clock } from 'lucide-react';

export default function ActivityModal() {
  const {
    isActivityModalOpen,
    closeActivityModal,
    editingActivity,
    selectedDate,
    addActivity,
    updateActivity,
  } = useActivityContext();

  const { tasks } = useTaskContext();
  const isEdit = Boolean(editingActivity);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [duration, setDuration] = useState(60);
  const [category, setCategory] = useState('Coding');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [relatedTaskId, setRelatedTaskId] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState({});

  // Sync state when modal opens or editingActivity changes
  useEffect(() => {
    if (editingActivity) {
      setTitle(editingActivity.title || '');
      setDescription(editingActivity.description || '');
      setDate(editingActivity.date || selectedDate);
      setStartTime(editingActivity.startTime || '09:00');
      setEndTime(editingActivity.endTime || '10:00');
      setDuration(editingActivity.duration || 60);

      const isStandard = activityCategories.includes(editingActivity.category);
      if (isStandard) {
        setCategory(editingActivity.category);
        setIsCustomCategory(false);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setIsCustomCategory(true);
        setCustomCategory(editingActivity.category || '');
      }

      setRelatedTaskId(editingActivity.relatedTaskId || '');
      setNotes(editingActivity.notes || '');
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setDate(selectedDate);
      setStartTime('09:00');
      setEndTime('10:00');
      setDuration(60);
      setCategory('Coding');
      setIsCustomCategory(false);
      setCustomCategory('');
      setRelatedTaskId('');
      setNotes('');
    }
    setErrors({});
  }, [editingActivity, isActivityModalOpen, selectedDate]);

  // Recalculate duration whenever start or end time changes
  const handleStartTimeChange = (newStart) => {
    setStartTime(newStart);
    const calculated = calculateDurationFromTimes(newStart, endTime);
    setDuration(calculated);
  };

  const handleEndTimeChange = (newEnd) => {
    setEndTime(newEnd);
    const calculated = calculateDurationFromTimes(startTime, newEnd);
    setDuration(calculated);
  };

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
      newErrors.title = 'Activity title is required.';
    }
    if (!date) {
      newErrors.date = 'Date is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const resolvedCategory = isCustomCategory
      ? customCategory.trim() || 'General'
      : category;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      date,
      startTime,
      endTime,
      duration: Number(duration) > 0 ? Number(duration) : 60,
      category: resolvedCategory,
      relatedTaskId: relatedTaskId ? relatedTaskId : null,
      notes: notes.trim(),
    };

    if (isEdit) {
      updateActivity(editingActivity.id, payload);
    } else {
      addActivity(payload);
    }
  };

  return (
    <Modal
      isOpen={isActivityModalOpen}
      onClose={closeActivityModal}
      title={isEdit ? 'Edit Activity' : 'Log Daily Activity'}
      subtitle={isEdit ? 'Update your recorded activity journal.' : 'Record what you worked on and how you spent your time.'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Activity Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
            Activity Title <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
            }}
            placeholder="e.g. Practiced React Hooks"
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
            placeholder="Describe what you worked on..."
            rows={2}
            className="w-full px-3.5 py-2.5 text-sm bg-[#171C27] text-white placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Date, Start Time & End Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Date <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors((prev) => ({ ...prev, date: null }));
              }}
              className={`w-full px-3 py-2 text-xs sm:text-sm bg-[#171C27] text-white rounded-xl border transition-all focus:outline-none ${
                errors.date ? 'border-[#EF4444]' : 'border-white/[0.08] focus:border-[#7C3AED]'
              }`}
            />
            {errors.date && <p className="text-[11px] text-[#EF4444] mt-1">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => handleEndTimeChange(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
            />
          </div>
        </div>

        {/* Duration Calculation Indicator */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#171C27] border border-white/[0.06] text-xs">
          <div className="flex items-center gap-1.5 text-[#94A3B8]">
            <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>Calculated Duration:</span>
          </div>
          <div className="font-bold text-white flex items-center gap-2">
            <span className="text-[#06B6D4]">{formatDuration(duration)}</span>
            <span className="text-slate-500 font-normal">({duration} mins)</span>
          </div>
        </div>

        {/* Category & Custom Entry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Category
            </label>
            <select
              value={isCustomCategory ? 'custom_entry' : category}
              onChange={handleCategoryChange}
              className="w-full px-3.5 py-2.5 text-sm bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none cursor-pointer"
            >
              {activityCategories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#171C27] text-white">
                  {cat}
                </option>
              ))}
              <option value="custom_entry" className="bg-[#171C27] text-[#06B6D4]">
                + Custom Category...
              </option>
            </select>
          </div>

          {isCustomCategory && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                Custom Name
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Reading, Fitness"
                className="w-full px-3.5 py-2.5 text-sm bg-[#171C27] text-white placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
              />
            </div>
          )}

          {/* Related Task Dropdown */}
          <div className={isCustomCategory ? 'sm:col-span-2' : ''}>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Related Task <span className="text-[11px] text-slate-500 font-normal lowercase">(optional)</span>
            </label>
            <select
              value={relatedTaskId}
              onChange={(e) => setRelatedTaskId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none cursor-pointer truncate"
            >
              <option value="" className="bg-[#171C27] text-slate-400">
                No related task
              </option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id} className="bg-[#171C27] text-white">
                  {task.title} ({task.priority})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
            Notes <span className="text-[11px] text-slate-500 font-normal lowercase">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional insights, reflections, or blockers..."
            rows={2}
            className="w-full px-3.5 py-2.5 text-sm bg-[#171C27] text-white placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none resize-none"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
          <Button variant="secondary" size="md" onClick={closeActivityModal}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={isEdit ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
          >
            {isEdit ? 'Save Changes' : 'Save Activity'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
