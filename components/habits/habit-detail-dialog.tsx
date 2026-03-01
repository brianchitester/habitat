"use client";

import { Flame, Pencil, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
}

export function HabitDetailDialog({
  open,
  onOpenChange,
  habit,
  onEdit,
}: HabitDetailDialogProps) {
  function handleEdit() {
    onOpenChange(false);
    onEdit();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{habit.name}</DialogTitle>
          <DialogDescription>No Description</DialogDescription>
        </DialogHeader>

        <Heatmap
          entries={habit.entries}
          dailyTarget={habit.daily_target}
          color={habit.color}
          weeks={HEATMAP_WEEKS}
          showLabels
        />

        {/* Summary row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">No Streak Goal</Badge>
            <Badge variant="outline">
              <Flame className="h-3 w-3" />
              0
            </Badge>
          </div>
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
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
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
