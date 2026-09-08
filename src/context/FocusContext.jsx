import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTaskContext } from './TaskContext';
import { useNotificationsContext } from './NotificationsContext';
import { useAuthContext } from './AuthContext';
import { api } from '../services/api';
import {
  loadFocusSettings,
  saveFocusSettings,
  loadFocusSessions,
  saveFocusSessions,
  loadActiveSessionState,
  saveActiveSessionState,
  defaultFocusSettings,
  calculateTodayFocusTime,
  calculateFocusStreak,
  calculateDailyFocusGoalProgress,
  getTaskFocusTime,
} from '../utils/focusUtils';
import { getTodayDateString } from '../utils/taskStorage';

const FocusContext = createContext(null);

export function FocusProvider({ children }) {
  const { tasks, updateTask, setTaskStatus, showToast } = useTaskContext();
  const { addNotification } = useNotificationsContext();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthContext();

  const [focusSettings, setFocusSettings] = useState(() => loadFocusSettings());
  const [focusSessions, setFocusSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Timer Core States
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [timerMode, setTimerMode] = useState('focus'); // 'focus' | 'shortBreak' | 'longBreak'
  const [timerStatus, setTimerStatus] = useState('idle'); // 'idle' | 'running' | 'paused' | 'completed' | 'stopped'
  const [currentSessionNumber, setCurrentSessionNumber] = useState(1); // 1..sessionsBeforeLongBreak
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timestamp references to prevent background tab drift
  const targetEndTimestampRef = useRef(null);
  const sessionStartedAtRef = useRef(null);
  const pausedAccumulatedRef = useRef(0);
  const pauseStartTimestampRef = useRef(null);

  // Fetch settings and sessions from backend API
  const fetchFocusData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setFocusSessions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const [settingsRes, sessionsRes] = await Promise.allSettled([
        api.focus.getSettings(),
        api.focus.getSessions({ limit: 100 }),
      ]);

      if (settingsRes.status === 'fulfilled' && settingsRes.value.success) {
        const backendSettings = settingsRes.value.data.settings;
        setFocusSettings((prev) => ({
          ...prev,
          focusDuration: backendSettings.pomodoroDuration || prev.focusDuration,
          shortBreakDuration: backendSettings.shortBreakDuration || prev.shortBreakDuration,
          longBreakDuration: backendSettings.longBreakDuration || prev.longBreakDuration,
          sessionsBeforeLongBreak: backendSettings.longBreakInterval || prev.sessionsBeforeLongBreak,
          autoStartBreak: backendSettings.autoStartBreaks !== undefined ? backendSettings.autoStartBreaks : prev.autoStartBreak,
          autoStartFocus: backendSettings.autoStartPomodoros !== undefined ? backendSettings.autoStartPomodoros : prev.autoStartFocus,
        }));
      }

      if (sessionsRes.status === 'fulfilled' && sessionsRes.value.success) {
        const list = sessionsRes.value.data.sessions || [];
        setFocusSessions(
          list.map((s) => ({
            id: String(s.id),
            taskId: s.taskId || null,
            taskTitle: s.taskTitle || 'Focused Work',
            startTime: s.startedAt,
            endTime: s.completedAt || s.startedAt,
            duration: s.durationMinutes,
            sessionType: s.sessionType || 'focus',
            completed: s.completed,
            createdAt: s.startedAt,
          }))
        );
      }
    } catch (err) {
      console.warn('Failed to load focus data from API:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchFocusData();
    }
  }, [fetchFocusData, isAuthLoading]);

  // Modal dialog states
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isTaskSelectorOpen, setIsTaskSelectorOpen] = useState(false);

  // Save settings and sessions to localStorage as cache fallback
  useEffect(() => {
    saveFocusSettings(focusSettings);
  }, [focusSettings]);

  useEffect(() => {
    saveFocusSessions(focusSessions);
  }, [focusSessions]);

  // Selected task object from TaskContext
  const selectedTask = useMemo(() => {
    if (!currentTaskId) return null;
    return tasks.find((t) => t.id === currentTaskId) || null;
  }, [currentTaskId, tasks]);

  // Total seconds for current mode based on settings
  const currentModeTotalSeconds = useMemo(() => {
    if (timerMode === 'shortBreak') return (focusSettings.shortBreakDuration || 5) * 60;
    if (timerMode === 'longBreak') return (focusSettings.longBreakDuration || 15) * 60;
    return (focusSettings.focusDuration || 25) * 60;
  }, [timerMode, focusSettings]);

  // Web Audio chime generator (gentle notification tone without external audio files)
  const playChime = () => {
    if (!focusSettings.timerSound || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio chime playback failed:', e);
    }
  };

  // Restore previous active session on initial mount if available
  useEffect(() => {
    const saved = loadActiveSessionState();
    if (saved && saved.currentTaskId) {
      setCurrentTaskId(saved.currentTaskId);
      setTimerMode(saved.timerMode || 'focus');
      setCurrentSessionNumber(saved.currentSessionNumber || 1);

      const totalSec = saved.totalSeconds || 25 * 60;

      if (saved.timerStatus === 'running' && saved.targetEndTimestamp) {
        const now = Date.now();
        const diff = Math.max(0, Math.round((saved.targetEndTimestamp - now) / 1000));
        if (diff > 0) {
          setRemainingSeconds(diff);
          setElapsedSeconds(totalSec - diff);
          setTimerStatus('running');
          targetEndTimestampRef.current = saved.targetEndTimestamp;
          sessionStartedAtRef.current = saved.sessionStartedAt;
        } else {
          // Finished while away
          setRemainingSeconds(0);
          setElapsedSeconds(totalSec);
          setTimerStatus('completed');
        }
      } else if (saved.timerStatus === 'paused') {
        setTimerStatus('paused');
        setRemainingSeconds(saved.remainingSeconds || totalSec);
        setElapsedSeconds(saved.elapsedSeconds || 0);
        sessionStartedAtRef.current = saved.sessionStartedAt;
      }
    } else {
      // Default to settings focus duration
      setRemainingSeconds(focusSettings.focusDuration * 60);
    }
  }, []);

  // Synchronize state persistence only when timerStatus transitions to paused
  useEffect(() => {
    if (timerStatus === 'paused') {
      saveActiveSessionState({
        currentTaskId,
        timerMode,
        timerStatus: 'paused',
        currentSessionNumber,
        remainingSeconds,
        elapsedSeconds,
        totalSeconds: currentModeTotalSeconds,
        sessionStartedAt: sessionStartedAtRef.current,
      });
    } else if (timerStatus === 'idle' || timerStatus === 'completed' || timerStatus === 'stopped') {
      saveActiveSessionState(null);
    }
  }, [timerStatus]);

  // Main Timer Interval Loop (Timestamp-based accuracy)
  useEffect(() => {
    let interval = null;

    if (timerStatus === 'running') {
      interval = setInterval(() => {
        const now = Date.now();
        if (!targetEndTimestampRef.current) {
          targetEndTimestampRef.current = now + remainingSeconds * 1000;
        }

        const secsLeft = Math.max(0, Math.round((targetEndTimestampRef.current - now) / 1000));
        setRemainingSeconds(secsLeft);
        setElapsedSeconds(currentModeTotalSeconds - secsLeft);

        // Timer Block Finished
        if (secsLeft <= 0) {
          clearInterval(interval);
          handleTimerCompleted();
        }
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerStatus, currentModeTotalSeconds]);

  // Record session to backend API
  const recordSessionToApi = async (sessionData) => {
    if (!isAuthenticated) return;
    try {
      await api.focus.createSession({
        taskId: sessionData.taskId || null,
        taskTitle: sessionData.taskTitle || null,
        durationMinutes: sessionData.duration,
        completed: sessionData.completed,
      });
    } catch (err) {
      console.warn('Failed to save focus session to API:', err.message);
    }
  };

  // Handle natural session or break completion
  const handleTimerCompleted = () => {
    playChime();
    setTimerStatus('completed');

    const durationMins = Math.max(1, Math.round(currentModeTotalSeconds / 60));

    if (timerMode === 'focus') {
      // 1. Record completed focus session
      const newSession = {
        id: `sess-${Date.now()}`,
        taskId: currentTaskId || null,
        taskTitle: selectedTask?.title || 'Focused Work',
        startTime: sessionStartedAtRef.current || new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: durationMins,
        sessionType: 'focus',
        completed: true,
        createdAt: new Date().toISOString(),
      };
      setFocusSessions((prev) => [newSession, ...prev]);
      recordSessionToApi(newSession);

      // 2. Add actual duration to task in TaskContext
      if (currentTaskId && selectedTask) {
        const prevActual = Number(selectedTask.actualDuration) || 0;
        updateTask(currentTaskId, {
          actualDuration: prevActual + durationMins,
        });
      }

      // 3. Trigger Notification
      addNotification({
        eventKey: `focus_completed_${Date.now()}`,
        type: 'reminder',
        title: 'Focus session completed 🎉',
        message: `Great job! You completed ${durationMins} minutes of focus on "${selectedTask?.title || 'your task'}".`,
        priority: 'high',
      });
      showToast('Focus session completed! Take a well-deserved break.', 'success');

      // 4. Auto-start break if configured
      if (focusSettings.autoStartBreak) {
        setTimeout(() => {
          advanceToBreak();
        }, 1500);
      }
    } else {
      // Break Finished
      addNotification({
        eventKey: `break_completed_${Date.now()}`,
        type: 'reminder',
        title: 'Break finished ☕',
        message: 'Ready to dive back into focused work?',
        priority: 'normal',
      });
      showToast('Break finished! Ready for another focus block.', 'info');

      if (focusSettings.autoStartFocus) {
        setTimeout(() => {
          advanceToFocus();
        }, 1500);
      }
    }
  };

  // Timer Actions
  const startFocus = (taskId = null) => {
    const targetTask = taskId || currentTaskId;
    if (targetTask) {
      setCurrentTaskId(targetTask);
      // If task is pending, advance to in-progress
      const found = tasks.find((t) => t.id === targetTask);
      if (found && found.status === 'pending') {
        setTaskStatus(targetTask, 'in_progress');
      }
    }

    setTimerMode('focus');
    const totalSec = (focusSettings.focusDuration || 25) * 60;
    setRemainingSeconds(totalSec);
    setElapsedSeconds(0);
    sessionStartedAtRef.current = new Date().toISOString();
    const targetEnd = Date.now() + totalSec * 1000;
    targetEndTimestampRef.current = targetEnd;
    saveActiveSessionState({
      currentTaskId: targetTask,
      timerMode: 'focus',
      timerStatus: 'running',
      currentSessionNumber,
      totalSeconds: totalSec,
      targetEndTimestamp: targetEnd,
      sessionStartedAt: sessionStartedAtRef.current,
    });
    setTimerStatus('running');
  };

  const pauseFocus = () => {
    if (timerStatus !== 'running') return;
    setTimerStatus('paused');
    pauseStartTimestampRef.current = Date.now();
  };

  const resumeFocus = () => {
    if (timerStatus !== 'paused') return;
    const targetEnd = Date.now() + remainingSeconds * 1000;
    targetEndTimestampRef.current = targetEnd;
    saveActiveSessionState({
      currentTaskId,
      timerMode,
      timerStatus: 'running',
      currentSessionNumber,
      totalSeconds: currentModeTotalSeconds,
      targetEndTimestamp: targetEnd,
      sessionStartedAt: sessionStartedAtRef.current,
    });
    setTimerStatus('running');
  };

  // Stop Session Handler
  const stopFocus = (shouldSave = true) => {
    const activeSecs = elapsedSeconds;
    const durationMins = Math.round(activeSecs / 60);

    if (shouldSave && durationMins > 0 && timerMode === 'focus') {
      const newSession = {
        id: `sess-${Date.now()}`,
        taskId: currentTaskId || null,
        taskTitle: selectedTask?.title || 'Focused Work',
        startTime: sessionStartedAtRef.current || new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: durationMins,
        sessionType: 'focus',
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setFocusSessions((prev) => [newSession, ...prev]);

      if (currentTaskId && selectedTask) {
        const prevActual = Number(selectedTask.actualDuration) || 0;
        updateTask(currentTaskId, {
          actualDuration: prevActual + durationMins,
        });
      }
      showToast(`Session stopped. ${durationMins}m added to actual duration.`, 'info');
    } else {
      showToast('Session stopped and discarded.', 'info');
    }

    resetFocus();
    setIsStopModalOpen(false);
  };

  // Complete Task from Focus Mode
  const completeTaskFromFocus = () => {
    const activeSecs = elapsedSeconds;
    const durationMins = Math.max(1, Math.round(activeSecs / 60));

    if (currentTaskId && selectedTask) {
      const prevActual = Number(selectedTask.actualDuration) || 0;
      updateTask(currentTaskId, {
        actualDuration: prevActual + (timerMode === 'focus' ? durationMins : 0),
        status: 'completed',
        completedAt: new Date().toISOString(),
      });

      // Record session
      if (timerMode === 'focus' && durationMins > 0) {
        const newSession = {
          id: `sess-${Date.now()}`,
          taskId: currentTaskId,
          taskTitle: selectedTask.title,
          startTime: sessionStartedAtRef.current || new Date().toISOString(),
          endTime: new Date().toISOString(),
          duration: durationMins,
          sessionType: 'focus',
          completed: true,
          createdAt: new Date().toISOString(),
        };
        setFocusSessions((prev) => [newSession, ...prev]);
        recordSessionToApi(newSession);
      }

      showToast(`Task completed 🎉 Focus time: ${durationMins} minutes recorded.`, 'success');
    }

    resetFocus();
    setIsCompleteModalOpen(false);
  };

  const resetFocus = () => {
    setTimerStatus('idle');
    setTimerMode('focus');
    const total = (focusSettings.focusDuration || 25) * 60;
    setRemainingSeconds(total);
    setElapsedSeconds(0);
    targetEndTimestampRef.current = null;
    sessionStartedAtRef.current = null;
    saveActiveSessionState(null);
  };

  // Advance to Break (Short or Long)
  const advanceToBreak = () => {
    const isLongBreak = currentSessionNumber >= (focusSettings.sessionsBeforeLongBreak || 4);
    const nextMode = isLongBreak ? 'longBreak' : 'shortBreak';
    const breakDuration = isLongBreak
      ? (focusSettings.longBreakDuration || 15) * 60
      : (focusSettings.shortBreakDuration || 5) * 60;

    setTimerMode(nextMode);
    setRemainingSeconds(breakDuration);
    setElapsedSeconds(0);
    sessionStartedAtRef.current = new Date().toISOString();
    targetEndTimestampRef.current = Date.now() + breakDuration * 1000;
    setTimerStatus('running');
  };

  // Skip Break
  const skipBreak = () => {
    advanceToFocus();
  };

  // Advance to Next Focus Session
  const advanceToFocus = () => {
    setTimerMode('focus');
    const nextSessionNum =
      currentSessionNumber >= (focusSettings.sessionsBeforeLongBreak || 4)
        ? 1
        : currentSessionNumber + 1;
    setCurrentSessionNumber(nextSessionNum);

    const totalSec = (focusSettings.focusDuration || 25) * 60;
    setRemainingSeconds(totalSec);
    setElapsedSeconds(0);
    sessionStartedAtRef.current = new Date().toISOString();
    targetEndTimestampRef.current = Date.now() + totalSec * 1000;
    setTimerStatus('running');
  };

  // Update Settings
  const updateSettings = async (newSettings) => {
    setFocusSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Focus settings updated', 'success');

    if (isAuthenticated) {
      try {
        await api.focus.updateSettings({
          pomodoroDuration: newSettings.focusDuration,
          shortBreakDuration: newSettings.shortBreakDuration,
          longBreakDuration: newSettings.longBreakDuration,
          longBreakInterval: newSettings.sessionsBeforeLongBreak,
          autoStartBreaks: newSettings.autoStartBreak,
          autoStartPomodoros: newSettings.autoStartFocus,
        });
      } catch (err) {
        console.warn('Failed to sync focus settings to API:', err.message);
      }
    }
  };

  // Derived summaries
  const todayFocusMinutes = useMemo(() => {
    return calculateTodayFocusTime(focusSessions, getTodayDateString());
  }, [focusSessions]);

  const focusStreak = useMemo(() => {
    return calculateFocusStreak(focusSessions, getTodayDateString());
  }, [focusSessions]);

  const dailyGoalProgress = useMemo(() => {
    return calculateDailyFocusGoalProgress(todayFocusMinutes, focusSettings.dailyFocusGoal || 120);
  }, [todayFocusMinutes, focusSettings.dailyFocusGoal]);

  const value = {
    // State
    focusSettings,
    focusSessions,
    currentTaskId,
    selectedTask,
    timerMode,
    timerStatus,
    remainingSeconds,
    elapsedSeconds,
    currentSessionNumber,
    currentModeTotalSeconds,
    // Summaries
    todayFocusMinutes,
    focusStreak,
    dailyGoalProgress,
    // Actions
    setCurrentTaskId,
    startFocus,
    pauseFocus,
    resumeFocus,
    stopFocus,
    completeTaskFromFocus,
    advanceToBreak,
    skipBreak,
    advanceToFocus,
    resetFocus,
    updateSettings,
    // Modals
    isStopModalOpen,
    setIsStopModalOpen,
    isCompleteModalOpen,
    setIsCompleteModalOpen,
    isTaskSelectorOpen,
    setIsTaskSelectorOpen,
  };

  return (
    <FocusContext.Provider value={value}>
      {children}
    </FocusContext.Provider>
  );
}

export function useFocusContext() {
  const context = useContext(FocusContext);
  if (!context) {
    return {
      focusSettings: defaultFocusSettings,
      focusSessions: [],
      currentTaskId: null,
      selectedTask: null,
      timerMode: 'focus',
      timerStatus: 'idle',
      remainingSeconds: 25 * 60,
      elapsedSeconds: 0,
      currentSessionNumber: 1,
      currentModeTotalSeconds: 25 * 60,
      todayFocusMinutes: 0,
      focusStreak: 0,
      dailyGoalProgress: { todayMinutes: 0, dailyGoalMinutes: 120, percentage: 0, isReached: false, remainingMinutes: 120 },
      setCurrentTaskId: () => {},
      startFocus: () => {},
      pauseFocus: () => {},
      resumeFocus: () => {},
      stopFocus: () => {},
      completeTaskFromFocus: () => {},
      advanceToBreak: () => {},
      skipBreak: () => {},
      advanceToFocus: () => {},
      resetFocus: () => {},
      updateSettings: () => {},
      isStopModalOpen: false,
      setIsStopModalOpen: () => {},
      isCompleteModalOpen: false,
      setIsCompleteModalOpen: () => {},
      isTaskSelectorOpen: false,
      setIsTaskSelectorOpen: () => {},
    };
  }
  return context;
}
