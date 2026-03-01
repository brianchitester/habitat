import type { Database } from "@/lib/supabase/database.types";

export type Habit = Database["public"]["Tables"]["habits"]["Row"];
export type HabitInsert = Database["public"]["Tables"]["habits"]["Insert"];
export type HabitUpdate = Database["public"]["Tables"]["habits"]["Update"];

export type HabitEntry = Database["public"]["Tables"]["habit_entries"]["Row"];
export type HabitEntryInsert = Database["public"]["Tables"]["habit_entries"]["Insert"];

export type HabitWithTodayEntry = Habit & {
  todayCount: number;
};
