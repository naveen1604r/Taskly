import { getTodayDateString, getOffsetDateString } from './taskStorage';
import { isTaskOverdue } from './filterUtils';
import { isTaskBlocked } from './dependencyUtils';

export const PROJECT_STORAGE_KEY = 'taskly_projects';

export const initialSeedProjects = [];


/**
 * Calculate comprehensive progress metrics for a project
 */
export const calculateProjectProgress = (projectId, allTasks = []) => {
  const projectTasks = allTasks.filter((t) => t.projectId === projectId);
  const total = projectTasks.length;

  const completed = projectTasks.filter((t) => t.status === 'completed').length;
  const inProgress = projectTasks.filter((t) => t.status === 'in_progress').length;
  const pending = projectTasks.filter((t) => t.status === 'pending' || !t.status).length;
  const blocked = projectTasks.filter((t) => isTaskBlocked(t, allTasks)).length;
  const overdue = projectTasks.filter((t) => isTaskOverdue(t)).length;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Estimated vs actual durations
  let estimatedMins = 0;
  let actualMins = 0;
  projectTasks.forEach((t) => {
    let est = Number(t.estimatedDuration || t.duration) || 30;
    if (t.durationUnit === 'hours') est *= 60;
    estimatedMins += est;
    actualMins += Number(t.actualDuration) || (t.status === 'completed' ? est : 0);
  });

  return {
    total,
    completed,
    inProgress,
    pending,
    blocked,
    overdue,
    percentage,
    estimatedMins,
    actualMins,
    tasks: projectTasks,
  };
};

/**
 * Deterministic Project Health Calculator
 * States: 'Completed' | 'Overdue' | 'Blocked' | 'At Risk' | 'Healthy'
 */
export const getProjectHealth = (project, allTasks = []) => {
  if (!project) return { status: 'Healthy', badgeColor: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/25' };

  if (project.status === 'completed') {
    return {
      status: 'Completed',
      badgeColor: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/25',
      description: 'All milestones completed.',
    };
  }

  const todayStr = getTodayDateString();
  const isProjectOverdue = project.dueDate && project.dueDate < todayStr;
  const stats = calculateProjectProgress(project.id, allTasks);

  if (isProjectOverdue && stats.percentage < 100) {
    return {
      status: 'Overdue',
      badgeColor: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/25',
      description: 'Target due date has passed with incomplete deliverables.',
    };
  }

  if (stats.blocked > 0 && stats.blocked >= stats.total * 0.4) {
    return {
      status: 'Blocked',
      badgeColor: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25',
      description: `${stats.blocked} tasks are waiting on incomplete dependencies.`,
    };
  }

  if (stats.overdue > 2 || (stats.overdue > 0 && stats.percentage < 40)) {
    return {
      status: 'At Risk',
      badgeColor: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25',
      description: 'Multiple overdue deliverables requiring urgent attention.',
    };
  }

  return {
    status: 'Healthy',
    badgeColor: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/25',
    description: 'Progress is on track with low bottleneck friction.',
  };
};

/**
 * Get project timeline, remaining days, and pace
 */
export const getProjectTimelineStats = (project) => {
  if (!project || !project.dueDate) {
    return { daysRemaining: 0, isOverdue: false, label: 'No deadline set' };
  }

  const today = new Date(getTodayDateString());
  const due = new Date(project.dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isOverdue = diffDays < 0;
  const daysRemaining = Math.abs(diffDays);

  let label = `${daysRemaining} days left`;
  if (diffDays === 0) label = 'Due Today';
  else if (isOverdue) label = `${daysRemaining} days overdue`;

  return {
    daysRemaining,
    isOverdue,
    label,
    startDate: project.startDate || '',
    dueDate: project.dueDate,
  };
};
