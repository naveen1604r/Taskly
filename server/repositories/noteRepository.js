import { getPool } from '../config/db.js';

// In-memory fallback cache for notes
const memoryNotes = new Map();
let nextMemoryNoteId = 1;

/**
 * Format a database note row to camelCase for the frontend
 */
export const formatNoteRow = (row) => {
  if (!row) return null;

  let tags = [];
  if (row.tags) {
    try {
      tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags;
      if (!Array.isArray(tags)) tags = [];
    } catch {
      tags = [];
    }
  }

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    content: row.content,
    category: row.category || 'General',
    tags,
    pinned: Boolean(row.pinned),
    archived: Boolean(row.archived),
    color: row.color || null,
    taskId: row.task_id ? String(row.task_id) : null,
    projectId: row.project_id ? String(row.project_id) : null,
    goalId: row.goal_id ? String(row.goal_id) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

/**
 * Note Repository
 */
export const noteRepository = {
  /**
   * Create a new note
   */
  createNote: async (userId, data) => {
    const pool = getPool();
    const now = new Date().toISOString();

    const title = data.title.trim();
    const content = data.content;
    const category = data.category?.trim() || 'General';
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const pinned = Boolean(data.pinned);
    const archived = Boolean(data.archived);
    const color = data.color || null;
    const taskId = data.taskId ? String(data.taskId) : null;
    const projectId = data.projectId ? String(data.projectId) : null;
    const goalId = data.goalId ? String(data.goalId) : null;

    if (pool) {
      try {
        const [result] = await pool.query(
          `INSERT INTO notes (
            user_id, title, content, category, tags, pinned, archived,
            color, task_id, project_id, goal_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            title,
            content,
            category,
            JSON.stringify(tags),
            pinned,
            archived,
            color,
            taskId,
            projectId,
            goalId,
          ]
        );

        return await noteRepository.findNoteByIdForUser(result.insertId, userId);
      } catch (error) {
        console.warn('MySQL createNote error, falling back to memory store:', error.message);
      }
    }

    // Memory fallback
    const id = nextMemoryNoteId++;
    const noteRecord = {
      id,
      user_id: userId,
      title,
      content,
      category,
      tags,
      pinned,
      archived,
      color,
      task_id: taskId,
      project_id: projectId,
      goal_id: goalId,
      created_at: now,
      updated_at: now,
    };

    memoryNotes.set(id, noteRecord);
    return formatNoteRow(noteRecord);
  },

  /**
   * Find note by ID for specific user
   */
  findNoteByIdForUser: async (noteId, userId) => {
    const pool = getPool();

    if (pool) {
      try {
        const [rows] = await pool.query(
          `SELECT * FROM notes WHERE id = ? AND user_id = ?`,
          [noteId, userId]
        );

        if (rows.length === 0) return null;
        return formatNoteRow(rows[0]);
      } catch (error) {
        console.warn('MySQL findNoteByIdForUser error, falling back to memory store:', error.message);
      }
    }

    // Memory fallback
    for (const note of memoryNotes.values()) {
      if (String(note.id) === String(noteId) && String(note.user_id) === String(userId)) {
        return formatNoteRow(note);
      }
    }
    return null;
  },

  /**
   * Find all notes for a user with optional filters, sort, and pagination
   */
  findNotesByUser: async (userId, filters = {}, sort = {}, pagination = {}) => {
    const pool = getPool();

    if (pool) {
      try {
        let query = 'SELECT * FROM notes WHERE user_id = ?';
        const params = [userId];

        if (filters.pinned !== undefined && filters.pinned !== null) {
          query += ' AND pinned = ?';
          params.push(Boolean(filters.pinned));
        }

        if (filters.archived !== undefined && filters.archived !== null) {
          query += ' AND archived = ?';
          params.push(Boolean(filters.archived));
        }

        if (filters.category) {
          query += ' AND category = ?';
          params.push(filters.category);
        }

        if (filters.taskId) {
          query += ' AND task_id = ?';
          params.push(String(filters.taskId));
        }

        if (filters.projectId) {
          query += ' AND project_id = ?';
          params.push(String(filters.projectId));
        }

        if (filters.goalId) {
          query += ' AND goal_id = ?';
          params.push(String(filters.goalId));
        }

        if (filters.search) {
          query += ' AND (title LIKE ? OR content LIKE ? OR category LIKE ?)';
          const term = `%${filters.search}%`;
          params.push(term, term, term);
        }

        // Sorting (pinned notes typically sorted to top, then recent)
        query += ' ORDER BY pinned DESC, created_at DESC';

        // Pagination
        const page = pagination.page && pagination.page > 0 ? parseInt(pagination.page, 10) : 1;
        const limit = pagination.limit && pagination.limit > 0 ? Math.min(parseInt(pagination.limit, 10), 100) : null;

        let total = 0;
        let totalPages = 1;

        if (limit) {
          const countQuery = `SELECT COUNT(*) as cnt FROM (${query}) as count_table`;
          const [countRows] = await pool.query(countQuery, params);
          total = countRows[0]?.cnt || 0;
          totalPages = Math.ceil(total / limit) || 1;

          const offset = (page - 1) * limit;
          query += ' LIMIT ? OFFSET ?';
          params.push(limit, offset);
        }

        const [rows] = await pool.query(query, params);
        const notes = rows.map(formatNoteRow);

        return {
          notes,
          pagination: {
            page,
            limit: limit || notes.length,
            total: limit ? total : notes.length,
            totalPages: limit ? totalPages : 1,
          },
        };
      } catch (error) {
        console.warn('MySQL findNotesByUser error, falling back to memory store:', error.message);
      }
    }

    // Memory fallback
    let userNotes = Array.from(memoryNotes.values()).filter(
      (n) => String(n.user_id) === String(userId)
    );

    if (filters.pinned !== undefined && filters.pinned !== null) {
      userNotes = userNotes.filter((n) => Boolean(n.pinned) === Boolean(filters.pinned));
    }
    if (filters.archived !== undefined && filters.archived !== null) {
      userNotes = userNotes.filter((n) => Boolean(n.archived) === Boolean(filters.archived));
    }
    if (filters.category) {
      userNotes = userNotes.filter((n) => n.category === filters.category);
    }
    if (filters.taskId) {
      userNotes = userNotes.filter((n) => String(n.task_id) === String(filters.taskId));
    }
    if (filters.projectId) {
      userNotes = userNotes.filter((n) => String(n.project_id) === String(filters.projectId));
    }
    if (filters.goalId) {
      userNotes = userNotes.filter((n) => String(n.goal_id) === String(filters.goalId));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      userNotes = userNotes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (n.category && n.category.toLowerCase().includes(q))
      );
    }

    userNotes.sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    const total = userNotes.length;
    const page = pagination.page && pagination.page > 0 ? parseInt(pagination.page, 10) : 1;
    const limit = pagination.limit && pagination.limit > 0 ? Math.min(parseInt(pagination.limit, 10), 100) : null;

    let pagedList = userNotes;
    if (limit) {
      const offset = (page - 1) * limit;
      pagedList = userNotes.slice(offset, offset + limit);
    }

    const notes = pagedList.map(formatNoteRow);

    return {
      notes,
      pagination: {
        page,
        limit: limit || total,
        total,
        totalPages: limit ? Math.ceil(total / limit) || 1 : 1,
      },
    };
  },

  /**
   * Update note fields
   */
  updateNote: async (noteId, userId, updates = {}) => {
    const existing = await noteRepository.findNoteByIdForUser(noteId, userId);
    if (!existing) return null;

    const pool = getPool();
    const now = new Date().toISOString();

    if (pool) {
      try {
        const fieldMap = {
          title: 'title',
          content: 'content',
          category: 'category',
          tags: 'tags',
          pinned: 'pinned',
          archived: 'archived',
          color: 'color',
          taskId: 'task_id',
          projectId: 'project_id',
          goalId: 'goal_id',
        };

        const updateFields = [];
        const params = [];

        Object.entries(updates).forEach(([key, val]) => {
          const col = fieldMap[key];
          if (col !== undefined) {
            updateFields.push(`${col} = ?`);
            if (key === 'tags') {
              params.push(val ? JSON.stringify(val) : null);
            } else {
              params.push(val === undefined ? null : val);
            }
          }
        });

        if (updateFields.length > 0) {
          params.push(noteId, userId);
          await pool.query(
            `UPDATE notes SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
            params
          );
        }

        return await noteRepository.findNoteByIdForUser(noteId, userId);
      } catch (error) {
        console.warn('MySQL updateNote error, falling back to memory store:', error.message);
      }
    }

    // Memory fallback
    for (const note of memoryNotes.values()) {
      if (String(note.id) === String(noteId) && String(note.user_id) === String(userId)) {
        if (updates.title !== undefined) note.title = updates.title.trim();
        if (updates.content !== undefined) note.content = updates.content;
        if (updates.category !== undefined) note.category = updates.category;
        if (updates.tags !== undefined) note.tags = Array.isArray(updates.tags) ? updates.tags : [];
        if (updates.pinned !== undefined) note.pinned = Boolean(updates.pinned);
        if (updates.archived !== undefined) note.archived = Boolean(updates.archived);
        if (updates.color !== undefined) note.color = updates.color;
        if (updates.taskId !== undefined) note.task_id = updates.taskId ? String(updates.taskId) : null;
        if (updates.projectId !== undefined) note.project_id = updates.projectId ? String(updates.projectId) : null;
        if (updates.goalId !== undefined) note.goal_id = updates.goalId ? String(updates.goalId) : null;
        note.updated_at = now;

        return formatNoteRow(note);
      }
    }
    return null;
  },

  /**
   * Delete a note.
   * Requirement 48: Deleting a Note should only delete that Note.
   * It must NOT delete Task, Project, Goal, User.
   */
  deleteNote: async (noteId, userId) => {
    const existing = await noteRepository.findNoteByIdForUser(noteId, userId);
    if (!existing) return false;

    const pool = getPool();

    if (pool) {
      try {
        const [result] = await pool.query(
          `DELETE FROM notes WHERE id = ? AND user_id = ?`,
          [noteId, userId]
        );
        return result.affectedRows > 0;
      } catch (error) {
        console.warn('MySQL deleteNote error, falling back to memory store:', error.message);
      }
    }

    // Memory fallback
    for (const [id, note] of memoryNotes.entries()) {
      if (String(note.id) === String(noteId) && String(note.user_id) === String(userId)) {
        memoryNotes.delete(id);
        return true;
      }
    }
    return false;
  },

  /**
   * Pin a note
   */
  pinNote: async (noteId, userId) => {
    return await noteRepository.updateNote(noteId, userId, { pinned: true });
  },

  /**
   * Unpin a note
   */
  unpinNote: async (noteId, userId) => {
    return await noteRepository.updateNote(noteId, userId, { pinned: false });
  },

  /**
   * Archive a note
   */
  archiveNote: async (noteId, userId) => {
    return await noteRepository.updateNote(noteId, userId, { archived: true });
  },

  /**
   * Restore a note
   */
  restoreNote: async (noteId, userId) => {
    return await noteRepository.updateNote(noteId, userId, { archived: false });
  },
};

export default noteRepository;
