import React from 'react';
import {
  User,
  Palette,
  SlidersHorizontal,
  Flame,
  Bell,
  CheckSquare,
  Calendar,
  Database,
  Keyboard,
  Info,
} from 'lucide-react';

export const settingsTabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { id: 'focus', label: 'Focus & Pomodoro', icon: Flame },
  { id: 'habits', label: 'Habit Tracking', icon: Flame },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'data', label: 'Data & Storage', icon: Database },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  { id: 'about', label: 'About', icon: Info },
];

export default function SettingsSidebar({ activeTab, onSelectTab }) {
  return (
    <nav className="space-y-1">
      {settingsTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
              isActive
                ? 'bg-accent text-[var(--accent-foreground)] shadow-glow-primary font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
