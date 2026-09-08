import { getPool } from '../config/db.js';

// In-memory fallback cache when MySQL is waiting for credentials
const memoryTasks = new Map();
const memorySubtasks = new Map();
let nextMemoryTaskId = 1;
let nextMemorySubtaskId = 1;

/**
 * Format a database task row to camelCase for the frontend
 */
export const formatTaskRow = (row, subtasks = []) => {
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

  let dependencyIds = [];
  if (row.dependency_ids) {
    try {
      dependencyIds = typeof row.dependency_ids === 'string' ? JSON.parse(row.dependency_ids) : row.dependency_ids;
      if (!Array.isArray(dependencyIds)) dependencyIds = [];
    } catch {
      dependencyIds = [];
    }
  }

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description || '',
    status: row.status || 'pending',
    priority: row.priority || 'medium',
    category: row.category || 'General',
    estimatedDuration: Number(row.estimated_duration) || 30,
    actualDuration: Number(row.actual_duration) || 0,
    duration: Number(row.estimated_duration) || 30,
    durationUnit: row.duration_unit || 'minutes',
    dueDate: row.due_date || '',
    dueTime: row.due_time || '',
    plannedDate: row.planned_date || '',
    plannedStartTime: row.planned_start_time || '',
    goalId: row.goal_id || null,
    projectId: row.project_id || null,
    recurringTaskId: row.recurring_task_id || null,
    occurrenceDate: row.occurrence_date || null,
    isRecurringOccurrence: Boolean(row.recurring_task_id),
    tags,
    dependencyIds,
    reminder: row.reminder || 'none',
    customReminderDate: row.custom_reminder_date || null,
    customReminderTime: row.custom_reminder_time || null,
    taskNotes: row.task_notes || '',
    subtasks: Array.isArray(subtasks) ? subtasks : [],
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null,
  };
};

/**
 * Format a database subtask row to camelCase
 */
export const formatSubtaskRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    taskId: row.task_id,
    userId: row.user_id,
    title: row.title,
    priority: row.priority || 'medium',
    completed: Boolean(row.completed),
    position: Number(row.position) || 0,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null,
  };
};

const isDbOfflineError = (err) =>
  err.code === 'ER_ACCESS_DENIED_ERROR' || err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST';

/**
 * Create a new task for an authenticated user
 */
export const createTask = async (userId, data) => {
  const now = new Date();
  const title = data.title.trim();
  const description = data.description?.trim() || '';
  const status = data.status || 'pending';
  const priority = data.priority || 'medium';
  const category = data.category?.trim() || 'General';
  const estimatedDuration = Number(data.estimatedDuration || data.duration) || 30;
  const actualDuration = Number(data.actualDuration) || 0;
  const durationUnit = data.durationUnit || 'minutes';
  const dueDate = data.dueDate || null;
  const dueTime = data.dueTime || null;
  const plannedDate = data.plannedDate || null;
  const plannedStartTime = data.plannedStartTime || null;
  const goalId = data.goalId || null;
  const projectId = data.projectId || null;
  const recurringTaskId = data.recurringTaskId || null;
  const occurrenceDate = data.occurrenceDate || null;
  const tagsJson = JSON.stringify(Array.isArray(data.tags) ? data.tags : []);
  const dependencyIdsJson = JSON.stringify(Array.isArray(data.dependencyIds) ? data.dependencyIds : []);
  const reminder = data.reminder || 'none';
  const customReminderDate = data.customReminderDate || null;
  const customReminderTime = data.customReminderTime || null;
  const taskNotes = data.taskNotes || '';
  const completedAt = status === 'completed' ? (data.completedAt ? new Date(data.completedAt) : now) : null;

  try {
    const pool = getPool();
    const sql = `
      INSERT INTO tasks (
        user_id, title, description, status, priority, category,
        estimated_duration, actual_duration, duration_unit,
        due_date, due_time, planned_date, planned_start_time,
        goal_id, project_id, recurring_task_id, occurrence_date,
        tags, dependency_ids, reminder, custom_reminder_date, custom_reminder_time,
        task_notes, completed_at, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, NOW(), NOW()
      )
    `;

    const [result] = await pool.query(sql, [
      userId, title, description, status, priority, category,
      estimatedDuration, actualDuration, durationUnit,
      dueDate, dueTime, plannedDate, plannedStartTime,
      goalId, projectId, recurringTaskId, occurrenceDate,
      tagsJson, dependencyIdsJson, reminder, customReminderDate, customReminderTime,
      taskNotes, completedAt,
    ]);

    const taskId = result.insertId;

    // Insert initial subtasks if provided
    if (Array.isArray(data.subtasks) && data.subtasks.length > 0) {
      for (let i = 0; i < data.subtasks.length; i++) {
        const st = data.subtasks[i];
        const stSql = `
          INSERT INTO subtasks (task_id, user_id, title, priority, completed, position, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        await pool.query(stSql, [
          taskId,
          userId,
          st.title || 'Untitled subtask',
          st.priority || 'medium',
          Boolean(st.completed),
          i,
        ]);
      }
    }

    return await findTaskByIdForUser(taskId, userId);
  } catch (dbErr) {
    if (isDbOfflineError(dbErr)) {
      const taskId = nextMemoryTaskId++;
      const createdSubtasks = [];
      if (Array.isArray(data.subtasks)) {
        for (let i = 0; i < data.subtasks.length; i++) {
          const st = data.subtasks[i];
          const subId = nextMemorySubtaskId++;
          const subtaskObj = {
            id: subId,
            task_id: taskId,
            user_id: userId,
            title: st.title || 'Untitled subtask',
            priority: st.priority || 'medium',
            completed: Boolean(st.completed),
            position: i,
            created_at: now,
            updated_at: now,
            completed_at: null,
          };
          memorySubtasks.set(subId, subtaskObj);
          createdSubtasks.push(formatSubtaskRow(subtaskObj));
        }
      }

      const taskObj = {
        id: taskId,
        user_id: userId,
        title,
        description,
        status,
        priority,
        category,
        estimated_duration: estimatedDuration,
        actual_duration: actualDuration,
        duration_unit: durationUnit,
        due_date: dueDate,
        due_time: dueTime,
        planned_date: plannedDate,
        planned_start_time: plannedStartTime,
        goal_id: goalId,
        project_id: projectId,
        recurring_task_id: recurringTaskId,
        occurrence_date: occurrenceDate,
        tags: Array.isArray(data.tags) ? data.tags : [],
        task_notes: taskNotes,
        completed_at: completedAt,
        created_at: now,
        updated_at: now,
      };

      memoryTasks.set(taskId, taskObj);
      return formatTaskRow(taskObj, createdSubtasks);
    }
    throw dbErr;
  }
};

/**
 * Find all tasks belonging to an authenticated user
 */
export const findTasksByUser = async (userId, filters = {}, sort = {}, pagination = {}) => {
  try {
    const pool = getPool();
    const whereClauses = ['tasks.user_id = ?'];
    const queryParams = [userId];

    if (filters.status && ['pending', 'in_progress', 'completed'].includes(filters.status)) {
      whereClauses.push('tasks.status = ?');
      queryParams.push(filters.status);
    }
    if (filters.priority && ['low', 'medium', 'high'].includes(filters.priority)) {
      whereClauses.push('tasks.priority = ?');
      queryParams.push(filters.priority);
    }
    if (filters.category) {
      whereClauses.push('tasks.category = ?');
      queryParams.push(filters.category);
    }
    if (filters.projectId) {
      whereClauses.push('tasks.project_id = ?');
      queryParams.push(filters.projectId);
    }
    if (filters.goalId) {
      whereClauses.push('tasks.goal_id = ?');
      queryParams.push(filters.goalId);
    }
    if (filters.dueDate) {
      whereClauses.push('tasks.due_date = ?');
      queryParams.push(filters.dueDate);
    }
    if (filters.plannedDate) {
      whereClauses.push('tasks.planned_date = ?');
      queryParams.push(filters.plannedDate);
    }

    const countSql = `SELECT COUNT(*) AS total FROM tasks WHERE ${whereClauses.join(' AND ')}`;
    const [countRows] = await pool.query(countSql, queryParams);
    const totalCount = countRows[0]?.total || 0;

    const allowedSortColumns = {
      createdAt: 'tasks.created_at',
      updatedAt: 'tasks.updated_at',
      dueDate: 'tasks.due_date',
      plannedDate: 'tasks.planned_date',
      priority: 'tasks.priority',
      title: 'tasks.title',
      estimatedDuration: 'tasks.estimated_duration',
    };

    const sortColumn = allowedSortColumns[sort.sortBy] || 'tasks.created_at';
    const sortDirection = sort.sortDirection?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    let limitClause = '';
    const paginationParams = [...queryParams];
    const page = Math.max(1, Number(pagination.page) || 1);
    const limit = pagination.limit ? Math.min(100, Math.max(1, Number(pagination.limit))) : null;

    if (limit) {
      const offset = (page - 1) * limit;
      limitClause = `LIMIT ? OFFSET ?`;
      paginationParams.push(limit, offset);
    }

    const tasksSql = `
      SELECT * FROM tasks
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY ${sortColumn} ${sortDirection}
      ${limitClause}
    `;

    const [taskRows] = await pool.query(tasksSql, paginationParams);

    if (taskRows.length === 0) {
      return {
        tasks: [],
        pagination: { page, limit: limit || totalCount, total: totalCount, totalPages: limit ? Math.ceil(totalCount / limit) : 1 },
      };
    }

    const taskIds = taskRows.map((t) => t.id);
    const [subtaskRows] = await pool.query(
      `SELECT * FROM subtasks WHERE task_id IN (?) AND user_id = ? ORDER BY position ASC, id ASC`,
      [taskIds, userId]
    );

    const subtasksMap = new Map();
    subtaskRows.forEach((st) => {
      const list = subtasksMap.get(st.task_id) || [];
      list.push(formatSubtaskRow(st));
      subtasksMap.set(st.task_id, list);
    });

    const formattedTasks = taskRows.map((t) => formatTaskRow(t, subtasksMap.get(t.id) || []));

    return {
      tasks: formattedTasks,
      pagination: {
        page,
        limit: limit || totalCount,
        total: totalCount,
        totalPages: limit ? Math.ceil(totalCount / limit) : 1,
      },
    };
  } catch (dbErr) {
    if (isDbOfflineError(dbErr)) {
      let list = Array.from(memoryTasks.values()).filter((t) => t.user_id === userId);

      if (filters.status) list = list.filter((t) => t.status === filters.status);
      if (filters.priority) list = list.filter((t) => t.priority === filters.priority);
      if (filters.category) list = list.filter((t) => t.category === filters.category);
      if (filters.projectId) list = list.filter((t) => String(t.project_id) === String(filters.projectId));
      if (filters.goalId) list = list.filter((t) => String(t.goal_id) === String(filters.goalId));

      const formatted = list.map((t) => {
        const subs = Array.from(memorySubtasks.values())
          .filter((st) => st.task_id === t.id && st.user_id === userId)
          .map(formatSubtaskRow);
        return formatTaskRow(t, subs);
      });

      return {
        tasks: formatted,
        pagination: { page: 1, limit: formatted.length, total: formatted.length, totalPages: 1 },
      };
    }
    throw dbErr;
  }
};

/**
 * Find single task by ID scoped to authenticated user
 */
export const findTaskByIdForUser = async (taskId, userId) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT * FROM tasks WHERE id = ? AND user_id = ? LIMIT 1`,
      [taskId, userId]
    );

    if (rows.length === 0) return null;

    const [subtaskRows] = await pool.query(
      `SELECT * FROM subtasks WHERE task_id = ? AND user_id = ? ORDER BY position ASC, id ASC`,
      [taskId, userId]
    );

    return formatTaskRow(rows[0], subtaskRows.map(formatSubtaskRow));
  } catch (dbErr) {
    if (isDbOfflineError(dbErr)) {
      const task = memoryTasks.get(Number(taskId));
      if (!task || task.user_id !== userId) return null;
      const subs = Array.from(memorySubtasks.values())
        .filter((st) => st.task_id === Number(taskId) && st.user_id === userId)
        .map(formatSubtaskRow);
      return formatTaskRow(task, subs);
    }
    throw dbErr;
  }
};

/**
 * Update task
 */
export const updateTask = async (taskId, userId, updates = {}) => {
  try {
    const pool = getPool();
    const setParts = [];
    const params = [];

    if (updates.title !== undefined) {
      setParts.push('title = ?');
      params.push(updates.title.trim());
    }
    if (updates.description !== undefined) {
      setParts.push('description = ?');
      params.push(updates.description.trim());
    }
    if (updates.status !== undefined) {
      setParts.push('status = ?');
      params.push(updates.status);

      if (updates.status === 'completed' && updates.completedAt === undefined) {
        setParts.push('completed_at = NOW()');
      } else if (updates.status !== 'completed' && updates.completedAt === undefined) {
        setParts.push('completed_at = NULL');
      }
    }
    if (updates.completedAt !== undefined) {
      setParts.push('completed_at = ?');
      params.push(updates.completedAt ? new Date(updates.completedAt) : null);
    }
    if (updates.priority !== undefined) {
      setParts.push('priority = ?');
      params.push(updates.priority);
    }
    if (updates.category !== undefined) {
      setParts.push('category = ?');
      params.push(updates.category.trim());
    }
    if (updates.estimatedDuration !== undefined || updates.duration !== undefined) {
      setParts.push('estimated_duration = ?');
      params.push(Number(updates.estimatedDuration || updates.duration) || 30);
    }
    if (updates.actualDuration !== undefined) {
      setParts.push('actual_duration = ?');
      params.push(Number(updates.actualDuration) || 0);
    }
    if (updates.durationUnit !== undefined) {
      setParts.push('duration_unit = ?');
      params.push(updates.durationUnit);
    }
    if (updates.dueDate !== undefined) {
      setParts.push('due_date = ?');
      params.push(updates.dueDate || null);
    }
    if (updates.dueTime !== undefined) {
      setParts.push('due_time = ?');
      params.push(updates.dueTime || null);
    }
    if (updates.plannedDate !== undefined) {
      setParts.push('planned_date = ?');
      params.push(updates.plannedDate || null);
    }
    if (updates.plannedStartTime !== undefined) {
      setParts.push('planned_start_time = ?');
      params.push(updates.plannedStartTime || null);
    }
    if (updates.goalId !== undefined) {
      setParts.push('goal_id = ?');
      params.push(updates.goalId || null);
    }
    if (updates.projectId !== undefined) {
      setParts.push('project_id = ?');
      params.push(updates.projectId || null);
    }
    if (updates.tags !== undefined) {
      setParts.push('tags = ?');
      params.push(JSON.stringify(Array.isArray(updates.tags) ? updates.tags : []));
    }
    if (updates.dependencyIds !== undefined) {
      setParts.push('dependency_ids = ?');
      params.push(JSON.stringify(Array.isArray(updates.dependencyIds) ? updates.dependencyIds : []));
    }
    if (updates.reminder !== undefined) {
      setParts.push('reminder = ?');
      params.push(updates.reminder);
    }
    if (updates.customReminderDate !== undefined) {
      setParts.push('custom_reminder_date = ?');
      params.push(updates.customReminderDate || null);
    }
    if (updates.customReminderTime !== undefined) {
      setParts.push('custom_reminder_time = ?');
      params.push(updates.customReminderTime || null);
    }
    if (updates.taskNotes !== undefined) {
      setParts.push('task_notes = ?');
      params.push(updates.taskNotes);
    }

    if (setParts.length > 0) {
      setParts.push('updated_at = NOW()');
      params.push(taskId, userId);

      const sql = `UPDATE tasks SET ${setParts.join(', ')} WHERE id = ? AND user_id = ?`;
      await pool.query(sql, params);
    }

    return await findTaskByIdForUser(taskId, userId);
  } catch (dbErr) {
    if (isDbOfflineError(dbErr)) {
      const task = memoryTasks.get(Number(taskId));
      if (!task || task.user_id !== userId) return null;

      if (updates.title !== undefined) task.title = updates.title.trim();
      if (updates.description !== undefined) task.description = updates.description.trim();
      if (updates.status !== undefined) {
        task.status = updates.status;
        task.completed_at = updates.status === 'completed' ? new Date() : null;
      }
      if (updates.priority !== undefined) task.priority = updates.priority;
      if (updates.category !== undefined) task.category = updates.category.trim();
      if (updates.estimatedDuration !== undefined) task.estimated_duration = Number(updates.estimatedDuration);
      if (updates.dueDate !== undefined) task.due_date = updates.dueDate;
      if (updates.plannedDate !== undefined) task.planned_date = updates.plannedDate;
      if (updates.tags !== undefined) task.tags = updates.tags;
      if (updates.projectId !== undefined) task.project_id = updates.projectId;
      if (updates.goalId !== undefined) task.goal_id = updates.goalId;
      if (updates.taskNotes !== undefined) task.task_notes = updates.taskNotes;
      task.updated_at = new Date();

      const subs = Array.from(memorySubtasks.values())
        .filter((st) => st.task_id === Number(taskId) && st.user_id === userId)
        .map(formatSubtaskRow);
      return formatTaskRow(task, subs);
    }
    throw dbErr;
  }
};

/**
 * Delete task (and cascades subtasks)
 */
export const deleteTask = async (taskId, userId) => {
  try {
    const pool = getPool();
    const [result] = await pool.query(
      `DELETE FROM tasks WHERE id = ? AND user_id = ?`,
      [taskId, userId]
    );
    return result.affectedRows > 0;
  } catch (dbErr) {
    if (isDbOfflineError(dbErr)) {
      const task = memoryTasks.get(Number(taskId));
      if (!task || task.user_id !== userId) return false;
      memoryTasks.delete(Number(taskId));
      for (const [stId, st] of memorySubtasks.entries()) {
        if (st.task_id === Number(taskId)) memorySubtasks.delete(stId);
      }
      return true;
    }
    throw dbErr;
  }
};

/**
 * Subtask Repository Operations
 */
export const createSubtask = async (taskId, userId, data) => {
  const title = (data.title || '').trim();
  const priority = data.priority || 'medium';
  const position = Number(data.position) || 0;

  try {
    const pool = getPool();
    const sql = `
      INSERT INTO subtasks (task_id, user_id, title, priority, completed, position, created_at, updated_at)
      VALUES (?, ?, ?, ?, FALSE, ?, NOW(), NOW())
    `;
    const [result] = await pool.query(sql, [taskId, userId, title, priority, position]);

    return {
      id: result.insertId,
      taskId,
      userId,
      title,
      priority,
      completed: false,
      position,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
  } catch (dbErr) {
    if (isDbOfflineError(dbErr)) {
      const subId = nextMemorySubtaskId++;
      const subtaskObj = {
        id: subId,
        task_id: Number(taskId),
        user_id: userId,
        title,
        priority,
        completed: false,
        position,
        created_at: new Date(),
        updated_at: new Date(),
        completed_at: null,
      };
      memorySubtasks.set(subId, subtaskObj);
      return formatSubtaskRow(subtaskObj);
    }
    throw dbErr;
  }
};

export const updateSubtask = async (subtaskId, taskId, userId, updates = {}) => {
  try {
    const pool = getPool();
    const setParts = [];
    const params = [];

    if (updates.title !== undefined) {
      setParts.push('title = ?');
      params.push(updates.title.trim());
    }
    if (updates.priority !== undefined) {
      setParts.push('priority = ?');
      params.push(updates.priority);
    }
    if (updates.completed !== undefined) {
      setParts.push('completed = ?');
      params.push(Boolean(updates.completed));
      if (updates.completed) {
        setParts.push('completed_at = NOW()');
      } else {
        setParts.push('completed_at = NULL');
      }
    }
    if (updates.position !== undefined) {
      setParts.push('position = ?');
      params.push(Number(updates.position));
    }

    if (setParts.length > 0) {
      setParts.push('updated_at = NOW()');
      params.push(subtaskId, taskId, userId);

      const sql = `UPDATE subtasks SET ${setParts.join(', ')} WHERE id = ? AND task_id = ? AND user_id = ?`;
      await pool.query(sql, params);
    }

    const [rows] = await pool.query(
      `SELECT * FROM subtasks WHERE id = ? AND task_id = ? AND user_id = ? LIMIT 1`,
      [subtaskId, taskId, userId]
    );

    return rows.length > 0 ? formatSubtaskRow(rows[0]) : null;
  } catch (dbErr) {
    if (isDbOfflineError(dbErr)) {
      const st = memorySubtasks.get(Number(subtaskId));
      if (!st || st.user_id !== userId || st.task_id !== Number(taskId)) return null;
      if (updates.title !== undefined) st.title = updates.title.trim();
      if (updates.priority !== undefined) st.priority = updates.priority;
      if (updates.completed !== undefined) {
        st.completed = Boolean(updates.completed);
        st.completed_at = st.completed ? new Date() : null;
      }
      st.updated_at = new Date();
      return formatSubtaskRow(st);
    }
    throw dbErr;
  }
};

export const deleteSubtask = async (subtaskId, taskId, userId) => {
  try {
    const pool = getPool();
    const [result] = await pool.query(
      `DELETE FROM subtasks WHERE id = ? AND task_id = ? AND user_id = ?`,
      [subtaskId, taskId, userId]
    );
    return result.affectedRows > 0;
  } catch (dbErr) {
    if (isDbOfflineError(dbErr)) {
      const st = memorySubtasks.get(Number(subtaskId));
      if (!st || st.user_id !== userId || st.task_id !== Number(taskId)) return false;
      memorySubtasks.delete(Number(subtaskId));
      return true;
    }
    throw dbErr;
  }
};

export const findSubtasksByTask = async (taskId, userId) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT * FROM subtasks WHERE task_id = ? AND user_id = ? ORDER BY position ASC, id ASC`,
      [taskId, userId]
    );
    return rows.map(formatSubtaskRow);
  } catch (dbErr) {
    if (isDbOfflineError(dbErr)) {
      return Array.from(memorySubtasks.values())
        .filter((st) => st.task_id === Number(taskId) && st.user_id === userId)
        .map(formatSubtaskRow);
    }
    throw dbErr;
  }
};

export default {
  createTask,
  findTasksByUser,
  findTaskByIdForUser,
  updateTask,
  deleteTask,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  findSubtasksByTask,
};
