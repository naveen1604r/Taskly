import React from 'react';
import { NavLink } from 'react-router-dom';
import { useInboxContext } from '../../context/InboxContext';
import {
  LayoutDashboard,
  Sun,
  Inbox as InboxIcon,
  CheckSquare,
  Flame,
  Clock,
  Repeat,
  Activity,
  FileText,
  Calendar,
  Target,
  BarChart3,
  Bell,
  Settings,
  X,
  CheckCircle2,
  KanbanSquare,
  FolderKanban,
  Zap,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { stats, openQuickCapture } = useInboxContext();

  const navigationGroups = [
    {
      category: 'Overview',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'My Day', path: '/my-day', icon: Sun },
        {
          name: 'Inbox',
          path: '/inbox',
          icon: InboxIcon,
          badge: stats.unprocessed > 0 ? stats.unprocessed : null,
        },
      ],
    },
    {
      category: 'Workspace',
      items: [
        { name: 'Tasks', path: '/tasks', icon: CheckSquare },
        { name: 'Daily Planner', path: '/planner', icon: Clock },
        { name: 'Calendar', path: '/calendar', icon: Calendar },
        { name: 'Task Board', path: '/board', icon: KanbanSquare },
        { name: 'Focus Mode', path: '/focus', icon: Zap },
        { name: 'Habits', path: '/habits', icon: Flame },
        { name: 'Projects', path: '/projects', icon: FolderKanban },
        { name: 'Routines', path: '/recurring', icon: Repeat },
        { name: 'Daily Activity', path: '/activity', icon: Activity },
        { name: 'Notes', path: '/notes', icon: FileText },
      ],
    },
    {
      category: 'Insights',
      items: [
        { name: 'Goals', path: '/goals', icon: Target },
        { name: 'Analytics', path: '/analytics', icon: BarChart3 },
      ],
    },
    {
      category: 'System',
      items: [
        { name: 'Notifications', path: '/notifications', icon: Bell },
        { name: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-[#0B0E14] border-r border-white/[0.08] flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Top: Logo & Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Logo Header */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] flex items-center justify-center shadow-[0_0_12px_rgba(124,58,237,0.5)]">
                <CheckCircle2 className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Taskly
              </span>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg md:hidden hover:bg-white/[0.06]"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>



          {/* Navigation Groups */}
          <nav className="space-y-5" aria-label="Main Navigation">
            {navigationGroups.map((group) => (
              <div key={group.category} className="space-y-1">
                <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {group.category}
                </h3>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                          if (window.innerWidth < 768) onClose();
                        }}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isActive
                            ? 'bg-accent-soft text-accent border border-accent-border shadow-xs font-bold'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                          }`
                        }
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </div>

                        {item.badge && (
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-accent text-white font-bold">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/[0.06] text-[11px] text-slate-500 text-center">
          Taskly v1.0 • Client-Only
        </div>
      </aside>
    </>
  );
}
