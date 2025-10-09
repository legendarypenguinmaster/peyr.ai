-- Create trust_ledger_entries table and policies

-- Table: public.trust_ledger_entries
create table if not exists public.trust_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.workspace_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  description text,
  trust_points integer,
  metadata jsonb,
  action_date timestamptz,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_trust_ledger_entries_workspace_id
  on public.trust_ledger_entries (workspace_id);

create index if not exists idx_trust_ledger_entries_project_id
  on public.trust_ledger_entries (project_id);

create index if not exists idx_trust_ledger_entries_user_id
  on public.trust_ledger_entries (user_id);

create index if not exists idx_trust_ledger_entries_created_at
  on public.trust_ledger_entries (created_at desc);

create index if not exists idx_trust_ledger_entries_action_date
  on public.trust_ledger_entries (action_date desc);

-- Enable Row Level Security
alter table public.trust_ledger_entries enable row level security;

-- Policy: Allow workspace members to read entries from their workspace
drop policy if exists "Allow select for workspace members" on public.trust_ledger_entries;
create policy "Allow select for workspace members"
  on public.trust_ledger_entries
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = trust_ledger_entries.workspace_id
        and wm.user_id = auth.uid()
        and wm.status = 'active'
    )
  );

-- Policy: Allow workspace members to insert
drop policy if exists "Allow insert for workspace members" on public.trust_ledger_entries;
create policy "Allow insert for workspace members"
  on public.trust_ledger_entries
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = trust_ledger_entries.workspace_id
        and wm.user_id = auth.uid()
        and wm.status = 'active'
    )
  );

-- Policy: Allow authors or workspace admins to update/delete
drop policy if exists "Allow update for authors or admins" on public.trust_ledger_entries;
create policy "Allow update for authors or admins"
  on public.trust_ledger_entries
  for update
  to authenticated
  using (
    trust_ledger_entries.user_id = auth.uid()
    or exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = trust_ledger_entries.workspace_id
        and wm.user_id = auth.uid()
        and wm.status = 'active'
        and wm.role in ('owner','admin')
    )
  )
  with check (
    trust_ledger_entries.user_id = auth.uid()
    or exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = trust_ledger_entries.workspace_id
        and wm.user_id = auth.uid()
        and wm.status = 'active'
        and wm.role in ('owner','admin')
    )
  );

drop policy if exists "Allow delete for authors or admins" on public.trust_ledger_entries;
create policy "Allow delete for authors or admins"
  on public.trust_ledger_entries
  for delete
  to authenticated
  using (
    trust_ledger_entries.user_id = auth.uid()
    or exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = trust_ledger_entries.workspace_id
        and wm.user_id = auth.uid()
        and wm.status = 'active'
        and wm.role in ('owner','admin')
    )
  );


