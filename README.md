# Habitat

A minimal, count-based habit tracker with GitHub-style heatmap visualizations. Built with Next.js and Supabase.

Track how often you perform habits each day, set daily targets, and visualize your consistency over time.

## Features (MVP)

- **Count-based tracking** — each tap = +1, no binary done/not done
- **Daily targets** — define what "complete" means per habit
- **Heatmap visualization** — GitHub-style grid showing intensity over time
- **Habit detail view** — full heatmap + monthly calendar with day-by-day counts
- **Color per habit** — each habit gets its own color theme
- **One-tap logging** — fast, low-friction interaction

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Auth & Database**: Supabase (`@supabase/ssr`, PostgreSQL, RLS)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Language**: TypeScript

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings > API Keys** and copy your Project URL and publishable key

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Configure Supabase Auth

In your Supabase dashboard under **Authentication > URL Configuration**:

- Set **Site URL** to `http://localhost:3000`
- Add `http://localhost:3000/auth/callback` to **Redirect URLs**

### 5. Create database tables

Run the SQL in `docs/technical-arch.md` (section 2) in the Supabase SQL Editor to create the `habits` and `habit_entries` tables with RLS policies.

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  auth/
    callback/route.ts       Auth callback handler
    page.tsx                 Sign in / sign up page
  dashboard/page.tsx         Protected dashboard
  layout.tsx                 Root layout with Toaster
  page.tsx                   Landing page
components/
  auth/
    auth-form.tsx            Tabbed sign in / sign up form
    user-profile.tsx         Avatar dropdown with sign out
  ui/                        shadcn/ui components
lib/
  supabase/
    client.ts                Browser Supabase client
    server.ts                Server Supabase client
    database.types.ts        Database TypeScript types
middleware.ts                Session refresh middleware
docs/
  prd.md                     Product requirements
  project.md                 Project plan and task tracking
  technical-arch.md          Technical architecture
  design/                    UI reference screenshots
```

## Documentation

- **[Product Requirements](docs/prd.md)** — MVP scope, user experience, data model
- **[Project Plan](docs/project.md)** — Phased tickets and remaining work
- **[Technical Architecture](docs/technical-arch.md)** — Data access patterns, mutation design, component architecture
