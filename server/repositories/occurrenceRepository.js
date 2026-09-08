import { getPool } from '../config/db.js';

const memoryOccurrences = new Map();
let nextOccurrenceId = 1;

export const formatOccurrenceRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    recurringTaskId: Number(row.recurring_task_id),
    taskId: Number(row.task_id),
    occurrenceDate: row.occurrence_date,
    createdAt: row.created_at,
  };
};

export const occurrenceRepository = {
  findOccurrence: async (userId, recurringTaskId, occurrenceDate) => {
    const pool = getPool();
    if (pool) {
      try {
        const [rows] = await pool.query(
          `SELECT * FROM recurring_task_occurrences
           WHERE user_id = ? AND recurring_task_id = ? AND occurrence_date = ?`,
          [userId, recurringTaskId, occurrenceDate]
        );
        if (rows.length === 0) return null;
        return formatOccurrenceRow(rows[0]);
      } catch (error) {
        console.warn('MySQL findOccurrence error, falling back to memory store:', error.message);
      }
    }

    const key = `${userId}_${recurringTaskId}_${occurrenceDate}`;
    const occ = memoryOccurrences.get(key);
    return occ ? formatOccurrenceRow(occ) : null;
  },

  recordOccurrence: async (userId, recurringTaskId, taskId, occurrenceDate) => {
    const pool = getPool();
    const now = new Date().toISOString();

    if (pool) {
      try {
        const [result] = await pool.query(
          `INSERT INTO recurring_task_occurrences (
            user_id, recurring_task_id, task_id, occurrence_date
          ) VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE task_id = VALUES(task_id)`,
          [userId, recurringTaskId, taskId, occurrenceDate]
        );

        return await occurrenceRepository.findOccurrence(userId, recurringTaskId, occurrenceDate);
      } catch (error) {
        console.warn('MySQL recordOccurrence error, falling back to memory store:', error.message);
      }
    }

    const key = `${userId}_${recurringTaskId}_${occurrenceDate}`;
    const occ = {
      id: nextOccurrenceId++,
      user_id: userId,
      recurring_task_id: recurringTaskId,
      task_id: taskId,
      occurrence_date: occurrenceDate,
      created_at: now,
    };
    memoryOccurrences.set(key, occ);
    return formatOccurrenceRow(occ);
  },

  findOccurrencesForTask: async (userId, recurringTaskId) => {
    const pool = getPool();
    if (pool) {
      try {
        const [rows] = await pool.query(
          `SELECT * FROM recurring_task_occurrences
           WHERE user_id = ? AND recurring_task_id = ?
           ORDER BY occurrence_date ASC`,
          [userId, recurringTaskId]
        );
        return rows.map(formatOccurrenceRow);
      } catch (error) {
        console.warn('MySQL findOccurrencesForTask error, falling back to memory store:', error.message);
      }
    }

    const list = Array.from(memoryOccurrences.values()).filter(
      (o) => String(o.user_id) === String(userId) && String(o.recurring_task_id) === String(recurringTaskId)
    );
    list.sort((a, b) => a.occurrence_date.localeCompare(b.occurrence_date));
    return list.map(formatOccurrenceRow);
  },
};

export default occurrenceRepository;
