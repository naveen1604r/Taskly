import { getPool } from '../config/db.js';

const memorySessions = new Map();
let nextSessionId = 1;

const memorySettings = new Map();

export const formatSessionRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    taskId: row.task_id ? String(row.task_id) : null,
    taskTitle: row.task_title || null,
    durationMinutes: Number(row.duration_minutes) || 0,
    completed: Boolean(row.completed),
    rating: row.rating ? Number(row.rating) : null,
    sessionType: row.session_type || 'pomodoro',
    notes: row.notes || '',
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
};

export const defaultSettings = {
  pomodoroDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  alarmSound: 'bell',
  ambientSound: 'none',
  volume: 80,
};

export const formatSettingsRow = (row) => {
  if (!row) return { ...defaultSettings };
  return {
    id: row.id,
    userId: row.user_id,
    pomodoroDuration: Number(row.pomodoro_duration) || 25,
    shortBreakDuration: Number(row.short_break_duration) || 5,
    longBreakDuration: Number(row.long_break_duration) || 15,
    longBreakInterval: Number(row.long_break_interval) || 4,
    autoStartBreaks: Boolean(row.auto_start_breaks),
    autoStartPomodoros: Boolean(row.auto_start_pomodoros),
    alarmSound: row.alarm_sound || 'bell',
    ambientSound: row.ambient_sound || 'none',
    volume: Number(row.volume) !== undefined ? Number(row.volume) : 80,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const focusRepository = {
  createSession: async (userId, data) => {
    const pool = getPool();
    const now = new Date().toISOString();
    const taskId = data.taskId ? String(data.taskId) : null;
    const taskTitle = data.taskTitle || null;
    const durationMinutes = Number(data.durationMinutes) || 25;
    const completed = data.completed !== undefined ? Boolean(data.completed) : true;
    const rating = data.rating ? Number(data.rating) : null;
    const sessionType = data.sessionType || 'pomodoro';
    const notes = data.notes || null;
    const completedAt = completed ? (data.completedAt || now) : null;

    if (pool) {
      try {
        const [result] = await pool.query(
          `INSERT INTO focus_sessions (
            user_id, task_id, task_title, duration_minutes, completed,
            rating, session_type, notes, completed_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, taskId, taskTitle, durationMinutes, completed, rating, sessionType, notes, completedAt]
        );

        return await focusRepository.findSessionById(result.insertId, userId);
      } catch (error) {
        console.warn('MySQL createSession error, falling back to memory store:', error.message);
      }
    }

    const id = nextSessionId++;
    const session = {
      id,
      user_id: userId,
      task_id: taskId,
      task_title: taskTitle,
      duration_minutes: durationMinutes,
      completed,
      rating,
      session_type: sessionType,
      notes,
      started_at: now,
      completed_at: completedAt,
    };
    memorySessions.set(id, session);
    return formatSessionRow(session);
  },

  findSessionById: async (sessionId, userId) => {
    const pool = getPool();
    if (pool) {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM focus_sessions WHERE id = ? AND user_id = ?',
          [sessionId, userId]
        );
        if (rows.length === 0) return null;
        return formatSessionRow(rows[0]);
      } catch (error) {
        console.warn('MySQL findSessionById error, falling back to memory store:', error.message);
      }
    }

    for (const session of memorySessions.values()) {
      if (String(session.id) === String(sessionId) && String(session.user_id) === String(userId)) {
        return formatSessionRow(session);
      }
    }
    return null;
  },

  findSessionsByUser: async (userId, filters = {}) => {
    const pool = getPool();
    if (pool) {
      try {
        let query = 'SELECT * FROM focus_sessions WHERE user_id = ?';
        const params = [userId];

        if (filters.completed !== undefined) {
          query += ' AND completed = ?';
          params.push(Boolean(filters.completed));
        }
        if (filters.sessionType) {
          query += ' AND session_type = ?';
          params.push(filters.sessionType);
        }

        query += ' ORDER BY started_at DESC';
        if (filters.limit) {
          query += ' LIMIT ?';
          params.push(parseInt(filters.limit, 10));
        }

        const [rows] = await pool.query(query, params);
        return rows.map(formatSessionRow);
      } catch (error) {
        console.warn('MySQL findSessionsByUser error, falling back to memory store:', error.message);
      }
    }

    let list = Array.from(memorySessions.values()).filter(
      (s) => String(s.user_id) === String(userId)
    );
    if (filters.completed !== undefined) {
      list = list.filter((s) => Boolean(s.completed) === Boolean(filters.completed));
    }
    if (filters.sessionType) {
      list = list.filter((s) => s.session_type === filters.sessionType);
    }
    list.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
    if (filters.limit) {
      list = list.slice(0, parseInt(filters.limit, 10));
    }
    return list.map(formatSessionRow);
  },

  getStats: async (userId) => {
    const sessions = await focusRepository.findSessionsByUser(userId);
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.completed).length;
    const totalMinutes = sessions
      .filter((s) => s.completed)
      .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

    const ratings = sessions.filter((s) => s.rating).map((s) => s.rating);
    const averageRating = ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : null;

    return {
      totalSessions,
      completedSessions,
      totalMinutes,
      averageRating: averageRating ? parseFloat(averageRating) : null,
    };
  },

  getSettings: async (userId) => {
    const pool = getPool();
    if (pool) {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM focus_settings WHERE user_id = ?',
          [userId]
        );
        if (rows.length > 0) {
          return formatSettingsRow(rows[0]);
        }
      } catch (error) {
        console.warn('MySQL getSettings error, falling back to memory store:', error.message);
      }
    }

    const mem = memorySettings.get(String(userId));
    if (mem) {
      return formatSettingsRow(mem);
    }

    return { ...defaultSettings, userId };
  },

  updateSettings: async (userId, data) => {
    const pool = getPool();
    const current = await focusRepository.getSettings(userId);
    const updated = {
      ...current,
      ...data,
      userId,
    };

    if (pool) {
      try {
        await pool.query(
          `INSERT INTO focus_settings (
            user_id, pomodoro_duration, short_break_duration, long_break_duration,
            long_break_interval, auto_start_breaks, auto_start_pomodoros,
            alarm_sound, ambient_sound, volume
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            pomodoro_duration = VALUES(pomodoro_duration),
            short_break_duration = VALUES(short_break_duration),
            long_break_duration = VALUES(long_break_duration),
            long_break_interval = VALUES(long_break_interval),
            auto_start_breaks = VALUES(auto_start_breaks),
            auto_start_pomodoros = VALUES(auto_start_pomodoros),
            alarm_sound = VALUES(alarm_sound),
            ambient_sound = VALUES(ambient_sound),
            volume = VALUES(volume)`,
          [
            userId,
            updated.pomodoroDuration,
            updated.shortBreakDuration,
            updated.longBreakDuration,
            updated.longBreakInterval,
            updated.autoStartBreaks,
            updated.autoStartPomodoros,
            updated.alarmSound,
            updated.ambientSound,
            updated.volume,
          ]
        );
        return await focusRepository.getSettings(userId);
      } catch (error) {
        console.warn('MySQL updateSettings error, falling back to memory store:', error.message);
      }
    }

    memorySettings.set(String(userId), {
      id: 1,
      user_id: userId,
      pomodoro_duration: updated.pomodoroDuration,
      short_break_duration: updated.shortBreakDuration,
      long_break_duration: updated.longBreakDuration,
      long_break_interval: updated.longBreakInterval,
      auto_start_breaks: updated.autoStartBreaks,
      auto_start_pomodoros: updated.autoStartPomodoros,
      alarm_sound: updated.alarmSound,
      ambient_sound: updated.ambientSound,
      volume: updated.volume,
    });
    return updated;
  },
};

export default focusRepository;
