import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useNotesContext } from '../../context/NotesContext';
import { noteCategories } from './NotesFilters';
import { Plus, Check, Pin, X, AlertCircle } from 'lucide-react';

export default function NoteModal() {
  const {
    isNoteModalOpen,
    closeNoteModal,
    editingNote,
    createNote,
    updateNote,
  } = useNotesContext();

  const isEdit = Boolean(editingNote);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [pinned, setPinned] = useState(false);

  const [errors, setErrors] = useState({});

  // Sync state when modal opens or editingNote changes
  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title || '');
      setContent(editingNote.content || '');

      const isKnown = noteCategories.includes(editingNote.category);
      if (isKnown) {
        setCategory(editingNote.category);
        setIsCustomCategory(false);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setIsCustomCategory(true);
        setCustomCategory(editingNote.category || '');
      }

      setTags(Array.isArray(editingNote.tags) ? [...editingNote.tags] : []);
      setPinned(Boolean(editingNote.pinned));
    } else {
      // Reset form
      setTitle('');
      setContent('');
      setCategory('General');
      setIsCustomCategory(false);
      setCustomCategory('');
      setTags([]);
      setPinned(false);
    }
    setTagInput('');
    setErrors({});
  }, [editingNote, isNoteModalOpen]);

  // Handle category selection
  const handleCategorySelect = (e) => {
    const val = e.target.value;
    if (val === 'custom_entry') {
      setIsCustomCategory(true);
    } else {
      setIsCustomCategory(false);
      setCategory(val);
    }
  };

  // Add tag on Enter or comma
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addCurrentTag();
    }
  };

  const addCurrentTag = () => {
    const clean = tagInput.replace(/^#/, '').trim().toLowerCase();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Note title is required.';
    }
    if (!content.trim()) {
      newErrors.content = 'Note content is required.';
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
      content: content.trim(),
      category: resolvedCategory,
      tags,
      pinned,
    };

    if (isEdit) {
      updateNote(editingNote.id, payload);
    } else {
      createNote(payload);
    }
  };

  // Ctrl+Enter to submit
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Modal
      isOpen={isNoteModalOpen}
      onClose={closeNoteModal}
      title={isEdit ? 'Edit Note' : 'Create New Note'}
      subtitle={isEdit ? 'Modify your note and save updates.' : 'Capture ideas, study points, and important information.'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4 sm:space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
            Note Title <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
            }}
            placeholder="Enter note title"
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

        {/* Content (Large Textarea) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
            Note Content <span className="text-[#EF4444]">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errors.content) setErrors((prev) => ({ ...prev, content: null }));
            }}
            placeholder="Write your note here... (Markdown & plain text supported)"
            rows={7}
            className={`w-full p-3.5 text-sm bg-[#171C27] text-white placeholder-slate-500 rounded-xl border transition-all focus:outline-none resize-y leading-relaxed ${
              errors.content
                ? 'border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]'
                : 'border-white/[0.08] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]'
            }`}
          />
          {errors.content && (
            <p className="flex items-center gap-1 text-xs text-[#EF4444] mt-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.content}</span>
            </p>
          )}
        </div>

        {/* Category & Custom Category */}
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
              {noteCategories.map((cat) => (
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
                placeholder="e.g. Architecture, Research"
                className="w-full px-3.5 py-2.5 text-sm bg-[#171C27] text-white placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
              />
            </div>
          )}

          {/* Pin toggle button */}
          <div className={`flex items-end ${isCustomCategory ? 'sm:col-span-2' : ''}`}>
            <button
              type="button"
              onClick={() => setPinned(!pinned)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                pinned
                  ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40 shadow-subtle'
                  : 'bg-[#171C27] text-slate-400 border-white/[0.08] hover:text-white hover:bg-[#1f2635]'
              }`}
            >
              <Pin className={`w-4 h-4 ${pinned ? 'fill-[#F59E0B]' : ''}`} />
              <span>{pinned ? 'Pinned to Top of Notes' : '☆ Pin this note'}</span>
            </button>
          </div>
        </div>

        {/* Tags with removable chips */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
            Tags <span className="text-[11px] text-slate-500 font-normal lowercase">(press Enter or comma to add)</span>
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="e.g. react, hooks, roadmap"
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-[#171C27] text-white placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
            />
            <button
              type="button"
              onClick={addCurrentTag}
              className="px-3 py-2 text-xs font-semibold bg-[#171C27] hover:bg-[#1f2635] text-slate-200 hover:text-white rounded-xl border border-white/[0.08] transition-colors"
            >
              Add
            </button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-[#171C27]/50 border border-white/[0.04]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#7C3AED]/15 text-[#c4b5fd] border border-[#7C3AED]/30"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="p-0.5 hover:text-white rounded-md transition-colors"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
          <span className="hidden sm:inline text-[11px] text-slate-500">
            Tip: Press <kbd className="px-1.5 py-0.5 bg-[#171C27] border border-white/[0.08] rounded">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-[#171C27] border border-white/[0.08] rounded">Enter</kbd> to save
          </span>
          <div className="flex items-center gap-3 ml-auto">
            <Button variant="secondary" size="md" onClick={closeNoteModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={isEdit ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
            >
              {isEdit ? 'Save Changes' : 'Save Note'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
