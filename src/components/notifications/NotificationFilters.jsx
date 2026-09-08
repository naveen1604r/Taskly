import React from 'react';
import {
  Bell,
  Clock,
  Target,
  FolderKanban,
  Zap,
  Repeat,
  Database,
  Info,
  CheckCircle2,
  Eye,
  Filter,
} from 'lucide-react';

export default function NotificationFilters({
  activeFilter,
  onFilterChange,
  unreadCount = 0,
  totalCount = 0,
}) {
  const filterOptions = [
    { id: 'all', label: 'All', count: totalCount },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'read', label: 'Read' },
    { id: 'task', label: 'Tasks' },
    { id: 'reminder', label: 'Reminders' },
    { id: 'project', label: 'Projects' },
    { id: 'goal', label: 'Goals' },
    { id: 'focus', label: 'Focus' },
    { id: 'recurring', label: 'Recurring' },
    { id: 'backup', label: 'Backup' },
    { id: 'system', label: 'System' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-[#11151F] border border-white/[0.06] text-xs">
      {filterOptions.map((opt) => {
        const isActive = activeFilter === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onFilterChange(opt.id)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
              isActive
                ? 'bg-[#7C3AED] text-white shadow-glow-primary'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <span>{opt.label}</span>
            {typeof opt.count === 'number' && opt.count > 0 && (
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/[0.08] text-slate-300'
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
