import { getPool } from '../config/db.js';

const memoryNotifications = new Map();
let nextNotificationId = 1;

export const formatNotificationRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type || 'info',
    title: row.title,
    message: row.message,
    isRead: Boolean(row.is_read),
    actionUrl: row.action_url || null,
    eventKey: row.event_key || null,
    createdAt: row.created_at,
  };
};

export const notificationRepository = {
  createNotification: async (userId, data) => {
    const pool = getPool();
    const now = new Date().toISOString();
    const type = data.type || 'info';
    const title = data.title.trim();
    const message = data.message.trim();
    const actionUrl = data.actionUrl || data.action_url || null;
    const eventKey = data.eventKey || data.event_key || null;

    // Check deduplication by event_key
    if (eventKey) {
      let foundExisting = null;
      if (pool) {
        try {
          const [existing] = await pool.query(
            'SELECT * FROM notifications WHERE user_id = ? AND event_key = ? LIMIT 1',
            [userId, eventKey]
          );
          if (existing.length > 0) {
            foundExisting = formatNotificationRow(existing[0]);
          }
        } catch (error) {
          console.warn('MySQL eventKey check error:', error.message);
        }
      }

      if (foundExisting) {
        return foundExisting;
      }

      for (const notif of memoryNotifications.values()) {
        if (String(notif.user_id) === String(userId) && notif.event_key === eventKey) {
          return formatNotificationRow(notif);
        }
      }
    }

    if (pool) {
      try {
        const [result] = await pool.query(
          `INSERT INTO notifications (
            user_id, type, title, message, action_url, event_key
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, type, title, message, actionUrl, eventKey]
        );

        const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
        return formatNotificationRow(rows[0]);
      } catch (error) {
        console.warn('MySQL createNotification error, falling back to memory store:', error.message);
      }
    }

    const id = nextNotificationId++;
    const notif = {
      id,
      user_id: userId,
      type,
      title,
      message,
      is_read: false,
      action_url: actionUrl,
      event_key: eventKey,
      created_at: now,
    };
    memoryNotifications.set(id, notif);
    return formatNotificationRow(notif);
  },

  findNotificationById: async (id, userId) => {
    const pool = getPool();
    if (pool) {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
          [id, userId]
        );
        if (rows.length === 0) return null;
        return formatNotificationRow(rows[0]);
      } catch (error) {
        console.warn('MySQL findNotificationById error, falling back to memory store:', error.message);
      }
    }

    for (const notif of memoryNotifications.values()) {
      if (String(notif.id) === String(id) && String(notif.user_id) === String(userId)) {
        return formatNotificationRow(notif);
      }
    }
    return null;
  },

  findNotificationsByUser: async (userId, filters = {}) => {
    const pool = getPool();
    if (pool) {
      try {
        let query = 'SELECT * FROM notifications WHERE user_id = ?';
        const params = [userId];

        if (filters.isRead !== undefined) {
          query += ' AND is_read = ?';
          params.push(Boolean(filters.isRead));
        }

        query += ' ORDER BY created_at DESC';
        if (filters.limit) {
          query += ' LIMIT ?';
          params.push(parseInt(filters.limit, 10));
        }

        const [rows] = await pool.query(query, params);
        const [unreadRows] = await pool.query(
          'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
          [userId]
        );

        return {
          notifications: rows.map(formatNotificationRow),
          unreadCount: unreadRows[0]?.count || 0,
        };
      } catch (error) {
        console.warn('MySQL findNotificationsByUser error, falling back to memory store:', error.message);
      }
    }

    let list = Array.from(memoryNotifications.values()).filter(
      (n) => String(n.user_id) === String(userId)
    );
    const unreadCount = list.filter((n) => !n.is_read).length;

    if (filters.isRead !== undefined) {
      list = list.filter((n) => Boolean(n.is_read) === Boolean(filters.isRead));
    }
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (filters.limit) {
      list = list.slice(0, parseInt(filters.limit, 10));
    }

    return {
      notifications: list.map(formatNotificationRow),
      unreadCount,
    };
  },

  markAsRead: async (id, userId) => {
    const pool = getPool();
    if (pool) {
      try {
        await pool.query(
          'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
          [id, userId]
        );
        return await notificationRepository.findNotificationById(id, userId);
      } catch (error) {
        console.warn('MySQL markAsRead error, falling back to memory store:', error.message);
      }
    }

    for (const notif of memoryNotifications.values()) {
      if (String(notif.id) === String(id) && String(notif.user_id) === String(userId)) {
        notif.is_read = true;
        return formatNotificationRow(notif);
      }
    }
    return null;
  },

  markAllAsRead: async (userId) => {
    const pool = getPool();
    if (pool) {
      try {
        await pool.query(
          'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
          [userId]
        );
        return true;
      } catch (error) {
        console.warn('MySQL markAllAsRead error, falling back to memory store:', error.message);
      }
    }

    for (const notif of memoryNotifications.values()) {
      if (String(notif.user_id) === String(userId)) {
        notif.is_read = true;
      }
    }
    return true;
  },

  deleteNotification: async (id, userId) => {
    const pool = getPool();
    if (pool) {
      try {
        const [result] = await pool.query(
          'DELETE FROM notifications WHERE id = ? AND user_id = ?',
          [id, userId]
        );
        return result.affectedRows > 0;
      } catch (error) {
        console.warn('MySQL deleteNotification error, falling back to memory store:', error.message);
      }
    }

    for (const [notifId, notif] of memoryNotifications.entries()) {
      if (String(notif.id) === String(id) && String(notif.user_id) === String(userId)) {
        memoryNotifications.delete(notifId);
        return true;
      }
    }
    return false;
  },

  clearAll: async (userId) => {
    const pool = getPool();
    if (pool) {
      try {
        await pool.query('DELETE FROM notifications WHERE user_id = ?', [userId]);
        return true;
      } catch (error) {
        console.warn('MySQL clearAll notifications error, falling back to memory store:', error.message);
      }
    }

    for (const [notifId, notif] of memoryNotifications.entries()) {
      if (String(notif.user_id) === String(userId)) {
        memoryNotifications.delete(notifId);
      }
    }
    return true;
  },
};

export default notificationRepository;
