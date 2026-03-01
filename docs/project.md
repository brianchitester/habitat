# Habitat — MVP Project Plan

## Current Status

Phases 1–4 are complete. Auth, database schema, habit CRUD, and the home screen are all functional. The app runs in dark mode with habit cards, optimistic increment, and create/edit/delete flows. **Next up: Phase 5 (Heatmap visualization).**

---

## Scaffold Cleanup (Pre-MVP)

### Recommended

- [ ] **Add form validation to auth form** — `react-hook-form` and `zod` are installed but unused in auth. Add email format and password length validation.
- [ ] **Improve auth callback error handling** — `app/auth/callback/route.ts` silently redirects on failure. Should redirect with an error param.
- [ ] **Add accessibility to password toggle** — The show/hide password button in `components/auth/auth-form.tsx` lacks an `aria-label`.

### Done

- [x] **Add dashboard loading state** — `app/dashboard/loading.tsx` added with skeleton UI.
- [x] **Update database types** — `lib/supabase/database.types.ts` replaced with `habits`, `habit_entries`, and `Functions` types.

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

### [DONE] Database schema (MVP)

- Tables `habits` and `habit_entries` created via `docs/schema.sql`
- Unique constraint on `(habit_id, date)`, indexes on `(user_id, date)` and `(habit_id, date)`
- Atomic `increment_habit_entry` RPC function for race-safe incrementing

### [DONE] Supabase RLS policies

- Users can only CRUD their own habits + entries

---

# Phase 2 — Auth Flow

### [DONE] Auth screens

- Sign up, sign in, sign out implemented
- Redirect to dashboard after login
- Protected dashboard route with server-side session check

---

# Phase 3 — Habit CRUD

### [DONE] Create habit screen

- Dialog with form (name, color picker, daily target)
- Zod v4 validation via `standardSchemaResolver`
- Server action creates habit, revalidates dashboard

### [DONE] Edit habit screen

- Same dialog in edit mode, pre-filled with existing values
- Server action updates habit

### [DONE] Delete habit

- AlertDialog confirmation
- Server action deletes habit (cascade removes entries)

---

# Phase 4 — Home Screen (Core UX)

### [DONE] Habit list UI

- Grid of habit cards with color accent, progress bar, edit/delete/increment buttons
- Empty state with create prompt
- Skeleton loading state (`loading.tsx`)
- Dark mode enabled (`className="dark"` on `<html>`)

### [DONE] Increment habit (+ button)

- Optimistic UI update with server reconciliation
- Atomic upsert via `increment_habit_entry` RPC
- Count displayed as `count / daily_target`

### [ ] Fetch habit entries (range query) — deferred to Phase 5

- Currently only fetches today's entries
- Full range query (last ~120 days) needed for heatmap

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

### [DONE] Date normalization

- `lib/dates.ts` — `getLocalDateString()` sends device local date as YYYY-MM-DD
- Server validates format via Zod before using as the `date`

### [DONE] Optimistic UI updates

- Increment updates count immediately in `habit-card.tsx`
- Server response reconciles count; reverts on error

---

# Phase 8 — Polish (MVP-level)

### [PARTIAL] Color system integration

- Habit color drives card accent bar, increment button, and progress bar
- [ ] Habit color drives heatmap intensity (Phase 5)

### [DONE] Empty states

- No habits → prompt with "Create Your First Habit" button

### [DONE] Loading states

- Dashboard skeleton via `app/dashboard/loading.tsx`

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
