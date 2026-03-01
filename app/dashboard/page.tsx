import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getLocalDateString } from "@/lib/dates";
import { UserProfile } from "@/components/auth/user-profile";
import { HabitList } from "@/components/habits/habit-list";
import type { HabitWithTodayEntry } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?message=Please sign in to view your dashboard");
  }

  const today = getLocalDateString();

  // Fetch habits and today's entries in parallel (avoid N+1)
  const [habitsResult, entriesResult] = await Promise.all([
    supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("habit_entries")
      .select("habit_id, count")
      .eq("user_id", user.id)
      .eq("date", today),
  ]);

  const habits = habitsResult.data ?? [];
  const entries = entriesResult.data ?? [];

  // Build a map of habit_id -> today's count
  const todayMap = new Map<string, number>();
  for (const entry of entries) {
    todayMap.set(entry.habit_id, entry.count);
  }

  // Merge habits with today's entry counts
  const habitsWithToday: HabitWithTodayEntry[] = habits.map((habit) => ({
    ...habit,
    todayCount: todayMap.get(habit.id) ?? 0,
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-14">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold">Habitat</h1>
            </div>
            <div className="flex items-center">
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
        <HabitList habits={habitsWithToday} />
      </main>
    </div>
  );
}
