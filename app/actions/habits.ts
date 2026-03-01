"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { habitFormSchema } from "@/lib/schemas";

export async function createHabit(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    color: formData.get("color"),
    daily_target: formData.get("daily_target"),
  };

  const parsed = habitFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("habits").insert({
    user_id: user.id,
    name: parsed.data.name,
    color: parsed.data.color,
    daily_target: parsed.data.daily_target,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateHabit(habitId: string, formData: FormData) {
  const raw = {
    name: formData.get("name"),
    color: formData.get("color"),
    daily_target: formData.get("daily_target"),
  };

  const parsed = habitFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("habits")
    .update({
      name: parsed.data.name,
      color: parsed.data.color,
      daily_target: parsed.data.daily_target,
      updated_at: new Date().toISOString(),
    })
    .eq("id", habitId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteHabit(habitId: string) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", habitId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
