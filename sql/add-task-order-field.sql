-- Add order field to workspace_tasks table for custom task ordering
ALTER TABLE workspace_tasks 
ADD COLUMN IF NOT EXISTS task_order INTEGER DEFAULT 0;

-- Create index for better performance when ordering tasks
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_order ON workspace_tasks(workspace_id, status, task_order);

-- Update existing tasks to have order based on created_at
-- This will give existing tasks a proper order
UPDATE workspace_tasks 
SET task_order = subquery.row_number
FROM (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY workspace_id, status ORDER BY created_at ASC) as row_number
  FROM workspace_tasks
) AS subquery
WHERE workspace_tasks.id = subquery.id;
