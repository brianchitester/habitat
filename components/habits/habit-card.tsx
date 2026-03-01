"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { incrementHabitEntry } from "@/app/actions/entries";
import { getLocalDateString } from "@/lib/dates";
import { HEATMAP_WEEKS } from "@/lib/constants";
import { Heatmap } from "@/components/habits/heatmap";
import type { HabitWithEntries } from "@/lib/types";

interface HabitCardProps {
  habit: HabitWithEntries;
  onEdit: () => void;
  onDelete: () => void;
  onCardClick: () => void;
}

export function HabitCard({ habit, onEdit, onDelete, onCardClick }: HabitCardProps) {
  const [count, setCount] = useState(habit.todayCount);
  const [isPending, startTransition] = useTransition();

  const progress = Math.min((count / habit.daily_target) * 100, 100);
  const isComplete = count >= habit.daily_target;

  function handleIncrement() {
    // Optimistic update
    setCount((prev) => prev + 1);

    startTransition(async () => {
      const localDate = getLocalDateString();
      const result = await incrementHabitEntry(habit.id, localDate);

      if (result.error) {
        // Revert on error
        setCount((prev) => prev - 1);
        return;
      }

      // Reconcile with server
      if (result.count !== undefined) {
        setCount(result.count);
      }
    });
  }

  return (
    <Card className="relative overflow-hidden cursor-pointer" onClick={onCardClick}>
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: habit.color }}
      />
      <CardContent className="p-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{habit.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {count} / {habit.daily_target}
              {isComplete && " — Done!"}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
            <Button
              size="icon"
              className="h-9 w-9"
              onClick={(e) => { e.stopPropagation(); handleIncrement(); }}
              disabled={isPending}
              style={{
                backgroundColor: habit.color,
                color: "white",
              }}
            >
              <Plus className="h-5 w-5" />
              <span className="sr-only">Increment</span>
            </Button>
          </div>
        </div>

        <Progress
          value={progress}
          className="mt-3 h-1.5"
          style={
            {
              "--progress-color": habit.color,
            } as React.CSSProperties
          }
        />

        <div className="mt-3">
          <Heatmap
            entries={habit.entries}
            dailyTarget={habit.daily_target}
            color={habit.color}
            weeks={HEATMAP_WEEKS}
          />
        </div>
      </CardContent>
    </Card>
  );
}
