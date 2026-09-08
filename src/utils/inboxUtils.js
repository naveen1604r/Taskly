import { getTodayDateString } from './taskStorage';

export const INBOX_STORAGE_KEY = 'taskly_inbox';

export const INBOX_TYPES = [
  { id: 'task', label: 'Task', icon: 'CheckSquare', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { id: 'habit', label: 'Habit', icon: 'Flame', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  { id: 'note', label: 'Note', icon: 'FileText', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'reminder', label: 'Reminder', icon: 'Bell', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { id: 'idea', label: 'Idea', icon: 'Lightbulb', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  { id: 'follow_up', label: 'Follow-up', icon: 'ArrowRightCircle', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
];

/**
 * Generate unique Inbox Item ID
 */
export const generateInboxId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `inbox-${crypto.randomUUID()}`;
  }
  return `inbox-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a new standardized inbox item object
 */
export const createInboxItem = (data = {}) => {
  const now = new Date().toISOString();
  return {
    id: data.id || generateInboxId(),
    type: data.type || 'task', // task | note | reminder | idea | follow_up
    title: data.title?.trim() || 'Untitled Capture',
    description: data.description?.trim() || '',
    priority: data.priority || 'medium', // low | medium | high
    category: data.category || 'General',
    tags: Array.isArray(data.tags) ? data.tags : [],
    estimatedDuration: Number(data.estimatedDuration) || 30,
    capturedAt: data.capturedAt || now,
    source: data.source || 'quick_capture', // quick_capture | web | manual
    status: data.status || 'unprocessed', // unprocessed | processed | archived
    processedAt: data.processedAt || null,
    convertedTaskId: data.convertedTaskId || null,
    convertedNoteId: data.convertedNoteId || null,
    createdAt: data.createdAt || now,
    updatedAt: now,
  };
};

/**
 * Filter and sort inbox items
 */
export const filterAndSortInbox = (
  items = [],
  { status = 'unprocessed', type = 'all', priority = 'all', search = '', sortBy = 'newest' } = {}
) => {
  let result = [...items];

  // 1. Status filter
  if (status !== 'all') {
    result = result.filter((item) => item.status === status);
  }

  // 2. Type filter
  if (type !== 'all') {
    result = result.filter((item) => item.type === type);
  }

  // 3. Priority filter
  if (priority !== 'all') {
    result = result.filter((item) => item.priority === priority);
  }

  // 4. Search query
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  // 5. Sorting
  result.sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    }
    if (sortBy === 'priority') {
      const pWeights = { high: 3, medium: 2, low: 1 };
      return (pWeights[b.priority] || 2) - (pWeights[a.priority] || 2);
    }
    if (sortBy === 'duration') {
      return (b.estimatedDuration || 0) - (a.estimatedDuration || 0);
    }
    return 0;
  });

  return result;
};

/**
 * Calculate Inbox Summary Statistics
 */
export const getInboxStats = (items = []) => {
  const todayStr = getTodayDateString();

  const total = items.length;
  const unprocessed = items.filter((i) => i.status === 'unprocessed').length;
  const processed = items.filter((i) => i.status === 'processed').length;
  const archived = items.filter((i) => i.status === 'archived').length;

  const processedToday = items.filter((i) => {
    if (i.status !== 'processed' || !i.processedAt) return false;
    return i.processedAt.split('T')[0] === todayStr;
  }).length;

  const needsAction = items.filter(
    (i) => i.status === 'unprocessed' && i.priority === 'high'
  ).length;

  return {
    total,
    unprocessed,
    processed,
    archived,
    processedToday,
    needsAction,
  };
};

/**
 * Load Initial Seed Data if storage is empty (Empty by default)
 */
export const seedInboxItems = () => {
  return [];
};

export const loadInboxFromStorage = () => {
  try {
    const raw = localStorage.getItem(INBOX_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load inbox items:', e);
    return [];
  }
};

export const saveInboxToStorage = (items) => {
  try {
    localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save inbox items:', e);
  }
};
