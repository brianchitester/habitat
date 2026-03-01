Absolutely — here’s a **tight, execution-ready PRD** for your MVP based on everything you’ve defined and _only_ what’s in scope.

---

# 📄 Product Requirements Document (PRD)

## HabitKit — MVP

---

## 1. 🧠 Overview

**HabitKit** is a minimal, count-based habit tracking app that helps users build consistency by tracking **how often** they perform habits each day and visualizing progress over time using a **GitHub-style heatmap**.

Unlike traditional habit trackers (binary done/not done), HabitKit focuses on **frequency and density**, allowing users to define daily targets and see how fully they meet them over time.

---

## 2. 🎯 Goals

### Primary Goal

Enable users to:

- Track habits with **daily frequency (counts)**
- Quickly log progress with a **single tap**
- Visually understand consistency via **heatmaps**

### Success Criteria (MVP)

- Users can create and track multiple habits
- Logging a habit takes **≤1 tap**
- Heatmap accurately reflects progress over time
- Data persists across sessions (via Supabase auth)

---

## 3. 🚫 Non-Goals (Out of Scope for MVP)

- Reminders / notifications
- Streak systems
- Categories / grouping
- Custom value input
- Social features
- Analytics / insights
- Monetization (Pro features)

---

## 4. 👤 Target User

- Individuals building daily routines (health, hygiene, learning, etc.)
- Users who prefer **low-friction logging**
- Users who care about **consistency over perfection**

---

## 5. 🧩 Core Concepts

### Habit

A recurring activity with:

- A **name**
- A **color**
- A **daily target** (number of times per day)

### Completion

- Each tap = +1 count for that habit on that day

### Daily Target

- Defines what “complete” means for a day
- Drives heatmap intensity

### Heatmap

- Visual grid of days
- Color intensity represents:

  ```
  count / daily_target
  ```

---

## 6. 📱 User Experience

---

### 6.1 Home Screen (Dashboard)

#### Description

Main screen showing all habits and allowing quick logging.

#### UI Elements

- List of habit cards
- Each card includes:
  - Habit name
  - Color indicator
  - Increment button (`+`)
  - Mini heatmap (recent history)

#### Behavior

- Tap `+`:
  - Increments today’s count
  - Updates UI immediately

- Tap habit:
  - Opens habit detail view

---

### 6.2 Habit Detail View

#### Description

Expanded view of a single habit.

#### UI Elements

- Habit name + color
- Full heatmap (multi-month view)
- Monthly calendar
- Edit button

#### Calendar Behavior

- Displays current month
- Each day shows count (dots or number)
- Navigation:
  - Previous month
  - Next month

---

### 6.3 Create / Edit Habit

#### Fields

- Name (required)
- Color (required)
- Daily target (required, integer ≥1)

#### Behavior

- Save creates or updates habit
- Changes reflected immediately

---

### 6.4 Delete Habit

- Accessible from edit screen
- Removes habit and associated data

---

## 7. 📊 Functional Requirements

---

### 7.1 Authentication

- Users must sign up / log in
- Session persists across app restarts

---

### 7.2 Habit Management

#### Create Habit

- User can create unlimited habits

#### Edit Habit

- User can modify:
  - Name
  - Color
  - Daily target

#### Delete Habit

- Permanently removes habit

---

### 7.3 Habit Tracking

#### Increment Behavior

- Each tap:
  - Increments today’s count by 1

- If no entry exists for today:
  - Create entry with count = 1

#### Constraints

- No upper limit on count
- No decrement in MVP

---

### 7.4 Data Fetching

- Load:
  - All habits for user
  - Entries for each habit within a fixed range (e.g. last 90–120 days)

---

### 7.5 Heatmap Visualization

#### Input

- Daily counts
- Daily target

#### Output

- Grid of days

#### Rules

- 0 → no color
- 0 < count < target → partial intensity
- count ≥ target → full intensity

---

### 7.6 Calendar View

- Month grid layout
- Each day displays count
- Navigation between months

---

## 8. 🗄️ Data Model (Supabase)

---

### Table: `habits`

| Column       | Type      | Notes         |
| ------------ | --------- | ------------- |
| id           | uuid      | primary key   |
| user_id      | uuid      | foreign key   |
| name         | text      | required      |
| color        | text      | required      |
| daily_target | int       | required      |
| created_at   | timestamp | default now() |

---

### Table: `habit_entries`

| Column   | Type | Notes                   |
| -------- | ---- | ----------------------- |
| id       | uuid | primary key             |
| habit_id | uuid | foreign key             |
| user_id  | uuid | foreign key             |
| date     | date | normalized (YYYY-MM-DD) |
| count    | int  | default 0               |

#### Constraint

- UNIQUE (habit_id, date)

---

## 9. 🔐 Security (RLS)

- Users can only access:
  - Their own habits
  - Their own entries

---

## 10. ⚙️ Key Logic

---

### Increment (critical path)

```sql
INSERT INTO habit_entries (habit_id, user_id, date, count)
VALUES (...)
ON CONFLICT (habit_id, date)
DO UPDATE SET count = habit_entries.count + 1;
```

---

### Heatmap Intensity

```ts
intensity = Math.min(count / dailyTarget, 1);
```

---

## 11. 🧪 Edge Cases

- First time user (no habits)
- No entry for a given day → treated as 0
- Rapid tapping → ensure increments are not lost
- Timezone consistency (use device local time for MVP)

---

## 12. 🎨 Design Principles

- **Fast interaction** (1 tap logging)
- **Visual feedback immediately**
- **Minimal cognitive load**
- **Consistency-focused, not perfection-focused**

---

## 13. 🚀 MVP Definition of Done

The MVP is complete when:

- A user can:
  - Sign up / log in
  - Create habits
  - Increment habits daily
  - See progress in heatmaps
  - View history in calendar
  - Edit and delete habits

- All data persists via Supabase

- UI updates instantly on interaction

- No critical bugs in logging or visualization

---

## 14. 🔜 Post-MVP Opportunities (Not Included)

- Reminders
- Streak tracking
- Categories
- Custom value input
- Insights / analytics
- Social sharing

---

## Final Thought

This is a **very strong MVP** because:

- It’s **focused**
- It has a clear differentiator (frequency + heatmap)
- It avoids feature bloat

---

If you want next, I can turn this into:

- a **technical architecture doc (frontend + Supabase queries)**
- or a **component breakdown for implementation (React/Expo)**
