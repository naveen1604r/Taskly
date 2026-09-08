import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { NOTES_STORAGE_KEY } from '../utils/noteUtils';
import { useTaskContext } from './TaskContext';
import { useAuthContext } from './AuthContext';
import { api } from '../services/api';

const NotesContext = createContext(null);

export function NotesProvider({ children }) {
  const { showToast } = useTaskContext();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthContext();

  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Modal & Viewer states
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);

  // Fetch notes from backend API
  const fetchNotes = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.notes.getAll();
      if (response.success && response.data?.notes) {
        setNotes(response.data.notes);
      } else {
        setNotes([]);
      }
    } catch (err) {
      console.error('Failed to load notes from server:', err);
      setError(err.message || 'Unable to load notes');
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchNotes();
    }
  }, [isAuthLoading, fetchNotes]);

  // Create Note
  const createNote = async (data) => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await api.notes.create({
        title: data.title.trim(),
        content: data.content.trim(),
        category: data.category?.trim() || 'General',
        tags: Array.isArray(data.tags) ? data.tags : [],
        pinned: Boolean(data.pinned),
        color: data.color || null,
        taskId: data.taskId || null,
        projectId: data.projectId || null,
        goalId: data.goalId || null,
      });

      if (response.success && response.data?.note) {
        const newNote = response.data.note;
        setNotes((prev) => [newNote, ...prev]);
        showToast('Note created successfully', 'success');
        closeNoteModal();
        return newNote;
      }
      throw new Error(response.message || 'Failed to create note');
    } catch (err) {
      console.error('Failed to add note:', err);
      showToast(err.message || 'Unable to save note. Please try again.', 'error');
      setError(err.message || 'Unable to save note');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  // Update Note
  const updateNote = async (id, updatedFields) => {
    try {
      setIsUpdating(true);
      setError(null);

      const response = await api.notes.update(id, updatedFields);
      if (response.success && response.data?.note) {
        const updated = response.data.note;
        setNotes((prev) =>
          prev.map((n) => (String(n.id) === String(id) ? updated : n))
        );

        // If currently viewing the updated note, update viewing state
        setViewingNote((prev) =>
          prev && String(prev.id) === String(id) ? updated : prev
        );

        showToast('Note updated successfully', 'success');
        closeNoteModal();
        return updated;
      }
      throw new Error(response.message || 'Failed to update note');
    } catch (err) {
      console.error('Failed to update note:', err);
      showToast(err.message || 'Unable to update note. Please try again.', 'error');
      setError(err.message || 'Unable to update note');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Note
  const deleteNote = async (id) => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await api.notes.delete(id);
      if (response.success) {
        setNotes((prev) => prev.filter((n) => String(n.id) !== String(id)));
        if (viewingNote && String(viewingNote.id) === String(id)) {
          setViewingNote(null);
        }
        showToast('Note deleted successfully', 'success');
        setNoteToDelete(null);
        return true;
      }
      throw new Error(response.message || 'Failed to delete note');
    } catch (err) {
      console.error('Failed to delete note:', err);
      showToast(err.message || 'Unable to delete note. Please try again.', 'error');
      setError(err.message || 'Unable to delete note');
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  // Pin / Unpin Note
  const togglePinNote = async (id) => {
    const currentNote = notes.find((n) => String(n.id) === String(id));
    if (!currentNote) return;

    try {
      const isCurrentlyPinned = currentNote.pinned;
      const response = isCurrentlyPinned
        ? await api.notes.unpin(id)
        : await api.notes.pin(id);

      if (response.success && response.data?.note) {
        const updated = response.data.note;
        setNotes((prev) =>
          prev.map((n) => (String(n.id) === String(id) ? updated : n))
        );
        setViewingNote((prev) =>
          prev && String(prev.id) === String(id) ? updated : prev
        );
        showToast(updated.pinned ? 'Note pinned' : 'Note unpinned', 'success');
        return updated;
      }
    } catch (err) {
      console.error('Failed to toggle pin note:', err);
      showToast(err.message || 'Unable to update note', 'error');
    }
  };

  // Archive / Unarchive Note
  const toggleArchiveNote = async (id) => {
    const currentNote = notes.find((n) => String(n.id) === String(id));
    if (!currentNote) return;

    try {
      const isCurrentlyArchived = currentNote.archived;
      const response = isCurrentlyArchived
        ? await api.notes.restore(id)
        : await api.notes.archive(id);

      if (response.success && response.data?.note) {
        const updated = response.data.note;
        setNotes((prev) =>
          prev.map((n) => (String(n.id) === String(id) ? updated : n))
        );
        setViewingNote((prev) =>
          prev && String(prev.id) === String(id) ? updated : prev
        );
        showToast(updated.archived ? 'Note archived' : 'Note unarchived', 'success');
        return updated;
      }
    } catch (err) {
      console.error('Failed to toggle archive note:', err);
      showToast(err.message || 'Unable to update note', 'error');
    }
  };

  // Modal Handlers
  const openCreateNoteModal = () => {
    setEditingNote(null);
    setIsNoteModalOpen(true);
  };

  const openEditNoteModal = (note) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  const closeNoteModal = () => {
    setIsNoteModalOpen(false);
    setEditingNote(null);
  };

  const openViewNoteModal = (note) => {
    setViewingNote(note);
  };

  const closeViewNoteModal = () => {
    setViewingNote(null);
  };

  const openDeleteNoteModal = (note) => {
    setNoteToDelete(note);
  };

  const closeDeleteNoteModal = () => {
    setNoteToDelete(null);
  };

  // Overview Metrics
  const metrics = useMemo(() => {
    const total = notes.length;
    const activeNotes = notes.filter((n) => !n.archived);
    const pinned = activeNotes.filter((n) => n.pinned).length;
    const archived = notes.filter((n) => n.archived).length;

    // This week (created within last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thisWeek = notes.filter((n) => {
      const createdTime = new Date(n.createdAt).getTime();
      return createdTime >= sevenDaysAgo;
    }).length;

    // Extract all unique tags
    const allTags = Array.from(
      new Set(
        notes
          .flatMap((n) => n.tags || [])
          .map((t) => (typeof t === 'string' ? t.toLowerCase().trim() : ''))
          .filter(Boolean)
      )
    );

    return {
      totalNotes: total,
      activeNotesCount: activeNotes.length,
      pinnedNotesCount: pinned,
      thisWeekNotesCount: thisWeek,
      archivedNotesCount: archived,
      allTags,
    };
  }, [notes]);

  const value = {
    notes,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createNote,
    updateNote,
    deleteNote,
    togglePinNote,
    toggleArchiveNote,
    // Modal states
    isNoteModalOpen,
    editingNote,
    openCreateNoteModal,
    openEditNoteModal,
    closeNoteModal,
    viewingNote,
    openViewNoteModal,
    closeViewNoteModal,
    noteToDelete,
    openDeleteNoteModal,
    closeDeleteNoteModal,
    // Metrics
    metrics,
    refreshNotes: fetchNotes,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotesContext() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotesContext must be used within a NotesProvider');
  }
  return context;
}
