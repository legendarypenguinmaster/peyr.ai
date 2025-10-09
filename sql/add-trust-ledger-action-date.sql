-- Add action_date column to trust_ledger_entries and related index

alter table if exists public.trust_ledger_entries
  add column if not exists action_date timestamptz;

create index if not exists idx_trust_ledger_entries_action_date
  on public.trust_ledger_entries (action_date desc);

-- Backfill action_date from created_at if null
update public.trust_ledger_entries
set action_date = coalesce(action_date, created_at)
where action_date is null;


