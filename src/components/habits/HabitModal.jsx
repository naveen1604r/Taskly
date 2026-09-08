import React, { useState, useEffect } from 'react';
import { useHabitContext } from '../../context/HabitContext';
import { useGoalsContext } from '../../context/GoalsContext';
import { useProjectContext } from '../../context/ProjectContext';
import { HABIT_CATEGORIES, ROUTINE_GROUPS } from '../../utils/habitUtils';
import Button from '../common/Button';
import {
  X,
  Plus,
  Flame,
  Droplet,
  BookOpen,
  Dumbbell,
  Code,
  Brain,
  Smile,
  Footprints,
  Moon,
  PenTool,
  Compass,
  Heart,
  Zap,
  Target,
  Coffee,
  Clock,
  FolderKanban,
  Check,
} from 'lucide-react';

const AVAILABLE_ICONS = [
  { id: 'Droplet', icon: Droplet, label: 'Water' },
  { id: 'BookOpen', icon: BookOpen, label: 'Read' },
  { id: 'Dumbbell', icon: Dumbbell, label: 'Fitness' },
  { id: 'Code', icon: Code, label: 'Coding' },
  { id: 'Brain', icon: Brain, label: 'Mind' },
  { id: 'Smile', icon: Smile, label: 'Mood' },
  { id: 'Footprints', icon: Footprints, label: 'Walk' },
  { id: 'Moon', icon: Moon, label: 'Sleep' },
  { id: 'PenTool', icon: PenTool, label: 'Write' },
  { id: 'Compass', icon: Compass, label: 'Explore' },
  { id: 'Heart', icon: Heart, label: 'Health' },
  { id: 'Zap', icon: Zap, label: 'Energy' },
  { id: 'Target', icon: Target, label: 'Focus' },
  { id: 'Coffee', icon: Coffee, label: 'Routine' },
  { id: 'Flame', icon: Flame, label: 'Habit' },
];

const AVAILABLE_COLORS = [
  '#7C3AED',
  '#06B6D4',
  '#22C55E',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#8B5CF6',
  '#14B8A6',
];

const DAYS_OF_WEEK = [
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
  { id: 0, label: 'Sun' },
];

export default function HabitModal() {
  const { isHabitModalOpen, closeHabitModal, editingHabit, addHabit, updateHabit } = useHabitContext();
  const { goals = [] } = useGoalsContext() || {};
  const { projects = [] } = useProjectContext() || {};

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Flame');
  const [color, setColor] = useState('#7C3AED');
  const [category, setCategory] = useState('Health');
  const [routineGroup, setRoutineGroup] = useState('morning');
  const [frequencyType, setFrequencyType] = useState('daily'); // 'daily' | 'weekdays' | 'weekly' | 'custom'
  const [customDays, setCustomDays] = useState([1, 2, 3, 4, 5]);
  const [targetCount, setTargetCount] = useState(1);
  const [unit, setUnit] = useState('session');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [goalId, setGoalId] = useState('');
  const [projectId, setProjectId] = useState('');

  const isEdit = Boolean(editingHabit && editingHabit.id);

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name || '');
      setDescription(editingHabit.description || '');
      setIcon(editingHabit.icon || 'Flame');
      setColor(editingHabit.color || '#7C3AED');
      setCategory(editingHabit.category || 'Health');
      setRoutineGroup(editingHabit.routineGroup || 'morning');
      setTargetCount(editingHabit.targetCount || 1);
      setUnit(editingHabit.unit || 'session');
      setReminderEnabled(Boolean(editingHabit.reminderEnabled));
      setReminderTime(editingHabit.reminderTime || '09:00');
      setGoalId(editingHabit.goalId || '');
      setProjectId(editingHabit.projectId || '');

      if (typeof editingHabit.frequency === 'object' && editingHabit.frequency !== null) {
        setFrequencyType('custom');
        setCustomDays(editingHabit.frequency.days || [1, 2, 3, 4, 5]);
      } else {
        setFrequencyType(editingHabit.frequency || 'daily');
      }
    } else {
      setName('');
      setDescription('');
      setIcon('Flame');
      setColor('#7C3AED');
      setCategory('Health');
      setRoutineGroup('morning');
      setFrequencyType('daily');
      setCustomDays([1, 2, 3, 4, 5]);
      setTargetCount(1);
      setUnit('session');
      setReminderEnabled(true);
      setReminderTime('09:00');
      setGoalId('');
      setProjectId('');
    }
  }, [editingHabit, isHabitModalOpen]);

  if (!isHabitModalOpen) return null;

  const toggleCustomDay = (dayId) => {
    if (customDays.includes(dayId)) {
      if (customDays.length > 1) {
        setCustomDays(customDays.filter((d) => d !== dayId));
      }
    } else {
      setCustomDays([...customDays, dayId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalFrequency = frequencyType;
    if (frequencyType === 'custom') {
      finalFrequency = { type: 'custom', days: customDays };
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      category,
      routineGroup,
      frequency: finalFrequency,
      targetCount: Math.max(1, Number(targetCount) || 1),
      unit: unit.trim() || 'session',
      reminderEnabled,
      reminderTime,
      goalId: goalId || null,
      projectId: projectId || null,
    };

    if (isEdit) {
      updateHabit(editingHabit.id, payload);
    } else {
      addHabit(payload);
    }

    closeHabitModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={closeHabitModal}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg bg-[#11151F] border border-white/[0.1] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-xl border shadow-sm"
              style={{ backgroundColor: `${color}20`, borderColor: `${color}40`, color }}
            >
              <Flame className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEdit ? 'Edit Habit' : 'Create New Habit'}
              </h3>
              <p className="text-xs text-slate-400">Build consistency one day at a time</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeHabitModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name & Description */}
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                Habit Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Read 20 minutes, Drink water, Practice code"
                className="w-full bg-[#171C27] border border-white/[0.1] focus:border-[#7C3AED] rounded-2xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                Description / Purpose
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why is this habit important to you? What is your routine cue?"
                rows={2}
                className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-3 py-1.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#7C3AED] resize-none"
              />
            </div>
          </div>

          {/* Icon & Color Selection */}
          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 font-bold uppercase block">
              Icon & Accent Color
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-[#171C27]/60 border border-white/[0.04]">
              {AVAILABLE_ICONS.map((item) => {
                const IconComp = item.icon;
                const isSelected = icon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIcon(item.id)}
                    className={`p-2 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/40'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                    title={item.label}
                  >
                    <IconComp className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Color Swatches */}
            <div className="flex items-center gap-2 pt-1">
              {AVAILABLE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Category & Routine Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
              >
                {HABIT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                Daily Routine Group
              </label>
              <select
                value={routineGroup}
                onChange={(e) => setRoutineGroup(e.target.value)}
                className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
              >
                {ROUTINE_GROUPS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target & Measurable Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                Target Daily Count
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={targetCount}
                onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none font-mono"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {targetCount === 1 ? '1 = Simple Complete / Incomplete' : `Target: ${targetCount} ${unit}`}
              </span>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                Measurement Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. glasses, minutes, pages"
                className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Frequency Selector */}
          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 font-bold uppercase block">
              Frequency Schedule
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'daily', label: 'Daily' },
                { id: 'weekdays', label: 'Weekdays' },
                { id: 'weekly', label: 'Weekly' },
                { id: 'custom', label: 'Custom' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFrequencyType(f.id)}
                  className={`p-2 rounded-xl border text-center font-semibold transition-all ${
                    frequencyType === f.id
                      ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-white'
                      : 'bg-[#171C27]/60 border-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {frequencyType === 'custom' && (
              <div className="flex items-center justify-between gap-1 p-2 rounded-2xl bg-[#171C27]/60 border border-white/[0.04] mt-2">
                {DAYS_OF_WEEK.map((d) => {
                  const isSelected = customDays.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleCustomDay(d.id)}
                      className={`w-9 h-9 rounded-xl font-bold transition-all text-xs flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#7C3AED] text-white shadow-sm'
                          : 'bg-white/[0.04] text-slate-400 hover:text-white'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reminder Settings */}
          <div className="p-3.5 rounded-2xl bg-[#171C27]/60 border border-white/[0.04] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#06B6D4]" />
              <div>
                <span className="font-bold text-white block">Daily Reminder</span>
                <span className="text-[10px] text-slate-400">Get an in-app alert when habit is pending</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                disabled={!reminderEnabled}
                className="bg-[#11151F] border border-white/[0.08] text-white rounded-xl px-2 py-1 text-xs focus:outline-none disabled:opacity-40"
              />
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#7C3AED] rounded"
              />
            </div>
          </div>

          {/* Goal & Project Linkage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                Link to Goal (Optional)
              </label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
              >
                <option value="">None (Standalone habit)</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                Link to Project (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
              >
                <option value="">None (Standalone habit)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
            <Button variant="ghost" size="sm" type="button" onClick={closeHabitModal}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={!name.trim()}>
              {isEdit ? 'Save Changes' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
