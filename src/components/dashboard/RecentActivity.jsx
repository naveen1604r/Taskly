import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { useActivityContext } from '../../context/ActivityContext';
import { useFocusContext } from '../../context/FocusContext';
import { formatTimeAgo } from '../../utils/activityUtils';
import { Activity, CheckCircle2, Clock, Target, FileText, ArrowRight } from 'lucide-react';

export default function RecentActivity() {
  const { activities = [] } = useActivityContext();
  const { sessions = [] } = useFocusContext();

  // Combine latest activities and sessions
  const recentItems = activities.slice(0, 5);

  return (
    <Card
      title="Recent Activity"
      subtitle="Chronological feed of completed deliverables"
      action={
        <Link
          to="/activity"
          className="text-xs font-semibold text-[#7C3AED] hover:text-[#c4b5fd] transition-colors flex items-center gap-1"
        >
          <span>Activity Log</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      {recentItems.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 italic">
          Your recent activity will appear here as you complete work.
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentItems.map((item) => {
            const timeAgo = formatTimeAgo(item.timestamp || item.createdAt || new Date().toISOString());

            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#171C27] border border-white/[0.04] text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="p-1.5 rounded-lg bg-[#7C3AED]/15 text-[#7C3AED] shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-white truncate">
                    {item.description || item.title || item.text || 'Task action logged'}
                  </span>
                </div>

                <span className="text-[11px] text-slate-500 shrink-0 font-mono">
                  {timeAgo}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
