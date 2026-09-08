/**
 * Task storage utility managing localStorage persistence and initial seed data
 */

export const STORAGE_KEY = 'taskly_tasks';

// Formats YYYY-MM-DD for local date
export const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getOffsetDateString = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
export const initialSeedTasks = [];


export const DEMO_TASK_TITLES = [
  'Learn React Hooks',
  'Practice JavaScript ES6+ algorithms',
  'Learn HTML & Semantic Structure',
  'Build Responsive Navigation',
  'Design System Token Audit',
  'Full-Stack Dashboard Architecture',
  'Daily Team Standup & Sync',
  'Review User Feedback & Bugs',
  'Prepare Weekly Release Notes',
  'Complete Portfolio Case Study',
  'React Interview Preparation',
  'Morning Study & Reading',
  'Fitness & Workout Session',
  'Weekly Systems Review',
];

export const DEMO_RECURRING_IDS = ['recurring-001', 'recurring-002', 'recurring-003', 'rec-1', 'rec-2', 'rec-3'];

/**
 * Check if a task is an automatically generated demo task or routine duplicate
 */
export const isDemoTask = (task) => {
  if (!task) return false;

  // 1. Check seed task IDs
  const seedIds = [
    'task-1', 'task-2', 'task-3', 'task-4', 'task-5',
    'task-6', 'task-7', 'task-8', 'task-9', 'task-10', 'task-11'
  ];
  if (seedIds.includes(task.id)) return true;

  // 2. Check demo recurring rule IDs
  if (task.recurringTaskId && DEMO_RECURRING_IDS.includes(task.recurringTaskId)) {
    return true;
  }

  // 3. Check automatically generated duplicate routine instances
  const routineDuplicates = [
    'Morning Study & Reading',
    'Fitness & Workout Session',
    'Weekly Systems Review',
  ];
  if (routineDuplicates.includes(task.title?.trim())) {
    return true;
  }

  return false;
};

/**
 * Filter out demo / fake / generated tasks, keeping only user-created tasks
 */
export const cleanDemoTasks = (tasks = []) => {
  if (!Array.isArray(tasks)) return [];
  return tasks.filter((t) => !isDemoTask(t));
};

export const loadTasksFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((t) => ({
        ...t,
        subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
        tags: Array.isArray(t.tags) ? t.tags : [],
        taskNotes: t.taskNotes || '',
        estimatedDuration: Number(t.estimatedDuration || t.duration) || 30,
        actualDuration: Number(t.actualDuration) || 0,
        projectId: t.projectId || null,
        recurringTaskId: t.recurringTaskId || null,
        occurrenceDate: t.occurrenceDate || null,
        isRecurringOccurrence: Boolean(t.recurringTaskId),
      }));
    }
    return [];
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error);
    return [];
  }
};

export const saveTasksToStorage = (tasks) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
  }
};
