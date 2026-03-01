"use client";

import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heatmap } from "@/components/habits/heatmap";
import { MonthCalendar } from "@/components/habits/month-calendar";
import { HEATMAP_WEEKS } from "@/lib/constants";
import type { HabitWithEntries } from "@/lib/types";

interface HabitDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: HabitWithEntries;
  onEdit: () => void;
  onDelete: () => void;
}

export function HabitDetailDialog({
  open,
  onOpenChange,
  habit,
  onEdit,
  onDelete,
}: HabitDetailDialogProps) {
  function handleEdit() {
    onOpenChange(false);
    onEdit();
  }

  function handleDelete() {
    onOpenChange(false);
    onDelete();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{habit.name}</DialogTitle>
        </DialogHeader>

        <Heatmap
          entries={habit.entries}
          dailyTarget={habit.daily_target}
          color={habit.color}
          weeks={HEATMAP_WEEKS}
          showLabels
        />

        <div className="flex items-center justify-end">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleEdit}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>

        <MonthCalendar
          entries={habit.entries}
          dailyTarget={habit.daily_target}
          color={habit.color}
        />
      </DialogContent>
    </Dialog>
  );
}
