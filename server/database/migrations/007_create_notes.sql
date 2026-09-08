-- Migration: 007_create_notes.sql
-- Description: Create notes table for Taskly with user ownership, tags, pins, and archives

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
