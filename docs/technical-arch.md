## Technical architecture (MVP) — Next.js + Supabase Auth

### Stack

- **Next.js (App Router)**: UI + server-rendering
- **Supabase**:
  - Auth (email/password)
  - Postgres (habits + daily entries)
  - Row Level Security (RLS)

- **Rendering strategy**
  - Server Components for data fetching + initial render
  - Client Components for interactions (increment button, modals)

---

# 1) High-level system design

### Core flows

1. **Auth**
   - User signs up / logs in
   - Session stored in cookies (SSR-compatible)
   - Middleware keeps session refreshed for SSR routes

2. **Habit CRUD**
   - Create/edit/delete habits via server actions (or route handlers)
   - Data stored in `habits`

3. **Daily increment**
   - Tap `+` → server action does atomic **upsert + increment** into `habit_entries`
   - UI updates optimistically; server response reconciles

4. **Visualizations**
   - Home: per-habit mini heatmap for last N days (e.g., 120)
   - Detail: larger heatmap + month calendar from `habit_entries`

---

# 2) Data model (Supabase / Postgres)

### Tables

**`habits`**

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id)`
- `name text not null`
- `color text not null` (e.g. hex, or token)
- `daily_target int not null check (daily_target >= 1)`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

**`habit_entries`** (one row per habit per day)

- `id uuid primary key default gen_random_uuid()`
- `habit_id uuid not null references habits(id) on delete cascade`
- `user_id uuid not null references auth.users(id)`
- `date date not null`
- `count int not null default 0 check (count >= 0)`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

**Constraints / indexes**

- `unique(habit_id, date)`
- index: `(user_id, date)` for calendar queries
- index: `(habit_id, date)` for heatmap range queries

### RLS policies (MVP)

Enable RLS on both tables.

**habits**

- Select/Insert/Update/Delete allowed only when `user_id = auth.uid()`

**habit_entries**

- Select/Insert/Update/Delete allowed only when `user_id = auth.uid()`

> Important: When inserting entries, always include `user_id = auth.uid()` from the server context, not from the client.

---

# 3) Next.js project structure (suggested)

```
src/
  app/
    (auth)/
      login/page.tsx
      signup/page.tsx
    app/
      layout.tsx            // authenticated shell
      page.tsx              // Home (habit list + mini heatmaps)
      habits/[id]/page.tsx  // Habit detail (heatmap + calendar)
    actions/
      habits.ts             // server actions (create/edit/delete)
      entries.ts            // server actions (increment, fetch ranges)
    api/                    // (optional) route handlers instead of actions
  components/
    HabitCard.tsx
    Heatmap.tsx
    CalendarMonth.tsx
    HabitForm.tsx
  lib/
    supabase/
      server.ts             // createServerClient()
      client.ts             // createBrowserClient()
      middleware.ts         // session refresh helpers
    dates.ts                // date normalization helpers
    queries.ts              // shared query builders
```

---

# 4) Supabase in Next.js (SSR-safe)

### Clients

- **Server client** (Server Components + Server Actions)
- **Browser client** (Client Components, only when needed)

Recommended approach:

- Use Supabase SSR helpers so auth works with cookies in server-rendered pages.
- Add **middleware** to refresh sessions so server components always see the correct user.

### Middleware

- Runs on authenticated route group (e.g. `/app/**`)
- Refreshes session/cookies to keep SSR consistent

---

# 5) Data access patterns

## A) Home page data needs

For each habit, show:

- habit fields: `id, name, color, daily_target`
- entry counts for the last **N days** (N = 84–140 is typical)

**Option 1 (simple MVP, OK for small N habits):**

- Query habits
- For each habit: query entries in range
  This is easiest but can cause multiple queries.

**Option 2 (better MVP):**

- Query habits
- Query all entries for all habits in the date range in one call:
  - `select habit_id, date, count from habit_entries where user_id = ? and date between start and end`

- Group entries by habit_id in server code

This stays fast as habit count grows.

## B) Habit detail page data needs

- Habit record
- Entries for:
  - heatmap range (e.g. last 6–12 months)
  - month calendar range (start/end of visible month)

Fetch patterns:

- One query for habit
- One query for entries in date range

---

# 6) Mutation design

## Increment (+)

**Goal:** atomic, race-safe (rapid tapping, multiple devices)

Use server action that executes:

- Compute `today` based on user timezone rule (MVP: device local; see note below)
- Upsert row and increment

**Upsert logic**

- Prefer an RPC function for clean atomicity, or use `upsert` + update carefully.
- Best practice: Postgres function `increment_habit_entry(habit_id, entry_date)` that:
  - inserts row if missing
  - increments count
  - returns new count

This avoids edge cases and keeps logic on the DB.

## Create/Edit/Delete habit

- Server action validates:
  - name not empty
  - daily_target >= 1
  - color is valid token/hex

- Writes to `habits`
- On delete, cascade removes entries (FK cascade)

---

# 7) Caching + revalidation (App Router)

- Home page uses server fetching, so after mutations:
  - `revalidatePath('/app')` after create/edit/delete/increment
  - and `revalidatePath('/app/habits/[id]')` after increment when on detail page

For best UX:

- **Optimistic UI** in client component (increment locally immediately)
- Then server action returns authoritative `count` to reconcile

---

# 8) Date normalization rule (MVP)

Since you haven’t specified a custom timezone setting, the simplest MVP rule is:

- “Today” is computed using the user’s **current device local date** at the time of tap.
- Store `date` as a **date** (no time) in Postgres.

Implementation detail:

- On the client, send nothing but `habit_id`
- On the server, compute `today` using server time is risky (server timezone differs). Prefer:
  - Client sends `localDateYYYYMMDD` (derived from device)
  - Server validates format and uses that as the `date`

That keeps “day” consistent with what the user sees.

---

# 9) Component architecture

### `HabitCard`

- Props: habit + entries slice
- Renders name, + button, mini heatmap
- `+` triggers `incrementHabit(habitId, localDate)`

### `Heatmap`

- Pure component:
  - input: list of `{date, count}` + `dailyTarget` + range
  - output: grid cells with intensity `min(count / dailyTarget, 1)`

### `CalendarMonth`

- input: visible month + entries map
- output: day grid with count indicator

### `HabitForm`

- used for create/edit
- minimal fields only (name, color, daily target)

---

# 10) Security considerations (MVP)

- All mutations must be **server-side** (server actions / route handlers), using the authenticated session.
- RLS is enabled so even if a client tries direct DB calls, they can’t access other users’ data.
- Validate habit ownership implicitly via RLS + additionally by filtering `user_id = auth.uid()` in queries.

---

# 11) Recommended MVP implementation choices

- Use **server actions** for:
  - createHabit, updateHabit, deleteHabit
  - incrementHabitEntry

- Use **single-range fetch** for entries on home to avoid N+1 queries
- Use a **DB function** for increment to guarantee correctness under concurrency
