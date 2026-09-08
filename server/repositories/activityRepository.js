import { getPool } from '../config/db.js';

const memoryActivities = new Map();
let nextActivityId = 1;

export const formatActivityRow = (row) => {
  if (!row) return null;
  let metadata = null;
  if (row.metadata) {
    try {
      metadata = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata;
    } catch {
      metadata = null;
    }
  }

  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    description: row.description,
    entityId: row.entity_id ? String(row.entity_id) : null,
    entityType: row.entity_type || null,
    metadata,
    createdAt: row.created_at,
  };
};

export const activityRepository = {
  createActivity: async (userId, data) => {
    const pool = getPool();
    const now = new Date().toISOString();
    const type = data.type;
    const description = data.description;
    const entityId = data.entityId || data.entity_id ? String(data.entityId || data.entity_id) : null;
    const entityType = data.entityType || data.entity_type || null;
    const metadata = data.metadata || null;

    if (pool) {
      try {
        const [result] = await pool.query(
          `INSERT INTO activities (
            user_id, type, description, entity_id, entity_type, metadata
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, type, description, entityId, entityType, metadata ? JSON.stringify(metadata) : null]
        );

        const [rows] = await pool.query('SELECT * FROM activities WHERE id = ?', [result.insertId]);
        return formatActivityRow(rows[0]);
      } catch (error) {
        console.warn('MySQL createActivity error, falling back to memory store:', error.message);
      }
    }

    const id = nextActivityId++;
    const act = {
      id,
      user_id: userId,
      type,
      description,
      entity_id: entityId,
      entity_type: entityType,
      metadata,
      created_at: now,
    };
    memoryActivities.set(id, act);
    return formatActivityRow(act);
  },

  findActivitiesByUser: async (userId, filters = {}) => {
    const pool = getPool();
    if (pool) {
      try {
        let query = 'SELECT * FROM activities WHERE user_id = ?';
        const params = [userId];

        if (filters.type) {
          query += ' AND type = ?';
          params.push(filters.type);
        }
        if (filters.entityType) {
          query += ' AND entity_type = ?';
          params.push(filters.entityType);
        }
        if (filters.entityId) {
          query += ' AND entity_id = ?';
          params.push(String(filters.entityId));
        }

        query += ' ORDER BY created_at DESC';
        if (filters.limit) {
          query += ' LIMIT ?';
          params.push(parseInt(filters.limit, 10));
        }

        const [rows] = await pool.query(query, params);
        return rows.map(formatActivityRow);
      } catch (error) {
        console.warn('MySQL findActivitiesByUser error, falling back to memory store:', error.message);
      }
    }

    let list = Array.from(memoryActivities.values()).filter(
      (a) => String(a.user_id) === String(userId)
    );
    if (filters.type) list = list.filter((a) => a.type === filters.type);
    if (filters.entityType) list = list.filter((a) => a.entity_type === filters.entityType);
    if (filters.entityId) list = list.filter((a) => String(a.entity_id) === String(filters.entityId));
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (filters.limit) list = list.slice(0, parseInt(filters.limit, 10));
    return list.map(formatActivityRow);
  },

  clearActivities: async (userId) => {
    const pool = getPool();
    if (pool) {
      try {
        await pool.query('DELETE FROM activities WHERE user_id = ?', [userId]);
        return true;
      } catch (error) {
        console.warn('MySQL clearActivities error, falling back to memory store:', error.message);
      }
    }

    for (const [id, act] of memoryActivities.entries()) {
      if (String(act.user_id) === String(userId)) {
        memoryActivities.delete(id);
      }
    }
    return true;
  },
};

export default activityRepository;
