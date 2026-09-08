import React, { useState } from 'react';
import { useNotificationsContext } from '../../context/NotificationsContext';
import NotificationDropdown from './NotificationDropdown';
import { Bell } from 'lucide-react';

export default function NotificationBell() {
  const { unreadCount } = useNotificationsContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all flex items-center justify-center"
        aria-label="View notifications"
        aria-expanded={dropdownOpen}
      >
        <Bell className="w-5 h-5" />

        {/* Dynamic Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#EF4444] text-[10px] font-bold text-white flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        isOpen={dropdownOpen}
        onClose={() => setDropdownOpen(false)}
      />
    </div>
  );
}
