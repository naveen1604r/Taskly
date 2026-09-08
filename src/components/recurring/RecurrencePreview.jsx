import React from 'react';
import { getRecurrencePreviewDates, parseLocalDate } from '../../utils/recurrenceUtils';
import { Calendar, Clock, Sparkles } from 'lucide-react';

export default function RecurrencePreview({ recurrence, taskTitle = 'Task', plannedStartTime }) {
  const previewDates = getRecurrencePreviewDates(recurrence, [], 5);

  const formatPreviewDate = (dateStr) => {
    const p = parseLocalDate(dateStr);
    if (!p) return dateStr;
    const d = new Date(p.year, p.month - 1, p.day);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (previewDates.length === 0) {
    return (
      <div className="p-3 rounded-xl bg-[#171C27]/50 border border-white/[0.06] text-xs text-slate-400 italic text-center">
        No upcoming occurrences matching current recurrence settings.
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.08] space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#06B6D4] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Upcoming Occurrences Preview</span>
        </span>
        <span className="text-[11px] text-slate-400 font-mono">Next 5 events</span>
      </div>

      <div className="space-y-1.5">
        {previewDates.map((dateStr, idx) => (
          <div
            key={dateStr}
            className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#11151F] border border-white/[0.04]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-5 h-5 rounded-md bg-[#7C3AED]/20 text-[#c4b5fd] font-bold text-[10px] flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <span className="font-semibold text-slate-200">{formatPreviewDate(dateStr)}</span>
              <span className="text-slate-500">•</span>
              <span className="text-white truncate">{taskTitle || 'Untitled Task'}</span>
            </div>

            {plannedStartTime && (
              <span className="text-[11px] font-mono text-[#94A3B8] shrink-0 pl-2">
                {plannedStartTime}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
