/**
 * Centralized Data Management & Storage Registry for Taskly
 */

export const TASKLY_STORAGE_KEYS = {
  tasks: 'taskly_tasks',
  inbox: 'taskly_inbox',
  myDaySettings: 'taskly_my_day_settings',
  projects: 'taskly_projects',
  notes: 'taskly_notes',
  goals: 'taskly_goals',
  recurringTasks: 'taskly_recurring_tasks',
  templates: 'taskly_task_templates',
  focusSessions: 'taskly_focus_sessions',
  focusSettings: 'taskly_focus_settings',
  notifications: 'taskly_notifications',
  reminders: 'taskly_reminders',
  activity: 'taskly_activity',
  habits: 'taskly_habits',
  habitLogs: 'taskly_habit_logs',
  habitOrder: 'taskly_habit_order',
  habitSettings: 'taskly_habit_settings',
  dashboardSettings: 'taskly_dashboard_settings',
  recentSearches: 'taskly_recent_searches',
  savedViews: 'taskly_saved_views',
  boardOrder: 'taskly_board_order',
  settings: 'taskly_settings',
  backupMetadata: 'taskly_backup_metadata',
  preRestoreBackup: 'taskly_pre_restore_backup',
};

export const CURRENT_BACKUP_VERSION = 1;

export const CATEGORY_DEFINITIONS = [
  { id: 'tasks', label: 'Tasks & Subtasks', key: TASKLY_STORAGE_KEYS.tasks, icon: 'CheckSquare', isArray: true },
  { id: 'inbox', label: 'Productivity Inbox & Quick Captures', key: TASKLY_STORAGE_KEYS.inbox, icon: 'Inbox', isArray: true },
  { id: 'habits', label: 'Habits & Daily Routines', key: TASKLY_STORAGE_KEYS.habits, icon: 'Flame', isArray: true },
  { id: 'habitLogs', label: 'Habit Completion Records', key: TASKLY_STORAGE_KEYS.habitLogs, icon: 'CheckCircle2', isArray: true },
  { id: 'projects', label: 'Projects & Workflows', key: TASKLY_STORAGE_KEYS.projects, icon: 'FolderKanban', isArray: true },
  { id: 'notes', label: 'Notes & Ideas', key: TASKLY_STORAGE_KEYS.notes, icon: 'FileText', isArray: true },
  { id: 'goals', label: 'Goals & Milestones', key: TASKLY_STORAGE_KEYS.goals, icon: 'Target', isArray: true },
  { id: 'recurringTasks', label: 'Recurring Tasks & Routines', key: TASKLY_STORAGE_KEYS.recurringTasks, icon: 'Repeat', isArray: true },
  { id: 'templates', label: 'Task Templates', key: TASKLY_STORAGE_KEYS.templates, icon: 'LayoutTemplate', isArray: true },
  { id: 'focusSessions', label: 'Focus & Pomodoro History', key: TASKLY_STORAGE_KEYS.focusSessions, icon: 'Flame', isArray: true },
  { id: 'notifications', label: 'Notifications & Alerts', key: TASKLY_STORAGE_KEYS.notifications, icon: 'Bell', isArray: true },
  { id: 'activity', label: 'Daily Activity Logs', key: TASKLY_STORAGE_KEYS.activity, icon: 'Activity', isArray: true },
  { id: 'settings', label: 'App Settings & Preferences', key: TASKLY_STORAGE_KEYS.settings, icon: 'Settings', isArray: false },
  { id: 'dashboardSettings', label: 'Dashboard Layout & Widgets', key: TASKLY_STORAGE_KEYS.dashboardSettings, icon: 'LayoutDashboard', isArray: false },
  { id: 'savedViews', label: 'Saved Views & Filters', key: TASKLY_STORAGE_KEYS.savedViews, icon: 'Filter', isArray: true },
];

/**
 * Format timestamp safely for backup filenames
 * taskly-backup-YYYY-MM-DD-HH-mm-ss.json
 */
export const formatBackupFileName = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `taskly-backup-${yyyy}-${mm}-${dd}-${hh}-${min}-${ss}.json`;
};

/**
 * Read raw item safely from localStorage
 */
const getParsedStorageItem = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
};

/**
 * Calculate approximate storage size in Bytes and KB
 */
export const getStorageStats = () => {
  let totalBytes = 0;
  const categories = CATEGORY_DEFINITIONS.map((cat) => {
    let count = 0;
    let bytes = 0;
    try {
      const raw = localStorage.getItem(cat.key);
      if (raw) {
        bytes = new Blob([raw]).size || raw.length * 2;
        totalBytes += bytes;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          count = parsed.length;
        } else if (parsed && typeof parsed === 'object') {
          count = Object.keys(parsed).length;
        }
      }
    } catch (e) {
      console.error(`Error reading stats for ${cat.id}:`, e);
    }

    return {
      ...cat,
      count,
      bytes,
      formattedSize: bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`,
    };
  });

  const formattedTotal =
    totalBytes > 1024 * 1024
      ? `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
      : totalBytes > 1024
      ? `${(totalBytes / 1024).toFixed(1)} KB`
      : `${totalBytes} B`;

  return {
    categories,
    totalBytes,
    formattedTotal,
  };
};

/**
 * Gather backup payload for full or partial export
 */
export const createBackup = (selectedCategories = null) => {
  const categoriesToInclude = selectedCategories || CATEGORY_DEFINITIONS.map((c) => c.id);
  const data = {};

  categoriesToInclude.forEach((catId) => {
    const def = CATEGORY_DEFINITIONS.find((c) => c.id === catId);
    if (def) {
      data[catId] = getParsedStorageItem(def.key, def.isArray ? [] : {});
    }
  });

  return {
    app: 'Taskly',
    version: '1.0',
    exportVersion: CURRENT_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    includedData: categoriesToInclude,
    data,
  };
};

/**
 * Trigger client-side download of a JSON backup file
 */
export const downloadBackup = (backupPayload, customFileName = null) => {
  const jsonStr = JSON.stringify(backupPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const filename = customFileName || formatBackupFileName();

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Update backup metadata
  updateBackupMetadata({ lastExportAt: new Date().toISOString() });
};

/**
 * Validate imported JSON file
 */
export const validateBackupFile = (parsedJson) => {
  if (!parsedJson || typeof parsedJson !== 'object') {
    return { isValid: false, error: 'The selected file is not a valid JSON document.' };
  }

  // Handle both Step 20 format (`{ app: 'Taskly', data: {...} }`) and legacy format
  let dataPayload = parsedJson.data;
  let exportVersion = parsedJson.exportVersion || parsedJson.version || 1;

  if (!dataPayload && (parsedJson.tasks || parsedJson.notes || parsedJson.goals)) {
    dataPayload = parsedJson;
  }

  if (!dataPayload || typeof dataPayload !== 'object') {
    return { isValid: false, error: 'Backup does not contain any valid Taskly data payload.' };
  }

  if (parsedJson.app && parsedJson.app !== 'Taskly') {
    return { isValid: false, error: `Invalid application identifier: "${parsedJson.app}". Expected "Taskly".` };
  }

  if (exportVersion > CURRENT_BACKUP_VERSION) {
    return {
      isValid: false,
      error: `This backup was created by a newer version of Taskly (v${exportVersion}). Please update Taskly before importing.`,
    };
  }

  const warnings = [];
  const preview = {
    exportedAt: parsedJson.exportedAt || null,
    version: exportVersion,
    categories: {},
    totalRecords: 0,
  };

  CATEGORY_DEFINITIONS.forEach((cat) => {
    const items = dataPayload[cat.id];
    if (items !== undefined) {
      if (cat.isArray) {
        if (!Array.isArray(items)) {
          warnings.push(`Category "${cat.label}" is malformed and will be skipped.`);
        } else {
          preview.categories[cat.id] = items.length;
          preview.totalRecords += items.length;
        }
      } else {
        preview.categories[cat.id] = items && typeof items === 'object' ? 1 : 0;
        preview.totalRecords += 1;
      }
    }
  });

  if (preview.totalRecords === 0) {
    return { isValid: false, error: 'No recognizable Taskly data entries found in this backup.' };
  }

  return {
    isValid: true,
    warnings,
    preview,
    normalizedData: dataPayload,
    includedData: parsedJson.includedData || Object.keys(preview.categories),
  };
};

/**
 * Create safety backup prior to destructive actions (Pre-Restore / Reset)
 */
export const createSafetyBackup = () => {
  try {
    const fullBackup = createBackup();
    localStorage.setItem(TASKLY_STORAGE_KEYS.preRestoreBackup, JSON.stringify(fullBackup));
    return true;
  } catch (e) {
    console.error('Failed to create safety backup:', e);
    return false;
  }
};

/**
 * Check if a pre-restore safety backup is available
 */
export const hasSafetyBackup = () => {
  try {
    return Boolean(localStorage.getItem(TASKLY_STORAGE_KEYS.preRestoreBackup));
  } catch {
    return false;
  }
};

/**
 * Restore from pre-restore safety backup
 */
export const restoreSafetyBackup = () => {
  try {
    const raw = localStorage.getItem(TASKLY_STORAGE_KEYS.preRestoreBackup);
    if (!raw) return { success: false, error: 'No safety backup found.' };

    const backup = JSON.parse(raw);
    if (backup && backup.data) {
      replaceBackupData(backup.data, Object.keys(backup.data));
      return { success: true };
    }
    return { success: false, error: 'Corrupted safety backup.' };
  } catch (e) {
    console.error('Failed to restore safety backup:', e);
    return { success: false, error: e.message };
  }
};

/**
 * Execute Replace Import
 */
export const replaceBackupData = (backupData, selectedCategories = null) => {
  const categoriesToApply = selectedCategories || Object.keys(backupData);

  createSafetyBackup();

  categoriesToApply.forEach((catId) => {
    const def = CATEGORY_DEFINITIONS.find((c) => c.id === catId);
    if (def && backupData[catId] !== undefined) {
      try {
        localStorage.setItem(def.key, JSON.stringify(backupData[catId]));
      } catch (e) {
        console.error(`Failed writing category ${catId}:`, e);
      }
    }
  });

  updateBackupMetadata({
    lastImportAt: new Date().toISOString(),
    lastImportType: 'replace',
  });
};

/**
 * Execute Safe Merge Import with Reference Preservation
 * Conflict strategies: 'keep_existing' | 'replace_existing' | 'create_copy'
 */
export const mergeBackupData = (backupData, selectedCategories = null, conflictStrategy = 'keep_existing') => {
  const categoriesToApply = selectedCategories || Object.keys(backupData);

  createSafetyBackup();

  const idMap = new Map(); // Old ID -> New ID if copies created

  // 1. Process Projects first (so Tasks can reference new Project IDs)
  if (categoriesToApply.includes('projects') && Array.isArray(backupData.projects)) {
    const existing = getParsedStorageItem(TASKLY_STORAGE_KEYS.projects, []);
    const existingMap = new Map(existing.map((p) => [p.id, p]));
    const mergedProjects = [...existing];

    backupData.projects.forEach((proj) => {
      if (!proj || !proj.id) return;
      if (!existingMap.has(proj.id)) {
        mergedProjects.push(proj);
      } else if (conflictStrategy === 'replace_existing') {
        const idx = mergedProjects.findIndex((p) => p.id === proj.id);
        if (idx !== -1) mergedProjects[idx] = proj;
      } else if (conflictStrategy === 'create_copy') {
        const newId = `proj-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        idMap.set(proj.id, newId);
        mergedProjects.push({ ...proj, id: newId, name: `${proj.name} (Copy)` });
      }
    });

    localStorage.setItem(TASKLY_STORAGE_KEYS.projects, JSON.stringify(mergedProjects));
  }

  // 2. Process Goals (so Tasks can reference new Goal IDs)
  if (categoriesToApply.includes('goals') && Array.isArray(backupData.goals)) {
    const existing = getParsedStorageItem(TASKLY_STORAGE_KEYS.goals, []);
    const existingMap = new Map(existing.map((g) => [g.id, g]));
    const mergedGoals = [...existing];

    backupData.goals.forEach((goal) => {
      if (!goal || !goal.id) return;
      if (!existingMap.has(goal.id)) {
        mergedGoals.push(goal);
      } else if (conflictStrategy === 'replace_existing') {
        const idx = mergedGoals.findIndex((g) => g.id === goal.id);
        if (idx !== -1) mergedGoals[idx] = goal;
      } else if (conflictStrategy === 'create_copy') {
        const newId = `goal-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        idMap.set(goal.id, newId);
        mergedGoals.push({ ...goal, id: newId, title: `${goal.title} (Copy)` });
      }
    });

    localStorage.setItem(TASKLY_STORAGE_KEYS.goals, JSON.stringify(mergedGoals));
  }

  // 3. Process Tasks with ID Mapping and Dependency references
  if (categoriesToApply.includes('tasks') && Array.isArray(backupData.tasks)) {
    const existing = getParsedStorageItem(TASKLY_STORAGE_KEYS.tasks, []);
    const existingMap = new Map(existing.map((t) => [t.id, t]));
    const mergedTasks = [...existing];

    // First pass: generate task ID copies if needed
    if (conflictStrategy === 'create_copy') {
      backupData.tasks.forEach((t) => {
        if (t && t.id && existingMap.has(t.id)) {
          idMap.set(t.id, `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`);
        }
      });
    }

    backupData.tasks.forEach((task) => {
      if (!task || !task.id) return;

      let taskToSave = { ...task };

      // Remap linked project or goal if parent was copied
      if (taskToSave.projectId && idMap.has(taskToSave.projectId)) {
        taskToSave.projectId = idMap.get(taskToSave.projectId);
      }
      if (taskToSave.goalId && idMap.has(taskToSave.goalId)) {
        taskToSave.goalId = idMap.get(taskToSave.goalId);
      }

      // Remap dependency references
      if (Array.isArray(taskToSave.dependencyIds)) {
        taskToSave.dependencyIds = taskToSave.dependencyIds.map((depId) => idMap.get(depId) || depId);
      }

      if (!existingMap.has(task.id)) {
        mergedTasks.push(taskToSave);
      } else if (conflictStrategy === 'replace_existing') {
        const idx = mergedTasks.findIndex((t) => t.id === task.id);
        if (idx !== -1) mergedTasks[idx] = taskToSave;
      } else if (conflictStrategy === 'create_copy') {
        const newId = idMap.get(task.id) || `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        mergedTasks.push({ ...taskToSave, id: newId, title: `${task.title} (Copy)` });
      }
    });

    localStorage.setItem(TASKLY_STORAGE_KEYS.tasks, JSON.stringify(mergedTasks));
  }

  // 4. Process Other Categories
  const otherArrayCategories = ['notes', 'recurringTasks', 'templates', 'focusSessions', 'notifications', 'activity', 'savedViews'];
  otherArrayCategories.forEach((catId) => {
    if (categoriesToApply.includes(catId) && Array.isArray(backupData[catId])) {
      const def = CATEGORY_DEFINITIONS.find((c) => c.id === catId);
      if (!def) return;

      const existing = getParsedStorageItem(def.key, []);
      const existingMap = new Map(existing.map((item) => [item.id, item]));
      const mergedList = [...existing];

      backupData[catId].forEach((item) => {
        if (!item || !item.id) return;
        if (!existingMap.has(item.id)) {
          mergedList.push(item);
        } else if (conflictStrategy === 'replace_existing') {
          const idx = mergedList.findIndex((it) => it.id === item.id);
          if (idx !== -1) mergedList[idx] = item;
        } else if (conflictStrategy === 'create_copy') {
          const newId = `${catId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          mergedList.push({
            ...item,
            id: newId,
            title: item.title ? `${item.title} (Copy)` : item.title,
            name: item.name ? `${item.name} (Copy)` : item.name,
          });
        }
      });

      localStorage.setItem(def.key, JSON.stringify(mergedList));
    }
  });

  // Settings & Objects
  ['settings', 'dashboardSettings'].forEach((catId) => {
    if (categoriesToApply.includes(catId) && backupData[catId] && typeof backupData[catId] === 'object') {
      const def = CATEGORY_DEFINITIONS.find((c) => c.id === catId);
      if (def) {
        if (conflictStrategy === 'replace_existing') {
          localStorage.setItem(def.key, JSON.stringify(backupData[catId]));
        } else {
          const existing = getParsedStorageItem(def.key, {});
          localStorage.setItem(def.key, JSON.stringify({ ...backupData[catId], ...existing }));
        }
      }
    }
  });

  updateBackupMetadata({
    lastImportAt: new Date().toISOString(),
    lastImportType: 'merge',
  });
};

/**
 * Clear a specific Taskly category only
 */
export const clearTasklyCategory = (categoryId) => {
  const def = CATEGORY_DEFINITIONS.find((c) => c.id === categoryId);
  if (!def) return;

  createSafetyBackup();

  try {
    localStorage.setItem(def.key, JSON.stringify(def.isArray ? [] : {}));
  } catch (e) {
    console.error(`Failed to clear category ${categoryId}:`, e);
  }
};

/**
 * Clear all Taskly data safely (NEVER calls localStorage.clear())
 */
export const clearAllTasklyData = () => {
  createSafetyBackup();

  Object.values(TASKLY_STORAGE_KEYS).forEach((key) => {
    if (key !== TASKLY_STORAGE_KEYS.preRestoreBackup) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error(`Failed removing ${key}:`, e);
      }
    }
  });
};

/**
 * Metadata Helpers
 */
export const getBackupMetadata = () => {
  return getParsedStorageItem(TASKLY_STORAGE_KEYS.backupMetadata, {
    lastExportAt: null,
    lastImportAt: null,
    lastImportType: null,
  });
};

export const updateBackupMetadata = (updates) => {
  try {
    const current = getBackupMetadata();
    const next = { ...current, ...updates };
    localStorage.setItem(TASKLY_STORAGE_KEYS.backupMetadata, JSON.stringify(next));
    return next;
  } catch (e) {
    console.error('Failed to update backup metadata:', e);
    return updates;
  }
};

/**
 * Calculate if backup reminder is overdue
 */
export const isBackupReminderOverdue = (reminderFrequency = 'monthly', lastExportAt = null) => {
  if (!reminderFrequency || reminderFrequency === 'off') return false;

  const lastTime = lastExportAt ? new Date(lastExportAt).getTime() : 0;
  const now = Date.now();
  const diffDays = (now - lastTime) / (1000 * 60 * 60 * 24);

  switch (reminderFrequency) {
    case 'weekly':
      return diffDays >= 7;
    case 'biweekly':
      return diffDays >= 14;
    case 'monthly':
      return diffDays >= 30;
    default:
      return false;
  }
};
