-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  template TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspace_members table
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Create workspace_tasks table (for Kanban)
CREATE TABLE IF NOT EXISTS workspace_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Enhanced Kanban fields
  ticket_number TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  UNIQUE (workspace_id, ticket_number)
);

-- Create workspace_diagrams table
CREATE TABLE IF NOT EXISTS workspace_diagrams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  diagram_data TEXT NOT NULL, -- Mermaid diagram code
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspace_documents table
CREATE TABLE IF NOT EXISTS workspace_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT, -- For uploaded files
  content TEXT, -- For created documents
  file_type TEXT, -- 'upload' or 'document'
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspace_meetings table
CREATE TABLE IF NOT EXISTS workspace_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  meeting_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  meeting_link TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspace_time_entries table
CREATE TABLE IF NOT EXISTS workspace_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES workspace_tasks(id) ON DELETE SET NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_workspace_id ON workspace_tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_status ON workspace_tasks(status);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_ticket_number ON workspace_tasks(ticket_number);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_due_date ON workspace_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_priority ON workspace_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_workspace_diagrams_workspace_id ON workspace_diagrams(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_documents_workspace_id ON workspace_documents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_meetings_workspace_id ON workspace_meetings(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_time_entries_workspace_id ON workspace_time_entries(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_time_entries_user_id ON workspace_time_entries(user_id);

-- Enable Row Level Security
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_time_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspaces
-- Workspaces: allow owners to see/update/delete; members can see via membership
CREATE POLICY "Workspaces: owner or member can select" ON workspaces
  FOR SELECT USING (
    owner_id = auth.uid() OR id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspaces: create" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspaces: owner can update" ON workspaces
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Workspaces: owner can delete" ON workspaces
  FOR DELETE USING (auth.uid() = owner_id);

-- workspace_members: avoid recursive dependency; gate by user_id
CREATE POLICY "Workspace members: select by user" ON workspace_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Workspace members: owner can insert" ON workspace_members
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members: self-delete" ON workspace_members
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Workspace members: owner delete" ON workspace_members
  FOR DELETE USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Workspace tasks: select if owner or member" ON workspace_tasks
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    ) OR workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace tasks: create if owner or member" ON workspace_tasks
  FOR INSERT WITH CHECK (
    (workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid()
    ) OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )) AND auth.uid() = created_by
  );

CREATE POLICY "Workspace tasks: update if owner or member" ON workspace_tasks
  FOR UPDATE USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid()
    ) OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace tasks: delete if owner or member" ON workspace_tasks
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid()
    ) OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for workspace_diagrams
CREATE POLICY "Workspace members can view diagrams" ON workspace_diagrams
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid()
    ) OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create diagrams" ON workspace_diagrams
  FOR INSERT WITH CHECK (
    (workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid()
    ) OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )) AND auth.uid() = created_by
  );

CREATE POLICY "Workspace members can update diagrams" ON workspace_diagrams
  FOR UPDATE USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid()
    ) OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can delete diagrams" ON workspace_diagrams
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid()
    ) OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for workspace_documents
CREATE POLICY "Workspace members can view documents" ON workspace_documents
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid()
    ) OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create documents" ON workspace_documents
  FOR INSERT WITH CHECK (
    (workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid()
    ) OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )) AND auth.uid() = created_by
  );

CREATE POLICY "Workspace members can update documents" ON workspace_documents
  FOR UPDATE USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid()
    ) OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can delete documents" ON workspace_documents
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid()
    ) OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for workspace_meetings
CREATE POLICY "Workspace members can view meetings" ON workspace_meetings
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid()
    ) OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create meetings" ON workspace_meetings
  FOR INSERT WITH CHECK (
    (workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid()
    ) OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )) AND auth.uid() = created_by
  );

CREATE POLICY "Workspace members can update meetings" ON workspace_meetings
  FOR UPDATE USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid()
    ) OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can delete meetings" ON workspace_meetings
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid()
    ) OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for workspace_time_entries
CREATE POLICY "Workspace members can view time entries" ON workspace_time_entries
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid()
    ) OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own time entries" ON workspace_time_entries
  FOR INSERT WITH CHECK (
    (workspace_id IN (
      SELECT id FROM workspaces 
      WHERE owner_id = auth.uid()
    ) OR workspace_id IN (
      SELECT workspace_id FROM workspace_members 
      WHERE user_id = auth.uid()
    )) AND auth.uid() = user_id
  );

CREATE POLICY "Users can update their own time entries" ON workspace_time_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time entries" ON workspace_time_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically add workspace owner as member
CREATE OR REPLACE FUNCTION add_workspace_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically add owner as member
CREATE TRIGGER add_workspace_owner_as_member_trigger
  AFTER INSERT ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION add_workspace_owner_as_member();

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables with updated_at column
DROP TRIGGER IF EXISTS set_workspaces_updated_at ON workspaces;
CREATE TRIGGER set_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_workspace_tasks_updated_at ON workspace_tasks;
CREATE TRIGGER set_workspace_tasks_updated_at
  BEFORE UPDATE ON workspace_tasks
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
