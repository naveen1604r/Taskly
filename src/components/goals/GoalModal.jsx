import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useGoalsContext } from '../../context/GoalsContext';
import { goalCategories } from '../../utils/goalUtils';
import { getTodayDateString, getOffsetDateString } from '../../utils/taskStorage';
import {
  Target,
  Briefcase,
  Compass,
  Award,
  BookOpen,
  CheckCircle2,
  Plus,
  Check,
  AlertCircle
} from 'lucide-react';

const availableIcons = [
  { id: 'Target', label: 'Target', icon: Target },
  { id: 'Briefcase', label: 'Work', icon: Briefcase },
  { id: 'Compass', label: 'Guide', icon: Compass },
  { id: 'Award', label: 'Milestone', icon: Award },
  { id: 'BookOpen', label: 'Study', icon: BookOpen },
  { id: 'CheckCircle2', label: 'Success', icon: CheckCircle2 },
];

export default function GoalModal() {
  const {
    isGoalModalOpen,
    closeGoalModal,
    editingGoal,
    addGoal,
    updateGoal,
  } = useGoalsContext();

  const isEdit = Boolean(editingGoal);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Learning');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [targetDate, setTargetDate] = useState(getOffsetDateString(30));
  const [progressMode, setProgressMode] = useState('manual');
  const [progress, setProgress] = useState(0);
  const [icon, setIcon] = useState('Target');

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title || '');
      setDescription(editingGoal.description || '');

      const isKnown = goalCategories.includes(editingGoal.category);
      if (isKnown) {
        setCategory(editingGoal.category);
        setIsCustomCategory(false);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setIsCustomCategory(true);
        setCustomCategory(editingGoal.category || '');
      }

      setPriority(editingGoal.priority || 'medium');
      setStartDate(editingGoal.startDate || getTodayDateString());
      setTargetDate(editingGoal.targetDate || getOffsetDateString(30));
      setProgressMode(editingGoal.progressMode || 'manual');
      setProgress(editingGoal.progress || 0);
      setIcon(editingGoal.icon || 'Target');
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('Learning');
      setIsCustomCategory(false);
      setCustomCategory('');
      setPriority('medium');
      setStartDate(getTodayDateString());
      setTargetDate(getOffsetDateString(30));
      setProgressMode('manual');
      setProgress(0);
      setIcon('Target');
    }
    setErrors({});
  }, [editingGoal, isGoalModalOpen]);

  const handleCategorySelect = (e) => {
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
      newErrors.title = 'Goal name is required.';
    }
    if (!targetDate) {
      newErrors.targetDate = 'Target date is required.';
    } else if (startDate && targetDate < startDate) {
      newErrors.targetDate = 'Target date must be after the start date.';
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
      category: resolvedCategory,
      priority,
      startDate,
      targetDate,
      progressMode,
      progress: Number(progress) || 0,
      icon,
    };

    if (isEdit) {
      updateGoal(editingGoal.id, payload);
    } else {
      addGoal(payload);
    }
  };

  return (
    <Modal
      isOpen={isGoalModalOpen}
      onClose={closeGoalModal}
      title={isEdit ? 'Edit Goal' : 'Create New Goal'}
      subtitle={isEdit ? 'Update your objective and parameters.' : 'Define something meaningful and track your progress.'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Goal Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
            Goal Name <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
            }}
            placeholder="e.g. Become a Full Stack Developer"
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
            placeholder="Describe what you want to achieve..."
            rows={2}
            className="w-full px-3.5 py-2.5 text-sm bg-[#171C27] text-white placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Category & Icon Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Category
            </label>
            <select
              value={isCustomCategory ? 'custom_entry' : category}
              onChange={handleCategorySelect}
              className="w-full px-3.5 py-2.5 text-sm bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none cursor-pointer"
            >
              {goalCategories.map((cat) => (
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
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                Custom Category Name
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Wellness, Startup"
                className="w-full px-3.5 py-2.5 text-sm bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
              />
            </div>
          )}

          {/* Visual Icon Identifier */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Visual Identifier
            </label>
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#171C27] border border-white/[0.08]">
              {availableIcons.map((item) => {
                const Icon = item.icon;
                const isSelected = icon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIcon(item.id)}
                    className={`flex-1 p-2 rounded-lg transition-all flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#7C3AED] text-white shadow-glow-primary'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Priority Selector */}
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

        {/* Start Date & Target Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Target Date <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => {
                setTargetDate(e.target.value);
                if (errors.targetDate) setErrors((prev) => ({ ...prev, targetDate: null }));
              }}
              className={`w-full px-3 py-2 text-xs sm:text-sm bg-[#171C27] text-white rounded-xl border transition-all focus:outline-none ${
                errors.targetDate ? 'border-[#EF4444]' : 'border-white/[0.08] focus:border-[#7C3AED]'
              }`}
            />
            {errors.targetDate && (
              <p className="text-[11px] text-[#EF4444] mt-1">{errors.targetDate}</p>
            )}
          </div>
        </div>

        {/* Progress Mode & Manual Progress adjustment */}
        <div className="space-y-3 p-3.5 rounded-xl bg-[#171C27]/60 border border-white/[0.06]">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            Progress Calculation Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'manual', label: 'Manual' },
              { id: 'task', label: 'Task Based' },
              { id: 'milestone', label: 'Milestone Based' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setProgressMode(mode.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                  progressMode === mode.id
                    ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-subtle'
                    : 'bg-[#171C27] text-slate-400 border-white/[0.08] hover:text-white'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {progressMode === 'manual' ? (
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Manual Progress:</span>
                <span className="text-[#06B6D4] font-bold">{progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-[#7C3AED] cursor-pointer"
              />
            </div>
          ) : progressMode === 'task' ? (
            <p className="text-xs text-[#94A3B8] italic">
              Progress will automatically calculate based on completed linked tasks.
            </p>
          ) : (
            <p className="text-xs text-[#94A3B8] italic">
              Progress will automatically calculate based on completed milestones.
            </p>
          )}
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
          <Button variant="secondary" size="md" onClick={closeGoalModal}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={isEdit ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
          >
            {isEdit ? 'Save Changes' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
