# Habitat — MVP Project Plan

## Current Status

Phase 1 (Project Setup) is complete. Auth scaffold is in place with Next.js 16 + Supabase (`@supabase/ssr`). Database schema and RLS policies still need to be created in Supabase.

---

## Scaffold Cleanup (Pre-MVP)

These items were identified during the initial scaffold review and should be addressed before or during Phase 3 work.

### Recommended

- [ ] **Add form validation to auth form** — `react-hook-form` and `zod` are installed but unused. Add email format and password length validation to the sign in/sign up forms.
- [ ] **Improve auth callback error handling** — `app/auth/callback/route.ts` silently redirects to dashboard even if `exchangeCodeForSession` fails. Should redirect with an error param on failure.
- [ ] **Add accessibility to password toggle** — The show/hide password button in `components/auth/auth-form.tsx` lacks an `aria-label`.

### Minor

- [ ] **Add dashboard loading state** — `app/dashboard/page.tsx` has no loading UI while the server component fetches the session. Could add a `loading.tsx` with a skeleton.
- [ ] **Update database types** — `lib/supabase/database.types.ts` has a placeholder `user_progress` table. Replace with `habits` and `habit_entries` types once the schema is created (or regenerate with `supabase gen types`).

---

## MVP Scope (Locked)

Only includes:

- User accounts (Supabase auth)
- Create / edit / delete habits
- Count-based tracking (increment only)
- Daily target per habit
- Heatmap visualization (GitHub-style)
- Habit detail view (heatmap + calendar)
- Color selection

Not included:

- Reminders
- Streaks
- Categories
- Custom value input
- Social / analytics / pro features

---

# Phase 1 — Project Setup

### [DONE] Initialize frontend project

- Next.js 16 (App Router) with TypeScript, Tailwind CSS v4, shadcn/ui
- Using `@supabase/ssr` (not the deprecated `@supabase/auth-helpers-nextjs`)
- Dev server runs with `--webpack` flag (Turbopack has a Windows crash bug)

### [DONE] Set up Supabase project

- Supabase project created
- Email/password auth enabled
- `.env.local` configured, `.env.example` provided
- Client and server Supabase clients created

### [ ] Database schema (MVP)

Create tables in Supabase SQL Editor:

#### `habits`

- id (uuid, PK, default `gen_random_uuid()`)
- user_id (uuid, FK → auth.users)
- name (text, not null)
- color (text, not null)
- daily_target (int, not null, check >= 1)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

#### `habit_entries`

- id (uuid, PK, default `gen_random_uuid()`)
- habit_id (uuid, FK → habits, on delete cascade)
- user_id (uuid, FK → auth.users)
- date (date, not null)
- count (int, not null, default 0, check >= 0)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

Constraints:

- unique(habit_id, date)
- index: (user_id, date) for calendar queries
- index: (habit_id, date) for heatmap range queries

### [ ] Supabase RLS policies

- Users can only access their own habits + entries (all CRUD operations)

---

# Phase 2 — Auth Flow

### [DONE] Auth screens

- Sign up, sign in, sign out implemented
- Redirect to dashboard after login
- Protected dashboard route with server-side session check

---

# Phase 3 — Habit CRUD

### [ ] Create habit screen

Fields: Name, Color, Daily target

Acceptance:
- Can create habit
- Saved to Supabase
- Appears on home screen

### [ ] Edit habit screen

- Update name, color, daily target

Acceptance:
- Changes persist
- UI updates immediately

### [ ] Delete habit

- Delete action from edit screen
- Habit + entries removed from DB + UI

---

# Phase 4 — Home Screen (Core UX)

### [ ] Habit list UI

- Render list of habits as cards
- Show: name, color, today's progress (via heatmap)

### [ ] Increment habit (+ button)

- Tap increments today's count via atomic upsert
- Works with no existing row (creates one)
- Multiple taps accumulate
- Optimistic UI update

### [ ] Fetch habit entries (range query)

- Fetch entries for last ~120 days
- Single query for all habits to avoid N+1

---

# Phase 5 — Heatmap (Core Feature)

### [ ] Heatmap component (reusable)

Input: Array of `{ date, count }` + `daily_target`
Output: Grid of squares with color intensity = `count / daily_target`

Rules:
- 0 → empty
- < target → partial intensity
- >= target → full

### [ ] Home screen mini-heatmap

- Attach heatmap to each habit card
- Show recent history (last 12-16 weeks)
- Updates immediately after increment

---

# Phase 6 — Habit Detail View

### [ ] Habit detail modal/screen

- Open on habit tap
- Show: name, color, full heatmap

### [ ] Monthly calendar view

- Grid of current month
- Each day shows count (dots or number)

### [ ] Date navigation

- Previous / next month buttons

---

# Phase 7 — Data Consistency

### [ ] Date normalization

- Client sends `localDate` (YYYY-MM-DD) derived from device
- Server validates format and uses as the `date`
- No duplicate days, no off-by-one errors

### [ ] Optimistic UI updates

- Increment updates UI immediately
- Syncs with backend
- Handles failure gracefully (basic revert)

---

# Phase 8 — Polish (MVP-level)

### [ ] Color system integration

- Habit color drives heatmap color and UI accents

### [ ] Empty states

- No habits → prompt to create one

### [ ] Loading states

- Skeletons or spinners where needed

---

# Phase 9 — Deployment

### [ ] Environment config

- Production Supabase keys
- Env setup for hosting platform

### [ ] Deploy app

- Deploy to Vercel

---

# Key Engineering Decisions

- **Date key format**: `YYYY-MM-DD` (date column)
- **Heatmap window**: fixed, last 120 days
- **Upsert strategy**: Postgres function `increment_habit_entry(habit_id, entry_date)` for atomic increment
- **Data fetching**: Server actions for mutations, single-range fetch for entries to avoid N+1
- **Rendering**: Server Components for data fetching, Client Components for interactions
