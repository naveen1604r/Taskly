import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useTaskContext } from './TaskContext';
import { useActivityContext } from './ActivityContext';
import {
  BOARD_ORDER_KEY,
  BOARD_SETTINGS_KEY,
  normalizeBoardOrder,
  getTasksByStatus,
  reorderTasksInColumn,
  moveTaskBetweenColumns,
  getBoardProgress,
  getBoardColumnCounts,
} from '../utils/boardUtils';

const defaultCollapsed = {
  pending: false,
  in_progress: false,
  completed: false,
};

const BoardContext = createContext(null);

export function BoardProvider({ children }) {
  const { tasks, updateTask, toggleTaskStatus } = useTaskContext();
  const { logActivity } = useActivityContext();

  // 1. Board Order (persisted in localStorage)
  const [boardOrder, setBoardOrder] = useState(() => {
    try {
      const saved = localStorage.getItem(BOARD_ORDER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load board order:', e);
    }
    return { pending: [], in_progress: [], completed: [] };
  });

  // 2. Board Settings (collapsed columns & view density)
  const [collapsedColumns, setCollapsedColumns] = useState(() => {
    try {
      const saved = localStorage.getItem(BOARD_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultCollapsed, ...parsed.collapsed };
      }
    } catch (e) {
      console.error('Failed to load board settings:', e);
    }
    return defaultCollapsed;
  });

  const [boardView, setBoardView] = useState(() => {
    try {
      const saved = localStorage.getItem(BOARD_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.view || 'comfortable';
      }
    } catch {
      return 'comfortable';
    }
    return 'comfortable';
  });

  // 3. In-board Search, Sort, Filters, and Mobile Tab States
  const [boardSearchQuery, setBoardSearchQuery] = useState('');
  const [boardSortBy, setBoardSortBy] = useState('manual');
  const [boardSortDirection, setBoardSortDirection] = useState('desc');
  const [activeMobileTab, setActiveMobileTab] = useState('pending');
  const [boardFilters, setBoardFilters] = useState({
    priority: 'all',
    category: 'all',
    projectId: 'all',
    status: 'all',
    tags: [],
  });

  // 4. Drag & Drop Live States
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Sync and normalize board order against task array
  useEffect(() => {
    setBoardOrder((prev) => {
      const normalized = normalizeBoardOrder({ tasks, currentOrder: prev });
      try {
        localStorage.setItem(BOARD_ORDER_KEY, JSON.stringify(normalized));
      } catch (e) {
        console.error('Failed to save board order:', e);
      }
      return normalized;
    });
  }, [tasks]);

  // Persist board settings
  useEffect(() => {
    try {
      localStorage.setItem(
        BOARD_SETTINGS_KEY,
        JSON.stringify({
          collapsed: collapsedColumns,
          view: boardView,
        })
      );
    } catch (e) {
      console.error('Failed to save board settings:', e);
    }
  }, [collapsedColumns, boardView]);

  // Move Task Status (Drag or accessible Move To... menu)
  const moveTaskStatus = useCallback(
    (taskId, targetStatus, targetIndex = null) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const sourceStatus = task.status || 'pending';
      if (sourceStatus === targetStatus && targetIndex === null) return;

      // Update Task in TaskContext
      const updates = {
        status: targetStatus,
      };

      if (targetStatus === 'completed') {
        updates.completedAt = new Date().toISOString();
      } else if (sourceStatus === 'completed') {
        updates.completedAt = null;
      }

      updateTask(taskId, updates);

      // Update Board Order
      setBoardOrder((prev) => {
        const updated = moveTaskBetweenColumns({
          boardOrder: prev,
          sourceColumn: sourceStatus,
          targetColumn: targetStatus,
          taskId,
          targetIndex,
        });
        try {
          localStorage.setItem(BOARD_ORDER_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to save board order:', e);
        }
        return updated;
      });

      // Log Activity
      if (logActivity) {
        const statusNames = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' };
        logActivity({
          title: `Moved "${task.title}" to ${statusNames[targetStatus] || targetStatus}`,
          category: task.category || 'Work',
          relatedTaskId: taskId,
        });
      }
    },
    [tasks, updateTask, logActivity]
  );

  // Reorder Task within Same Column
  const reorderTaskInColumn = useCallback((columnId, sourceIndex, targetIndex) => {
    setBoardOrder((prev) => {
      const reordered = reorderTasksInColumn({
        boardOrder: prev,
        columnId,
        sourceIndex,
        targetIndex,
      });
      try {
        localStorage.setItem(BOARD_ORDER_KEY, JSON.stringify(reordered));
      } catch (e) {
        console.error('Failed to save board order:', e);
      }
      return reordered;
    });
  }, []);

  // Collapse / Expand Column
  const toggleColumnCollapse = (columnId) => {
    setCollapsedColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const setViewDensity = (view) => {
    setBoardView(view);
  };

  // Move Task to Column via Dropdown
  const moveTaskToColumn = (taskId, targetColumn) => {
    moveTaskStatus(taskId, targetColumn);
  };

  // Quick Complete from Board
  const completeBoardTask = (taskId) => {
    toggleTaskStatus(taskId);
  };

  // Reset Board Order to Default
  const resetBoardOrder = () => {
    const normalized = normalizeBoardOrder({ tasks, currentOrder: {} });
    setBoardOrder(normalized);
  };

  // Grouped Tasks for Kanban View
  const groupedTasks = useMemo(() => {
    return getTasksByStatus({
      tasks,
      boardOrder,
      sortBy: boardSortBy,
      sortDirection: boardSortDirection,
      activeFilters: boardFilters,
      searchQuery: boardSearchQuery,
    });
  }, [tasks, boardOrder, boardSortBy, boardSortDirection, boardFilters, boardSearchQuery]);

  // Overall Progress
  const progress = useMemo(() => getBoardProgress(tasks), [tasks]);
  const columnCounts = useMemo(() => getBoardColumnCounts(tasks), [tasks]);

  const value = {
    // Board State
    boardOrder,
    groupedTasks,
    collapsedColumns,
    boardView,
    activeMobileTab,
    boardSearchQuery,
    boardSortBy,
    boardSortDirection,
    boardFilters,
    draggedTaskId,
    dragOverColumn,
    progress,
    columnCounts,

    // Setters & Actions
    setBoardSearchQuery,
    setBoardSortBy,
    setBoardSortDirection,
    setBoardFilters,
    setActiveMobileTab,
    setDraggedTaskId,
    setDragOverColumn,
    toggleColumnCollapse,
    setViewDensity,
    moveTaskStatus,
    reorderTaskInColumn,
    moveTaskToColumn,
    completeBoardTask,
    resetBoardOrder,
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoardContext() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  return context;
}
