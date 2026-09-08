import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTaskContext } from './TaskContext';
import { useActivityContext } from './ActivityContext';
import { useAuthContext } from './AuthContext';
import { api } from '../services/api';
import {
  INBOX_STORAGE_KEY,
  loadInboxFromStorage,
  saveInboxToStorage,
  createInboxItem,
  getInboxStats,
  filterAndSortInbox,
} from '../utils/inboxUtils';

const InboxContext = createContext(null);

export function InboxProvider({ children }) {
  const { showToast } = useTaskContext();
  const { logActivity } = useActivityContext() || {};
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthContext();

  const [inboxItems, setInboxItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Capture & Process Modal States
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [itemToProcess, setItemToProcess] = useState(null);

  // Fetch inbox items from backend API
  const fetchInboxData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setInboxItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const res = await api.inbox.getAll();
      if (res.success && res.data?.inboxItems) {
        setInboxItems(
          res.data.inboxItems.map((item) => ({
            id: String(item.id),
            title: item.title,
            content: item.notes || '',
            notes: item.notes || '',
            type: item.category || 'Quick Note',
            status: item.processed ? 'processed' : 'unprocessed',
            convertedTaskId: item.convertedTaskId || null,
            convertedNoteId: item.convertedNoteId || null,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }))
        );
      }
    } catch (err) {
      console.warn('Failed to load inbox items from API:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchInboxData();
    }
  }, [fetchInboxData, isAuthLoading]);

  // Sync to localStorage as client fallback cache
  useEffect(() => {
    saveInboxToStorage(inboxItems);
  }, [inboxItems]);

  // Global Keyboard Shortcut: 'Q' for Quick Capture (Requirement 3)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) {
        return;
      }

      if ((e.key === 'q' || e.key === 'Q') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsQuickCaptureOpen(true);
      } else if (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsQuickCaptureOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add Item to Inbox
  const addInboxItem = useCallback(async (data) => {
    const newItem = createInboxItem(data);
    setInboxItems((prev) => [newItem, ...prev]);

    if (isAuthenticated) {
      try {
        const res = await api.inbox.create({
          title: newItem.title,
          notes: newItem.notes || newItem.content || '',
          category: newItem.type || 'Quick Note',
          processed: false,
        });
        if (res.success && res.data?.inboxItem) {
          const created = res.data.inboxItem;
          setInboxItems((prev) =>
            prev.map((it) =>
              it.id === newItem.id ? { ...it, id: String(created.id) } : it
            )
          );
        }
      } catch (err) {
        console.warn('API createInboxItem warning:', err.message);
      }
    }

    if (showToast) {
      showToast(`Captured to Inbox: "${newItem.title}"`, 'success');
    }

    if (logActivity) {
      logActivity({
        title: `Captured to Inbox: "${newItem.title}" (${newItem.type})`,
        category: 'Inbox',
      });
    }

    return newItem;
  }, [isAuthenticated, showToast, logActivity]);

  // Update Item
  const updateInboxItem = useCallback(async (id, updates) => {
    setInboxItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      )
    );

    if (isAuthenticated) {
      try {
        await api.inbox.update(id, {
          title: updates.title,
          notes: updates.notes !== undefined ? updates.notes : updates.content,
          category: updates.type,
          processed: updates.status === 'processed',
        });
      } catch (err) {
        console.warn('API updateInboxItem warning:', err.message);
      }
    }
  }, [isAuthenticated]);

  // Delete Item
  const deleteInboxItem = useCallback(async (id) => {
    setInboxItems((prev) => prev.filter((item) => item.id !== id));

    if (isAuthenticated) {
      try {
        await api.inbox.delete(id);
      } catch (err) {
        console.warn('API deleteInboxItem warning:', err.message);
      }
    }

    if (showToast) showToast('Inbox item removed', 'info');
  }, [isAuthenticated, showToast]);

  // Archive Item
  const archiveInboxItem = useCallback((id) => {
    updateInboxItem(id, { status: 'archived' });
    if (showToast) showToast('Item archived', 'info');
  }, [updateInboxItem, showToast]);

  // Mark as Processed
  const markAsProcessed = useCallback(async (id, convertedTaskId = null, convertedNoteId = null) => {
    updateInboxItem(id, {
      status: 'processed',
      processedAt: new Date().toISOString(),
      convertedTaskId,
      convertedNoteId,
    });

    if (isAuthenticated) {
      try {
        await api.inbox.process(id, {
          convertedTaskId,
          convertedNoteId,
        });
      } catch (err) {
        console.warn('API processInboxItem warning:', err.message);
      }
    }
  }, [isAuthenticated, updateInboxItem]);

  // Restore to Unprocessed
  const restoreInboxItem = useCallback((id) => {
    updateInboxItem(id, { status: 'unprocessed', processedAt: null });
    if (showToast) showToast('Restored to Inbox', 'success');
  }, [updateInboxItem, showToast]);

  // Bulk Actions
  const bulkArchive = useCallback((ids = []) => {
    setInboxItems((prev) =>
      prev.map((item) =>
        ids.includes(item.id) ? { ...item, status: 'archived', updatedAt: new Date().toISOString() } : item
      )
    );
    if (showToast) showToast(`Archived ${ids.length} items`, 'success');
  }, [showToast]);

  const bulkDelete = useCallback((ids = []) => {
    setInboxItems((prev) => prev.filter((item) => !ids.includes(item.id)));
    if (showToast) showToast(`Deleted ${ids.length} items`, 'info');
  }, [showToast]);

  const bulkMarkProcessed = useCallback((ids = []) => {
    const now = new Date().toISOString();
    setInboxItems((prev) =>
      prev.map((item) =>
        ids.includes(item.id)
          ? { ...item, status: 'processed', processedAt: now, updatedAt: now }
          : item
      )
    );
    if (showToast) showToast(`Marked ${ids.length} items as processed`, 'success');
  }, [showToast]);

  // Modal Triggers
  const openQuickCapture = () => setIsQuickCaptureOpen(true);
  const closeQuickCapture = () => setIsQuickCaptureOpen(false);

  const openProcessModal = (item) => setItemToProcess(item);
  const closeProcessModal = () => setItemToProcess(null);

  // Summary Statistics
  const stats = useMemo(() => getInboxStats(inboxItems), [inboxItems]);
  const unprocessedCount = stats.unprocessed;

  const value = {
    inboxItems,
    stats,
    unprocessedCount,
    isQuickCaptureOpen,
    itemToProcess,

    addInboxItem,
    updateInboxItem,
    deleteInboxItem,
    archiveInboxItem,
    markAsProcessed,
    restoreInboxItem,

    bulkArchive,
    bulkDelete,
    bulkMarkProcessed,

    openQuickCapture,
    closeQuickCapture,
    openProcessModal,
    closeProcessModal,
  };

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}

export function useInboxContext() {
  const context = useContext(InboxContext);
  if (!context) {
    throw new Error('useInboxContext must be used within an InboxProvider');
  }
  return context;
}
