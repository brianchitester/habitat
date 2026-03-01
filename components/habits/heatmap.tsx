"use client";

import { useMemo } from "react";
import { getLocalDateString, getDayOfWeek, subtractDays, generateDateRange } from "@/lib/dates";
import { HEATMAP_EMPTY_COLOR } from "@/lib/constants";
import type { HeatmapEntry } from "@/lib/types";

interface HeatmapProps {
  entries: HeatmapEntry[];
  dailyTarget: number;
  color: string;
  weeks: number;
}

export function Heatmap({ entries, dailyTarget, color, weeks }: HeatmapProps) {
  const today = getLocalDateString();

  const cells = useMemo(() => {
    // O(1) lookup for entry counts by date
    const countMap = new Map<string, number>();
    for (const entry of entries) {
      countMap.set(entry.date, entry.count);
    }

    // End date is the last day of the final column (today's week).
    // The grid is 7 rows (Mon–Sun), columns flow left to right.
    // We want today to land in the rightmost column.
    const todayDow = getDayOfWeek(today); // 0=Mon … 6=Sun
    const endDate = today; // today is always in the last column
    // Start from the Monday `weeks` columns back
    const totalDays = (weeks - 1) * 7 + todayDow + 1;
    const startDate = subtractDays(endDate, totalDays - 1);

    const range = generateDateRange(startDate, endDate);
    return range.map((date) => {
      const count = countMap.get(date) ?? 0;
      const intensity = dailyTarget > 0 ? Math.min(count / dailyTarget, 1) : 0;
      return { date, count, intensity };
    });
  }, [entries, dailyTarget, today, weeks]);

  return (
    <div
      className="grid w-full"
      style={{
        gridTemplateRows: "repeat(7, 1fr)",
        gridAutoFlow: "column",
        gridAutoColumns: "1fr",
        gap: "2px",
      }}
    >
      {cells.map((cell) => {
        const isToday = cell.date === today;
        const bg =
          cell.count === 0
            ? HEATMAP_EMPTY_COLOR
            : color;
        const opacity = cell.count === 0 ? 1 : 0.2 + cell.intensity * 0.8;

        return (
          <div
            key={cell.date}
            className="aspect-square rounded-[2px]"
            style={{
              backgroundColor: bg,
              opacity,
              minHeight: "6px",
              outline: isToday ? `1.5px solid ${color}` : undefined,
              outlineOffset: isToday ? "-0.5px" : undefined,
            }}
            title={`${cell.date}: ${cell.count}/${dailyTarget}`}
          />
        );
      })}
    </div>
  );
}
