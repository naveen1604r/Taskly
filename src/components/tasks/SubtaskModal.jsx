import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Edit2, AlertCircle } from 'lucide-react';
import Button from '../common/Button';

export default function SubtaskModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  title = 'Add Subtask',
}) {
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setSubtaskTitle(initialData.title || '');
        setPriority(initialData.priority || 'medium');
      } else {
        setSubtaskTitle('');
        setPriority('medium');
      }
      setError('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subtaskTitle.trim()) {
      setError('Please enter a subtask title');
      inputRef.current?.focus();
      return;
    }

    onSubmit({
      title: subtaskTitle.trim(),
      priority,
    });
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="subtask-modal-title"
    >
      <div
        className="w-full max-w-md bg-[#11151F] border border-white/[0.1] rounded-2xl p-5 sm:p-6 shadow-hover space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            {initialData ? (
              <Edit2 className="w-4 h-4 text-[#06B6D4]" />
            ) : (
              <Plus className="w-4 h-4 text-[#7C3AED]" />
            )}
            <h3 id="subtask-modal-title" className="text-base font-semibold text-white">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Subtask Title <span className="text-[#EF4444]">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={subtaskTitle}
              onChange={(e) => {
                setSubtaskTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Create Home Page"
              className="w-full bg-[#171C27] border border-white/[0.1] focus:border-[#7C3AED] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 transition-all"
            />
            {error && (
              <div className="flex items-center gap-1 text-xs text-[#EF4444] mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'low', label: 'Low', color: 'text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/10' },
                { key: 'medium', label: 'Medium', color: 'text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10' },
                { key: 'high', label: 'High', color: 'text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/10' },
              ].map((p) => {
                const isSelected = priority === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPriority(p.key)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? `${p.color} ring-1 ring-white/20`
                        : 'bg-[#171C27] border-white/[0.08] text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
            <Button variant="secondary" size="sm" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {initialData ? 'Update Subtask' : 'Add Subtask'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
