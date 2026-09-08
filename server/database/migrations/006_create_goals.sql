-- Migration: 006_create_goals.sql
-- Description: Create goals table for Taskly with user ownership, milestones, and task associations

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
