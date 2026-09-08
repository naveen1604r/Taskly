import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotificationsContext } from '../../context/NotificationsContext';
import { formatNotificationTime } from '../../utils/notificationUtils';
import {
  Bell,
  CheckCheck,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  Target,
  Trophy,
  Activity,
  Info,
  FolderKanban,
  Zap,
  Repeat,
  Database,
  ExternalLink,
} from 'lucide-react';

const typeIconMap = {
  task: { icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  task_due: { icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  task_overdue: { icon: AlertCircle, color: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20' },
  task_completed: { icon: CheckCircle2, color: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20' },
  reminder: { icon: Bell, color: 'text-[#7C3AED] bg-[#7C3AED]/10 border-[#7C3AED]/20' },
  project: { icon: FolderKanban, color: 'text-[#7C3AED] bg-[#7C3AED]/10 border-[#7C3AED]/20' },
  goal: { icon: Target, color: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/20' },
  goal_due: { icon: Target, color: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/20' },
  goal_completed: { icon: Trophy, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  focus: { icon: Zap, color: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/20' },
  recurring: { icon: Repeat, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  backup: { icon: Database, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  activity: { icon: Activity, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  system: { icon: Info, color: 'text-slate-400 bg-slate-800 border-white/[0.08]' },
};

export default function NotificationDropdown({ isOpen, onClose }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationsContext();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const latestNotifications = notifications.slice(0, 6);

  const handleItemClick = (n) => {
    markAsRead(n.id);
    onClose();
    if (n.taskId || n.entityType === 'task') {
      const tid = n.taskId || n.entityId;
      navigate(tid ? `/tasks/${tid}` : '/tasks');
    } else if (n.projectId || n.entityType === 'project') {
      const pid = n.projectId || n.entityId;
      navigate(pid ? `/projects/${pid}` : '/projects');
    } else if (n.goalId || n.entityType === 'goal') {
      navigate('/goals');
    } else if (n.type === 'backup') {
      navigate('/settings/data');
    } else if (n.type === 'focus') {
      navigate('/focus');
    } else if (n.type === 'recurring') {
      navigate('/recurring');
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#11151F] border border-white/[0.1] rounded-3xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-150 text-xs"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#7C3AED] text-white font-bold text-[10px]">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-[11px] text-[#7C3AED] hover:text-[#c4b5fd] font-semibold transition-colors flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark read</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.03]">
        {latestNotifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-1">
            <Bell className="w-7 h-7 mx-auto opacity-50" />
            <p className="text-xs">No notifications yet</p>
          </div>
        ) : (
          latestNotifications.map((n) => {
            const config = typeIconMap[n.type] || typeIconMap[n.entityType] || typeIconMap.system;
            const Icon = config.icon;

            return (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`p-3 flex items-start gap-3 hover:bg-[#171C27] cursor-pointer transition-colors ${
                  !n.read ? 'bg-[#7C3AED]/5' : ''
                }`}
              >
                <div className={`p-2 rounded-xl border shrink-0 ${config.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`font-bold truncate ${
                        !n.read ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {n.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {formatNotificationTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {n.message}
                  </p>
                </div>

                {!n.read && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] shrink-0 mt-1.5" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-white/[0.08] bg-[#171C27]/50 text-center">
        <Link
          to="/notifications"
          onClick={onClose}
          className="text-xs text-[#7C3AED] hover:text-[#c4b5fd] font-bold transition-colors inline-flex items-center gap-1.5"
        >
          <span>View all notifications</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
