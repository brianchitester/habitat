-- Habitat Database Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- ============================================
-- 1. TABLES
-- ============================================

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  daily_target int not null default 1 check (daily_target >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.habit_entries (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  count int not null default 0 check (count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- 2. CONSTRAINTS & INDEXES
-- ============================================

-- One entry per habit per day
alter table public.habit_entries
  add constraint habit_entries_habit_date_unique unique (habit_id, date);

-- Fast lookups for calendar / heatmap queries
create index idx_habit_entries_user_date on public.habit_entries (user_id, date);
create index idx_habit_entries_habit_date on public.habit_entries (habit_id, date);

-- Fast lookup for user's habits
create index idx_habits_user_id on public.habits (user_id);

-- ============================================
-- 3. ROW LEVEL SECURITY
-- ============================================

alter table public.habits enable row level security;
alter table public.habit_entries enable row level security;

-- habits: users can only access their own
create policy "Users can view their own habits"
  on public.habits for select
  using (auth.uid() = user_id);

create policy "Users can create their own habits"
  on public.habits for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own habits"
  on public.habits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own habits"
  on public.habits for delete
  using (auth.uid() = user_id);

-- habit_entries: users can only access their own
create policy "Users can view their own entries"
  on public.habit_entries for select
  using (auth.uid() = user_id);

create policy "Users can create their own entries"
  on public.habit_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own entries"
  on public.habit_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own entries"
  on public.habit_entries for delete
  using (auth.uid() = user_id);

-- ============================================
-- 4. ATOMIC INCREMENT FUNCTION
-- ============================================

create or replace function public.increment_habit_entry(
  p_habit_id uuid,
  p_user_id uuid,
  p_date date
)
returns int
language plpgsql
security definer
as $$
declare
  new_count int;
begin
  insert into public.habit_entries (habit_id, user_id, date, count)
  values (p_habit_id, p_user_id, p_date, 1)
  on conflict (habit_id, date)
  do update set
    count = habit_entries.count + 1,
    updated_at = now()
  returning count into new_count;

  return new_count;
end;
$$;
