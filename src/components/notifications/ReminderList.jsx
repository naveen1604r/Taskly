import React, { useState, useMemo } from 'react';
import { useNotificationsContext } from '../../context/NotificationsContext';
import ReminderCard from './ReminderCard';
import Button from '../common/Button';
import { Bell, Clock, AlertTriangle, Plus } from 'lucide-react';

export default function ReminderList() {
  const {
    reminders,
    upcomingReminders,
    overdueReminders,
    openCreateReminderModal,
  } = useNotificationsContext();

  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'upcoming' | 'overdue'

  const displayedReminders = useMemo(() => {
    if (filterTab === 'upcoming') return upcomingReminders;
    if (filterTab === 'overdue') return overdueReminders;
    return reminders;
  }, [filterTab, reminders, upcomingReminders, overdueReminders]);

  return (
    <div className="space-y-4 text-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Smart Reminders ({reminders.length})
          </h3>
          <p className="text-xs text-slate-400">
            Automated alerts, repeating routines, and deliverable reminders
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => openCreateReminderModal()}
          icon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
        >
          Create Reminder
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#11151F] border border-white/[0.06] rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1 rounded-xl font-bold transition-colors ${
            filterTab === 'all'
              ? 'bg-[#7C3AED] text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All ({reminders.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('upcoming')}
          className={`px-3 py-1 rounded-xl font-bold transition-colors ${
            filterTab === 'upcoming'
              ? 'bg-[#7C3AED] text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Upcoming ({upcomingReminders.length})
        </button>

        {overdueReminders.length > 0 && (
          <button
            type="button"
            onClick={() => setFilterTab('overdue')}
            className={`px-3 py-1 rounded-xl font-bold transition-colors ${
              filterTab === 'overdue'
                ? 'bg-[#EF4444] text-white'
                : 'text-[#EF4444] hover:bg-[#EF4444]/10'
            }`}
          >
            Overdue ({overdueReminders.length})
          </button>
        )}
      </div>

      {/* Reminders List */}
      {displayedReminders.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#11151F]/40 border border-dashed border-white/[0.08] text-center space-y-3">
          <Bell className="w-10 h-10 text-slate-500 mx-auto stroke-[1.5]" />
          <div>
            <h4 className="text-sm font-bold text-white">No reminders found</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-0.5">
              {filterTab === 'overdue'
                ? 'No overdue reminders. Great job staying ahead!'
                : 'Never miss a deliverable by scheduling smart reminders.'}
            </p>
          </div>
          {filterTab !== 'overdue' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openCreateReminderModal()}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Create Reminder
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayedReminders.map((rem) => (
            <ReminderCard key={rem.id} reminder={rem} />
          ))}
        </div>
      )}
    </div>
  );
}
