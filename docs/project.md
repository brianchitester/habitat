# Habitat — MVP Project Plan

## Current Status

Phases 1–5 are complete. Auth, database schema, habit CRUD, home screen with optimistic increment, and heatmap visualization are all functional. The app runs in dark mode with habit cards showing a GitHub-style heatmap grid (16 weeks, 7 rows). **Next up: Phase 6 (Habit detail view).**

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

### [DONE] Fetch habit entries (range query)

- Dashboard fetches 16 weeks of entries in a single range query
- Entries grouped by habit_id into `HeatmapEntry[]` arrays

---

# Phase 5 — Heatmap (Core Feature)

### [DONE] Heatmap component (reusable)

- `components/habits/heatmap.tsx` — pure client component
- CSS Grid: 7 rows (Mon–Sun), `grid-auto-flow: column`, today in rightmost column
- Intensity = `count / daily_target`, clamped to [0, 1]
- Empty cells use faint `rgba(255,255,255,0.03)`, filled cells use habit color with `opacity: 0.2 + intensity * 0.8`
- Today's cell highlighted with outline ring

### [DONE] Home screen mini-heatmap

- Dashboard fetches 16 weeks of entries (single range query, no N+1)
- Each habit card renders `<Heatmap />` below the progress bar
- Date helpers added to `lib/dates.ts`: `subtractDays`, `addDays`, `getDayOfWeek`, `generateDateRange`
- Types: `HeatmapEntry`, `HeatmapCell`, `HabitWithEntries`

---

# Phase 6 — Habit Detail View

### [ ] Habit detail modal

- Opens as a bottom sheet / modal when tapping a habit card (not the edit/delete/increment buttons)
- Header: habit name, description (or "No Description"), close (X) button
- Full-width heatmap (reuse `<Heatmap />`) with month labels above and day-of-week labels (Mon, Wed, Fri) on the left
- Summary row below heatmap: streak goal badge, fire icon with current streak count
- Action buttons: edit (pencil) and settings (gear) icons

### [ ] Monthly calendar view

- 7-column grid (Sun–Sat) for the current month
- Days with entries get a tinted background (habit color, low opacity)
- Colored dots below the date number indicating count (e.g., 3 dots = count of 3)
- Days outside the current month shown but muted

### [ ] Date navigation

- "Feb 2026" label with calendar icon at bottom-left
- Previous / next month arrow buttons at bottom-right
- Navigating months updates the calendar grid; heatmap stays fixed

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

### [DONE] Color system integration

- Habit color drives card accent bar, increment button, progress bar, and heatmap intensity

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
- **Heatmap window**: 16 weeks (~112 days), configurable via `HEATMAP_WEEKS` constant
- **Upsert strategy**: Postgres function `increment_habit_entry(habit_id, entry_date)` for atomic increment
- **Data fetching**: Server actions for mutations, single-range fetch for entries to avoid N+1
- **Rendering**: Server Components for data fetching, Client Components for interactions
