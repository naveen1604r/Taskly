import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Clock,
  Check,
  X,
} from 'lucide-react';

const priorityBadges = {
  high: {
    label: 'High',
    styles: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20',
    dot: 'bg-[#EF4444]',
  },
  medium: {
    label: 'Medium',
    styles: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20',
    dot: 'bg-[#F59E0B]',
  },
  low: {
    label: 'Low',
    styles: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20',
    dot: 'bg-[#22C55E]',
  },
};

export default function SubtaskItem({
  subtask,
  index,
  totalCount,
  onToggle,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isCompact = false,
}) {
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [editedTitle, setEditedTitle] = useState(subtask.title);
  const [editedPriority, setEditedPriority] = useState(subtask.priority || 'medium');

  const priority = priorityBadges[subtask.priority] || priorityBadges.medium;
  const isCompleted = Boolean(subtask.completed);

  const handleSaveInline = () => {
    if (editedTitle.trim()) {
      onEdit(subtask.id, {
        title: editedTitle.trim(),
        priority: editedPriority,
      });
      setIsEditingInline(false);
    }
  };

  const handleCancelInline = () => {
    setEditedTitle(subtask.title);
    setEditedPriority(subtask.priority || 'medium');
    setIsEditingInline(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveInline();
    } else if (e.key === 'Escape') {
      handleCancelInline();
    }
  };

  // Compact Checklist rendering
  if (isCompact) {
    return (
      <div
        className={`group flex items-center justify-between gap-3 px-3 py-2 rounded-xl border transition-all duration-150 ${
          isCompleted
            ? 'bg-[#171C27]/40 border-white/[0.04] opacity-75'
            : 'bg-[#171C27] border-white/[0.06] hover:border-white/[0.14]'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onToggle(subtask.id)}
            className="shrink-0 text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] rounded"
            aria-label={isCompleted ? `Mark "${subtask.title}" as incomplete` : `Mark "${subtask.title}" as completed`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            ) : (
              <Circle className="w-4 h-4 text-[#94A3B8] group-hover:text-white" />
            )}
          </button>

          <span
            className={`text-sm truncate transition-all ${
              isCompleted ? 'text-slate-400 line-through' : 'text-slate-200'
            }`}
          >
            {subtask.title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${priority.styles}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
            {priority.label}
          </span>

          <button
            type="button"
            onClick={() => onDelete(subtask.id)}
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-[#EF4444] transition-all rounded"
            title="Delete subtask"
            aria-label={`Delete "${subtask.title}"`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Normal List View rendering
  return (
    <div
      className={`group relative p-3.5 rounded-2xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-[#171C27]/45 border-white/[0.04] opacity-80'
          : 'bg-[#171C27] border-white/[0.08] hover:border-white/[0.18] shadow-sm'
      }`}
    >
      {isEditingInline ? (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="flex-1 bg-[#11151F] border border-[#7C3AED]/50 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              placeholder="Subtask title"
            />
            <select
              value={editedPriority}
              onChange={(e) => setEditedPriority(e.target.value)}
              className="bg-[#11151F] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelInline}
              className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleSaveInline}
              disabled={!editedTitle.trim()}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          {/* Left: Checkbox & Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => onToggle(subtask.id)}
              className="shrink-0 text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] rounded-lg p-0.5"
              aria-label={isCompleted ? `Mark "${subtask.title}" as incomplete` : `Mark "${subtask.title}" as completed`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
              ) : (
                <Circle className="w-5 h-5 text-[#94A3B8] group-hover:text-white" />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium truncate ${
                  isCompleted ? 'text-slate-400 line-through' : 'text-white'
                }`}
              >
                {subtask.title}
              </p>
              {subtask.completedAt && (
                <span className="flex items-center gap-1 text-[10px] text-[#22C55E]/80 mt-0.5 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>Done {new Date(subtask.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </span>
              )}
            </div>
          </div>

          {/* Right: Priority Badge, Reorder & Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Priority Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${priority.styles}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
              {priority.label}
            </span>

            {/* Reorder Buttons */}
            <div className="flex items-center opacity-70 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onMoveUp(index)}
                disabled={index === 0}
                className="p-1 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:text-slate-400 rounded transition-colors"
                title="Move up"
                aria-label="Move subtask up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onMoveDown(index)}
                disabled={index === totalCount - 1}
                className="p-1 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:text-slate-400 rounded transition-colors"
                title="Move down"
                aria-label="Move subtask down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Edit Button */}
            <button
              type="button"
              onClick={() => setIsEditingInline(true)}
              className="p-1 text-slate-400 hover:text-[#06B6D4] transition-colors rounded"
              title="Edit subtask"
              aria-label={`Edit "${subtask.title}"`}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => onDelete(subtask.id)}
              className="p-1 text-slate-400 hover:text-[#EF4444] transition-colors rounded"
              title="Delete subtask"
              aria-label={`Delete "${subtask.title}"`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
