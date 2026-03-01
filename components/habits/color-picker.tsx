"use client";

import { cn } from "@/lib/utils";
import { HABIT_COLORS } from "@/lib/constants";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {HABIT_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          title={color.name}
          className={cn(
            "h-8 w-8 rounded-full transition-all",
            value === color.value
              ? "ring-2 ring-offset-2 ring-offset-background scale-110"
              : "hover:scale-105"
          )}
          style={
            {
              backgroundColor: color.value,
              "--tw-ring-color": value === color.value ? color.value : undefined,
            } as React.CSSProperties
          }
          onClick={() => onChange(color.value)}
        />
      ))}
    </div>
  );
}
