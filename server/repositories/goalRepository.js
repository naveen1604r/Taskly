import { getPool } from '../config/db.js';
import taskRepository from './taskRepository.js';

// In-memory fallback cache for goals
const memoryGoals = new Map();
let nextMemoryGoalId = 1;

/**
 * Format a database goal row to camelCase for the frontend
 */
export const formatGoalRow = (row) => {
  if (!row) return null;

  let milestones = [];
  if (row.milestones) {
    try {
      milestones = typeof row.milestones === 'string' ? JSON.parse(row.milestones) : row.milestones;
      if (!Array.isArray(milestones)) milestones = [];
    } catch {
      milestones = [];
    }
  }

  let relatedTaskIds = [];
  if (row.related_task_ids) {
    try {
      relatedTaskIds = typeof row.related_task_ids === 'string' ? JSON.parse(row.related_task_ids) : row.related_task_ids;
      if (!Array.isArray(relatedTaskIds)) relatedTaskIds = [];
    } catch {
      relatedTaskIds = [];
    }
  }

  let activityLog = [];
  if (row.activity_log) {
    try {
      activityLog = typeof row.activity_log === 'string' ? JSON.parse(row.activity_log) : row.activity_log;
      if (!Array.isArray(activityLog)) activityLog = [];
    } catch {
      activityLog = [];
    }
  }

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description || '',
    category: row.category || 'Learning',
    priority: row.priority || 'medium',
    startDate: row.start_date || '',
    targetDate: row.target_date || '',
    progressMode: row.progress_mode || 'manual',
    progress: Number(row.progress) || 0,
    status: row.status || 'active',
    icon: row.icon || 'Target',
    color: row.color || null,
    milestones,
    relatedTaskIds,
    activityLog,
    completedAt: row.completed_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

/**
 * Goal Repository
 */
export const goalRepository = {
  /**
   * Create a new goal
   */
  createGoal: async (userId, data) => {
    const pool = getPool();
    const now = new Date().toISOString();

    const title = data.title.trim();
    const description = data.description?.trim() || null;
    const category = data.category?.trim() || 'Learning';
    const priority = data.priority || 'medium';
    const startDate = data.startDate || null;
    const targetDate = data.targetDate || null;
    const progressMode = data.progressMode || 'manual';
    const progress = Math.min(100, Math.max(0, Number(data.progress) || 0));
    const status = data.status || 'active';
    const icon = data.icon || 'Target';
    const color = data.color || null;
    const milestones = Array.isArray(data.milestones) ? data.milestones : [];
    const relatedTaskIds = Array.isArray(data.relatedTaskIds) ? data.relatedTaskIds : [];
    const activityLog = Array.isArray(data.activityLog)
      ? data.activityLog
      : [
          {
            id: `log-${Date.now()}`,
            type: 'creation',
            message: `Goal "${title}" created`,
            createdAt: now,
          },
        ];

    if (pool) {
      try {
        const [result] = await pool.query(
          `INSERT INTO goals (
            user_id, title, description, category, priority, start_date,
            target_date, progress_mode, progress, status, icon, color,
            milestones, related_task_ids, activity_log
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            title,
            description,
            category,
            priority,
            startDate,
            targetDate,
            progressMode,
            progress,
            status,
            icon,
            color,
            JSON.stringify(milestones),
            JSON.stringify(relatedTaskIds),
            JSON.stringify(activityLog),
          ]
        );

        return await goalRepository.findGoalByIdForUser(result.insertId, userId);
      } catch (error) {
        console.warn('MySQL createGoal error, falling back to memory store:', error.message);
      }
    }

    // Memory fallback
    const id = nextMemoryGoalId++;
    const goalRecord = {
      id,
      user_id: userId,
      title,
      description: description || '',
      category,
      priority,
      start_date: startDate || '',
      target_date: targetDate || '',
      progress_mode: progressMode,
      progress,
      status,
      icon,
      color,
      milestones,
      related_task_ids: relatedTaskIds,
      activity_log: activityLog,
      completed_at: status === 'completed' ? now : null,
      created_at: now,
      updated_at: now,
    };

    memoryGoals.set(id, goalRecord);
    return formatGoalRow(goalRecord);
  },

  /**
   * Find goal by ID for specific user
   */
  findGoalByIdForUser: async (goalId, userId) => {
    const pool = getPool();

    if (pool) {
      try {
        const [rows] = await pool.query(
          `SELECT * FROM goals WHERE id = ? AND user_id = ?`,
          [goalId, userId]
        );

        if (rows.length === 0) return null;
        return formatGoalRow(rows[0]);
      } catch (error) {
        console.warn('MySQL findGoalByIdForUser error, falling back to memory store:', error.message);
      }
    }

    // Memory fallback
    for (const goal of memoryGoals.values()) {
      if (String(goal.id) === String(goalId) && String(goal.user_id) === String(userId)) {
        return formatGoalRow(goal);
      }
    }
    return null;
  },

  /**
   * Find all goals for a user with optional filters, sort, and pagination
   */
  findGoalsByUser: async (userId, filters = {}, sort = {}, pagination = {}) => {
    const pool = getPool();

    if (pool) {
      try {
        let query = 'SELECT * FROM goals WHERE user_id = ?';
        const params = [userId];

        if (filters.status) {
          query += ' AND status = ?';
          params.push(filters.status);
        }

        if (filters.priority) {
          query += ' AND priority = ?';
          params.push(filters.priority);
        }

        if (filters.category) {
          query += ' AND category = ?';
          params.push(filters.category);
        }

        if (filters.search) {
          query += ' AND (title LIKE ? OR description LIKE ? OR category LIKE ?)';
          const term = `%${filters.search}%`;
          params.push(term, term, term);
        }

        // Sorting
        const allowedSortFields = {
          createdAt: 'created_at',
          updatedAt: 'updated_at',
          title: 'title',
          targetDate: 'target_date',
          priority: 'priority',
          progress: 'progress',
        };
        const sortCol = allowedSortFields[sort.sortBy] || 'created_at';
        const sortDir = sort.sortDirection?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
        query += ` ORDER BY ${sortCol} ${sortDir}`;

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
        const goals = rows.map(formatGoalRow);

        return {
          goals,
          pagination: {
            page,
            limit: limit || goals.length,
            total: limit ? total : goals.length,
            totalPages: limit ? totalPages : 1,
          },
        };
      } catch (error) {
        console.warn('MySQL findGoalsByUser error, falling back to memory store:', error.message);
      }
    }

    // Memory fallback
    let userGoals = Array.from(memoryGoals.values()).filter(
      (g) => String(g.user_id) === String(userId)
    );

    if (filters.status) {
      userGoals = userGoals.filter((g) => g.status === filters.status);
    }
    if (filters.priority) {
      userGoals = userGoals.filter((g) => g.priority === filters.priority);
    }
    if (filters.category) {
      userGoals = userGoals.filter((g) => g.category === filters.category);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      userGoals = userGoals.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          (g.description && g.description.toLowerCase().includes(q)) ||
          (g.category && g.category.toLowerCase().includes(q))
      );
    }

    userGoals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = userGoals.length;
    const page = pagination.page && pagination.page > 0 ? parseInt(pagination.page, 10) : 1;
    const limit = pagination.limit && pagination.limit > 0 ? Math.min(parseInt(pagination.limit, 10), 100) : null;

    let pagedList = userGoals;
    if (limit) {
      const offset = (page - 1) * limit;
      pagedList = userGoals.slice(offset, offset + limit);
    }

    const goals = pagedList.map(formatGoalRow);

    return {
      goals,
      pagination: {
        page,
        limit: limit || total,
        total,
        totalPages: limit ? Math.ceil(total / limit) || 1 : 1,
      },
    };
  },

  /**
   * Update goal fields
   */
  updateGoal: async (goalId, userId, updates = {}) => {
    const existing = await goalRepository.findGoalByIdForUser(goalId, userId);
    if (!existing) return null;

    const pool = getPool();
    const now = new Date().toISOString();

    if (pool) {
      try {
        const fieldMap = {
          title: 'title',
          description: 'description',
          category: 'category',
          priority: 'priority',
          startDate: 'start_date',
          targetDate: 'target_date',
          progressMode: 'progress_mode',
          progress: 'progress',
          status: 'status',
          icon: 'icon',
          color: 'color',
          milestones: 'milestones',
          relatedTaskIds: 'related_task_ids',
          activityLog: 'activity_log',
          completedAt: 'completed_at',
        };

        const updateFields = [];
        const params = [];

        Object.entries(updates).forEach(([key, val]) => {
          const col = fieldMap[key];
          if (col !== undefined) {
            updateFields.push(`${col} = ?`);
            if (['milestones', 'relatedTaskIds', 'activityLog'].includes(key)) {
              params.push(val ? JSON.stringify(val) : null);
            } else {
              params.push(val === undefined ? null : val);
            }
          }
        });

        if (updateFields.length > 0) {
          params.push(goalId, userId);
          await pool.query(
            `UPDATE goals SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
            params
          );
        }

        return await goalRepository.findGoalByIdForUser(goalId, userId);
      } catch (error) {
        console.warn('MySQL updateGoal error, falling back to memory store:', error.message);
      }
    }

    // Memory fallback
    for (const goal of memoryGoals.values()) {
      if (String(goal.id) === String(goalId) && String(goal.user_id) === String(userId)) {
        if (updates.title !== undefined) goal.title = updates.title.trim();
        if (updates.description !== undefined) goal.description = updates.description ? updates.description.trim() : '';
        if (updates.category !== undefined) goal.category = updates.category;
        if (updates.priority !== undefined) goal.priority = updates.priority;
        if (updates.startDate !== undefined) goal.start_date = updates.startDate;
        if (updates.targetDate !== undefined) goal.target_date = updates.targetDate;
        if (updates.progressMode !== undefined) goal.progress_mode = updates.progressMode;
        if (updates.progress !== undefined) goal.progress = Math.min(100, Math.max(0, Number(updates.progress) || 0));
        if (updates.status !== undefined) {
          goal.status = updates.status;
          if (updates.status === 'completed' && !goal.completed_at) {
            goal.completed_at = now;
          }
        }
        if (updates.icon !== undefined) goal.icon = updates.icon;
        if (updates.color !== undefined) goal.color = updates.color;
        if (updates.milestones !== undefined) goal.milestones = Array.isArray(updates.milestones) ? updates.milestones : [];
        if (updates.relatedTaskIds !== undefined) goal.related_task_ids = Array.isArray(updates.relatedTaskIds) ? updates.relatedTaskIds : [];
        if (updates.activityLog !== undefined) goal.activity_log = Array.isArray(updates.activityLog) ? updates.activityLog : [];
        goal.updated_at = now;

        return formatGoalRow(goal);
      }
    }
    return null;
  },

  /**
   * Delete a goal.
   * Requirement 47: Deleting a Goal must NOT accidentally delete Projects or Tasks.
   * Sets projects.goal_id = NULL and tasks.goal_id = NULL.
   */
  deleteGoal: async (goalId, userId) => {
    const existing = await goalRepository.findGoalByIdForUser(goalId, userId);
    if (!existing) return false;

    const pool = getPool();

    if (pool) {
      let connection;
      try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Unlink associated projects
        await connection.query(
          `UPDATE projects SET goal_id = NULL WHERE goal_id = ? AND user_id = ?`,
          [String(goalId), userId]
        );

        // 2. Unlink associated tasks
        await connection.query(
          `UPDATE tasks SET goal_id = NULL WHERE goal_id = ? AND user_id = ?`,
          [String(goalId), userId]
        );

        // 3. Delete the goal
        const [result] = await connection.query(
          `DELETE FROM goals WHERE id = ? AND user_id = ?`,
          [goalId, userId]
        );

        await connection.commit();
        return result.affectedRows > 0;
      } catch (error) {
        if (connection) {
          try { await connection.rollback(); } catch {}
        }
        console.warn('MySQL deleteGoal error, falling back to memory store:', error.message);
      } finally {
        if (connection) {
          try { connection.release(); } catch {}
        }
      }
    }

    // Memory fallback
    let deleted = false;
    for (const [id, goal] of memoryGoals.entries()) {
      if (String(goal.id) === String(goalId) && String(goal.user_id) === String(userId)) {
        memoryGoals.delete(id);
        deleted = true;
        break;
      }
    }

    // Unlink tasks in taskRepository memory store if any
    try {
      const userTasksResult = await taskRepository.findTasksByUser(userId, { goalId: String(goalId) });
      const linkedTasks = userTasksResult.tasks || [];
      for (const t of linkedTasks) {
        await taskRepository.updateTask(t.id, userId, { goalId: null });
      }
    } catch {
      // Ignore task unlink error on memory fallback
    }

    return deleted;
  },

  /**
   * Mark goal complete
   */
  completeGoal: async (goalId, userId) => {
    const now = new Date().toISOString();
    return await goalRepository.updateGoal(goalId, userId, {
      status: 'completed',
      progress: 100,
      completedAt: now,
    });
  },

  /**
   * Archive goal
   */
  archiveGoal: async (goalId, userId) => {
    return await goalRepository.updateGoal(goalId, userId, { status: 'archived' });
  },

  /**
   * Restore goal to active
   */
  restoreGoal: async (goalId, userId) => {
    return await goalRepository.updateGoal(goalId, userId, { status: 'active' });
  },

  /**
   * Update goal progress
   */
  updateProgress: async (goalId, userId, progress) => {
    const clamped = Math.min(100, Math.max(0, Number(progress) || 0));
    const updates = { progress: clamped };
    if (clamped === 100) {
      updates.status = 'completed';
      updates.completedAt = new Date().toISOString();
    }
    return await goalRepository.updateGoal(goalId, userId, updates);
  },
};

export default goalRepository;
