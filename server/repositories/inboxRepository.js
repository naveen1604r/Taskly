import { getPool } from '../config/db.js';

const memoryInbox = new Map();
let nextInboxId = 1;

export const formatInboxRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    notes: row.notes || '',
    processed: Boolean(row.processed),
    category: row.category || 'Quick Note',
    convertedTaskId: row.converted_task_id ? String(row.converted_task_id) : null,
    convertedNoteId: row.converted_note_id ? String(row.converted_note_id) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const inboxRepository = {
  createInboxItem: async (userId, data) => {
    const pool = getPool();
    const now = new Date().toISOString();
    const title = data.title.trim();
    const notes = data.notes || '';
    const category = data.category || 'Quick Note';
    const processed = Boolean(data.processed);

    if (pool) {
      try {
        const [result] = await pool.query(
          `INSERT INTO inbox_items (
            user_id, title, notes, category, processed
          ) VALUES (?, ?, ?, ?, ?)`,
          [userId, title, notes, category, processed]
        );

        return await inboxRepository.findInboxItemById(result.insertId, userId);
      } catch (error) {
        console.warn('MySQL createInboxItem error, falling back to memory store:', error.message);
      }
    }

    const id = nextInboxId++;
    const item = {
      id,
      user_id: userId,
      title,
      notes,
      category,
      processed,
      converted_task_id: null,
      converted_note_id: null,
      created_at: now,
      updated_at: now,
    };
    memoryInbox.set(id, item);
    return formatInboxRow(item);
  },

  findInboxItemById: async (id, userId) => {
    const pool = getPool();
    if (pool) {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM inbox_items WHERE id = ? AND user_id = ?',
          [id, userId]
        );
        if (rows.length === 0) return null;
        return formatInboxRow(rows[0]);
      } catch (error) {
        console.warn('MySQL findInboxItemById error, falling back to memory store:', error.message);
      }
    }

    for (const item of memoryInbox.values()) {
      if (String(item.id) === String(id) && String(item.user_id) === String(userId)) {
        return formatInboxRow(item);
      }
    }
    return null;
  },

  findInboxItemsByUser: async (userId, filters = {}) => {
    const pool = getPool();
    if (pool) {
      try {
        let query = 'SELECT * FROM inbox_items WHERE user_id = ?';
        const params = [userId];

        if (filters.processed !== undefined) {
          query += ' AND processed = ?';
          params.push(Boolean(filters.processed));
        }

        query += ' ORDER BY created_at DESC';
        const [rows] = await pool.query(query, params);
        return rows.map(formatInboxRow);
      } catch (error) {
        console.warn('MySQL findInboxItemsByUser error, falling back to memory store:', error.message);
      }
    }

    let list = Array.from(memoryInbox.values()).filter(
      (item) => String(item.user_id) === String(userId)
    );
    if (filters.processed !== undefined) {
      list = list.filter((item) => Boolean(item.processed) === Boolean(filters.processed));
    }
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return list.map(formatInboxRow);
  },

  updateInboxItem: async (id, userId, updates = {}) => {
    const existing = await inboxRepository.findInboxItemById(id, userId);
    if (!existing) return null;

    const pool = getPool();
    const now = new Date().toISOString();

    if (pool) {
      try {
        const fieldMap = {
          title: 'title',
          notes: 'notes',
          category: 'category',
          processed: 'processed',
          convertedTaskId: 'converted_task_id',
          convertedNoteId: 'converted_note_id',
        };

        const updateFields = [];
        const params = [];

        Object.entries(updates).forEach(([key, val]) => {
          const col = fieldMap[key];
          if (col !== undefined) {
            updateFields.push(`${col} = ?`);
            params.push(val === undefined ? null : val);
          }
        });

        if (updateFields.length > 0) {
          params.push(id, userId);
          await pool.query(
            `UPDATE inbox_items SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
            params
          );
        }

        return await inboxRepository.findInboxItemById(id, userId);
      } catch (error) {
        console.warn('MySQL updateInboxItem error, falling back to memory store:', error.message);
      }
    }

    for (const item of memoryInbox.values()) {
      if (String(item.id) === String(id) && String(item.user_id) === String(userId)) {
        if (updates.title !== undefined) item.title = updates.title.trim();
        if (updates.notes !== undefined) item.notes = updates.notes;
        if (updates.category !== undefined) item.category = updates.category;
        if (updates.processed !== undefined) item.processed = Boolean(updates.processed);
        if (updates.convertedTaskId !== undefined) item.converted_task_id = updates.convertedTaskId;
        if (updates.convertedNoteId !== undefined) item.converted_note_id = updates.convertedNoteId;
        item.updated_at = now;
        return formatInboxRow(item);
      }
    }
    return null;
  },

  deleteInboxItem: async (id, userId) => {
    const existing = await inboxRepository.findInboxItemById(id, userId);
    if (!existing) return false;

    const pool = getPool();
    if (pool) {
      try {
        const [result] = await pool.query(
          'DELETE FROM inbox_items WHERE id = ? AND user_id = ?',
          [id, userId]
        );
        return result.affectedRows > 0;
      } catch (error) {
        console.warn('MySQL deleteInboxItem error, falling back to memory store:', error.message);
      }
    }

    for (const [itemId, item] of memoryInbox.entries()) {
      if (String(item.id) === String(id) && String(item.user_id) === String(userId)) {
        memoryInbox.delete(itemId);
        return true;
      }
    }
    return false;
  },

  processInboxItem: async (id, userId, conversionData = {}) => {
    return await inboxRepository.updateInboxItem(id, userId, {
      processed: true,
      convertedTaskId: conversionData.convertedTaskId || null,
      convertedNoteId: conversionData.convertedNoteId || null,
    });
  },
};

export default inboxRepository;
