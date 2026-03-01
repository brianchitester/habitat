# Habitat — MVP Project Plan

## Current Status

All 9 phases are complete. The MVP is live — auth, habit CRUD, heatmap visualization, habit detail view with monthly calendar, dark theme, and Vercel deployment are all functional.

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

### [DONE] Habit detail modal

- `components/habits/habit-detail-dialog.tsx` — controlled dialog opened by clicking a habit card
- Header: habit name, "No Description" placeholder, close (X) button
- Full-width `<Heatmap showLabels />` with month labels above and day-of-week labels (Mon, Wed, Fri) on the left
- Summary row: "No Streak Goal" badge, flame icon with streak count (static placeholders)
- Action buttons: edit (pencil) and settings (gear) icons
- Edit button closes detail dialog first, then opens edit dialog

### [DONE] Monthly calendar view

- `components/habits/month-calendar.tsx` — client component with month state
- 7-column grid (Sun–Sat) with leading/trailing days from adjacent months
- Days with entries get tinted background via `color-mix()` and colored dots (up to 4)
- Non-current-month days at reduced opacity

### [DONE] Date navigation

- "Feb 2026" label with calendar icon at bottom-left
- Previous / next month chevron buttons at bottom-right
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

### [DONE] Dark theme consistency

- Landing page (`app/page.tsx`) — minimal splash with app name, tagline, and CTA buttons
- Auth page (`app/auth/page.tsx`) — replaced hardcoded light-mode colors with theme-aware tokens

### [DONE] Timezone-safe todayCount

- Server query uses ±1 day buffer to cover client/server timezone differences
- `todayCount` derived on the client from entries array using client's local date

---

# Phase 9 — Deployment

### [DONE] Environment config

- Production Supabase keys configured in Vercel

### [DONE] Deploy app

- Deployed to Vercel

---

# Key Engineering Decisions

- **Date key format**: `YYYY-MM-DD` (date column)
- **Heatmap window**: 16 weeks (~112 days), configurable via `HEATMAP_WEEKS` constant
- **Upsert strategy**: Postgres function `increment_habit_entry(habit_id, entry_date)` for atomic increment
- **Data fetching**: Server actions for mutations, single-range fetch for entries to avoid N+1
- **Rendering**: Server Components for data fetching, Client Components for interactions
- **Timezone handling**: Server fetches entries with ±1 day buffer; `todayCount` derived on client to avoid server/client date mismatch
