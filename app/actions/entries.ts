"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { dateStringSchema } from "@/lib/schemas";

export async function incrementHabitEntry(habitId: string, localDate: string) {
  const dateResult = dateStringSchema.safeParse(localDate);
  if (!dateResult.success) {
    return { error: "Invalid date format" };
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase.rpc("increment_habit_entry", {
    p_habit_id: habitId,
    p_user_id: user.id,
    p_date: localDate,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { count: data as number };
}
