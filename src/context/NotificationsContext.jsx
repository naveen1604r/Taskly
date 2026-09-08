import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTaskContext } from './TaskContext';
import { useGoalsContext } from './GoalsContext';
import { useAuthContext } from './AuthContext';
import { api } from '../services/api';
import {
  loadNotificationsFromStorage,
  saveNotificationsToStorage,
  loadRemindersFromStorage,
  saveRemindersToStorage,
  loadSettingsFromStorage,
  saveSettingsToStorage,
  isDateTimeDue,
  getNextOccurrence,
  isQuietHoursNow,
  calculateSnoozeTime,
  getNotificationEventKey,
  cleanupOldNotifications,
} from '../utils/notificationUtils';
import { getTodayDateString } from '../utils/taskStorage';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { tasks, showToast } = useTaskContext();
  const goalsCtx = useGoalsContext({ optional: true });
  const goals = goalsCtx?.goals || [];
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthContext();

  const [notifications, setNotifications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [settings, setSettings] = useState(() => loadSettingsFromStorage());
  const [quietHoursQueue, setQuietHoursQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const notificationsRef = useRef(notifications);
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  // Fetch notifications and reminders from backend API
  const fetchNotificationsAndReminders = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      setReminders([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const [notifRes, remRes] = await Promise.allSettled([
        api.notifications.getAll(),
        api.reminders.getAll(),
      ]);

      if (notifRes.status === 'fulfilled' && notifRes.value.success) {
        const notifList = notifRes.value.data.notifications || [];
        setNotifications(
          notifList.map((n) => ({
            id: String(n.id),
            eventKey: n.eventKey || null,
            type: n.type || 'system',
            title: n.title,
            message: n.message,
            read: Boolean(n.isRead),
            priority: 'normal',
            createdAt: n.createdAt,
          }))
        );
      }

      if (remRes.status === 'fulfilled' && remRes.value.success) {
        const remList = remRes.value.data.reminders || [];
        setReminders(
          remList.map((r) => ({
            id: String(r.id),
            title: r.title,
            message: '',
            date: r.date || getTodayDateString(),
            time: r.time,
            type: r.type || 'once',
            repeat: r.type || 'none',
            enabled: Boolean(r.enabled),
            snoozedUntil: r.snoozeUntil || null,
            triggered: false,
            createdAt: r.createdAt,
          }))
        );
      }
    } catch (err) {
      console.warn('Failed to load notifications from API:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchNotificationsAndReminders();
    }
  }, [fetchNotificationsAndReminders, isAuthLoading]);

  // Modal dialog states
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);

  // Sync to localStorage as client fallback cache
  useEffect(() => {
    saveNotificationsToStorage(notifications);
  }, [notifications]);

  useEffect(() => {
    saveRemindersToStorage(reminders);
  }, [reminders]);

  useEffect(() => {
    saveSettingsToStorage(settings);
  }, [settings]);

  const generateId = (prefix = 'notif') => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Play subtle sound if enabled
  const playNotificationSound = () => {
    if (!settings.notificationSound) return;
    try {
      if (typeof window !== 'undefined' && window.AudioContext) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // Audio autoplay policy ignored safely
    }
  };

  // Add Notification with deduplication & quiet hours check
  const addNotification = useCallback((data) => {
    // Check user category filters
    if (data.type === 'task' && !settings.taskDue) return null;
    if (data.type === 'project' && !settings.projectDeadlines) return null;
    if (data.type === 'goal' && !settings.goalDue) return null;
    if (data.type === 'focus' && !settings.focusSession) return null;
    if (data.type === 'recurring' && !settings.recurringTasks) return null;
    if (data.type === 'backup' && !settings.backupReminders) return null;
    if (data.type === 'system' && !settings.systemAlerts) return null;

    // Deduplication check
    if (data.eventKey) {
      const exists = notificationsRef.current.some((n) => n.eventKey === data.eventKey);
      if (exists) return null;
    }

    const newNotif = {
      id: generateId('notif'),
      eventKey: data.eventKey || null,
      type: data.type || 'system', // task | reminder | project | goal | focus | recurring | system | backup | activity
      title: data.title.trim(),
      message: data.message?.trim() || '',
      entityType: data.entityType || data.type || 'system',
      entityId: data.entityId || null,
      taskId: data.taskId || (data.entityType === 'task' ? data.entityId : null),
      projectId: data.projectId || (data.entityType === 'project' ? data.entityId : null),
      goalId: data.goalId || (data.entityType === 'goal' ? data.entityId : null),
      read: false,
      priority: data.priority || 'normal', // low | normal | high | urgent
      createdAt: new Date().toISOString(),
    };

    // Quiet Hours Check
    const inQuiet = isQuietHoursNow(settings.quietHours);
    if (inQuiet && !(settings.quietHours.allowUrgent && newNotif.priority === 'urgent')) {
      setQuietHoursQueue((prev) => [...prev, newNotif]);
      return newNotif;
    }

    notificationsRef.current = [newNotif, ...notificationsRef.current];
    setNotifications((prev) => [newNotif, ...prev]);
    playNotificationSound();

    if (isAuthenticated) {
      try {
        api.notifications.create({
          type: newNotif.type,
          title: newNotif.title,
          message: newNotif.message,
          eventKey: newNotif.eventKey,
        }).catch(() => {});
      } catch {}
    }

    // Desktop Notification API
    if (
      settings.desktopNotifications &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification(newNotif.title, {
          body: newNotif.message,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Desktop notification dispatch error:', e);
      }
    }

    return newNotif;
  }, [settings, isAuthenticated]);

  // Release Quiet Hours Queue when quiet hours end
  useEffect(() => {
    if (quietHoursQueue.length > 0 && !isQuietHoursNow(settings.quietHours)) {
      setNotifications((prev) => [...quietHoursQueue, ...prev]);
      if (showToast) {
        showToast(`Delivered ${quietHoursQueue.length} notifications from quiet hours`, 'info');
      }
      setQuietHoursQueue([]);
    }
  }, [settings.quietHours, quietHoursQueue, showToast]);

  // Actions
  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (isAuthenticated) {
      try { await api.notifications.markAsRead(id); } catch {}
    }
  };

  const markAsUnread = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: false } : n))
    );
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (showToast) showToast('All notifications marked as read', 'success');
    if (isAuthenticated) {
      try { await api.notifications.markAllAsRead(); } catch {}
    }
  };

  const deleteNotification = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (isAuthenticated) {
      try { await api.notifications.delete(id); } catch {}
    }
  };

  const clearReadNotifications = () => {
    const unreadOnly = notifications.filter((n) => !n.read);
    setNotifications(unreadOnly);
    if (showToast) showToast('Read notifications cleared', 'info');
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    setIsClearAllOpen(false);
    if (showToast) showToast('All notifications cleared', 'success');
    if (isAuthenticated) {
      try { await api.notifications.clearAll(); } catch {}
    }
  };

  // Reminder Management
  const addReminder = async (data) => {
    let newRem = null;

    if (isAuthenticated) {
      try {
        const res = await api.reminders.create({
          title: data.title.trim(),
          time: data.time || '09:00',
          date: data.date || getTodayDateString(),
          type: data.repeat || 'once',
          enabled: true,
        });
        if (res.success && res.data?.reminder) {
          const r = res.data.reminder;
          newRem = {
            id: String(r.id),
            title: r.title,
            message: '',
            date: r.date || getTodayDateString(),
            time: r.time,
            type: r.type || 'once',
            repeat: r.type || 'none',
            enabled: Boolean(r.enabled),
            snoozedUntil: r.snoozeUntil || null,
            triggered: false,
            createdAt: r.createdAt,
          };
        }
      } catch (err) {
        console.warn('API createReminder warning:', err.message);
      }
    }

    if (!newRem) {
      newRem = {
        id: generateId('rem'),
        title: data.title.trim(),
        message: data.message?.trim() || data.description?.trim() || '',
        date: data.date || getTodayDateString(),
        time: data.time || '09:00',
        entityType: data.entityType || 'custom',
        entityId: data.entityId || null,
        relatedTaskId: data.relatedTaskId || (data.entityType === 'task' ? data.entityId : null),
        relatedProjectId: data.relatedProjectId || (data.entityType === 'project' ? data.entityId : null),
        relatedGoalId: data.relatedGoalId || (data.entityType === 'goal' ? data.entityId : null),
        repeat: data.repeat || 'none',
        priority: data.priority || 'normal',
        enabled: true,
        snoozedUntil: null,
        triggered: false,
        createdAt: new Date().toISOString(),
      };
    }

    setReminders((prev) => [newRem, ...prev]);
    if (showToast) showToast('Reminder created successfully', 'success');
    closeReminderModal();
    return newRem;
  };

  const updateReminder = async (id, fields) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...fields, triggered: false } : r))
    );

    if (isAuthenticated) {
      try {
        await api.reminders.update(id, {
          title: fields.title,
          time: fields.time,
          date: fields.date,
          type: fields.repeat || fields.type,
          enabled: fields.enabled,
        });
      } catch (err) {
        console.warn('API updateReminder warning:', err.message);
      }
    }

    if (showToast) showToast('Reminder updated', 'success');
    closeReminderModal();
  };

  const toggleReminder = async (id) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const next = !r.enabled;
          if (showToast) showToast(next ? 'Reminder resumed' : 'Reminder paused', 'success');
          return { ...r, enabled: next };
        }
        return r;
      })
    );

    if (isAuthenticated) {
      try {
        await api.reminders.toggle(id);
      } catch (err) {
        console.warn('API toggleReminder warning:', err.message);
      }
    }
  };

  const snoozeReminder = async (id, option, customDate = null, customTime = null) => {
    const targetISO = calculateSnoozeTime(option, customDate, customTime);
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              snoozedUntil: targetISO,
              triggered: false,
            }
          : r
      )
    );

    if (isAuthenticated) {
      try {
        await api.reminders.snooze(id, 10);
      } catch (err) {
        console.warn('API snoozeReminder warning:', err.message);
      }
    }

    if (showToast) showToast(`Reminder snoozed until ${option}`, 'info');
  };

  const deleteReminder = async (id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    if (isAuthenticated) {
      try { await api.reminders.delete(id); } catch {}
    }
    if (showToast) showToast('Reminder deleted', 'success');
  };

  // Preferences Update
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    if (showToast) showToast('Notification preferences updated', 'success');
  };

  const requestDesktopPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      if (showToast) showToast('Notifications not supported by this browser', 'error');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateSettings({ desktopNotifications: true });
        if (showToast) showToast('Desktop notifications enabled', 'success');
      } else {
        updateSettings({ desktopNotifications: false });
        if (showToast) showToast('Desktop notifications denied', 'info');
      }
    } catch (e) {
      console.error('Permission request failed:', e);
      if (showToast) showToast('Failed to enable desktop notifications', 'error');
    }
  };

  // Reminder Modals
  const openCreateReminderModal = (prefill = {}) => {
    setEditingReminder(prefill);
    setIsReminderModalOpen(true);
  };

  const openEditReminderModal = (reminder) => {
    setEditingReminder(reminder);
    setIsReminderModalOpen(true);
  };

  const closeReminderModal = () => {
    setIsReminderModalOpen(false);
    setEditingReminder(null);
  };

  // Process Active Reminders & Due Tasks on schedule / tab focus
  const checkPendingRemindersAndDues = useCallback(() => {
    const now = new Date();
    const todayStr = getTodayDateString();

    // 1. Check custom reminders
    setReminders((prevReminders) => {
      let modified = false;
      const updated = prevReminders.map((r) => {
        if (!r.enabled) return r;

        // Check if snoozed
        if (r.snoozedUntil) {
          if (new Date(r.snoozedUntil) <= now) {
            addNotification({
              eventKey: getNotificationEventKey('reminder_snooze', r.id, r.snoozedUntil),
              type: 'reminder',
              title: `Reminder: ${r.title}`,
              message: r.message || 'Snoozed reminder is now active.',
              entityType: r.entityType,
              entityId: r.entityId,
              priority: r.priority || 'normal',
            });
            modified = true;
            return { ...r, snoozedUntil: null, triggered: true };
          }
          return r;
        }

        // Check regular date & time
        if (!r.triggered && isDateTimeDue(r.date, r.time)) {
          addNotification({
            eventKey: getNotificationEventKey('reminder', r.id, `${r.date}_${r.time}`),
            type: 'reminder',
            title: `Reminder: ${r.title}`,
            message: r.message || 'Scheduled reminder is now due.',
            entityType: r.entityType,
            entityId: r.entityId,
            priority: r.priority || 'normal',
          });

          modified = true;
          if (r.repeat !== 'none') {
            const nextDate = getNextOccurrence(r.date, r.repeat);
            return { ...r, date: nextDate, triggered: false };
          }
          return { ...r, triggered: true };
        }

        return r;
      });

      return modified ? updated : prevReminders;
    });

    // 2. Check Tasks Due Today / Overdue
    if (tasks && tasks.length > 0) {
      tasks.forEach((task) => {
        if (task.status === 'completed') return;

        const targetDate = task.plannedDate || task.dueDate;
        if (!targetDate) return;

        // Due / Planned Start time notification
        if (targetDate === todayStr && task.plannedStartTime) {
          const isStartTimeReached = isDateTimeDue(todayStr, task.plannedStartTime);
          if (isStartTimeReached) {
            addNotification({
              eventKey: getNotificationEventKey('task_start', task.id, `${todayStr}_${task.plannedStartTime}`),
              type: 'task',
              title: `Task Starts Now: ${task.title}`,
              message: `Scheduled for ${task.plannedStartTime} today.`,
              entityType: 'task',
              entityId: task.id,
              priority: task.priority === 'high' ? 'urgent' : 'high',
            });
          }
        }
      });
    }
  }, [tasks, addNotification]);

  // Run on interval and tab visibility change
  useEffect(() => {
    checkPendingRemindersAndDues();
    const interval = setInterval(checkPendingRemindersAndDues, 60000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkPendingRemindersAndDues();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkPendingRemindersAndDues]);

  // Run cleanup of old notifications based on historyRetention policy
  useEffect(() => {
    setNotifications((prev) => cleanupOldNotifications(prev, settings.historyRetention));
  }, [settings.historyRetention]);

  // Derived Values
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const upcomingReminders = useMemo(() => {
    const now = new Date();
    return reminders
      .filter((r) => r.enabled && !r.triggered)
      .sort((a, b) => {
        const timeA = new Date(`${a.date}T${a.time || '09:00'}:00`).getTime();
        const timeB = new Date(`${b.date}T${b.time || '09:00'}:00`).getTime();
        return timeA - timeB;
      });
  }, [reminders]);

  const overdueReminders = useMemo(() => {
    return reminders.filter(
      (r) => r.enabled && !r.triggered && isDateTimeDue(r.date, r.time)
    );
  }, [reminders]);

  const value = {
    notifications,
    unreadCount,
    reminders,
    settings,
    upcomingReminders,
    overdueReminders,
    isReminderModalOpen,
    editingReminder,
    isClearAllOpen,

    addNotification,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    clearAllNotifications,

    addReminder,
    updateReminder,
    toggleReminder,
    snoozeReminder,
    deleteReminder,

    updateSettings,
    requestDesktopPermission,

    openCreateReminderModal,
    openEditReminderModal,
    closeReminderModal,
    setIsClearAllOpen,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  return context;
}
