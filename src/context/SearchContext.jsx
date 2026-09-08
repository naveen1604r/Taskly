import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useTaskContext } from './TaskContext';
import { useNotesContext } from './NotesContext';
import { useGoalsContext } from './GoalsContext';
import { useProjectContext } from './ProjectContext';
import { useInboxContext } from './InboxContext';
import { useHabitContext } from './HabitContext';
import { searchAll } from '../utils/searchUtils';
import { applyAllFilters, sortTasks } from '../utils/filterUtils';

const RECENT_SEARCHES_KEY = 'taskly_recent_searches';
const SAVED_VIEWS_KEY = 'taskly_saved_views';
const MAX_RECENT_SEARCHES = 10;

const defaultFilters = {
  status: 'all',
  priority: 'all',
  category: 'all',
  projectId: 'all',
  tags: [],
  date: 'all',
  duration: 'all',
  goalId: 'all',
  customRange: { start: '', end: '' },
};

const defaultPresetViews = [
  {
    id: 'view-today-focus',
    name: "Today's Focus",
    searchQuery: '',
    filters: { ...defaultFilters, date: 'today', status: 'pending' },
    sortBy: 'priority',
    sortDirection: 'desc',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'view-high-priority',
    name: 'High Priority',
    searchQuery: '',
    filters: { ...defaultFilters, priority: 'high' },
    sortBy: 'due_date',
    sortDirection: 'asc',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'view-overdue',
    name: 'Overdue Tasks',
    searchQuery: '',
    filters: { ...defaultFilters, status: 'overdue' },
    sortBy: 'due_date',
    sortDirection: 'asc',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const { tasks } = useTaskContext();
  const { notes } = useNotesContext();
  const { goals } = useGoalsContext();
  const { projects = [] } = useProjectContext();
  const { inboxItems = [] } = useInboxContext();
  const { habits = [] } = useHabitContext() || {};

  // Search Modal / Overlay visibility
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Recent Searches
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : ['portfolio', 'react', 'urgent', 'meeting'];
    } catch {
      return ['portfolio', 'react', 'urgent', 'meeting'];
    }
  });

  // Task Filter states
  const [activeFilters, setActiveFilters] = useState(defaultFilters);

  // Sorting states
  const [sortBy, setSortBy] = useState('recently_updated');
  const [sortDirection, setSortDirection] = useState('desc');

  // Saved Views
  const [savedViews, setSavedViews] = useState(() => {
    try {
      const saved = localStorage.getItem(SAVED_VIEWS_KEY);
      return saved ? JSON.parse(saved) : defaultPresetViews;
    } catch {
      return defaultPresetViews;
    }
  });
  const [activeViewId, setActiveViewId] = useState(null);

  // Sync recent searches to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
    } catch (e) {
      console.error('Failed to save recent searches:', e);
    }
  }, [recentSearches]);

  // Sync saved views to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(savedViews));
    } catch (e) {
      console.error('Failed to save views:', e);
    }
  }, [savedViews]);

  // Keyboard shortcut listener: Ctrl + K, Cmd + K, Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + K or Cmd + K opens search
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      // Escape closes search overlay
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Derived Multi-Entity Search Results
  const searchResults = useMemo(() => {
    return searchAll({
      tasks,
      notes,
      goals,
      projects,
      inboxItems,
      habits,
      query: searchQuery,
    });
  }, [tasks, notes, goals, projects, inboxItems, habits, searchQuery]);

  // Open & Close Search
  const openSearch = (initialQuery = '') => {
    if (initialQuery) setSearchQuery(initialQuery);
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  // Recent Searches management
  const addRecentSearch = (query) => {
    const trimmed = (query || '').trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    });
  };

  const removeRecentSearch = (queryToRemove) => {
    setRecentSearches((prev) =>
      prev.filter((q) => q.toLowerCase() !== queryToRemove.toLowerCase())
    );
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  // Filter setters
  const setFilter = (key, value) => {
    setActiveViewId(null);
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const removeFilter = (key) => {
    setActiveViewId(null);
    setActiveFilters((prev) => ({
      ...prev,
      [key]: defaultFilters[key],
    }));
  };

  const clearFilters = () => {
    setActiveViewId(null);
    setActiveFilters(defaultFilters);
  };

  // Sort setters
  const setSorting = (newSortBy, direction = null) => {
    setActiveViewId(null);
    setSortBy(newSortBy);
    if (direction) {
      setSortDirection(direction);
    }
  };

  const toggleSortDirection = () => {
    setActiveViewId(null);
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // Saved Views operations
  const saveView = (name) => {
    const newView = {
      id: `view-${Date.now()}`,
      name: name.trim() || 'Untitled View',
      searchQuery: '',
      filters: { ...activeFilters },
      sortBy,
      sortDirection,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSavedViews((prev) => [...prev, newView]);
    setActiveViewId(newView.id);
    return newView;
  };

  const renameView = (id, newName) => {
    setSavedViews((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, name: newName.trim(), updatedAt: new Date().toISOString() }
          : v
      )
    );
  };

  const deleteView = (id) => {
    setSavedViews((prev) => prev.filter((v) => v.id !== id));
    if (activeViewId === id) {
      setActiveViewId(null);
    }
  };

  const applyView = (id) => {
    const target = savedViews.find((v) => v.id === id);
    if (!target) return;

    setActiveFilters({ ...target.filters });
    if (target.sortBy) setSortBy(target.sortBy);
    if (target.sortDirection) setSortDirection(target.sortDirection);
    setActiveViewId(id);
  };

  // Active filter count for badges
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeFilters.status !== 'all') count++;
    if (activeFilters.priority !== 'all') count++;
    if (activeFilters.category !== 'all') count++;
    if (Array.isArray(activeFilters.tags) && activeFilters.tags.length > 0) count++;
    if (activeFilters.date !== 'all') count++;
    if (activeFilters.duration !== 'all') count++;
    if (activeFilters.goalId !== 'all') count++;
    return count;
  }, [activeFilters]);

  // Derived filtered & sorted tasks
  const filteredAndSortedTasks = useMemo(() => {
    const filtered = applyAllFilters(tasks, activeFilters);
    return sortTasks(filtered, sortBy, sortDirection);
  }, [tasks, activeFilters, sortBy, sortDirection]);

  const value = {
    // Global Search State
    isSearchOpen,
    searchQuery,
    searchResults,
    recentSearches,
    openSearch,
    closeSearch,
    setSearchQuery,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,

    // Task Filters & Sorting State
    activeFilters,
    activeFilterCount,
    setFilter,
    removeFilter,
    clearFilters,
    sortBy,
    sortDirection,
    setSorting,
    toggleSortDirection,

    // Saved Views State
    savedViews,
    activeViewId,
    saveView,
    renameView,
    deleteView,
    applyView,

    // Processed Tasks
    filteredAndSortedTasks,
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
}
