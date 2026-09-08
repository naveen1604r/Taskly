import noteRepository from '../repositories/noteRepository.js';
import { validateCreateNote, validateUpdateNote } from '../validators/noteValidators.js';

export const createNote = async (userId, data) => {
  const validation = validateCreateNote(data);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  return await noteRepository.createNote(userId, data);
};

export const getNotes = async (userId, query = {}) => {
  const filters = {
    pinned: query.pinned !== undefined ? (query.pinned === 'true' || query.pinned === true) : undefined,
    archived: query.archived !== undefined ? (query.archived === 'true' || query.archived === true) : undefined,
    category: query.category,
    taskId: query.taskId,
    projectId: query.projectId,
    goalId: query.goalId,
    search: query.search || query.q,
  };

  const sort = {
    sortBy: query.sortBy || 'createdAt',
    sortDirection: query.sortDirection || 'desc',
  };

  const pagination = {
    page: query.page ? parseInt(query.page, 10) : 1,
    limit: query.limit ? parseInt(query.limit, 10) : null,
  };

  return await noteRepository.findNotesByUser(userId, filters, sort, pagination);
};

export const getNoteById = async (noteId, userId) => {
  const note = await noteRepository.findNoteByIdForUser(noteId, userId);
  if (!note) {
    const error = new Error('Note not found');
    error.statusCode = 404;
    throw error;
  }
  return note;
};

export const updateNote = async (noteId, userId, updates) => {
  const existing = await noteRepository.findNoteByIdForUser(noteId, userId);
  if (!existing) {
    const error = new Error('Note not found');
    error.statusCode = 404;
    throw error;
  }

  const validation = validateUpdateNote(updates);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  return await noteRepository.updateNote(noteId, userId, updates);
};

export const deleteNote = async (noteId, userId) => {
  const existing = await noteRepository.findNoteByIdForUser(noteId, userId);
  if (!existing) {
    const error = new Error('Note not found');
    error.statusCode = 404;
    throw error;
  }

  return await noteRepository.deleteNote(noteId, userId);
};

export const pinNote = async (noteId, userId) => {
  const existing = await noteRepository.findNoteByIdForUser(noteId, userId);
  if (!existing) {
    const error = new Error('Note not found');
    error.statusCode = 404;
    throw error;
  }

  return await noteRepository.pinNote(noteId, userId);
};

export const unpinNote = async (noteId, userId) => {
  const existing = await noteRepository.findNoteByIdForUser(noteId, userId);
  if (!existing) {
    const error = new Error('Note not found');
    error.statusCode = 404;
    throw error;
  }

  return await noteRepository.unpinNote(noteId, userId);
};

export const archiveNote = async (noteId, userId) => {
  const existing = await noteRepository.findNoteByIdForUser(noteId, userId);
  if (!existing) {
    const error = new Error('Note not found');
    error.statusCode = 404;
    throw error;
  }

  return await noteRepository.archiveNote(noteId, userId);
};

export const restoreNote = async (noteId, userId) => {
  const existing = await noteRepository.findNoteByIdForUser(noteId, userId);
  if (!existing) {
    const error = new Error('Note not found');
    error.statusCode = 404;
    throw error;
  }

  return await noteRepository.restoreNote(noteId, userId);
};

export default {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  pinNote,
  unpinNote,
  archiveNote,
  restoreNote,
};
