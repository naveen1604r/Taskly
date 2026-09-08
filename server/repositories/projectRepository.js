import { getPool } from '../config/db.js';
import taskRepository from './taskRepository.js';

// In-memory fallback cache for projects
const memoryProjects = new Map();
let nextMemoryProjectId = 1;

/**
 * Format a database project row to camelCase for the frontend
 */
export const formatProjectRow = (row, taskStats = null) => {
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description || '',
    color: row.color || '#7C3AED',
    icon: row.icon || 'Folder',
    status: row.status || 'active',
    priority: row.priority || 'medium',
    startDate: row.start_date || '',
    dueDate: row.due_date || '',
    goalId: row.goal_id ? String(row.goal_id) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Dynamic task statistics
    totalTasks: taskStats ? taskStats.total : 0,
    completedTasks: taskStats ? taskStats.completed : 0,
    inProgressTasks: taskStats ? taskStats.inProgress : 0,
    pendingTasks: taskStats ? taskStats.pending : 0,
    progress: taskStats ? taskStats.progress : 0,
  };
};

/**
 * Calculate task metrics for a specific project
 */
export const getTaskStatsForProject = async (projectId, userId) => {
  try {
    const tasksResult = await taskRepository.findTasksByUser(userId, { projectId: String(projectId) });
    const tasks = tasksResult.tasks || [];
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const pending = tasks.filter((t) => t.status === 'pending' || !t.status).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, pending, progress };
  } catch {
    return { total: 0, completed: 0, inProgress: 0, pending: 0, progress: 0 };
  }
};

/**
 * Project Repository
 */
export const projectRepository = {
  /**
   * Create a new project
   */
  createProject: async (userId, data) => {
    const pool = getPool();
    const now = new Date().toISOString();

    const name = data.name.trim();
    const description = data.description?.trim() || null;
    const color = data.color || '#7C3AED';
    const icon = data.icon || 'Folder';
    const status = data.status || 'active';
    const priority = data.priority || 'medium';
    const startDate = data.startDate || null;
    const dueDate = data.dueDate || null;
    const goalId = data.goalId ? String(data.goalId) : null;

    if (pool) {
      try {
        const [result] = await pool.query(
          `INSERT INTO projects (
            user_id, name, description, color, icon, status, priority,
            start_date, due_date, goal_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            name,
            description,
            color,
            icon,
            status,
            priority,
            startDate,
            dueDate,
            goalId,
          ]
        );

        return await projectRepository.findProjectByIdForUser(result.insertId, userId);
      } catch (error) {
        console.warn('MySQL createProject error, falling back to memory store:', error.message);
      }
    }

    // Memory fallback
    const id = nextMemoryProjectId++;
    const projectRecord = {
      id,
      user_id: userId,
      name,
      description: description || '',
      color,
      icon,
      status,
      priority,
      start_date: startDate || '',
      due_date: dueDate || '',
      goal_id: goalId,
      created_at: now,
      updated_at: now,
    };

    memoryProjects.set(id, projectRecord);
    return formatProjectRow(projectRecord, { total: 0, completed: 0, inProgress: 0, pending: 0, progress: 0 });
  },

  /**
   * Find project by ID for specific user
   */
  findProjectByIdForUser: async (projectId, userId) => {
    const pool = getPool();

    if (pool) {
      try {
        const [rows] = await pool.query(
          `SELECT * FROM projects WHERE id = ? AND user_id = ?`,
          [projectId, userId]
        );

        if (rows.length === 0) return null;
        const taskStats = await getTaskStatsForProject(projectId, userId);
        return formatProjectRow(rows[0], taskStats);
      } catch (error) {
        console.warn('MySQL findProjectByIdForUser error, falling back to memory store:', error.message);
      }
    }

    // Memory fallback
    for (const project of memoryProjects.values()) {
      if (String(project.id) === String(projectId) && String(project.user_id) === String(userId)) {
        const taskStats = await getTaskStatsForProject(project.id, userId);
        return formatProjectRow(project, taskStats);
      }
    }
    return null;
  },

  /**
   * Find all projects for a user with optional filters, sort, and pagination
   */
  findProjectsByUser: async (userId, filters = {}, sort = {}, pagination = {}) => {
    const pool = getPool();

    if (pool) {
      try {
        let query = 'SELECT * FROM projects WHERE user_id = ?';
        const params = [userId];

        if (filters.status) {
          query += ' AND status = ?';
          params.push(filters.status);
        }

        if (filters.priority) {
          query += ' AND priority = ?';
          params.push(filters.priority);
        }

        if (filters.goalId) {
          query += ' AND goal_id = ?';
          params.push(String(filters.goalId));
        }

        if (filters.search) {
          query += ' AND (name LIKE ? OR description LIKE ?)';
          const term = `%${filters.search}%`;
          params.push(term, term);
        }

        // Sorting
        const allowedSortFields = {
          createdAt: 'created_at',
          updatedAt: 'updated_at',
          name: 'name',
          dueDate: 'due_date',
          priority: 'priority',
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

        const projects = await Promise.all(
          rows.map(async (row) => {
            const taskStats = await getTaskStatsForProject(row.id, userId);
            return formatProjectRow(row, taskStats);
          })
        );

        return {
          projects,
          pagination: {
            page,
            limit: limit || projects.length,
            total: limit ? total : projects.length,
            totalPages: limit ? totalPages : 1,
          },
        };
      } catch (error) {
        console.warn('MySQL findProjectsByUser error, falling back to memory store:', error.message);
      }
    }

    // Memory fallback
    let userProjects = Array.from(memoryProjects.values()).filter(
      (p) => String(p.user_id) === String(userId)
    );

    if (filters.status) {
      userProjects = userProjects.filter((p) => p.status === filters.status);
    }
    if (filters.priority) {
      userProjects = userProjects.filter((p) => p.priority === filters.priority);
    }
    if (filters.goalId) {
      userProjects = userProjects.filter((p) => String(p.goal_id) === String(filters.goalId));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      userProjects = userProjects.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
      );
    }

    userProjects.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = userProjects.length;
    const page = pagination.page && pagination.page > 0 ? parseInt(pagination.page, 10) : 1;
    const limit = pagination.limit && pagination.limit > 0 ? Math.min(parseInt(pagination.limit, 10), 100) : null;

    let pagedList = userProjects;
    if (limit) {
      const offset = (page - 1) * limit;
      pagedList = userProjects.slice(offset, offset + limit);
    }

    const projects = await Promise.all(
      pagedList.map(async (p) => {
        const taskStats = await getTaskStatsForProject(p.id, userId);
        return formatProjectRow(p, taskStats);
      })
    );

    return {
      projects,
      pagination: {
        page,
        limit: limit || total,
        total,
        totalPages: limit ? Math.ceil(total / limit) || 1 : 1,
      },
    };
  },

  /**
   * Update project fields
   */
  updateProject: async (projectId, userId, updates = {}) => {
    const existing = await projectRepository.findProjectByIdForUser(projectId, userId);
    if (!existing) return null;

    const pool = getPool();
    const now = new Date().toISOString();

    if (pool) {
      try {
        const fieldMap = {
          name: 'name',
          description: 'description',
          color: 'color',
          icon: 'icon',
          status: 'status',
          priority: 'priority',
          startDate: 'start_date',
          dueDate: 'due_date',
          goalId: 'goal_id',
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
          params.push(projectId, userId);
          await pool.query(
            `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
            params
          );
        }

        return await projectRepository.findProjectByIdForUser(projectId, userId);
      } catch (error) {
        console.warn('MySQL updateProject error, falling back to memory store:', error.message);
      }
    }

    // Memory fallback
    for (const project of memoryProjects.values()) {
      if (String(project.id) === String(projectId) && String(project.user_id) === String(userId)) {
        if (updates.name !== undefined) project.name = updates.name.trim();
        if (updates.description !== undefined) project.description = updates.description ? updates.description.trim() : '';
        if (updates.color !== undefined) project.color = updates.color;
        if (updates.icon !== undefined) project.icon = updates.icon;
        if (updates.status !== undefined) project.status = updates.status;
        if (updates.priority !== undefined) project.priority = updates.priority;
        if (updates.startDate !== undefined) project.start_date = updates.startDate;
        if (updates.dueDate !== undefined) project.due_date = updates.dueDate;
        if (updates.goalId !== undefined) project.goal_id = updates.goalId ? String(updates.goalId) : null;
        project.updated_at = now;

        const taskStats = await getTaskStatsForProject(project.id, userId);
        return formatProjectRow(project, taskStats);
      }
    }
    return null;
  },

  /**
   * Delete a project.
   * Requirement 12: Deleting a project must NOT delete tasks.
   * Unassigns associated tasks by setting tasks.project_id = NULL.
   */
  deleteProject: async (projectId, userId) => {
    const existing = await projectRepository.findProjectByIdForUser(projectId, userId);
    if (!existing) return false;

    const pool = getPool();

    if (pool) {
      let connection;
      try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Unlink associated tasks
        await connection.query(
          `UPDATE tasks SET project_id = NULL WHERE project_id = ? AND user_id = ?`,
          [String(projectId), userId]
        );

        // 2. Delete the project
        const [result] = await connection.query(
          `DELETE FROM projects WHERE id = ? AND user_id = ?`,
          [projectId, userId]
        );

        await connection.commit();
        return result.affectedRows > 0;
      } catch (error) {
        if (connection) {
          try { await connection.rollback(); } catch {}
        }
        console.warn('MySQL deleteProject error, falling back to memory store:', error.message);
      } finally {
        if (connection) {
          try { connection.release(); } catch {}
        }
      }
    }

    // Memory fallback
    let deleted = false;
    for (const [id, project] of memoryProjects.entries()) {
      if (String(project.id) === String(projectId) && String(project.user_id) === String(userId)) {
        memoryProjects.delete(id);
        deleted = true;
        break;
      }
    }

    // Unlink tasks in taskRepository memory store if any
    try {
      const userTasksResult = await taskRepository.findTasksByUser(userId, { projectId: String(projectId) });
      const linkedTasks = userTasksResult.tasks || [];
      for (const t of linkedTasks) {
        await taskRepository.updateTask(t.id, userId, { projectId: null });
      }
    } catch {
      // Ignore task unlink error on memory fallback
    }

    return deleted;
  },

  /**
   * Mark a project as completed
   */
  completeProject: async (projectId, userId) => {
    return await projectRepository.updateProject(projectId, userId, { status: 'completed' });
  },

  /**
   * Archive a project
   */
  archiveProject: async (projectId, userId) => {
    return await projectRepository.updateProject(projectId, userId, { status: 'archived' });
  },

  /**
   * Restore a project to active
   */
  restoreProject: async (projectId, userId) => {
    return await projectRepository.updateProject(projectId, userId, { status: 'active' });
  },
};

export default projectRepository;
