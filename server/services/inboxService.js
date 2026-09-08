import inboxRepository from '../repositories/inboxRepository.js';
import taskRepository from '../repositories/taskRepository.js';
import noteRepository from '../repositories/noteRepository.js';
import { validateInboxItem } from '../validators/inboxValidator.js';

export const createInboxItem = async (userId, data) => {
  const validation = validateInboxItem(data, false);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }
  return await inboxRepository.createInboxItem(userId, data);
};

export const getInboxItems = async (userId, query = {}) => {
  const filters = {
    processed: query.processed !== undefined ? (query.processed === 'true' || query.processed === true) : undefined,
  };
  return await inboxRepository.findInboxItemsByUser(userId, filters);
};

export const getInboxItemById = async (id, userId) => {
  const item = await inboxRepository.findInboxItemById(id, userId);
  if (!item) {
    const error = new Error('Inbox item not found');
    error.statusCode = 404;
    throw error;
  }
  return item;
};

export const updateInboxItem = async (id, userId, updates) => {
  const existing = await inboxRepository.findInboxItemById(id, userId);
  if (!existing) {
    const error = new Error('Inbox item not found');
    error.statusCode = 404;
    throw error;
  }

  const validation = validateInboxItem(updates, true);
  if (!validation.isValid) {
    const error = new Error(validation.errors[0]);
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  return await inboxRepository.updateInboxItem(id, userId, updates);
};

export const deleteInboxItem = async (id, userId) => {
  const existing = await inboxRepository.findInboxItemById(id, userId);
  if (!existing) {
    const error = new Error('Inbox item not found');
    error.statusCode = 404;
    throw error;
  }
  return await inboxRepository.deleteInboxItem(id, userId);
};

export const processInboxItem = async (id, userId, conversionData = {}) => {
  const item = await inboxRepository.findInboxItemById(id, userId);
  if (!item) {
    const error = new Error('Inbox item not found');
    error.statusCode = 404;
    throw error;
  }

  if (conversionData.type === 'task') {
    const taskData = {
      title: item.title,
      description: item.notes,
      ...(conversionData.taskDetails || {}),
    };
    const task = await taskRepository.createTask(userId, taskData);
    const updatedItem = await inboxRepository.processInboxItem(id, userId, {
      convertedTaskId: task.id,
    });
    return { item: updatedItem, task };
  }

  if (conversionData.type === 'note') {
    const noteData = {
      title: item.title,
      content: item.notes || item.title,
      ...(conversionData.noteDetails || {}),
    };
    const note = await noteRepository.createNote(userId, noteData);
    const updatedItem = await inboxRepository.processInboxItem(id, userId, {
      convertedNoteId: note.id,
    });
    return { item: updatedItem, note };
  }

  const updatedItem = await inboxRepository.processInboxItem(id, userId, conversionData);
  return { item: updatedItem };
};

export default {
  createInboxItem,
  getInboxItems,
  getInboxItemById,
  updateInboxItem,
  deleteInboxItem,
  processInboxItem,
};
