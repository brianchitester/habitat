"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitFormDialog } from "@/components/habits/habit-form-dialog";
import { DeleteHabitDialog } from "@/components/habits/delete-habit-dialog";
import { EmptyState } from "@/components/habits/empty-state";
import type { Habit, HabitWithTodayEntry } from "@/lib/types";

interface HabitListProps {
  habits: HabitWithTodayEntry[];
}

export function HabitList({ habits }: HabitListProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | undefined>();

  if (habits.length === 0) {
    return (
      <>
        <EmptyState onCreateClick={() => setCreateOpen(true)} />
        <HabitFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      </>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          New Habit
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onEdit={() => setEditHabit(habit)}
            onDelete={() =>
              setDeleteTarget({ id: habit.id, name: habit.name })
            }
          />
        ))}
      </div>

      <HabitFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <HabitFormDialog
        open={!!editHabit}
        onOpenChange={(open) => !open && setEditHabit(undefined)}
        habit={editHabit}
      />
      {deleteTarget && (
        <DeleteHabitDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(undefined)}
          habitId={deleteTarget.id}
          habitName={deleteTarget.name}
        />
      )}
    </>
  );
}
