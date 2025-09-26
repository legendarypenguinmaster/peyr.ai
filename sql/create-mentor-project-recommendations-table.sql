-- Mentor to Project recommendations cache
create table if not exists public.mentor_project_recommendations (
  mentor_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  match_score integer not null default 0,
  reason text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (mentor_id, project_id)
);

alter table public.mentor_project_recommendations enable row level security;

-- Policies: mentors can read their own cached recs
drop policy if exists mpr_select_own on public.mentor_project_recommendations;
create policy mpr_select_own on public.mentor_project_recommendations
for select using (auth.uid() = mentor_id);

-- Mentors can manage (upsert) their own cached recs
drop policy if exists mpr_upsert_own on public.mentor_project_recommendations;
create policy mpr_upsert_own on public.mentor_project_recommendations
for insert with check (auth.uid() = mentor_id);

drop policy if exists mpr_update_own on public.mentor_project_recommendations;
create policy mpr_update_own on public.mentor_project_recommendations
for update using (auth.uid() = mentor_id);

drop policy if exists mpr_delete_own on public.mentor_project_recommendations;
create policy mpr_delete_own on public.mentor_project_recommendations
for delete using (auth.uid() = mentor_id);

-- Updated at trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_mpr_updated_at on public.mentor_project_recommendations;
create trigger trg_mpr_updated_at
before update on public.mentor_project_recommendations
for each row execute function public.update_updated_at_column();


