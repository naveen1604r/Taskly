import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useTemplateContext } from '../../context/TemplateContext';
import { useGoalsContext } from '../../context/GoalsContext';
import { useTaskContext } from '../../context/TaskContext';
import { Check } from 'lucide-react';

export default function TemplateModal() {
  const { isTemplateModalOpen, editingTemplate, closeTemplateModal, addTemplate, updateTemplate } =
    useTemplateContext();
  const { goals } = useGoalsContext();
  const { categories = ['General', 'Work', 'Personal', 'Study', 'Health', 'Productivity'] } =
    useTaskContext();

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('General');
  const [duration, setDuration] = useState(60);
  const [goalId, setGoalId] = useState('');

  useEffect(() => {
    if (editingTemplate) {
      setName(editingTemplate.name || '');
      setTitle(editingTemplate.title || '');
      setDescription(editingTemplate.description || '');
      setPriority(editingTemplate.priority || 'medium');
      setCategory(editingTemplate.category || 'General');
      setDuration(editingTemplate.estimatedDuration || 60);
      setGoalId(editingTemplate.goalId || '');
    } else {
      setName('');
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('General');
      setDuration(60);
      setGoalId('');
    }
  }, [editingTemplate, isTemplateModalOpen]);

  if (!isTemplateModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !title.trim()) return;

    const templateData = {
      name: name.trim(),
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      estimatedDuration: Number(duration) || 60,
      goalId: goalId || null,
    };

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, templateData);
    } else {
      addTemplate(templateData);
    }
  };

  return (
    <Modal
      isOpen={isTemplateModalOpen}
      onClose={closeTemplateModal}
      title={editingTemplate ? 'Edit Task Template' : 'Create Task Template'}
      subtitle="Save a reusable blueprint to create tasks faster"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Template Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
            Template Name <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!title || title === name) {
                setTitle(e.target.value);
              }
            }}
            placeholder="e.g. Study Session Blueprint"
            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#171C27] text-white placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
          />
        </div>

        {/* Task Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
            Default Task Title <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Algorithm & React Practice"
            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#171C27] text-white placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
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
            placeholder="Default instructions or notes for this task..."
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
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
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

        {/* Duration & Goal Link */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="5"
              step="5"
              value={duration}
              onChange={(e) => setDuration(Math.max(5, parseInt(e.target.value, 10) || 30))}
              className="w-full px-3 py-2 text-xs bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Goal Link
            </label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
            >
              <option value="">None</option>
              {goals &&
                goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
          <Button variant="secondary" size="md" onClick={closeTemplateModal}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={<Check className="w-4 h-4" />}
          >
            {editingTemplate ? 'Save Changes' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
