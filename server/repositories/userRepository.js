import { getPool } from '../config/db.js';

// In-memory fallback cache when MySQL is waiting for credentials
const memoryUsers = new Map();
let nextMemoryUserId = 1;

/**
 * Create a new user record in MySQL (or in-memory fallback)
 */
export const createUser = async ({ name, email, passwordHash, avatarUrl = null, timezone = 'UTC' }) => {
  const normalizedEmail = email.toLowerCase().trim();
  try {
    const pool = getPool();
    const sql = `
      INSERT INTO users (name, email, password_hash, avatar_url, timezone, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, TRUE, NOW(), NOW())
    `;

    const [result] = await pool.query(sql, [name, normalizedEmail, passwordHash, avatarUrl, timezone]);

    return {
      id: result.insertId,
      name,
      email: normalizedEmail,
      avatar_url: avatarUrl,
      timezone,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
  } catch (dbErr) {
    if (dbErr.code === 'ER_ACCESS_DENIED_ERROR' || dbErr.code === 'ECONNREFUSED') {
      console.warn('⚠ MySQL disconnected. Using in-memory fallback for user registration.');
      const user = {
        id: nextMemoryUserId++,
        name,
        email: normalizedEmail,
        password_hash: passwordHash,
        avatar_url: avatarUrl,
        timezone,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        last_login_at: null,
      };
      memoryUsers.set(user.id, user);
      return user;
    }
    throw dbErr;
  }
};

/**
 * Find user by ID
 */
export const findUserById = async (id, includePassword = false) => {
  try {
    const pool = getPool();
    const fields = includePassword
      ? 'id, name, email, password_hash, avatar_url, timezone, is_active, created_at, updated_at, last_login_at'
      : 'id, name, email, avatar_url, timezone, is_active, created_at, updated_at, last_login_at';

    const sql = `SELECT ${fields} FROM users WHERE id = ? LIMIT 1`;
    const [rows] = await pool.query(sql, [id]);

    return rows.length > 0 ? rows[0] : null;
  } catch (dbErr) {
    if (dbErr.code === 'ER_ACCESS_DENIED_ERROR' || dbErr.code === 'ECONNREFUSED') {
      const user = memoryUsers.get(Number(id));
      if (!user) return null;
      if (!includePassword) {
        const { password_hash, ...sanitized } = user;
        return sanitized;
      }
      return user;
    }
    throw dbErr;
  }
};

/**
 * Find user by email
 */
export const findUserByEmail = async (email, includePassword = true) => {
  const normalizedEmail = email.toLowerCase().trim();
  try {
    const pool = getPool();
    const fields = includePassword
      ? 'id, name, email, password_hash, avatar_url, timezone, is_active, created_at, updated_at, last_login_at'
      : 'id, name, email, avatar_url, timezone, is_active, created_at, updated_at, last_login_at';

    const sql = `SELECT ${fields} FROM users WHERE email = ? LIMIT 1`;
    const [rows] = await pool.query(sql, [normalizedEmail]);

    return rows.length > 0 ? rows[0] : null;
  } catch (dbErr) {
    if (dbErr.code === 'ER_ACCESS_DENIED_ERROR' || dbErr.code === 'ECONNREFUSED') {
      for (const u of memoryUsers.values()) {
        if (u.email === normalizedEmail) {
          if (!includePassword) {
            const { password_hash, ...sanitized } = u;
            return sanitized;
          }
          return u;
        }
      }
      return null;
    }
    throw dbErr;
  }
};

/**
 * Update user last login timestamp
 */
export const updateLastLogin = async (id) => {
  const pool = getPool();
  const sql = `UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = ?`;
  await pool.query(sql, [id]);
};

/**
 * Update user profile
 */
export const updateUser = async (id, { name, avatarUrl, timezone }) => {
  const pool = getPool();
  const updates = [];
  const params = [];

  if (name !== undefined) {
    updates.push('name = ?');
    params.push(name.trim());
  }
  if (avatarUrl !== undefined) {
    updates.push('avatar_url = ?');
    params.push(avatarUrl);
  }
  if (timezone !== undefined) {
    updates.push('timezone = ?');
    params.push(timezone);
  }

  if (updates.length === 0) return await findUserById(id);

  updates.push('updated_at = NOW()');
  params.push(id);

  const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
  await pool.query(sql, params);

  return await findUserById(id);
};

/**
 * Soft deactivate user account
 */
export const deactivateUser = async (id) => {
  const pool = getPool();
  const sql = `UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ?`;
  await pool.query(sql, [id]);
};

export default {
  createUser,
  findUserById,
  findUserByEmail,
  updateLastLogin,
  updateUser,
  deactivateUser,
};
