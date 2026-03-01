import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getLocalDateString, subtractDays, addDays } from "@/lib/dates";
import { HEATMAP_WEEKS } from "@/lib/constants";
import { UserProfile } from "@/components/auth/user-profile";
import { HabitList } from "@/components/habits/habit-list";
import type { HabitWithEntries, HeatmapEntry } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?message=Please sign in to view your dashboard");
  }

  // Add ±1 day buffer to account for server/client timezone differences.
  // todayCount is derived on the client from entries, so we just need to
  // ensure the date range covers the client's "today" regardless of offset.
  const serverToday = getLocalDateString();
  const startDate = subtractDays(serverToday, HEATMAP_WEEKS * 7);
  const endDate = addDays(serverToday, 1);

  // Fetch habits and date-range entries in parallel (avoid N+1)
  const [habitsResult, entriesResult] = await Promise.all([
    supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("habit_entries")
      .select("habit_id, date, count")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .lte("date", endDate),
  ]);

  const habits = habitsResult.data ?? [];
  const entries = entriesResult.data ?? [];

  // Group entries by habit_id
  const entriesByHabit = new Map<string, HeatmapEntry[]>();
  for (const entry of entries) {
    if (!entriesByHabit.has(entry.habit_id)) {
      entriesByHabit.set(entry.habit_id, []);
    }
    entriesByHabit.get(entry.habit_id)!.push({
      date: entry.date,
      count: entry.count,
    });
  }

  // todayCount is derived on the client side (habit-card.tsx) to avoid
  // timezone mismatch — the server's "today" may differ from the client's.
  const habitsWithEntries: HabitWithEntries[] = habits.map((habit) => ({
    ...habit,
    todayCount: 0,
    entries: entriesByHabit.get(habit.id) ?? [],
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
        <HabitList habits={habitsWithEntries} />
      </main>
    </div>
  );
}
