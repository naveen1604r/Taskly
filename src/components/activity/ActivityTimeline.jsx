import React from 'react';
import ActivityCard from './ActivityCard';
import { formatTimeDisplay, formatDuration } from '../../utils/activityUtils';
import { Clock, CheckCircle2, Flame, Award } from 'lucide-react';

export default function ActivityTimeline({ activities, totalMinutes, completedTasksCount }) {
  if (!activities || activities.length === 0) return null;

  // Chronologically order for timeline display
  const timelineActivities = [...activities].sort((a, b) => {
    const timeA = a.startTime || '00:00';
    const timeB = b.startTime || '00:00';
    return timeA.localeCompare(timeB);
  });

  return (
    <div className="space-y-6">
      {/* Productivity Summary: Tracked Focus Time */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#171C27] to-[#11151F] border border-white/[0.08] shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#7C3AED]/15 text-[#7C3AED]">
                <Clock className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold tracking-tight text-white">
                Tracked Focus Time
              </h3>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Personal activity journal reflecting actual work logged for this day.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-6 shrink-0 text-center sm:text-right">
            <div className="bg-[#11151F] sm:bg-transparent p-2.5 sm:p-0 rounded-xl border border-white/[0.04] sm:border-0">
              <div className="text-xs text-[#94A3B8]">Activities</div>
              <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                {activities.length}
              </div>
            </div>
            <div className="bg-[#11151F] sm:bg-transparent p-2.5 sm:p-0 rounded-xl border border-white/[0.04] sm:border-0">
              <div className="text-xs text-[#94A3B8]">Focused Time</div>
              <div className="text-base sm:text-lg font-bold text-[#06B6D4] mt-0.5">
                {formatDuration(totalMinutes)}
              </div>
            </div>
            <div className="bg-[#11151F] sm:bg-transparent p-2.5 sm:p-0 rounded-xl border border-white/[0.04] sm:border-0">
              <div className="text-xs text-[#94A3B8]">Tasks Done</div>
              <div className="text-base sm:text-lg font-bold text-[#22C55E] mt-0.5">
                {completedTasksCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Vertical Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-6">
        {/* Continuous vertical connecting line */}
        <div className="absolute left-[11px] sm:left-[15px] top-3 bottom-6 w-[2px] bg-gradient-to-b from-[#7C3AED] via-[#06B6D4] to-white/[0.08]" />

        {timelineActivities.map((act) => (
          <div key={act.id} className="relative group">
            {/* Timeline Node Point */}
            <div className="absolute -left-[23px] sm:-left-[27px] top-4 w-4 h-4 rounded-full bg-[#11151F] border-2 border-[#7C3AED] shadow-[0_0_8px_rgba(124,58,237,0.6)] group-hover:scale-125 transition-transform" />

            {/* Time label above card */}
            <div className="text-xs font-bold text-[#94A3B8] mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[#06B6D4]" />
              <span>{formatTimeDisplay(act.startTime)}</span>
            </div>

            {/* Reusable Activity Card */}
            <ActivityCard activity={act} />
          </div>
        ))}
      </div>
    </div>
  );
}
