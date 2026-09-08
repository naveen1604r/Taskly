import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  loadActivitiesFromStorage,
  saveActivitiesToStorage,
  calculateStreak,
  calculateDurationFromTimes,
} from '../utils/activityUtils';
import { getTodayDateString } from '../utils/taskStorage';
import { useTaskContext } from './TaskContext';
import { useAuthContext } from './AuthContext';
import { api } from '../services/api';

const ActivityContext = createContext(null);

export function ActivityProvider({ children }) {
  const { showToast } = useTaskContext();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthContext();

  const [activities, setActivities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityToDelete, setActivityToDelete] = useState(null);

  // Fetch activities from backend API
  const fetchActivitiesData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setActivities([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const res = await api.activity.getAll();
      if (res.success && res.data?.activities) {
        setActivities(
          res.data.activities.map((a) => ({
            id: String(a.id),
            title: a.description,
            description: a.description,
            date: a.metadata?.date || (a.createdAt ? a.createdAt.slice(0, 10) : getTodayDateString()),
            startTime: a.metadata?.startTime || '09:00',
            endTime: a.metadata?.endTime || '10:00',
            duration: a.metadata?.duration || 30,
            category: a.type || 'General',
            relatedTaskId: a.entityId || null,
            notes: '',
            createdAt: a.createdAt,
          }))
        );
      }
    } catch (err) {
      console.warn('Failed to load activities from API:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchActivitiesData();
    }
  }, [fetchActivitiesData, isAuthLoading]);

  // Sync to localStorage as client fallback cache
  useEffect(() => {
    saveActivitiesToStorage(activities);
  }, [activities]);

  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `act-${crypto.randomUUID()}`;
    }
    return `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add activity
  const addActivity = async (data) => {
    let resolvedDuration = Number(data.duration);
    if (!resolvedDuration || isNaN(resolvedDuration)) {
      resolvedDuration = calculateDurationFromTimes(data.startTime, data.endTime);
    }

    const newActivity = {
      id: generateId(),
      title: (data.title || data.description || 'Activity').trim(),
      description: data.description?.trim() || '',
      date: data.date || selectedDate,
      startTime: data.startTime || '09:00',
      endTime: data.endTime || '10:00',
      duration: resolvedDuration > 0 ? resolvedDuration : 30,
      category: data.category?.trim() || 'General',
      relatedTaskId: data.relatedTaskId || null,
      notes: data.notes?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    setActivities((prev) => [newActivity, ...prev]);

    if (isAuthenticated) {
      try {
        await api.activity.create({
          type: newActivity.category,
          description: newActivity.title,
          metadata: {
            date: newActivity.date,
            startTime: newActivity.startTime,
            endTime: newActivity.endTime,
            duration: newActivity.duration,
          },
        });
      } catch (err) {
        console.warn('API createActivity warning:', err.message);
      }
    }

    showToast('Activity logged successfully', 'success');
    closeActivityModal();
    return newActivity;
  };

  // Simple logger for other contexts
  const logActivity = (data) => {
    return addActivity({
      title: data.title || data.description || 'Action Logged',
      category: data.category || 'General',
    });
  };

  // Update activity
  const updateActivity = (id, updatedFields) => {
    let resolvedDuration = Number(updatedFields.duration);
    if (!resolvedDuration || isNaN(resolvedDuration)) {
      resolvedDuration = calculateDurationFromTimes(updatedFields.startTime, updatedFields.endTime);
    }

    setActivities((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              ...updatedFields,
              duration: resolvedDuration > 0 ? resolvedDuration : a.duration,
            }
          : a
      )
    );
    showToast('Activity updated successfully', 'success');
    closeActivityModal();
  };

  // Delete activity
  const deleteActivity = (id) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    showToast('Activity deleted successfully', 'success');
    setActivityToDelete(null);
  };

  // Date Navigation
  const goToPreviousDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${day}`);
  };

  const goToNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${day}`);
  };

  const goToToday = () => {
    setSelectedDate(getTodayDateString());
  };

  // Modal handlers
  const openCreateActivityModal = (customDate) => {
    setEditingActivity(null);
    if (customDate) {
      setSelectedDate(customDate);
    }
    setIsActivityModalOpen(true);
  };

  const openEditActivityModal = (act) => {
    setEditingActivity(act);
    setIsActivityModalOpen(true);
  };

  const closeActivityModal = () => {
    setIsActivityModalOpen(false);
    setEditingActivity(null);
  };

  const openDeleteActivityModal = (act) => {
    setActivityToDelete(act);
  };

  const closeDeleteActivityModal = () => {
    setActivityToDelete(null);
  };

  // Computed summary metrics
  const summary = useMemo(() => {
    const today = getTodayDateString();

    const selectedDateActivities = activities.filter((a) => a.date === selectedDate);
    const todayActivities = activities.filter((a) => a.date === today);

    const selectedDateTotalMinutes = selectedDateActivities.reduce(
      (acc, curr) => acc + (Number(curr.duration) || 0),
      0
    );

    const todayTotalMinutes = todayActivities.reduce(
      (acc, curr) => acc + (Number(curr.duration) || 0),
      0
    );

    const activeStreak = calculateStreak(activities);

    const datesWithActivities = new Set(
      activities.map((a) => a.date).filter(Boolean)
    );

    return {
      selectedDateActivities,
      todayActivities,
      selectedDateTotalMinutes,
      todayTotalMinutes,
      activeStreak,
      datesWithActivities,
      totalLoggedActivities: activities.length,
    };
  }, [activities, selectedDate]);

  const value = {
    activities,
    selectedDate,
    setSelectedDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    addActivity,
    logActivity,
    updateActivity,
    deleteActivity,
    // Modal controls
    isActivityModalOpen,
    editingActivity,
    openCreateActivityModal,
    openEditActivityModal,
    closeActivityModal,
    activityToDelete,
    openDeleteActivityModal,
    closeDeleteActivityModal,
    // Summary
    summary,
  };

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

export function useActivityContext() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivityContext must be used within an ActivityProvider');
  }
  return context;
}
