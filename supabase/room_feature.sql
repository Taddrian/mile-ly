-- Milo's Room (idle-game Phase 1) — run this once in the Supabase SQL editor.

alter table user_settings
  add column if not exists coin_balance integer not null default 0,
  add column if not exists xp integer not null default 0,
  add column if not exists last_budget_bonus_cycle date,
  add column if not exists room_slots jsonb not null default '{}'::jsonb,
  add column if not exists equipped_wardrobe jsonb not null default '{}'::jsonb;

create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  item_type text not null check (item_type in ('furniture', 'wardrobe')),
  acquired_at timestamptz not null default now(),
  unique (user_id, item_id)
);

alter table inventory enable row level security;

create policy "inventory_select_own" on inventory for select using (auth.uid() = user_id);
create policy "inventory_insert_own" on inventory for insert with check (auth.uid() = user_id);
create policy "inventory_delete_own" on inventory for delete using (auth.uid() = user_id);
