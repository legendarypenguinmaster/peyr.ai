-- Simple script to add missing columns to workspace_tasks table
-- Run this in your Supabase SQL editor

-- Step 1: Add the missing columns
ALTER TABLE workspace_tasks 
ADD COLUMN IF NOT EXISTS ticket_number TEXT,
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Step 2: Update existing tasks with default values
UPDATE workspace_tasks 
SET 
  ticket_number = 'TASK-' || LPAD(EXTRACT(EPOCH FROM created_at)::TEXT, 10, '0'),
  priority = 'medium'
WHERE ticket_number IS NULL;

-- Step 3: Make ticket_number NOT NULL (optional)
-- ALTER TABLE workspace_tasks ALTER COLUMN ticket_number SET NOT NULL;

-- Step 4: Add indexes for better performance (optional)
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_ticket_number ON workspace_tasks(ticket_number);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_due_date ON workspace_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_priority ON workspace_tasks(priority);
