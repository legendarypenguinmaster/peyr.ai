-- Create core tables (idempotent)
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  purpose VARCHAR(50) NOT NULL CHECK (purpose IN ('personal', 'shared')),
  description TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_features JSONB DEFAULT '[]'::jsonb,
  trust_agreement TEXT,
  equity_split VARCHAR(100),
  generate_contract BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS workspace_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  invited_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email VARCHAR(255),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    (invited_user_id IS NOT NULL AND invited_email IS NULL) OR
    (invited_user_id IS NULL AND invited_email IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS workspace_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  type VARCHAR(50) DEFAULT 'document' CHECK (type IN ('document', 'contract', 'proposal', 'note')),
  file_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trust_ledger_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  trust_points INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspace_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspace_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES workspace_projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  task_id VARCHAR(64),
  task_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_workspaces_creator_id ON workspaces(creator_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_status ON workspaces(status);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_workspace_id ON workspace_invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_invited_user_id ON workspace_invitations(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_invited_email ON workspace_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_status ON workspace_invitations(status);
CREATE INDEX IF NOT EXISTS idx_workspace_documents_workspace_id ON workspace_documents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_trust_ledger_entries_workspace_id ON trust_ledger_entries(workspace_id);
CREATE INDEX IF NOT EXISTS idx_trust_ledger_entries_user_id ON trust_ledger_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_projects_workspace_id ON workspace_projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_workspace_id ON workspace_tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_project_id ON workspace_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_assigned_to ON workspace_tasks(assigned_to);
CREATE UNIQUE INDEX IF NOT EXISTS ux_workspace_tasks_task_id ON workspace_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_order ON workspace_tasks(workspace_id, status, task_order);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can update their workspaces" ON workspaces;
DROP POLICY IF EXISTS "Invited users can view workspaces (pending)" ON workspaces;

CREATE POLICY "Users can view workspaces they are members of" ON workspaces
  FOR SELECT USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Invited users can view workspaces (pending)" ON workspaces
  FOR SELECT USING (
    id IN (
      SELECT workspace_id FROM workspace_invitations
      WHERE invited_user_id = auth.uid() AND status = 'pending'
    )
  );

CREATE POLICY "Users can create workspaces" ON workspaces
  FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Workspace owners can update their workspaces" ON workspaces
  FOR UPDATE USING (
    creator_id = auth.uid() OR
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can view workspace members of workspaces they belong to" ON workspace_members;
DROP POLICY IF EXISTS "Workspace creators can add themselves as owner" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can add other members" ON workspace_members;
DROP POLICY IF EXISTS "Allow all operations (app enforces)" ON workspace_members;

-- Simplified members policies; rely on app-level checks for inserts/updates
CREATE POLICY "Users can view workspace members of workspaces they belong to" ON workspace_members
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Allow all operations (app enforces)" ON workspace_members
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view invitations sent to them" ON workspace_invitations;
DROP POLICY IF EXISTS "Workspace owners can create invitations" ON workspace_invitations;
DROP POLICY IF EXISTS "View own workspace invitations" ON workspace_invitations;
DROP POLICY IF EXISTS "Create workspace invitations" ON workspace_invitations;
DROP POLICY IF EXISTS "Invited users can update their invitations" ON workspace_invitations;
DROP POLICY IF EXISTS "Inviters can update their sent invitations" ON workspace_invitations;

-- Select: user can see invites they sent or received
CREATE POLICY "View own workspace invitations" ON workspace_invitations
  FOR SELECT USING (
    invited_by = auth.uid()
    OR invited_user_id = auth.uid()
  );

-- Insert: allow creators/owners/admins to invite
CREATE POLICY "Create workspace invitations" ON workspace_invitations
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces WHERE creator_id = auth.uid()
    )
    OR workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('owner','admin')
    )
  );

-- Update status by invited user or inviter
CREATE POLICY "Invited users can update their invitations" ON workspace_invitations
  FOR UPDATE USING (invited_user_id = auth.uid()) WITH CHECK (invited_user_id = auth.uid());

CREATE POLICY "Inviters can update their sent invitations" ON workspace_invitations
  FOR UPDATE USING (invited_by = auth.uid()) WITH CHECK (invited_by = auth.uid());

DROP POLICY IF EXISTS "Workspace members can view documents" ON workspace_documents;
DROP POLICY IF EXISTS "Workspace members can create documents" ON workspace_documents;

CREATE POLICY "Workspace members can view documents" ON workspace_documents
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Workspace members can create documents" ON workspace_documents
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Workspace members can view trust ledger entries" ON trust_ledger_entries;
DROP POLICY IF EXISTS "System can create trust ledger entries" ON trust_ledger_entries;

CREATE POLICY "Workspace members can view trust ledger entries" ON trust_ledger_entries
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "System can create trust ledger entries" ON trust_ledger_entries
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Workspace members can view projects" ON workspace_projects;
DROP POLICY IF EXISTS "Workspace members can create projects" ON workspace_projects;

CREATE POLICY "Workspace members can view projects" ON workspace_projects
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Workspace members can create projects" ON workspace_projects
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Workspace members can view tasks" ON workspace_tasks;
DROP POLICY IF EXISTS "Workspace members can create tasks" ON workspace_tasks;
DROP POLICY IF EXISTS "Workspace members can update tasks" ON workspace_tasks;

CREATE POLICY "Workspace members can view tasks" ON workspace_tasks
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Workspace members can create tasks" ON workspace_tasks
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Workspace members can update tasks" ON workspace_tasks
  FOR UPDATE USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  ) WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_invitations_updated_at BEFORE UPDATE ON workspace_invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_documents_updated_at BEFORE UPDATE ON workspace_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_projects_updated_at BEFORE UPDATE ON workspace_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_tasks_updated_at BEFORE UPDATE ON workspace_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
