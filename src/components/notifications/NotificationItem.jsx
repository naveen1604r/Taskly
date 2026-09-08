import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsContext } from '../../context/NotificationsContext';
import { formatNotificationTime } from '../../utils/notificationUtils';
import {
  Bell,
  Clock,
  AlertCircle,
  CheckCircle2,
  Target,
  Trophy,
  Activity,
  Info,
  Trash2,
  Check,
  ExternalLink,
  FolderKanban,
  Zap,
  Repeat,
  Database,
  Eye,
  EyeOff,
} from 'lucide-react';

const typeConfig = {
  task: { label: 'Task', icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  task_due: { label: 'Task Due', icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  task_overdue: { label: 'Task Overdue', icon: AlertCircle, color: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20' },
  task_completed: { label: 'Task Completed', icon: CheckCircle2, color: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20' },
  reminder: { label: 'Reminder', icon: Bell, color: 'text-[#7C3AED] bg-[#7C3AED]/10 border-[#7C3AED]/20' },
  project: { label: 'Project', icon: FolderKanban, color: 'text-[#7C3AED] bg-[#7C3AED]/10 border-[#7C3AED]/20' },
  goal: { label: 'Goal', icon: Target, color: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/20' },
  goal_due: { label: 'Goal Due', icon: Target, color: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/20' },
  goal_completed: { label: 'Goal Completed', icon: Trophy, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  focus: { label: 'Focus', icon: Zap, color: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/20' },
  recurring: { label: 'Recurring', icon: Repeat, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  backup: { label: 'Backup', icon: Database, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  activity: { label: 'Activity', icon: Activity, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  system: { label: 'System', icon: Info, color: 'text-slate-400 bg-slate-800 border-white/[0.08]' },
};

const priorityBadges = {
  urgent: 'text-[#EF4444] bg-[#EF4444]/15 border-[#EF4444]/30',
  high: 'text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/30',
  normal: 'text-[#06B6D4] bg-[#06B6D4]/15 border-[#06B6D4]/30',
  low: 'text-slate-400 bg-slate-800 border-white/[0.08]',
};

export default function NotificationItem({ notification }) {
  const { markAsRead, markAsUnread, deleteNotification } = useNotificationsContext();
  const navigate = useNavigate();

  const typeInfo = typeConfig[notification.type] || typeConfig[notification.entityType] || typeConfig.system;
  const Icon = typeInfo.icon;

  const handleNavigate = () => {
    markAsRead(notification.id);
    if (notification.taskId || notification.entityType === 'task') {
      const tid = notification.taskId || notification.entityId;
      navigate(tid ? `/tasks/${tid}` : '/tasks');
    } else if (notification.projectId || notification.entityType === 'project') {
      const pid = notification.projectId || notification.entityId;
      navigate(pid ? `/projects/${pid}` : '/projects');
    } else if (notification.goalId || notification.entityType === 'goal') {
      navigate('/goals');
    } else if (notification.type === 'backup') {
      navigate('/settings/data');
    } else if (notification.type === 'focus') {
      navigate('/focus');
    } else if (notification.type === 'recurring') {
      navigate('/recurring');
    }
  };

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group text-xs ${
        !notification.read
          ? 'bg-[#171C27] border-[#7C3AED]/40 shadow-glow-primary/10'
          : 'bg-[#11151F]/70 border-white/[0.04] hover:border-white/[0.1]'
      }`}
    >
      {/* Left: Icon & Content */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className={`p-2.5 rounded-xl border shrink-0 ${typeInfo.color}`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4
              onClick={handleNavigate}
              className={`font-bold hover:text-[#c4b5fd] cursor-pointer transition-colors truncate ${
                !notification.read ? 'text-white' : 'text-slate-300'
              }`}
            >
              {notification.title}
            </h4>

            <span className={`px-2 py-0.2 rounded-md font-semibold text-[10px] uppercase border ${typeInfo.color}`}>
              {typeInfo.label}
            </span>

            {notification.priority && notification.priority !== 'normal' && (
              <span
                className={`px-1.5 py-0.2 rounded-md font-semibold text-[10px] uppercase border ${
                  priorityBadges[notification.priority] || priorityBadges.normal
                }`}
              >
                {notification.priority}
              </span>
            )}

            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-[#7C3AED] shadow-sm" />
            )}
          </div>

          <p className="text-slate-400 text-[11px] leading-relaxed">
            {notification.message}
          </p>

          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
            <span>{formatNotificationTime(notification.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
        <button
          type="button"
          onClick={() => (notification.read ? markAsUnread(notification.id) : markAsRead(notification.id))}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title={notification.read ? 'Mark as Unread' : 'Mark as Read'}
        >
          {notification.read ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#7C3AED]" />}
        </button>

        <button
          type="button"
          onClick={handleNavigate}
          className="p-1.5 rounded-lg text-slate-400 hover:text-[#06B6D4] hover:bg-white/[0.06] transition-colors"
          title="Open Related Deliverable"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => deleteNotification(notification.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
          title="Delete Notification"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
