import { getPool } from '../config/db.js';

const memoryReminders = new Map();
let nextReminderId = 1;

export const formatReminderRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    time: row.time,
    date: row.date || null,
    type: row.type || 'once',
    channel: row.channel || 'browser',
    enabled: Boolean(row.enabled),
    taskId: row.task_id ? String(row.task_id) : null,
    habitId: row.habit_id ? String(row.habit_id) : null,
    snoozeUntil: row.snooze_until || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const reminderRepository = {
  createReminder: async (userId, data) => {
    const pool = getPool();
    const now = new Date().toISOString();
    const title = data.title.trim();
    const time = data.time;
    const date = data.date || null;
    const type = data.type || 'once';
    const channel = data.channel || 'browser';
    const enabled = data.enabled !== undefined ? Boolean(data.enabled) : true;
    const taskId = data.taskId || data.task_id ? String(data.taskId || data.task_id) : null;
    const habitId = data.habitId || data.habit_id ? String(data.habitId || data.habit_id) : null;

    if (pool) {
      try {
        const [result] = await pool.query(
          `INSERT INTO reminders (
            user_id, title, time, date, type, channel, enabled, task_id, habit_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, title, time, date, type, channel, enabled, taskId, habitId]
        );

        return await reminderRepository.findReminderById(result.insertId, userId);
      } catch (error) {
        console.warn('MySQL createReminder error, falling back to memory store:', error.message);
      }
    }

    const id = nextReminderId++;
    const reminder = {
      id,
      user_id: userId,
      title,
      time,
      date,
      type,
      channel,
      enabled,
      task_id: taskId,
      habit_id: habitId,
      snooze_until: null,
      created_at: now,
      updated_at: now,
    };
    memoryReminders.set(id, reminder);
    return formatReminderRow(reminder);
  },

  findReminderById: async (id, userId) => {
    const pool = getPool();
    if (pool) {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM reminders WHERE id = ? AND user_id = ?',
          [id, userId]
        );
        if (rows.length === 0) return null;
        return formatReminderRow(rows[0]);
      } catch (error) {
        console.warn('MySQL findReminderById error, falling back to memory store:', error.message);
      }
    }

    for (const rem of memoryReminders.values()) {
      if (String(rem.id) === String(id) && String(rem.user_id) === String(userId)) {
        return formatReminderRow(rem);
      }
    }
    return null;
  },

  findRemindersByUser: async (userId, filters = {}) => {
    const pool = getPool();
    if (pool) {
      try {
        let query = 'SELECT * FROM reminders WHERE user_id = ?';
        const params = [userId];

        if (filters.enabled !== undefined) {
          query += ' AND enabled = ?';
          params.push(Boolean(filters.enabled));
        }

        query += ' ORDER BY created_at DESC';
        const [rows] = await pool.query(query, params);
        return rows.map(formatReminderRow);
      } catch (error) {
        console.warn('MySQL findRemindersByUser error, falling back to memory store:', error.message);
      }
    }

    let list = Array.from(memoryReminders.values()).filter(
      (r) => String(r.user_id) === String(userId)
    );
    if (filters.enabled !== undefined) {
      list = list.filter((r) => Boolean(r.enabled) === Boolean(filters.enabled));
    }
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return list.map(formatReminderRow);
  },

  updateReminder: async (id, userId, updates = {}) => {
    const existing = await reminderRepository.findReminderById(id, userId);
    if (!existing) return null;

    const pool = getPool();
    const now = new Date().toISOString();

    if (pool) {
      try {
        const fieldMap = {
          title: 'title',
          time: 'time',
          date: 'date',
          type: 'type',
          channel: 'channel',
          enabled: 'enabled',
          taskId: 'task_id',
          habitId: 'habit_id',
          snoozeUntil: 'snooze_until',
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
            `UPDATE reminders SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
            params
          );
        }

        return await reminderRepository.findReminderById(id, userId);
      } catch (error) {
        console.warn('MySQL updateReminder error, falling back to memory store:', error.message);
      }
    }

    for (const rem of memoryReminders.values()) {
      if (String(rem.id) === String(id) && String(rem.user_id) === String(userId)) {
        if (updates.title !== undefined) rem.title = updates.title.trim();
        if (updates.time !== undefined) rem.time = updates.time;
        if (updates.date !== undefined) rem.date = updates.date;
        if (updates.type !== undefined) rem.type = updates.type;
        if (updates.channel !== undefined) rem.channel = updates.channel;
        if (updates.enabled !== undefined) rem.enabled = Boolean(updates.enabled);
        if (updates.taskId !== undefined) rem.task_id = updates.taskId;
        if (updates.habitId !== undefined) rem.habit_id = updates.habitId;
        if (updates.snoozeUntil !== undefined) rem.snooze_until = updates.snoozeUntil;
        rem.updated_at = now;
        return formatReminderRow(rem);
      }
    }
    return null;
  },

  deleteReminder: async (id, userId) => {
    const existing = await reminderRepository.findReminderById(id, userId);
    if (!existing) return false;

    const pool = getPool();
    if (pool) {
      try {
        const [result] = await pool.query(
          'DELETE FROM reminders WHERE id = ? AND user_id = ?',
          [id, userId]
        );
        return result.affectedRows > 0;
      } catch (error) {
        console.warn('MySQL deleteReminder error, falling back to memory store:', error.message);
      }
    }

    for (const [remId, rem] of memoryReminders.entries()) {
      if (String(rem.id) === String(id) && String(rem.user_id) === String(userId)) {
        memoryReminders.delete(remId);
        return true;
      }
    }
    return false;
  },

  toggleReminder: async (id, userId) => {
    const reminder = await reminderRepository.findReminderById(id, userId);
    if (!reminder) return null;
    return await reminderRepository.updateReminder(id, userId, {
      enabled: !reminder.enabled,
    });
  },

  snoozeReminder: async (id, userId, minutes = 10) => {
    const snoozeDate = new Date(Date.now() + minutes * 60 * 1000);
    return await reminderRepository.updateReminder(id, userId, {
      snoozeUntil: snoozeDate,
    });
  },
};

export default reminderRepository;
