"use client";

import { ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <ListPlus className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No habits yet</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Create your first habit to start tracking your daily progress.
      </p>
      <Button onClick={onCreateClick}>Create Your First Habit</Button>
    </div>
  );
}
