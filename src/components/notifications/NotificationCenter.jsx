import React, { useState, useMemo } from 'react';
import { useNotificationsContext } from '../../context/NotificationsContext';
import { groupNotificationsByDate } from '../../utils/notificationUtils';
import NotificationFilters from './NotificationFilters';
import NotificationItem from './NotificationItem';
import ReminderList from './ReminderList';
import NotificationSettings from './NotificationSettings';
import ReminderModal from './ReminderModal';
import Button from '../common/Button';
import {
  Bell,
  CheckCheck,
  Trash2,
  SlidersHorizontal,
  Clock,
  Search,
  X,
  Inbox,
  Filter,
} from 'lucide-react';

export default function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearReadNotifications,
  } = useNotificationsContext();

  const [activeTab, setActiveTab] = useState('notifications'); // 'notifications' | 'reminders' | 'settings'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter notifications by category/read state and search text
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // 1. Filter Check
      if (activeFilter === 'unread' && n.read) return false;
      if (activeFilter === 'read' && !n.read) return false;
      if (activeFilter !== 'all' && activeFilter !== 'unread' && activeFilter !== 'read') {
        const matchesType = n.type === activeFilter || n.entityType === activeFilter;
        if (!matchesType) return false;
      }

      // 2. Search Text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = n.title?.toLowerCase().includes(q);
        const msgMatch = n.message?.toLowerCase().includes(q);
        if (!titleMatch && !msgMatch) return false;
      }

      return true;
    });
  }, [notifications, activeFilter, searchQuery]);

  // Group filtered notifications by date
  const grouped = useMemo(() => {
    return groupNotificationsByDate(filteredNotifications);
  }, [filteredNotifications]);

  const readCount = notifications.filter((n) => n.read).length;

  return (
    <div className="space-y-6 sm:space-y-7 pb-16 animate-in fade-in duration-200">
      {/* 1. Header with Snapshot Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/25">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Notification Center
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.2 rounded-full bg-[#7C3AED] text-white text-[11px] font-bold">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Stay updated with deliverable alerts, smart routines, and system milestones.
              </p>
            </div>
          </div>
        </div>

        {/* Global Quick Actions */}
        {activeTab === 'notifications' && (
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
            {unreadCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={markAllAsRead}
                icon={<CheckCheck className="w-3.5 h-3.5 text-[#22C55E]" />}
              >
                Mark All Read
              </Button>
            )}

            {readCount > 0 && (
              <button
                type="button"
                onClick={clearReadNotifications}
                className="px-3 py-1.5 rounded-xl bg-[#11151F] hover:bg-[#171C27] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
              >
                Clear Read
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#11151F] border border-white/[0.08] rounded-2xl w-fit text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'notifications'
              ? 'bg-[#7C3AED] text-white shadow-glow-primary'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reminders')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'reminders'
              ? 'bg-[#7C3AED] text-white shadow-glow-primary'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Smart Reminders</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-[#7C3AED] text-white shadow-glow-primary'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Preferences</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notifications..."
                className="w-full bg-[#11151F] border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <NotificationFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              unreadCount={unreadCount}
              totalCount={notifications.length}
            />
          </div>

          {/* Grouped Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="p-16 rounded-3xl bg-[#11151F]/40 border border-dashed border-white/[0.08] text-center space-y-3">
              <Inbox className="w-10 h-10 text-slate-500 mx-auto stroke-[1.5]" />
              <div>
                <h4 className="text-sm font-bold text-white">No notifications</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-0.5">
                  Your inbox is completely clear for the selected filter.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {grouped.today.length > 0 && (
                <section className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#c4b5fd] px-1">
                    Today ({grouped.today.length})
                  </h4>
                  <div className="space-y-2">
                    {grouped.today.map((notif) => (
                      <NotificationItem key={notif.id} notification={notif} />
                    ))}
                  </div>
                </section>
              )}

              {grouped.yesterday.length > 0 && (
                <section className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                    Yesterday ({grouped.yesterday.length})
                  </h4>
                  <div className="space-y-2">
                    {grouped.yesterday.map((notif) => (
                      <NotificationItem key={notif.id} notification={notif} />
                    ))}
                  </div>
                </section>
              )}

              {grouped.earlier.length > 0 && (
                <section className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                    Earlier ({grouped.earlier.length})
                  </h4>
                  <div className="space-y-2">
                    {grouped.earlier.map((notif) => (
                      <NotificationItem key={notif.id} notification={notif} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reminders' && <ReminderList />}

      {activeTab === 'settings' && <NotificationSettings />}

      {/* Reminder Modal */}
      <ReminderModal />
    </div>
  );
}
