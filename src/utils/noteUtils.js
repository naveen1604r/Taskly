/**
 * Notes persistence and text / relative time helpers
 */

export const NOTES_STORAGE_KEY = 'taskly_notes';

/**
 * Truncate text without awkwardly cutting words
 */
export const truncateText = (text, maxLength = 130) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  const trimmed = text.substring(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  if (lastSpace > 30) {
    return `${trimmed.substring(0, lastSpace)}...`;
  }
  return `${trimmed}...`;
};

/**
 * Format relative date time e.g. "Just now", "2 hours ago", "Yesterday", "Sep 1, 2026"
 */
export const formatRelativeTime = (isoString) => {
  if (!isoString) return '';
  try {
    const time = new Date(isoString).getTime();
    const now = Date.now();
    const diffMs = now - time;

    if (diffMs < 0) return 'Just now';

    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
    if (diffHours < 24) return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

export const initialSeedNotes = [];


export const loadNotesFromStorage = () => {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load notes from localStorage:', error);
    return [];
  }
};

export const saveNotesToStorage = (notes) => {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to save notes to localStorage:', error);
  }
};
