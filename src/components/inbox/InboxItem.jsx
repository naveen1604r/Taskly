import React from 'react';
import { useInboxContext } from '../../context/InboxContext';
import { formatNotificationTime } from '../../utils/notificationUtils';
import { INBOX_TYPES } from '../../utils/inboxUtils';
import {
  CheckSquare,
  FileText,
  Bell,
  Lightbulb,
  ArrowRightCircle,
  Clock,
  Tag,
  Archive,
  Trash2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

const iconMap = {
  CheckSquare,
  FileText,
  Bell,
  Lightbulb,
  ArrowRightCircle,
};

const priorityBadges = {
  high: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/25',
  medium: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25',
  low: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/25',
};

export default function InboxItem({ item, isSelected, onToggleSelect }) {
  const { openProcessModal, archiveInboxItem, deleteInboxItem, restoreInboxItem } =
    useInboxContext();

  const typeConfig = INBOX_TYPES.find((t) => t.id === item.type) || INBOX_TYPES[0];
  const Icon = iconMap[typeConfig.icon] || CheckSquare;

  const isProcessed = item.status === 'processed';
  const isArchived = item.status === 'archived';

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs group ${
        isSelected
          ? 'bg-[#7C3AED]/10 border-[#7C3AED]/50'
          : isProcessed
          ? 'bg-[#11151F]/50 border-white/[0.04] opacity-75'
          : isArchived
          ? 'bg-[#11151F]/40 border-white/[0.03] opacity-60'
          : 'bg-[#171C27] border-white/[0.08] hover:border-white/[0.18]'
      }`}
    >
      {/* Left: Checkbox + Icon + Details */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Bulk Selection Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(item.id)}
          className="w-4 h-4 accent-[#7C3AED] rounded mt-0.5 cursor-pointer shrink-0"
        />

        <div className={`p-2 rounded-xl border shrink-0 ${typeConfig.color}`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4
              onClick={() => openProcessModal(item)}
              className={`font-bold hover:text-[#c4b5fd] cursor-pointer transition-colors truncate ${
                isProcessed ? 'line-through text-slate-400' : 'text-white'
              }`}
            >
              {item.title}
            </h4>

            <span className={`px-2 py-0.2 rounded-md font-semibold text-[10px] uppercase border ${typeConfig.color}`}>
              {typeConfig.label}
            </span>

            <span
              className={`px-1.5 py-0.2 rounded-md font-semibold text-[10px] uppercase border ${
                priorityBadges[item.priority] || priorityBadges.medium
              }`}
            >
              {item.priority}
            </span>

            {isProcessed && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.2 rounded-md border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>Processed</span>
              </span>
            )}
          </div>

          {item.description && (
            <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">
              {item.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
            <span>{formatNotificationTime(item.capturedAt || item.createdAt)}</span>
            {item.category && (
              <>
                <span>•</span>
                <span>{item.category}</span>
              </>
            )}
            {item.estimatedDuration && (
              <>
                <span>•</span>
                <span className="font-mono">{item.estimatedDuration}m</span>
              </>
            )}
            {item.tags?.length > 0 && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  {item.tags.map((t) => (
                    <span key={t} className="text-[#06B6D4]">
                      #{t}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
        {!isProcessed && !isArchived && (
          <button
            type="button"
            onClick={() => openProcessModal(item)}
            className="px-3 py-1.5 rounded-xl bg-[#7C3AED]/20 hover:bg-[#7C3AED] text-[#c4b5fd] hover:text-white border border-[#7C3AED]/30 font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Process</span>
          </button>
        )}

        {isProcessed || isArchived ? (
          <button
            type="button"
            onClick={() => restoreInboxItem(item.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Restore to Unprocessed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => archiveInboxItem(item.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Archive Item"
          >
            <Archive className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => deleteInboxItem(item.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
          title="Delete Item"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
