import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useTaskContext } from './TaskContext';
import { useAuthContext } from './AuthContext';
import { api } from '../services/api';

export const SETTINGS_STORAGE_KEY = 'taskly_settings';

export const ACCENT_COLORS = {
  purple: {
    name: 'Purple',
    primary: '#7C3AED',
    hover: '#6D28D9',
    foreground: '#FFFFFF',
    soft: 'rgba(124, 58, 237, 0.15)',
    border: 'rgba(124, 58, 237, 0.35)',
    glow: 'rgba(124, 58, 237, 0.4)',
    ring: '#7C3AED',
  },
  blue: {
    name: 'Blue',
    primary: '#2563EB',
    hover: '#1D4ED8',
    foreground: '#FFFFFF',
    soft: 'rgba(37, 99, 235, 0.15)',
    border: 'rgba(37, 99, 235, 0.35)',
    glow: 'rgba(37, 99, 235, 0.4)',
    ring: '#2563EB',
  },
  cyan: {
    name: 'Cyan',
    primary: '#06B6D4',
    hover: '#0891B2',
    foreground: '#0F172A', // Contrast-aware dark foreground for cyan
    soft: 'rgba(6, 182, 212, 0.15)',
    border: 'rgba(6, 182, 212, 0.35)',
    glow: 'rgba(6, 182, 212, 0.4)',
    ring: '#06B6D4',
  },
  green: {
    name: 'Green',
    primary: '#10B981',
    hover: '#059669',
    foreground: '#FFFFFF',
    soft: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.35)',
    glow: 'rgba(16, 185, 129, 0.4)',
    ring: '#10B981',
  },
  orange: {
    name: 'Orange',
    primary: '#F97316',
    hover: '#EA580C',
    foreground: '#FFFFFF',
    soft: 'rgba(249, 115, 22, 0.15)',
    border: 'rgba(249, 115, 22, 0.35)',
    glow: 'rgba(249, 115, 22, 0.4)',
    ring: '#F97316',
  },
  pink: {
    name: 'Pink',
    primary: '#EC4899',
    hover: '#DB2777',
    foreground: '#FFFFFF',
    soft: 'rgba(236, 72, 153, 0.15)',
    border: 'rgba(236, 72, 153, 0.35)',
    glow: 'rgba(236, 72, 153, 0.4)',
    ring: '#EC4899',
  },
  red: {
    name: 'Red',
    primary: '#EF4444',
    hover: '#DC2626',
    foreground: '#FFFFFF',
    soft: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.35)',
    glow: 'rgba(239, 68, 68, 0.4)',
    ring: '#EF4444',
  },
};

export const defaultSettings = {
  profile: {
    name: 'User',
    email: 'user@example.com',
    avatar: null,
  },
  appearance: {
    theme: 'dark', // 'dark' | 'light' | 'system'
    accentColor: 'purple', // 'purple' | 'blue' | 'cyan' | 'green' | 'orange' | 'pink' | 'red'
    compactMode: false,
    animations: true,
  },
  preferences: {
    startOfWeek: 'monday', // 'monday' | 'sunday'
    defaultTaskPriority: 'medium', // 'low' | 'medium' | 'high'
    defaultTaskStatus: 'pending', // 'pending' | 'in_progress'
    confirmBeforeDelete: true,
  },
  tasks: {
    showCompletedTasks: true,
    autoSortTasks: false,
    showTaskDescriptions: true,
  },
  calendar: {
    weekStartsOn: 'monday',
    showWeekends: true,
  },
};

const loadSettingsFromStorage = () => {
  try {
    let savedProfile = null;
    try {
      const userProfileRaw = localStorage.getItem('user_profile');
      if (userProfileRaw) savedProfile = JSON.parse(userProfileRaw);
    } catch {
      // ignore
    }

    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return {
        ...defaultSettings,
        profile: { ...defaultSettings.profile, ...(savedProfile || {}) },
      };
    }
    const parsed = JSON.parse(raw);
    return {
      profile: { ...defaultSettings.profile, ...(parsed.profile || {}), ...(savedProfile || {}) },
      appearance: { ...defaultSettings.appearance, ...(parsed.appearance || {}) },
      preferences: { ...defaultSettings.preferences, ...(parsed.preferences || {}) },
      tasks: { ...defaultSettings.tasks, ...(parsed.tasks || {}) },
      calendar: { ...defaultSettings.calendar, ...(parsed.calendar || {}) },
    };
  } catch (error) {
    console.warn('Failed to load taskly_settings:', error);
    return defaultSettings;
  }
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { showToast } = useTaskContext() || {};
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthContext();

  const [settings, setSettings] = useState(() => loadSettingsFromStorage());
  const initialSyncRef = useRef(false);

  // Apply Theme, Accent Color, Compact Mode, and Animation tokens to root DOM
  const applyVisualAppearance = useCallback(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const {
      theme = 'dark',
      accentColor = 'purple',
      compactMode = false,
      animations = true,
    } = settings.appearance || {};

    // 1. Theme resolution (Dark / Light / System)
    let effectiveTheme = theme;
    if (theme === 'system') {
      const isSystemDark =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = isSystemDark ? 'dark' : 'light';
    }

    root.setAttribute('data-theme', effectiveTheme);
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // 2. Accent Color resolution
    const normalizedAccent = (accentColor || 'purple').toLowerCase();
    const config = ACCENT_COLORS[normalizedAccent] || ACCENT_COLORS.purple;

    root.setAttribute('data-accent', normalizedAccent);

    // Set standardized CSS variables
    root.style.setProperty('--accent-primary', config.primary);
    root.style.setProperty('--accent-primary-hover', config.hover);
    root.style.setProperty('--accent-primary-soft', config.soft);
    root.style.setProperty('--accent-primary-border', config.border);
    root.style.setProperty('--accent-glow', config.glow);
    root.style.setProperty('--accent-ring', config.ring);
    root.style.setProperty('--accent-foreground', config.foreground || '#FFFFFF');

    // Backwards compatibility for existing variable names
    root.style.setProperty('--color-primary', config.primary);
    root.style.setProperty('--color-primary-hover', config.hover);
    root.style.setProperty('--color-primary-soft', config.soft);
    root.style.setProperty('--color-primary-glow', config.glow);

    // 3. Theme CSS variables
    if (effectiveTheme === 'light') {
      root.style.setProperty('--bg-primary', '#F8FAFC');
      root.style.setProperty('--bg-surface', '#FFFFFF');
      root.style.setProperty('--bg-secondary', '#F1F5F9');
      root.style.setProperty('--text-primary', '#0F172A');
      root.style.setProperty('--text-secondary', '#475569');
      root.style.setProperty('--text-muted', '#64748B');
      root.style.setProperty('--border-primary', '#E2E8F0');
      root.style.setProperty('--border-secondary', '#CBD5E1');
      root.style.setProperty('--bg-hover', '#F1F5F9');
    } else {
      root.style.setProperty('--bg-primary', '#080B12');
      root.style.setProperty('--bg-surface', '#11151F');
      root.style.setProperty('--bg-secondary', '#171C27');
      root.style.setProperty('--text-primary', '#FFFFFF');
      root.style.setProperty('--text-secondary', '#CBD5E1');
      root.style.setProperty('--text-muted', '#94A3B8');
      root.style.setProperty('--border-primary', 'rgba(255, 255, 255, 0.08)');
      root.style.setProperty('--border-secondary', 'rgba(255, 255, 255, 0.06)');
      root.style.setProperty('--bg-hover', 'rgba(255, 255, 255, 0.06)');
    }

    // 4. Compact Mode
    root.setAttribute('data-compact', compactMode ? 'true' : 'false');

    // 5. Animations
    root.setAttribute('data-animations', animations ? 'true' : 'false');
  }, [settings.appearance]);

  // Apply appearance immediately whenever appearance settings change
  useEffect(() => {
    applyVisualAppearance();
  }, [applyVisualAppearance]);

  // Listen to OS system theme changes if set to 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (settings.appearance?.theme === 'system') {
        applyVisualAppearance();
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [settings.appearance?.theme, applyVisualAppearance]);

  // Save to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Error saving settings to storage:', e);
    }
  }, [settings]);

  // Fetch settings from server on user authentication
  useEffect(() => {
    if (isAuthLoading) return;

    if (isAuthenticated && user?.id) {
      const fetchServerSettings = async () => {
        try {
          const res = await api.settings.get();
          if (res?.success && res?.data?.settings) {
            const serverData = res.data.settings;
            setSettings((prev) => ({
              ...prev,
              appearance: {
                ...prev.appearance,
                theme: serverData.theme || prev.appearance.theme,
                accentColor: serverData.accentColor || prev.appearance.accentColor,
                compactMode:
                  serverData.compactMode !== undefined
                    ? serverData.compactMode
                    : prev.appearance.compactMode,
                animations:
                  serverData.animations !== undefined
                    ? serverData.animations
                    : prev.appearance.animations,
              },
            }));
          }
        } catch (err) {
          console.warn('Could not sync user settings with server:', err.message);
        }
      };

      fetchServerSettings();
      initialSyncRef.current = true;
    } else if (!isAuthenticated) {
      // Clear authenticated settings on logout, revert to defaults
      if (initialSyncRef.current) {
        setSettings(defaultSettings);
        initialSyncRef.current = false;
      }
    }
  }, [isAuthenticated, user?.id, isAuthLoading]);

  // Keep settings profile synchronized with authenticated user
  useEffect(() => {
    if (user && (user.name || user.email)) {
      setSettings((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          name: user.name || prev.profile.name || 'User',
          email: user.email || prev.profile.email || '',
          avatar: user.avatarUrl || prev.profile.avatar || null,
        },
      }));
    }
  }, [user]);

  // Update specific setting property with server sync
  const updateSetting = (section, key, value) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      };

      // Server sync for appearance settings
      if (section === 'appearance' && isAuthenticated && user?.id) {
        const payload = {
          theme: key === 'theme' ? value : updated.appearance.theme,
          accentColor: key === 'accentColor' ? value : updated.appearance.accentColor,
          compactMode: key === 'compactMode' ? value : updated.appearance.compactMode,
          animations: key === 'animations' ? value : updated.appearance.animations,
        };
        api.settings.update(payload).catch((e) => {
          console.warn('Failed to persist settings to server:', e.message);
        });
      }

      return updated;
    });

    if (showToast) {
      showToast('Settings updated', 'success');
    }
  };

  // Update Profile
  const updateProfile = (profileData) => {
    setSettings((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...profileData,
      },
    }));
    if (showToast) {
      showToast('Profile updated successfully', 'success');
    }
  };

  // Reset all Settings to default
  const resetSettings = () => {
    setSettings(defaultSettings);
    if (isAuthenticated && user?.id) {
      api.settings.update({
        theme: defaultSettings.appearance.theme,
        accentColor: defaultSettings.appearance.accentColor,
        compactMode: defaultSettings.appearance.compactMode,
        animations: defaultSettings.appearance.animations,
      }).catch(() => {});
    }
    if (showToast) {
      showToast('Settings reset to default', 'success');
    }
  };

  // Reset Profile only
  const resetProfile = () => {
    setSettings((prev) => ({
      ...prev,
      profile: defaultSettings.profile,
    }));
    if (showToast) {
      showToast('Profile reset to default', 'success');
    }
  };

  const value = {
    settings,
    accentColors: ACCENT_COLORS,
    updateSetting,
    updateProfile,
    resetSettings,
    resetProfile,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
}
