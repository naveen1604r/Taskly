import React, { useState, useEffect, useRef } from 'react';
import { useInboxContext } from '../../context/InboxContext';
import { useHabitContext } from '../../context/HabitContext';
import { INBOX_TYPES } from '../../utils/inboxUtils';
import Button from '../common/Button';
import {
  Sparkles,
  X,
  Plus,
  CheckSquare,
  FileText,
  Bell,
  Lightbulb,
  ArrowRightCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Flame,
} from 'lucide-react';

const iconMap = {
  CheckSquare,
  Flame,
  FileText,
  Bell,
  Lightbulb,
  ArrowRightCircle,
};

export default function QuickCaptureModal() {
  const { isQuickCaptureOpen, closeQuickCapture, addInboxItem } = useInboxContext();
  const { openCreateHabitModal } = useHabitContext() || {};

  const inputRef = useRef(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('task');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [estimatedDuration, setEstimatedDuration] = useState(30);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isRapidMode, setIsRapidMode] = useState(false);
  const [lastCapturedTitle, setLastCapturedTitle] = useState(null);

  useEffect(() => {
    if (isQuickCaptureOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setTitle('');
      setDescription('');
      setTags([]);
      setTagInput('');
      setShowAdvanced(false);
      setLastCapturedTitle(null);
    }
  }, [isQuickCaptureOpen]);

  if (!isQuickCaptureOpen) return null;

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (t) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'habit' && openCreateHabitModal) {
      closeQuickCapture();
      openCreateHabitModal({
        name: title.trim(),
        description: description.trim(),
        category: category.trim() || 'Health',
      });
      setTitle('');
      setDescription('');
      return;
    }

    addInboxItem({
      title: title.trim(),
      type,
      priority,
      description: description.trim(),
      category: category.trim() || 'General',
      tags,
      estimatedDuration: Number(estimatedDuration) || 30,
      source: 'quick_capture',
    });

    setLastCapturedTitle(title.trim());
    setTitle('');
    setDescription('');
    setTags([]);
    setTagInput('');

    if (isRapidMode) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      closeQuickCapture();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={closeQuickCapture}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg bg-[#11151F] border border-white/[0.1] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Quick Capture</h3>
              <p className="text-xs text-slate-400">Capture thoughts now, organize later</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeQuickCapture}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rapid Mode Feedback */}
        {lastCapturedTitle && isRapidMode && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold flex items-center justify-between animate-in fade-in duration-100">
            <span className="truncate">✓ Captured "{lastCapturedTitle}"</span>
            <span className="text-[10px] text-slate-400 font-normal">Ready for next</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Main Title Input */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
              What do you want to capture?
            </label>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task, idea, or reminder..."
              className="w-full bg-[#171C27] border border-white/[0.1] focus:border-[#7C3AED] rounded-2xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none shadow-xs"
            />
          </div>

          {/* Type Selector Pills */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase block">
              Capture Type
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {INBOX_TYPES.map((t) => {
                const Icon = iconMap[t.icon] || CheckSquare;
                const isSelected = type === t.id;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-white font-bold'
                        : 'bg-[#171C27]/60 border-white/[0.04] text-slate-400 hover:text-white hover:border-white/[0.1]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#7C3AED]" />
                    <span className="text-[11px] truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Pills */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase block">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'low', label: 'Low', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
                { id: 'medium', label: 'Medium', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
                { id: 'high', label: 'High', color: 'border-rose-500/40 text-rose-400 bg-rose-500/10' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={`p-1.5 rounded-xl border font-bold transition-all text-center ${
                    priority === p.id
                      ? p.color
                      : 'bg-[#171C27]/40 border-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Collapsible Advanced Details */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-slate-400 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
            >
              <span>{showAdvanced ? 'Hide Details' : '+ Add Description, Category, Tags'}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="p-3 rounded-2xl bg-[#171C27]/60 border border-white/[0.04] space-y-3 mt-2 animate-in fade-in duration-100">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add extra context or notes..."
                    rows={2}
                    className="w-full bg-[#11151F] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#7C3AED] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Work, Personal"
                      className="w-full bg-[#11151F] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                      className="w-full bg-[#11151F] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Tag Input */}
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                    Tags (Press Enter)
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tags..."
                    className="w-full bg-[#11151F] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                  />
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-lg bg-white/[0.06] text-white text-[10px] flex items-center gap-1"
                        >
                          #{t}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="text-slate-400 hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer & Rapid Mode Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
            <label className="flex items-center gap-2 text-slate-400 hover:text-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isRapidMode}
                onChange={(e) => setIsRapidMode(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#7C3AED] rounded"
              />
              <span className="text-[11px] font-medium">Rapid Capture Mode (stay open)</span>
            </label>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button variant="ghost" size="sm" type="button" onClick={closeQuickCapture}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={!title.trim()}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Capture to Inbox
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
