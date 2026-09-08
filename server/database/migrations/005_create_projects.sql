-- Migration: 005_create_projects.sql
-- Description: Create projects table for Taskly with user ownership and goal linkage

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
