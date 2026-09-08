import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import NotificationBell from '../notifications/NotificationBell';
import { useSettingsContext } from '../../context/SettingsContext';
import { useSearchContext } from '../../context/SearchContext';
import { useInboxContext } from '../../context/InboxContext';
import { useAuthContext } from '../../context/AuthContext';
import { getStoredUser } from '../../utils/authStorage';
import { Menu, Search, ChevronDown, Command, Settings as SettingsIcon, User, BarChart3, Zap, LogOut } from 'lucide-react';

const routeTitles = {
  '/': 'Dashboard',
  '/my-day': 'My Day',
  '/inbox': 'Productivity Inbox',
  '/tasks': 'Tasks',
  '/projects': 'Projects',
  '/board': 'Task Board',
  '/search': 'Search',
  '/focus': 'Focus Mode',
  '/habits': 'Habit Tracker',
  '/planner': 'Daily Planner',
  '/recurring': 'Recurring Tasks & Routines',
  '/templates': 'Task Templates',
  '/activity': 'Daily Activity',
  '/notes': 'Notes',
  '/calendar': 'Calendar',
  '/goals': 'Goals',
  '/notifications': 'Notifications',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function Header({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettingsContext();
  const { openSearch } = useSearchContext();
  const currentTitle = routeTitles[location.pathname] || 'Dashboard';

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const { openQuickCapture } = useInboxContext();
  const { user, logout } = useAuthContext();

  // Read immediately from context or localStorage to prevent any temporary flash of "User"
  const currentUser = user || getStoredUser();
  const profile = settings?.profile || {};

  // Requirements 5 & 6:
  // 1. Display actual user name
  // 2. If name is unavailable, display user email instead
  const userName = currentUser?.name?.trim();
  const userEmail = currentUser?.email?.trim();
  const customProfileName = profile?.name && profile.name !== 'User' ? profile.name.trim() : '';
  const customProfileEmail = profile?.email?.trim() || '';

  const displayName = userName || userEmail || customProfileName || customProfileEmail || 'User';
  const displayEmail = userEmail || customProfileEmail || '';
  const avatarUrl = currentUser?.avatarUrl || profile?.avatar || null;

  const initials = displayName
    ? displayName
        .split(' ')
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  // Outside click & Escape to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsUserMenuOpen(false);
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserMenuOpen]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-[#080B12]/90 backdrop-blur-md border-b border-white/[0.08]">
      {/* Left: Hamburger (mobile) + Dynamic Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl lg:hidden focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)]">
          {currentTitle}
        </h1>
      </div>

      {/* Center: Global Search Bar (Requirement 2 & 3) */}
      <div
        onClick={() => openSearch()}
        className="relative hidden md:flex items-center cursor-pointer group"
        role="search"
      >
        <Search className="absolute left-3.5 w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] pointer-events-none transition-colors" />
        <input
          type="text"
          readOnly
          onClick={() => openSearch()}
          placeholder="Search tasks, notes, goals..."
          className="w-64 lg:w-84 pl-10 pr-16 py-2 text-xs bg-[var(--bg-surface)] group-hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-xl border border-[var(--border-primary)] group-hover:border-accent cursor-pointer transition-all pointer-events-none"
        />
        <div className="absolute right-2.5 flex items-center gap-1 text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded border border-[var(--border-primary)]">
          <span>Ctrl + K</span>
        </div>
      </div>

      {/* Right: Mobile search trigger + Notification bell + User profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Search Icon Button */}
        <button
          type="button"
          onClick={() => openSearch()}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl md:hidden focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Open search"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Quick Capture Button in Header */}
        <button
          type="button"
          onClick={openQuickCapture}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-soft hover:bg-accent text-accent hover:text-[var(--accent-foreground)] border border-accent-border text-xs font-bold transition-all shadow-xs"
          title="Quick Capture (Press Q)"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Capture</span>
          <kbd className="px-1 py-0.2 rounded bg-black/30 text-[9px] font-mono">Q</kbd>
        </button>

        {/* Interactive Notification Bell */}
        <NotificationBell />

        {/* User profile dropdown button */}
        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 pl-2 border-l border-[var(--border-primary)] cursor-pointer group focus:outline-none"
            aria-label="User account menu"
            aria-expanded={isUserMenuOpen}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-accent transition-all"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] text-white font-bold text-xs flex items-center justify-center shadow-xs ring-2 ring-white/10 group-hover:ring-accent transition-all">
                {initials}
              </div>
            )}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-accent transition-colors max-w-[140px] truncate">
                {displayName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
            </div>
          </button>

          {/* User Menu Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 p-1.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-hover z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2.5 border-b border-[var(--border-secondary)] mb-1">
                <p className="text-xs font-bold text-[var(--text-primary)] truncate">{displayName}</p>
                <p className="text-[11px] text-[var(--text-muted)] truncate">{displayEmail || 'Signed in'}</p>
              </div>

              <Link
                to="/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition-colors"
              >
                <User className="w-3.5 h-3.5 text-accent" />
                <span>Profile</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition-colors"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-accent" />
                <span>Settings</span>
              </Link>

              <Link
                to="/analytics"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition-colors"
              >
                <BarChart3 className="w-3.5 h-3.5 text-cyanAccent" />
                <span>Productivity Analytics</span>
              </Link>

              <div className="border-t border-[var(--border-secondary)] mt-1 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    setIsUserMenuOpen(false);
                    await logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
