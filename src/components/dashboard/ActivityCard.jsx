import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { useActivityContext } from '../../context/ActivityContext';
import { formatDuration } from '../../utils/activityUtils';
import { CheckCircle2, Clock, ArrowRight, Activity as ActivityIcon } from 'lucide-react';

export default function ActivityCard() {
  const { activities, summary } = useActivityContext();

  // Grab the 4-5 most recent activities across the journal
  const recentActivities = [...activities].slice(0, 4);

  // Helper to format friendly relative time
  const getRelativeTime = (isoString, dateStr) => {
    try {
      if (!isoString) return dateStr || 'Recently';
      const created = new Date(isoString).getTime();
      const diffMs = Date.now() - created;
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor(diffMs / (1000 * 60));

      if (diffMins < 60) {
        return diffMins <= 5 ? 'Just now' : `${diffMins} mins ago`;
      }
      if (diffHrs < 24) {
        return diffHrs === 1 ? '1 hour ago' : `${diffHrs} hours ago`;
      }
      if (diffHrs < 48) {
        return 'Yesterday';
      }
      const days = Math.floor(diffHrs / 24);
      return `${days} days ago`;
    } catch {
      return dateStr || 'Recently';
    }
  };

  return (
    <Card
      title="Recent Activity"
      subtitle={`${summary.todayActivities.length} activities • ${formatDuration(summary.todayTotalMinutes)} tracked today`}
      action={
        <Link
          to="/activity"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] hover:text-[#c4b5fd] transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
      className="flex flex-col justify-between"
    >
      {recentActivities.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <ActivityIcon className="w-8 h-8 text-slate-500 mb-2" />
          <p className="text-sm font-semibold text-white">No activities logged</p>
          <p className="text-xs text-[#94A3B8] mt-0.5 mb-3">Record what you worked on in Daily Activity.</p>
          <Link
            to="/activity"
            className="text-xs font-semibold text-[#06B6D4] hover:underline"
          >
            Log first activity →
          </Link>
        </div>
      ) : (
        <div className="relative pl-3 space-y-4">
          {/* Continuous timeline line */}
          <div className="absolute left-[21px] top-3 bottom-3 w-[1px] bg-white/[0.08]" />

          {recentActivities.map((act) => (
            <div key={act.id} className="relative flex items-start gap-3.5 group">
              {/* Timeline Icon Node */}
              <div className="relative z-10 flex items-center justify-center w-7 h-7 rounded-lg border shrink-0 bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E] transition-transform duration-200 group-hover:scale-105">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>

              {/* Activity Description */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-xs sm:text-sm text-slate-200 leading-snug font-medium truncate">
                  <span className="text-white">{act.title}</span>
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-[#94A3B8]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#06B6D4]" />
                    <span>{getRelativeTime(act.createdAt, act.date)}</span>
                  </span>
                  <span>•</span>
                  <span>{formatDuration(act.duration)}</span>
                  {act.category && (
                    <>
                      <span>•</span>
                      <span className="text-slate-400">{act.category}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
