-- Update workspace_tasks table to include new fields for enhanced Kanban tickets

-- Add new columns to workspace_tasks table
ALTER TABLE workspace_tasks 
ADD COLUMN IF NOT EXISTS ticket_number TEXT,
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Create a sequence for ticket numbers (optional - can be generated in application)
-- CREATE SEQUENCE IF NOT EXISTS workspace_tasks_ticket_number_seq;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_ticket_number ON workspace_tasks(ticket_number);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_due_date ON workspace_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_priority ON workspace_tasks(priority);

-- Update existing tasks to have default values
UPDATE workspace_tasks 
SET 
  ticket_number = 'TASK-' || LPAD(EXTRACT(EPOCH FROM created_at)::TEXT, 10, '0'),
  priority = 'medium'
WHERE ticket_number IS NULL;

-- Make ticket_number NOT NULL after setting default values
ALTER TABLE workspace_tasks ALTER COLUMN ticket_number SET NOT NULL;

-- Add unique constraint for ticket_number per workspace
ALTER TABLE workspace_tasks ADD CONSTRAINT unique_ticket_number_per_workspace 
UNIQUE (workspace_id, ticket_number);
