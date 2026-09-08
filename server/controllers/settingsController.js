import { getPool } from '../config/db.js';

const memorySettings = new Map();

const defaultSettings = {
  theme: 'dark',
  accentColor: 'purple',
  compactMode: false,
  animations: true,
  preferences: {},
};

export const getSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    if (pool) {
      try {
        const [rows] = await pool.query(
          'SELECT theme, accent_color, compact_mode, animations, preferences FROM user_settings WHERE user_id = ? LIMIT 1',
          [userId]
        );

        if (rows.length > 0) {
          const row = rows[0];
          let parsedPrefs = {};
          if (row.preferences) {
            try {
              parsedPrefs = typeof row.preferences === 'string' ? JSON.parse(row.preferences) : row.preferences;
            } catch {}
          }

          return res.status(200).json({
            success: true,
            data: {
              settings: {
                theme: row.theme || 'dark',
                accentColor: row.accent_color || 'purple',
                compactMode: Boolean(row.compact_mode),
                animations: row.animations !== undefined ? Boolean(row.animations) : true,
                preferences: parsedPrefs,
              },
            },
          });
        }
      } catch (err) {
        console.warn('MySQL getSettings error, checking memory fallback:', err.message);
      }
    }

    const saved = memorySettings.get(userId) || defaultSettings;
    return res.status(200).json({
      success: true,
      data: { settings: saved },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { theme, accentColor, compactMode, animations, preferences } = req.body;
    const pool = getPool();

    const cleanTheme = ['dark', 'light', 'system'].includes(theme) ? theme : undefined;
    const cleanAccent = typeof accentColor === 'string' ? accentColor.trim().toLowerCase() : undefined;
    const cleanCompact = compactMode !== undefined ? Boolean(compactMode) : undefined;
    const cleanAnim = animations !== undefined ? Boolean(animations) : undefined;
    const prefsJson = preferences ? JSON.stringify(preferences) : null;

    if (pool) {
      try {
        await pool.query(
          `INSERT INTO user_settings (user_id, theme, accent_color, compact_mode, animations, preferences)
           VALUES (?, COALESCE(?, 'dark'), COALESCE(?, 'purple'), COALESCE(?, false), COALESCE(?, true), ?)
           ON DUPLICATE KEY UPDATE
             theme = COALESCE(VALUES(theme), theme),
             accent_color = COALESCE(VALUES(accent_color), accent_color),
             compact_mode = COALESCE(VALUES(compact_mode), compact_mode),
             animations = COALESCE(VALUES(animations), animations),
             preferences = COALESCE(VALUES(preferences), preferences)`,
          [userId, cleanTheme, cleanAccent, cleanCompact, cleanAnim, prefsJson]
        );

        const [rows] = await pool.query(
          'SELECT theme, accent_color, compact_mode, animations, preferences FROM user_settings WHERE user_id = ? LIMIT 1',
          [userId]
        );

        if (rows.length > 0) {
          const row = rows[0];
          let parsedPrefs = {};
          if (row.preferences) {
            try {
              parsedPrefs = typeof row.preferences === 'string' ? JSON.parse(row.preferences) : row.preferences;
            } catch {}
          }

          const result = {
            theme: row.theme || 'dark',
            accentColor: row.accent_color || 'purple',
            compactMode: Boolean(row.compact_mode),
            animations: row.animations !== undefined ? Boolean(row.animations) : true,
            preferences: parsedPrefs,
          };
          memorySettings.set(userId, result);

          return res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            data: { settings: result },
          });
        }
      } catch (err) {
        console.warn('MySQL updateSettings error, saving to memory fallback:', err.message);
      }
    }

    const prev = memorySettings.get(userId) || defaultSettings;
    const updated = {
      ...prev,
      ...(cleanTheme !== undefined && { theme: cleanTheme }),
      ...(cleanAccent !== undefined && { accentColor: cleanAccent }),
      ...(cleanCompact !== undefined && { compactMode: cleanCompact }),
      ...(cleanAnim !== undefined && { animations: cleanAnim }),
      ...(preferences !== undefined && { preferences }),
    };
    memorySettings.set(userId, updated);

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings: updated },
    });
  } catch (error) {
    next(error);
  }
};
