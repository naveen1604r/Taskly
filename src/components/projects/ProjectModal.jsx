import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { useGoalsContext } from '../../context/GoalsContext';
import {
  X,
  Folder,
  Globe,
  Smartphone,
  Palette,
  Briefcase,
  Code2,
  Rocket,
  Sparkles,
  Layers,
  AlertCircle,
} from 'lucide-react';
import Button from '../common/Button';

const iconMap = {
  Folder: Folder,
  Globe: Globe,
  Smartphone: Smartphone,
  Palette: Palette,
  Briefcase: Briefcase,
  Code2: Code2,
  Rocket: Rocket,
  Sparkles: Sparkles,
  Layers: Layers,
};

const colorOptions = [
  '#7C3AED', // Purple
  '#06B6D4', // Cyan
  '#22C55E', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#EF4444', // Red
];

export default function ProjectModal({ isOpen, onClose, editingProject = null }) {
  const { addProject, updateProject } = useProjectContext();
  const { goals } = useGoalsContext();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#7C3AED');
  const [icon, setIcon] = useState('Folder');
  const [priority, setPriority] = useState('medium');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [goalId, setGoalId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name || '');
      setDescription(editingProject.description || '');
      setColor(editingProject.color || '#7C3AED');
      setIcon(editingProject.icon || 'Folder');
      setPriority(editingProject.priority || 'medium');
      setStartDate(editingProject.startDate || '');
      setDueDate(editingProject.dueDate || '');
      setGoalId(editingProject.goalId || '');
    } else {
      setName('');
      setDescription('');
      setColor('#7C3AED');
      setIcon('Folder');
      setPriority('medium');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDueDate('');
      setGoalId('');
    }
    setError('');
  }, [editingProject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }

    if (startDate && dueDate && dueDate < startDate) {
      setError('Due date cannot be earlier than the start date.');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      color,
      icon,
      priority,
      startDate,
      dueDate,
      goalId: goalId || null,
    };

    if (editingProject) {
      updateProject(editingProject.id, payload);
    } else {
      addProject(payload);
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg bg-[#11151F] border border-white/[0.1] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 shrink-0">
          <div>
            <h3 className="text-base font-bold text-white">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h3>
            <p className="text-xs text-slate-400">
              {editingProject ? 'Update project scope and milestones' : 'Organize tasks into cohesive strategic deliverables'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* Project Name */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Website Redesign & Launch"
              className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of the goals, milestones, and deliverables..."
              rows={3}
              className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED] resize-none"
            />
          </div>

          {/* Color & Icon Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Accent Color</label>
              <div className="flex items-center gap-2">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#11151F]' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Icon</label>
              <div className="flex flex-wrap items-center gap-1.5">
                {Object.keys(iconMap).map((iconKey) => {
                  const IconComp = iconMap[iconKey];
                  const isSelected = icon === iconKey;
                  return (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => setIcon(iconKey)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-xs'
                          : 'bg-[#171C27] border-white/[0.08] text-slate-400 hover:text-white'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Priority & Goal Linkage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-[#171C27] border border-white/[0.08] text-white rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Linked Goal (Optional)</label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full bg-[#171C27] border border-white/[0.08] text-white rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="">None (Independent)</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timeline: Start Date & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Target Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
