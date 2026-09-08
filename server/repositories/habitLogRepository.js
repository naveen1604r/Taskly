import { getPool } from '../config/db.js';
import { habitRepository } from './habitRepository.js';

const memoryLogs = new Map();
let nextLogId = 1;

export const formatLogRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    habitId: Number(row.habit_id),
    logDate: row.log_date,
    completed: Boolean(row.completed),
    progressCount: Number(row.progress_count) || 0,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const habitLogRepository = {
  upsertLog: async (userId, habitId, logDate, completed, progressCount = 1, notes = null) => {
    const pool = getPool();
    const now = new Date().toISOString();
    const isCompleted = Boolean(completed);
    const count = Number(progressCount) || (isCompleted ? 1 : 0);

    if (pool) {
      try {
        await pool.query(
          `INSERT INTO habit_logs (
            user_id, habit_id, log_date, completed, progress_count, notes
          ) VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            completed = VALUES(completed),
            progress_count = VALUES(progress_count),
            notes = VALUES(notes),
            updated_at = CURRENT_TIMESTAMP`,
          [userId, habitId, logDate, isCompleted, count, notes]
        );

        const [rows] = await pool.query(
          'SELECT * FROM habit_logs WHERE user_id = ? AND habit_id = ? AND log_date = ?',
          [userId, habitId, logDate]
        );

        await habitLogRepository.recalculateHabitStreaks(userId, habitId);
        return formatLogRow(rows[0]);
      } catch (error) {
        console.warn('MySQL upsertLog error, falling back to memory store:', error.message);
      }
    }

    const key = `${userId}_${habitId}_${logDate}`;
    let log = memoryLogs.get(key);
    if (log) {
      log.completed = isCompleted;
      log.progress_count = count;
      log.notes = notes;
      log.updated_at = now;
    } else {
      log = {
        id: nextLogId++,
        user_id: userId,
        habit_id: habitId,
        log_date: logDate,
        completed: isCompleted,
        progress_count: count,
        notes,
        created_at: now,
        updated_at: now,
      };
      memoryLogs.set(key, log);
    }

    await habitLogRepository.recalculateHabitStreaks(userId, habitId);
    return formatLogRow(log);
  },

  getLogsForHabit: async (userId, habitId, startDate = null, endDate = null) => {
    const pool = getPool();
    if (pool) {
      try {
        let query = 'SELECT * FROM habit_logs WHERE user_id = ? AND habit_id = ?';
        const params = [userId, habitId];

        if (startDate) {
          query += ' AND log_date >= ?';
          params.push(startDate);
        }
        if (endDate) {
          query += ' AND log_date <= ?';
          params.push(endDate);
        }

        query += ' ORDER BY log_date ASC';
        const [rows] = await pool.query(query, params);
        return rows.map(formatLogRow);
      } catch (error) {
        console.warn('MySQL getLogsForHabit error, falling back to memory store:', error.message);
      }
    }

    let list = Array.from(memoryLogs.values()).filter(
      (l) => String(l.user_id) === String(userId) && String(l.habit_id) === String(habitId)
    );
    if (startDate) list = list.filter((l) => l.log_date >= startDate);
    if (endDate) list = list.filter((l) => l.log_date <= endDate);
    list.sort((a, b) => a.log_date.localeCompare(b.log_date));
    return list.map(formatLogRow);
  },

  getAllLogsForUser: async (userId, startDate = null, endDate = null) => {
    const pool = getPool();
    if (pool) {
      try {
        let query = 'SELECT * FROM habit_logs WHERE user_id = ?';
        const params = [userId];

        if (startDate) {
          query += ' AND log_date >= ?';
          params.push(startDate);
        }
        if (endDate) {
          query += ' AND log_date <= ?';
          params.push(endDate);
        }

        query += ' ORDER BY log_date ASC';
        const [rows] = await pool.query(query, params);
        return rows.map(formatLogRow);
      } catch (error) {
        console.warn('MySQL getAllLogsForUser error, falling back to memory store:', error.message);
      }
    }

    let list = Array.from(memoryLogs.values()).filter(
      (l) => String(l.user_id) === String(userId)
    );
    if (startDate) list = list.filter((l) => l.log_date >= startDate);
    if (endDate) list = list.filter((l) => l.log_date <= endDate);
    list.sort((a, b) => a.log_date.localeCompare(b.log_date));
    return list.map(formatLogRow);
  },

  recalculateHabitStreaks: async (userId, habitId) => {
    const logs = await habitLogRepository.getLogsForHabit(userId, habitId);
    const completedDates = Array.from(
      new Set(logs.filter((l) => l.completed).map((l) => l.logDate))
    ).sort();

    const totalCompleted = completedDates.length;
    if (completedDates.length === 0) {
      await habitRepository.updateHabit(habitId, userId, {
        currentStreak: 0,
        bestStreak: 0,
        totalCompleted: 0,
      });
      return;
    }

    // Calculate streaks
    let bestStreak = 0;
    let tempStreak = 0;
    let prevDate = null;

    for (const dStr of completedDates) {
      const d = new Date(dStr + 'T00:00:00');
      if (prevDate) {
        const diffMs = d - prevDate;
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak += 1;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
      prevDate = d;
    }

    // Current streak: count backwards from latest completed date if it's today or yesterday
    const today = new Date().toISOString().slice(0, 10);
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const latestCompleted = completedDates[completedDates.length - 1];
    let currentStreak = 0;

    if (latestCompleted === today || latestCompleted === yesterdayDate) {
      currentStreak = 1;
      let curr = new Date(latestCompleted + 'T00:00:00');
      for (let i = completedDates.length - 2; i >= 0; i--) {
        const prev = new Date(completedDates[i] + 'T00:00:00');
        const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak += 1;
          curr = prev;
        } else {
          break;
        }
      }
    }

    await habitRepository.updateHabit(habitId, userId, {
      currentStreak,
      bestStreak: Math.max(bestStreak, currentStreak),
      totalCompleted,
    });
  },
};

export default habitLogRepository;
