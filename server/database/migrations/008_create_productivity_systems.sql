-- Migration: 008_create_productivity_systems.sql
-- Description: Create tables for remaining productivity systems in Taskly:
-- Focus Sessions, Focus Settings, Habits, Habit Logs, Recurring Tasks,
-- Recurring Task Occurrences, Reminders, Notifications, Activities, Inbox Items.

-- 1. Focus Sessions
CREATE TABLE IF NOT EXISTS focus_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  task_id INT NULL,
  task_title VARCHAR(255) NULL,
  session_type VARCHAR(50) DEFAULT 'focus',
  planned_duration INT DEFAULT 25,
  actual_duration INT DEFAULT 0,
  started_at VARCHAR(50) NULL,
  ended_at VARCHAR(50) NULL,
  status VARCHAR(50) DEFAULT 'completed',
  completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_focus_user_id (user_id),
  INDEX idx_focus_status (status),
  INDEX idx_focus_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Focus Settings
CREATE TABLE IF NOT EXISTS focus_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  focus_duration INT DEFAULT 25,
  short_break_duration INT DEFAULT 5,
  long_break_duration INT DEFAULT 15,
  sessions_before_long_break INT DEFAULT 4,
  daily_focus_goal INT DEFAULT 120,
  auto_start_break BOOLEAN DEFAULT FALSE,
  auto_start_focus BOOLEAN DEFAULT FALSE,
  timer_sound BOOLEAN DEFAULT TRUE,
  desktop_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Habits
CREATE TABLE IF NOT EXISTS habits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  icon VARCHAR(50) DEFAULT 'Flame',
  color VARCHAR(50) DEFAULT '#7C3AED',
  category VARCHAR(100) DEFAULT 'Health',
  frequency VARCHAR(100) DEFAULT 'daily',
  weekly_day INT DEFAULT 0,
  target_count INT DEFAULT 1,
  unit VARCHAR(50) DEFAULT 'session',
  reminder_time VARCHAR(20) DEFAULT '09:00',
  reminder_enabled BOOLEAN DEFAULT FALSE,
  routine_group VARCHAR(50) DEFAULT 'none',
  goal_id VARCHAR(100) NULL,
  project_id VARCHAR(100) NULL,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_habits_user_id (user_id),
  INDEX idx_habits_archived (archived),
  INDEX idx_habits_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Habit Logs
CREATE TABLE IF NOT EXISTS habit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  habit_id INT NOT NULL,
  log_date VARCHAR(20) NOT NULL,
  count INT DEFAULT 1,
  target_count INT DEFAULT 1,
  completed BOOLEAN DEFAULT TRUE,
  completed_at VARCHAR(50) NULL,
  note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_user_habit_date (user_id, habit_id, log_date),
  INDEX idx_habit_logs_user_date (user_id, log_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Recurring Tasks
CREATE TABLE IF NOT EXISTS recurring_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  priority VARCHAR(50) DEFAULT 'medium',
  category VARCHAR(100) DEFAULT 'General',
  estimated_duration INT DEFAULT 30,
  goal_id VARCHAR(100) NULL,
  project_id VARCHAR(100) NULL,
  recurrence JSON NOT NULL,
  planned_start_time VARCHAR(20) NULL,
  enabled BOOLEAN DEFAULT TRUE,
  skipped_dates JSON NULL,
  reminder VARCHAR(50) DEFAULT 'none',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_recurring_user_id (user_id),
  INDEX idx_recurring_enabled (enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Recurring Task Occurrences
CREATE TABLE IF NOT EXISTS recurring_task_occurrences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recurring_task_id INT NOT NULL,
  task_id INT NULL,
  occurrence_date VARCHAR(20) NOT NULL,
  status VARCHAR(50) DEFAULT 'generated',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recurring_task_id) REFERENCES recurring_tasks(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_user_recur_date (user_id, recurring_task_id, occurrence_date),
  INDEX idx_occurrences_user (user_id),
  INDEX idx_occurrences_date (occurrence_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Reminders
CREATE TABLE IF NOT EXISTS reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NULL,
  date VARCHAR(20) NOT NULL,
  time VARCHAR(20) DEFAULT '09:00',
  entity_type VARCHAR(50) DEFAULT 'custom',
  entity_id VARCHAR(100) NULL,
  repeat_interval VARCHAR(50) DEFAULT 'none',
  priority VARCHAR(50) DEFAULT 'normal',
  enabled BOOLEAN DEFAULT TRUE,
  snoozed_until VARCHAR(50) NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reminders_user_id (user_id),
  INDEX idx_reminders_date (date),
  INDEX idx_reminders_enabled (enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_key VARCHAR(255) NULL,
  type VARCHAR(50) DEFAULT 'task',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read_status BOOLEAN DEFAULT FALSE,
  priority VARCHAR(50) DEFAULT 'normal',
  entity_type VARCHAR(50) NULL,
  entity_id VARCHAR(100) NULL,
  action_url VARCHAR(255) NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user_id (user_id),
  INDEX idx_notif_read (read_status),
  INDEX idx_notif_event_key (event_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Activities
CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  date VARCHAR(20) NOT NULL,
  start_time VARCHAR(20) DEFAULT '09:00',
  end_time VARCHAR(20) DEFAULT '10:00',
  duration INT DEFAULT 30,
  category VARCHAR(100) DEFAULT 'General',
  related_task_id VARCHAR(100) NULL,
  action VARCHAR(100) NULL,
  entity_type VARCHAR(50) NULL,
  entity_id VARCHAR(100) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_activities_user_id (user_id),
  INDEX idx_activities_date (date),
  INDEX idx_activities_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Inbox Items
CREATE TABLE IF NOT EXISTS inbox_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'task',
  content TEXT NULL,
  status VARCHAR(50) DEFAULT 'unprocessed',
  converted_task_id VARCHAR(100) NULL,
  converted_note_id VARCHAR(100) NULL,
  processed_at VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_inbox_user_id (user_id),
  INDEX idx_inbox_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
