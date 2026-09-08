import { getPool } from '../config/db.js';

/**
 * Initialize database schema if database connection is available
 */
export const initializeDatabase = async () => {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      // 1. Create users table if not exists
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          avatar_url VARCHAR(500) DEFAULT NULL,
          timezone VARCHAR(50) DEFAULT 'UTC',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          last_login_at TIMESTAMP NULL DEFAULT NULL,
          INDEX idx_users_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 2. Create tasks table if not exists
      await connection.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
          priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
          category VARCHAR(100) DEFAULT 'General',
          estimated_duration INT DEFAULT 30,
          actual_duration INT DEFAULT 0,
          duration_unit VARCHAR(20) DEFAULT 'minutes',
          due_date VARCHAR(20) NULL,
          due_time VARCHAR(20) NULL,
          planned_date VARCHAR(20) NULL,
          planned_start_time VARCHAR(20) NULL,
          goal_id VARCHAR(100) NULL,
          project_id VARCHAR(100) NULL,
          recurring_task_id VARCHAR(100) NULL,
          occurrence_date VARCHAR(20) NULL,
          tags JSON NULL,
          dependency_ids JSON NULL,
          reminder VARCHAR(50) DEFAULT 'none',
          custom_reminder_date VARCHAR(20) NULL,
          custom_reminder_time VARCHAR(20) NULL,
          task_notes TEXT NULL,
          completed_at TIMESTAMP NULL DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_tasks_user_id (user_id),
          INDEX idx_tasks_status (status),
          INDEX idx_tasks_due_date (due_date),
          INDEX idx_tasks_planned_date (planned_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 3. Create subtasks table if not exists
      await connection.query(`
        CREATE TABLE IF NOT EXISTS subtasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          task_id INT NOT NULL,
          user_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
          completed BOOLEAN DEFAULT FALSE,
          position INT DEFAULT 0,
          completed_at TIMESTAMP NULL DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_subtasks_task_id (task_id),
          INDEX idx_subtasks_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 4. Create task_dependencies table if not exists
      await connection.query(`
        CREATE TABLE IF NOT EXISTS task_dependencies (
          id INT AUTO_INCREMENT PRIMARY KEY,
          task_id INT NOT NULL,
          depends_on_task_id INT NOT NULL,
          user_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
          FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY uniq_task_dependency (task_id, depends_on_task_id),
          INDEX idx_task_dep_task (task_id),
          INDEX idx_task_dep_depends (depends_on_task_id),
          INDEX idx_task_dep_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 5. Create goals table if not exists (Step 28)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS goals (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT NULL,
          category VARCHAR(100) DEFAULT 'Learning',
          priority VARCHAR(50) DEFAULT 'medium',
          start_date VARCHAR(50) NULL,
          target_date VARCHAR(50) NULL,
          progress_mode VARCHAR(50) DEFAULT 'manual',
          progress INT DEFAULT 0,
          status VARCHAR(50) DEFAULT 'active',
          icon VARCHAR(50) DEFAULT 'Target',
          color VARCHAR(50) NULL,
          milestones JSON NULL,
          related_task_ids JSON NULL,
          activity_log JSON NULL,
          completed_at TIMESTAMP NULL DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_goals_user_id (user_id),
          INDEX idx_goals_status (status),
          INDEX idx_goals_priority (priority),
          INDEX idx_goals_target_date (target_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 6. Create projects table if not exists (Step 28)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT NULL,
          color VARCHAR(50) DEFAULT '#7C3AED',
          icon VARCHAR(50) DEFAULT 'Folder',
          status VARCHAR(50) DEFAULT 'active',
          priority VARCHAR(50) DEFAULT 'medium',
          start_date VARCHAR(50) NULL,
          due_date VARCHAR(50) NULL,
          goal_id VARCHAR(100) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_projects_user_id (user_id),
          INDEX idx_projects_status (status),
          INDEX idx_projects_priority (priority),
          INDEX idx_projects_due_date (due_date),
          INDEX idx_projects_goal_id (goal_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 7. Create notes table if not exists (Step 28)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS notes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          content LONGTEXT NOT NULL,
          category VARCHAR(100) DEFAULT 'General',
          tags JSON NULL,
          pinned BOOLEAN DEFAULT FALSE,
          archived BOOLEAN DEFAULT FALSE,
          color VARCHAR(50) NULL,
          task_id VARCHAR(100) NULL,
          project_id VARCHAR(100) NULL,
          goal_id VARCHAR(100) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_notes_user_id (user_id),
          INDEX idx_notes_pinned (pinned),
          INDEX idx_notes_archived (archived),
          INDEX idx_notes_category (category),
          INDEX idx_notes_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 8. Create focus_sessions table if not exists (Step 29)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS focus_sessions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          task_id VARCHAR(100) NULL,
          task_title VARCHAR(255) NULL,
          duration_minutes INT NOT NULL DEFAULT 25,
          completed BOOLEAN DEFAULT TRUE,
          rating INT NULL,
          session_type VARCHAR(50) DEFAULT 'pomodoro',
          notes TEXT NULL,
          started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP NULL DEFAULT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_focus_sessions_user_id (user_id),
          INDEX idx_focus_sessions_started_at (started_at),
          INDEX idx_focus_sessions_completed (completed)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 9. Create focus_settings table if not exists (Step 29)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS focus_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL UNIQUE,
          pomodoro_duration INT DEFAULT 25,
          short_break_duration INT DEFAULT 5,
          long_break_duration INT DEFAULT 15,
          long_break_interval INT DEFAULT 4,
          auto_start_breaks BOOLEAN DEFAULT FALSE,
          auto_start_pomodoros BOOLEAN DEFAULT FALSE,
          alarm_sound VARCHAR(50) DEFAULT 'bell',
          ambient_sound VARCHAR(50) DEFAULT 'none',
          volume INT DEFAULT 80,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 10. Create habits table if not exists (Step 29)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS habits (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT NULL,
          category VARCHAR(100) DEFAULT 'Health',
          frequency ENUM('daily', 'weekly', 'weekdays', 'weekends', 'custom') DEFAULT 'daily',
          target_per_day INT DEFAULT 1,
          target_unit VARCHAR(50) DEFAULT 'times',
          custom_days JSON NULL,
          color VARCHAR(50) DEFAULT '#10B981',
          icon VARCHAR(50) DEFAULT 'Activity',
          reminder_time VARCHAR(20) NULL,
          streak_goal INT DEFAULT 30,
          current_streak INT DEFAULT 0,
          best_streak INT DEFAULT 0,
          total_completed INT DEFAULT 0,
          archived BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_habits_user_id (user_id),
          INDEX idx_habits_archived (archived),
          INDEX idx_habits_category (category)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 11. Create habit_logs table if not exists (Step 29)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS habit_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          habit_id INT NOT NULL,
          log_date VARCHAR(20) NOT NULL,
          completed BOOLEAN DEFAULT TRUE,
          progress_count INT DEFAULT 1,
          notes TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
          UNIQUE KEY uniq_habit_user_date (user_id, habit_id, log_date),
          INDEX idx_habit_logs_user_id (user_id),
          INDEX idx_habit_logs_habit_id (habit_id),
          INDEX idx_habit_logs_date (log_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 12. Create recurring_tasks table if not exists (Step 29)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS recurring_tasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT NULL,
          frequency ENUM('daily', 'weekly', 'biweekly', 'monthly', 'yearly', 'weekdays', 'custom') DEFAULT 'daily',
          interval_value INT DEFAULT 1,
          days_of_week JSON NULL,
          day_of_month INT NULL,
          start_date VARCHAR(20) NOT NULL,
          end_date VARCHAR(20) NULL,
          time VARCHAR(20) NULL,
          priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
          category VARCHAR(100) DEFAULT 'General',
          estimated_duration INT DEFAULT 30,
          project_id VARCHAR(100) NULL,
          goal_id VARCHAR(100) NULL,
          tags JSON NULL,
          is_active BOOLEAN DEFAULT TRUE,
          last_generated_date VARCHAR(20) NULL,
          next_generation_date VARCHAR(20) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_rec_tasks_user_id (user_id),
          INDEX idx_rec_tasks_active (is_active),
          INDEX idx_rec_tasks_next_gen (next_generation_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 13. Create recurring_task_occurrences table if not exists (Step 29)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS recurring_task_occurrences (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          recurring_task_id INT NOT NULL,
          task_id INT NOT NULL,
          occurrence_date VARCHAR(20) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (recurring_task_id) REFERENCES recurring_tasks(id) ON DELETE CASCADE,
          FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
          UNIQUE KEY uniq_occurrence (user_id, recurring_task_id, occurrence_date),
          INDEX idx_occurrences_user_id (user_id),
          INDEX idx_occurrences_rec_task (recurring_task_id),
          INDEX idx_occurrences_task_id (task_id),
          INDEX idx_occurrences_date (occurrence_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 14. Create reminders table if not exists (Step 29)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS reminders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          time VARCHAR(20) NOT NULL,
          date VARCHAR(20) NULL,
          type VARCHAR(50) DEFAULT 'once',
          channel VARCHAR(50) DEFAULT 'browser',
          enabled BOOLEAN DEFAULT TRUE,
          task_id VARCHAR(100) NULL,
          habit_id VARCHAR(100) NULL,
          snooze_until TIMESTAMP NULL DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_reminders_user_id (user_id),
          INDEX idx_reminders_enabled (enabled),
          INDEX idx_reminders_date (date),
          INDEX idx_reminders_time (time)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 15. Create notifications table if not exists (Step 29)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          action_url VARCHAR(255) NULL,
          event_key VARCHAR(150) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_notifications_user_id (user_id),
          INDEX idx_notifications_read (is_read),
          INDEX idx_notifications_event_key (event_key),
          INDEX idx_notifications_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 16. Create activities table if not exists (Step 29)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS activities (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          type VARCHAR(50) NOT NULL,
          description TEXT NOT NULL,
          entity_id VARCHAR(100) NULL,
          entity_type VARCHAR(50) NULL,
          metadata JSON NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_activities_user_id (user_id),
          INDEX idx_activities_type (type),
          INDEX idx_activities_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 17. Create inbox_items table if not exists (Step 29)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS inbox_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          notes TEXT NULL,
          processed BOOLEAN DEFAULT FALSE,
          category VARCHAR(100) DEFAULT 'Quick Note',
          converted_task_id VARCHAR(100) NULL,
          converted_note_id VARCHAR(100) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_inbox_user_id (user_id),
          INDEX idx_inbox_processed (processed),
          INDEX idx_inbox_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 18. Create user_settings table if not exists
      await connection.query(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL UNIQUE,
          theme VARCHAR(20) DEFAULT 'dark',
          accent_color VARCHAR(30) DEFAULT 'purple',
          compact_mode BOOLEAN DEFAULT FALSE,
          animations BOOLEAN DEFAULT TRUE,
          preferences JSON NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_settings_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      console.log('✔ MySQL schema check: all core and productivity tables verified/created successfully.');
      return true;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.warn('⚠ Database auto-initialization skipped or failed:', error.message);
    return false;
  }
};

export default initializeDatabase;
