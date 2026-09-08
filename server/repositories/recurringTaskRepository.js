import { getPool } from '../config/db.js';

const memoryRecurring = new Map();
let nextRecurringId = 1;

export const formatRecurringTaskRow = (row) => {
  if (!row) return null;

  let daysOfWeek = [];
  if (row.days_of_week) {
    try {
      daysOfWeek = typeof row.days_of_week === 'string' ? JSON.parse(row.days_of_week) : row.days_of_week;
      if (!Array.isArray(daysOfWeek)) daysOfWeek = [];
    } catch {
      daysOfWeek = [];
    }
  }

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
    description: row.description || '',
    frequency: row.frequency || 'daily',
    intervalValue: Number(row.interval_value) || 1,
    daysOfWeek,
    dayOfMonth: row.day_of_month ? Number(row.day_of_month) : null,
    startDate: row.start_date,
    endDate: row.end_date || null,
    time: row.time || null,
    priority: row.priority || 'medium',
    category: row.category || 'General',
    estimatedDuration: Number(row.estimated_duration) || 30,
    projectId: row.project_id ? String(row.project_id) : null,
    goalId: row.goal_id ? String(row.goal_id) : null,
    tags,
    isActive: Boolean(row.is_active),
    lastGeneratedDate: row.last_generated_date || null,
    nextGenerationDate: row.next_generation_date || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const recurringTaskRepository = {
  createRecurringTask: async (userId, data) => {
    const pool = getPool();
    const now = new Date().toISOString();
    const title = data.title.trim();
    const description = data.description || '';
    const frequency = data.frequency || 'daily';
    const intervalValue = Number(data.intervalValue || data.interval_value) || 1;
    const daysOfWeek = Array.isArray(data.daysOfWeek || data.days_of_week) ? (data.daysOfWeek || data.days_of_week) : [];
    const dayOfMonth = (data.dayOfMonth || data.day_of_month) ? Number(data.dayOfMonth || data.day_of_month) : null;
    const startDate = data.startDate || data.start_date || new Date().toISOString().slice(0, 10);
    const endDate = data.endDate || data.end_date || null;
    const time = data.time || null;
    const priority = data.priority || 'medium';
    const category = data.category || 'General';
    const estimatedDuration = Number(data.estimatedDuration || data.estimated_duration) || 30;
    const projectId = data.projectId || data.project_id ? String(data.projectId || data.project_id) : null;
    const goalId = data.goalId || data.goal_id ? String(data.goalId || data.goal_id) : null;
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const isActive = data.isActive !== undefined ? Boolean(data.isActive) : true;

    if (pool) {
      try {
        const [result] = await pool.query(
          `INSERT INTO recurring_tasks (
            user_id, title, description, frequency, interval_value,
            days_of_week, day_of_month, start_date, end_date, time,
            priority, category, estimated_duration, project_id, goal_id,
            tags, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId, title, description, frequency, intervalValue,
            JSON.stringify(daysOfWeek), dayOfMonth, startDate, endDate, time,
            priority, category, estimatedDuration, projectId, goalId,
            JSON.stringify(tags), isActive
          ]
        );

        return await recurringTaskRepository.findRecurringTaskById(result.insertId, userId);
      } catch (error) {
        console.warn('MySQL createRecurringTask error, falling back to memory store:', error.message);
      }
    }

    const id = nextRecurringId++;
    const rec = {
      id,
      user_id: userId,
      title,
      description,
      frequency,
      interval_value: intervalValue,
      days_of_week: daysOfWeek,
      day_of_month: dayOfMonth,
      start_date: startDate,
      end_date: endDate,
      time,
      priority,
      category,
      estimated_duration: estimatedDuration,
      project_id: projectId,
      goal_id: goalId,
      tags,
      is_active: isActive,
      last_generated_date: null,
      next_generation_date: null,
      created_at: now,
      updated_at: now,
    };
    memoryRecurring.set(id, rec);
    return formatRecurringTaskRow(rec);
  },

  findRecurringTaskById: async (id, userId) => {
    const pool = getPool();
    if (pool) {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM recurring_tasks WHERE id = ? AND user_id = ?',
          [id, userId]
        );
        if (rows.length === 0) return null;
        return formatRecurringTaskRow(rows[0]);
      } catch (error) {
        console.warn('MySQL findRecurringTaskById error, falling back to memory store:', error.message);
      }
    }

    for (const rec of memoryRecurring.values()) {
      if (String(rec.id) === String(id) && String(rec.user_id) === String(userId)) {
        return formatRecurringTaskRow(rec);
      }
    }
    return null;
  },

  findRecurringTasksByUser: async (userId, filters = {}) => {
    const pool = getPool();
    if (pool) {
      try {
        let query = 'SELECT * FROM recurring_tasks WHERE user_id = ?';
        const params = [userId];

        if (filters.isActive !== undefined) {
          query += ' AND is_active = ?';
          params.push(Boolean(filters.isActive));
        }

        query += ' ORDER BY created_at DESC';
        const [rows] = await pool.query(query, params);
        return rows.map(formatRecurringTaskRow);
      } catch (error) {
        console.warn('MySQL findRecurringTasksByUser error, falling back to memory store:', error.message);
      }
    }

    let list = Array.from(memoryRecurring.values()).filter(
      (r) => String(r.user_id) === String(userId)
    );
    if (filters.isActive !== undefined) {
      list = list.filter((r) => Boolean(r.is_active) === Boolean(filters.isActive));
    }
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return list.map(formatRecurringTaskRow);
  },

  updateRecurringTask: async (id, userId, updates = {}) => {
    const existing = await recurringTaskRepository.findRecurringTaskById(id, userId);
    if (!existing) return null;

    const pool = getPool();
    const now = new Date().toISOString();

    if (pool) {
      try {
        const fieldMap = {
          title: 'title',
          description: 'description',
          frequency: 'frequency',
          intervalValue: 'interval_value',
          daysOfWeek: 'days_of_week',
          dayOfMonth: 'day_of_month',
          startDate: 'start_date',
          endDate: 'end_date',
          time: 'time',
          priority: 'priority',
          category: 'category',
          estimatedDuration: 'estimated_duration',
          projectId: 'project_id',
          goalId: 'goal_id',
          tags: 'tags',
          isActive: 'is_active',
          lastGeneratedDate: 'last_generated_date',
          nextGenerationDate: 'next_generation_date',
        };

        const updateFields = [];
        const params = [];

        Object.entries(updates).forEach(([key, val]) => {
          const col = fieldMap[key];
          if (col !== undefined) {
            updateFields.push(`${col} = ?`);
            if (key === 'daysOfWeek' || key === 'tags') {
              params.push(val ? JSON.stringify(val) : null);
            } else {
              params.push(val === undefined ? null : val);
            }
          }
        });

        if (updateFields.length > 0) {
          params.push(id, userId);
          await pool.query(
            `UPDATE recurring_tasks SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
            params
          );
        }

        return await recurringTaskRepository.findRecurringTaskById(id, userId);
      } catch (error) {
        console.warn('MySQL updateRecurringTask error, falling back to memory store:', error.message);
      }
    }

    for (const rec of memoryRecurring.values()) {
      if (String(rec.id) === String(id) && String(rec.user_id) === String(userId)) {
        if (updates.title !== undefined) rec.title = updates.title.trim();
        if (updates.description !== undefined) rec.description = updates.description;
        if (updates.frequency !== undefined) rec.frequency = updates.frequency;
        if (updates.intervalValue !== undefined) rec.interval_value = Number(updates.intervalValue);
        if (updates.daysOfWeek !== undefined) rec.days_of_week = updates.daysOfWeek;
        if (updates.dayOfMonth !== undefined) rec.day_of_month = updates.dayOfMonth;
        if (updates.startDate !== undefined) rec.start_date = updates.startDate;
        if (updates.endDate !== undefined) rec.end_date = updates.endDate;
        if (updates.time !== undefined) rec.time = updates.time;
        if (updates.priority !== undefined) rec.priority = updates.priority;
        if (updates.category !== undefined) rec.category = updates.category;
        if (updates.estimatedDuration !== undefined) rec.estimated_duration = Number(updates.estimatedDuration);
        if (updates.projectId !== undefined) rec.project_id = updates.projectId;
        if (updates.goalId !== undefined) rec.goal_id = updates.goalId;
        if (updates.tags !== undefined) rec.tags = updates.tags;
        if (updates.isActive !== undefined) rec.is_active = Boolean(updates.isActive);
        if (updates.lastGeneratedDate !== undefined) rec.last_generated_date = updates.lastGeneratedDate;
        if (updates.nextGenerationDate !== undefined) rec.next_generation_date = updates.nextGenerationDate;
        rec.updated_at = now;
        return formatRecurringTaskRow(rec);
      }
    }
    return null;
  },

  deleteRecurringTask: async (id, userId) => {
    const existing = await recurringTaskRepository.findRecurringTaskById(id, userId);
    if (!existing) return false;

    const pool = getPool();
    if (pool) {
      try {
        const [result] = await pool.query(
          'DELETE FROM recurring_tasks WHERE id = ? AND user_id = ?',
          [id, userId]
        );
        return result.affectedRows > 0;
      } catch (error) {
        console.warn('MySQL deleteRecurringTask error, falling back to memory store:', error.message);
      }
    }

    for (const [recId, rec] of memoryRecurring.entries()) {
      if (String(rec.id) === String(id) && String(rec.user_id) === String(userId)) {
        memoryRecurring.delete(recId);
        return true;
      }
    }
    return false;
  },

  pauseRecurringTask: async (id, userId) => {
    return await recurringTaskRepository.updateRecurringTask(id, userId, { isActive: false });
  },

  resumeRecurringTask: async (id, userId) => {
    return await recurringTaskRepository.updateRecurringTask(id, userId, { isActive: true });
  },
};

export default recurringTaskRepository;
