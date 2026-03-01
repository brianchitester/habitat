"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HabitForm } from "@/components/habits/habit-form";
import { createHabit, updateHabit } from "@/app/actions/habits";
import type { Habit } from "@/lib/types";
import type { HabitFormValues } from "@/lib/schemas";

interface HabitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit;
}

export function HabitFormDialog({
  open,
  onOpenChange,
  habit,
}: HabitFormDialogProps) {
  const isEditing = !!habit;
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(values: HabitFormValues) {
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("color", values.color);
    formData.set("daily_target", String(values.daily_target));

    startTransition(async () => {
      const result = isEditing
        ? await updateHabit(habit.id, formData)
        : await createHabit(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(isEditing ? "Habit updated" : "Habit created");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Habit" : "New Habit"}</DialogTitle>
        </DialogHeader>
        <HabitForm
          defaultValues={
            habit
              ? {
                  name: habit.name,
                  color: habit.color,
                  daily_target: habit.daily_target,
                }
              : undefined
          }
          onSubmit={handleSubmit}
          submitLabel={isEditing ? "Save Changes" : "Create Habit"}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
