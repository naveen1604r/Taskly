/**
 * Goal utilities, progress calculations, deadlines, and seed data
 */
import { getTodayDateString, getOffsetDateString } from './taskStorage';

export const GOALS_STORAGE_KEY = 'taskly_goals';

export const goalCategories = [
  'Learning',
  'Career',
  'Personal',
  'Health',
  'Finance',
  'Projects',
  'Other',
];

/**
 * Calculate progress based on linked tasks
 */
export const calculateTaskProgress = (relatedTaskIds, allTasks) => {
  if (!relatedTaskIds || relatedTaskIds.length === 0) return 0;
  const linkedTasks = allTasks.filter((t) => relatedTaskIds.includes(t.id));
  if (linkedTasks.length === 0) return 0;

  const completedCount = linkedTasks.filter((t) => t.status === 'completed').length;
  return Math.round((completedCount / linkedTasks.length) * 100);
};

/**
 * Calculate progress based on milestones
 */
export const calculateMilestoneProgress = (milestones) => {
  if (!milestones || milestones.length === 0) return 0;
  const completed = milestones.filter((m) => m.completed).length;
  return Math.round((completed / milestones.length) * 100);
};

/**
 * Calculate days remaining, overdue, or due soon status
 */
export const getGoalDeadlineInfo = (targetDate, status) => {
  if (status === 'completed') {
    return { label: 'Completed', isCompleted: true, isDueSoon: false, isOverdue: false, days: 0 };
  }
  if (!targetDate) {
    return { label: 'No deadline', isCompleted: false, isDueSoon: false, isOverdue: false, days: 0 };
  }

  const today = new Date(getTodayDateString());
  const target = new Date(targetDate);
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      label: `Overdue by ${overdueDays} ${overdueDays === 1 ? 'day' : 'days'}`,
      isOverdue: true,
      isDueSoon: false,
      isCompleted: false,
      days: diffDays,
    };
  }

  if (diffDays === 0) {
    return {
      label: 'Due today',
      isDueSoon: true,
      isOverdue: false,
      isCompleted: false,
      days: 0,
    };
  }

  const isDueSoon = diffDays <= 7;
  return {
    label: isDueSoon ? `⚠ Due in ${diffDays} ${diffDays === 1 ? 'day' : 'days'}` : `${diffDays} days remaining`,
    isDueSoon,
    isOverdue: false,
    isCompleted: false,
    days: diffDays,
  };
};

/**
 * Calculate average progress of active goals
 */
export const calculateAverageProgress = (goals) => {
  const active = goals.filter((g) => g.status === 'active');
  if (active.length === 0) return 0;
  const total = active.reduce((acc, curr) => acc + (Number(curr.progress) || 0), 0);
  return Math.round(total / active.length);
};

// Initial seed goals reflecting Step 7 exact requirements (4 active, 2 completed, 1 due soon, ~68% avg progress)
export const initialSeedGoals = [];

export const loadGoalsFromStorage = () => {
  try {
    const raw = localStorage.getItem(GOALS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load goals from localStorage:', error);
    return [];
  }
};

export const saveGoalsToStorage = (goals) => {
  try {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error('Failed to save goals to localStorage:', error);
  }
};
