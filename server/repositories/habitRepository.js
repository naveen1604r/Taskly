import { getPool } from '../config/db.js';

const memoryHabits = new Map();
let nextHabitId = 1;

export const formatHabitRow = (row) => {
  if (!row) return null;
  let customDays = [];
  if (row.custom_days) {
    try {
      customDays = typeof row.custom_days === 'string' ? JSON.parse(row.custom_days) : row.custom_days;
      if (!Array.isArray(customDays)) customDays = [];
    } catch {
      customDays = [];
    }
  }

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description || '',
    category: row.category || 'Health',
    frequency: row.frequency || 'daily',
    targetPerDay: Number(row.target_per_day) || 1,
    targetUnit: row.target_unit || 'times',
    customDays,
    color: row.color || '#10B981',
    icon: row.icon || 'Activity',
    reminderTime: row.reminder_time || null,
    streakGoal: Number(row.streak_goal) || 30,
    currentStreak: Number(row.current_streak) || 0,
    bestStreak: Number(row.best_streak) || 0,
    totalCompleted: Number(row.total_completed) || 0,
    archived: Boolean(row.archived),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const habitRepository = {
  createHabit: async (userId, data) => {
    const pool = getPool();
    const now = new Date().toISOString();
    const name = data.name.trim();
    const description = data.description || '';
    const category = data.category || 'Health';
    const frequency = data.frequency || 'daily';
    const targetPerDay = Number(data.targetPerDay || data.target_per_day) || 1;
    const targetUnit = data.targetUnit || data.target_unit || 'times';
    const customDays = Array.isArray(data.customDays) ? data.customDays : [];
    const color = data.color || '#10B981';
    const icon = data.icon || 'Activity';
    const reminderTime = data.reminderTime || data.reminder_time || null;
    const streakGoal = Number(data.streakGoal || data.streak_goal) || 30;

    if (pool) {
      try {
        const [result] = await pool.query(
          `INSERT INTO habits (
            user_id, name, description, category, frequency, target_per_day,
            target_unit, custom_days, color, icon, reminder_time, streak_goal
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId, name, description, category, frequency, targetPerDay,
            targetUnit, JSON.stringify(customDays), color, icon, reminderTime, streakGoal
          ]
        );

        return await habitRepository.findHabitByIdForUser(result.insertId, userId);
      } catch (error) {
        console.warn('MySQL createHabit error, falling back to memory store:', error.message);
      }
    }

    const id = nextHabitId++;
    const habit = {
      id,
      user_id: userId,
      name,
      description,
      category,
      frequency,
      target_per_day: targetPerDay,
      target_unit: targetUnit,
      custom_days: customDays,
      color,
      icon,
      reminder_time: reminderTime,
      streak_goal: streakGoal,
      current_streak: 0,
      best_streak: 0,
      total_completed: 0,
      archived: false,
      created_at: now,
      updated_at: now,
    };
    memoryHabits.set(id, habit);
    return formatHabitRow(habit);
  },

  findHabitByIdForUser: async (habitId, userId) => {
    const pool = getPool();
    if (pool) {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM habits WHERE id = ? AND user_id = ?',
          [habitId, userId]
        );
        if (rows.length === 0) return null;
        return formatHabitRow(rows[0]);
      } catch (error) {
        console.warn('MySQL findHabitByIdForUser error, falling back to memory store:', error.message);
      }
    }

    for (const habit of memoryHabits.values()) {
      if (String(habit.id) === String(habitId) && String(habit.user_id) === String(userId)) {
        return formatHabitRow(habit);
      }
    }
    return null;
  },

  findHabitsByUser: async (userId, filters = {}) => {
    const pool = getPool();
    if (pool) {
      try {
        let query = 'SELECT * FROM habits WHERE user_id = ?';
        const params = [userId];

        if (filters.archived !== undefined) {
          query += ' AND archived = ?';
          params.push(Boolean(filters.archived));
        }
        if (filters.category) {
          query += ' AND category = ?';
          params.push(filters.category);
        }
        if (filters.frequency) {
          query += ' AND frequency = ?';
          params.push(filters.frequency);
        }

        query += ' ORDER BY created_at ASC';
        const [rows] = await pool.query(query, params);
        return rows.map(formatHabitRow);
      } catch (error) {
        console.warn('MySQL findHabitsByUser error, falling back to memory store:', error.message);
      }
    }

    let list = Array.from(memoryHabits.values()).filter(
      (h) => String(h.user_id) === String(userId)
    );
    if (filters.archived !== undefined) {
      list = list.filter((h) => Boolean(h.archived) === Boolean(filters.archived));
    }
    if (filters.category) {
      list = list.filter((h) => h.category === filters.category);
    }
    if (filters.frequency) {
      list = list.filter((h) => h.frequency === filters.frequency);
    }
    list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return list.map(formatHabitRow);
  },

  updateHabit: async (habitId, userId, updates = {}) => {
    const existing = await habitRepository.findHabitByIdForUser(habitId, userId);
    if (!existing) return null;

    const pool = getPool();
    const now = new Date().toISOString();

    if (pool) {
      try {
        const fieldMap = {
          name: 'name',
          description: 'description',
          category: 'category',
          frequency: 'frequency',
          targetPerDay: 'target_per_day',
          targetUnit: 'target_unit',
          customDays: 'custom_days',
          color: 'color',
          icon: 'icon',
          reminderTime: 'reminder_time',
          streakGoal: 'streak_goal',
          currentStreak: 'current_streak',
          bestStreak: 'best_streak',
          totalCompleted: 'total_completed',
          archived: 'archived',
        };

        const updateFields = [];
        const params = [];

        Object.entries(updates).forEach(([key, val]) => {
          const col = fieldMap[key];
          if (col !== undefined) {
            updateFields.push(`${col} = ?`);
            if (key === 'customDays') {
              params.push(val ? JSON.stringify(val) : null);
            } else {
              params.push(val === undefined ? null : val);
            }
          }
        });

        if (updateFields.length > 0) {
          params.push(habitId, userId);
          await pool.query(
            `UPDATE habits SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
            params
          );
        }

        return await habitRepository.findHabitByIdForUser(habitId, userId);
      } catch (error) {
        console.warn('MySQL updateHabit error, falling back to memory store:', error.message);
      }
    }

    for (const habit of memoryHabits.values()) {
      if (String(habit.id) === String(habitId) && String(habit.user_id) === String(userId)) {
        if (updates.name !== undefined) habit.name = updates.name.trim();
        if (updates.description !== undefined) habit.description = updates.description;
        if (updates.category !== undefined) habit.category = updates.category;
        if (updates.frequency !== undefined) habit.frequency = updates.frequency;
        if (updates.targetPerDay !== undefined) habit.target_per_day = Number(updates.targetPerDay);
        if (updates.targetUnit !== undefined) habit.target_unit = updates.targetUnit;
        if (updates.customDays !== undefined) habit.custom_days = updates.customDays;
        if (updates.color !== undefined) habit.color = updates.color;
        if (updates.icon !== undefined) habit.icon = updates.icon;
        if (updates.reminderTime !== undefined) habit.reminder_time = updates.reminderTime;
        if (updates.streakGoal !== undefined) habit.streak_goal = Number(updates.streakGoal);
        if (updates.currentStreak !== undefined) habit.current_streak = Number(updates.currentStreak);
        if (updates.bestStreak !== undefined) habit.best_streak = Number(updates.bestStreak);
        if (updates.totalCompleted !== undefined) habit.total_completed = Number(updates.totalCompleted);
        if (updates.archived !== undefined) habit.archived = Boolean(updates.archived);
        habit.updated_at = now;
        return formatHabitRow(habit);
      }
    }
    return null;
  },

  deleteHabit: async (habitId, userId) => {
    const existing = await habitRepository.findHabitByIdForUser(habitId, userId);
    if (!existing) return false;

    const pool = getPool();
    if (pool) {
      try {
        const [result] = await pool.query(
          'DELETE FROM habits WHERE id = ? AND user_id = ?',
          [habitId, userId]
        );
        return result.affectedRows > 0;
      } catch (error) {
        console.warn('MySQL deleteHabit error, falling back to memory store:', error.message);
      }
    }

    for (const [id, habit] of memoryHabits.entries()) {
      if (String(habit.id) === String(habitId) && String(habit.user_id) === String(userId)) {
        memoryHabits.delete(id);
        return true;
      }
    }
    return false;
  },

  archiveHabit: async (habitId, userId) => {
    return await habitRepository.updateHabit(habitId, userId, { archived: true });
  },

  restoreHabit: async (habitId, userId) => {
    return await habitRepository.updateHabit(habitId, userId, { archived: false });
  },
};

export default habitRepository;
