import React from 'react';
import { Link } from 'react-router-dom';
import { useNotificationsContext } from '../../context/NotificationsContext';
import Card from '../common/Card';
import { Bell, Clock, Calendar, Repeat, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function UpcomingRemindersWidget() {
  const { upcomingReminders } = useNotificationsContext();
  const topReminders = upcomingReminders.slice(0, 3);

  return (
    <Card
      title="Upcoming Reminders"
      subtitle="Scheduled alerts & routines"
      action={
        <Link
          to="/notifications"
          className="text-xs text-[#7C3AED] hover:text-[#c4b5fd] font-semibold transition-colors inline-flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-2 text-xs">
        {topReminders.length === 0 ? (
          <div className="py-6 text-center text-slate-500 italic space-y-1">
            <CheckCircle2 className="w-6 h-6 mx-auto opacity-40 text-emerald-400" />
            <p className="text-xs">No upcoming reminders</p>
          </div>
        ) : (
          topReminders.map((r) => (
            <div
              key={r.id}
              className="p-2.5 rounded-xl bg-[#171C27] border border-white/[0.04] flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <span className="font-bold text-white truncate block">
                  {r.title}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5 text-[#7C3AED]" />
                    <span>{r.date}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-[#06B6D4]" />
                    <span>{r.time}</span>
                  </div>
                </div>
              </div>

              {r.repeat !== 'none' && (
                <span className="px-1.5 py-0.2 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-semibold shrink-0">
                  <Repeat className="w-2.5 h-2.5 inline mr-0.5" />
                  <span className="capitalize">{r.repeat}</span>
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
